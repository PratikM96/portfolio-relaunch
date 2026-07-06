/**
 * Font subsetting — mehtapratik.com (One System)
 *
 * The self-hosted woff2 faces ship full glyph coverage (Berkeley Mono TX-02
 * alone carries box-drawing/Powerline/etc.), which is dead weight for a
 * Latin-only site and the dominant cost in the landing-page critical request
 * chain. This subsets each shipped face down to the characters the site can
 * actually render, writing the smaller woff2 back over public/fonts/.
 *
 * Sources are the OTF masters in _reference/fonts/site/ (gitignored); the repo only
 * ever holds the optimized woff2 deliverable, same as before — these are just
 * smaller now. Re-run after adding a face or introducing a new glyph:
 *   node scripts/fonts/subset.mjs
 *
 * The retain set = printable ASCII + Latin-1 Supplement (headroom for normal
 * copy: accents, ·, ×, ©, en-dash range) UNION every non-ASCII codepoint found
 * in the built HTML and the source (so JS-injected UI glyphs like ▶ ❚ ✕ → and
 * the bullet separators can't be dropped). Over-inclusion is harmless; dropping
 * a used glyph is not, so the scan is the safety net.
 */
import subsetFont from 'subset-font';
import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));

// face → [OTF master (source), shipped woff2 (destination)]
const FACES = [
  ['_reference/fonts/site/Berkeley-Mono/TX-02-Regular.otf', 'public/fonts/TX-02-Regular.woff2'],
  ['_reference/fonts/site/Berkeley-Mono/TX-02-Medium.otf', 'public/fonts/TX-02-Medium.woff2'],
  ['_reference/fonts/site/Clash-Display/ClashDisplay-Semibold.otf', 'public/fonts/ClashDisplay-Semibold.woff2'],
  ['_reference/fonts/site/Clash-Display/ClashDisplay-Bold.otf', 'public/fonts/ClashDisplay-Bold.woff2'],
  ['_reference/fonts/site/Clash-Grotesk/ClashGrotesk-Regular.otf', 'public/fonts/ClashGrotesk-Regular.woff2'],
  ['_reference/fonts/site/Clash-Grotesk/ClashGrotesk-Semibold.otf', 'public/fonts/ClashGrotesk-Semibold.woff2'],
  ['_reference/fonts/site/Clash-Grotesk/ClashGrotesk-Bold.otf', 'public/fonts/ClashGrotesk-Bold.woff2'],
];

// Directories scanned for glyphs actually in play (rendered HTML + source that
// injects text at runtime). dist/ is the built output; run `npm run build` first
// so the scan sees the real pages.
const SCAN_DIRS = ['dist/client', 'src'];
const SCAN_EXT = new Set(['.html', '.astro', '.ts', '.js', '.css', '.md']);

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (SCAN_EXT.has(extname(e.name))) out.push(p);
  }
  return out;
}

// Baseline: printable ASCII (0x20–0x7E) + Latin-1 Supplement (0xA0–0xFF).
const retain = new Set();
for (let c = 0x20; c <= 0x7e; c++) retain.add(c);
for (let c = 0xa0; c <= 0xff; c++) retain.add(c);

// Union in every non-ASCII codepoint present in the scanned content.
let scanned = 0;
for (const d of SCAN_DIRS) {
  for (const file of walk(join(root, d))) {
    scanned++;
    const text = readFileSync(file, 'utf8');
    for (const ch of text) {
      const cp = ch.codePointAt(0);
      if (cp > 0x7f) retain.add(cp);
    }
  }
}

const retainText = String.fromCodePoint(...[...retain].sort((a, b) => a - b));
const nonAscii = [...retain].filter((c) => c > 0xff).sort((a, b) => a - b);
console.log(`Scanned ${scanned} files.`);
console.log(`Retain set: ${retain.size} codepoints (ASCII+Latin-1 + ${nonAscii.length} extra).`);
console.log(`Extra non-Latin glyphs kept: ${nonAscii.map((c) => 'U+' + c.toString(16).toUpperCase().padStart(4, '0')).join(' ') || '(none)'}\n`);

const kib = (n) => (n / 1024).toFixed(1) + ' KB';
let before = 0;
let after = 0;

for (const [src, dest] of FACES) {
  const srcPath = join(root, src);
  const destPath = join(root, dest);
  const input = readFileSync(srcPath);
  const prevSize = statSync(destPath).size; // current shipped woff2
  const out = await subsetFont(input, retainText, { targetFormat: 'woff2' });
  writeFileSync(destPath, out);
  before += prevSize;
  after += out.length;
  const pct = (100 * (1 - out.length / prevSize)).toFixed(0);
  console.log(`${dest.replace('public/fonts/', '').padEnd(28)} ${kib(prevSize).padStart(9)} -> ${kib(out.length).padStart(9)}  (-${pct}%)`);
}

console.log(`\nTOTAL  ${kib(before)} -> ${kib(after)}  (saved ${kib(before - after)}, -${(100 * (1 - after / before)).toFixed(0)}%)`);
