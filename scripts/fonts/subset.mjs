/**
 * Font subsetting — mehtapratik.com (One System)
 *
 * The self-hosted woff2 faces ship full glyph coverage (JetBrains Mono alone
 * carries box-drawing/Powerline/etc.), which is dead weight for a Latin-only
 * site and the dominant cost in the landing-page critical request chain. This
 * subsets each shipped face down to the characters the site can actually
 * render, writing the smaller woff2 back over public/fonts/.
 *
 * Sources are the OTF masters in _reference/fonts/site/ (gitignored); the repo only
 * ever holds the optimized woff2 deliverable, same as before — these are just
 * smaller now. Re-run after adding a face or introducing a new glyph:
 *   node scripts/fonts/subset.mjs            # all faces
 *   node scripts/fonts/subset.mjs JetBrains  # only faces matching a substring
 *
 * LICENSING — subsetting is a modification, so a face may only be listed here if
 * its licence permits modification. This is a hard gate, not a preference:
 *
 *   JetBrains Mono  OFL-1.1, no Reserved Font Name -> modification + subsetting
 *                   permitted, name may be kept. Listed below. See
 *                   public/fonts/OFL.txt.
 *
 *   Clash families  NOT LISTED, and must not be re-added. Fontshare FFL §02:
 *                   "You may not modify, edit, adapt, translate, reverse
 *                   engineer, decompile or disassemble, alter or otherwise copy
 *                   the Font Software ... without the prior written consent of
 *                   the Licensor." Subsetting is modification, so Clash ships
 *                   verbatim as downloaded from Fontshare (2026-07-15). Cost of
 *                   shipping them whole: +34.8 KB total, +13 KB on the critical
 *                   path (only Display-Bold and Grotesk-Regular are preloaded).
 *                   That is single-digit ms same-origin — cheaper than the fix.
 *                   Re-add only with written consent from Indian Type Foundry.
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
// Modification-permitting licences ONLY — read the block comment before adding.
const FACES = [
  ['_reference/fonts/site/jetbrains-mono/JetBrainsMono-Regular.otf', 'public/fonts/JetBrainsMono-Regular.woff2'],
  ['_reference/fonts/site/jetbrains-mono/JetBrainsMono-Medium.otf', 'public/fonts/JetBrainsMono-Medium.woff2'],
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

// Optional substring filter: `node scripts/fonts/subset.mjs JetBrains` runs only
// the matching faces, so a single family can be re-cut without touching the rest.
const filter = process.argv[2];
const faces = filter ? FACES.filter(([src]) => src.includes(filter)) : FACES;
if (filter) console.log(`Filter "${filter}": ${faces.length}/${FACES.length} faces.\n`);

for (const [src, dest] of faces) {
  const srcPath = join(root, src);
  const destPath = join(root, dest);
  const input = readFileSync(srcPath);
  // A new face has no shipped woff2 yet; fall back to the OTF master so the
  // saving still reports against something real instead of throwing.
  let prevSize;
  try {
    prevSize = statSync(destPath).size;
  } catch {
    prevSize = input.length;
  }
  const out = await subsetFont(input, retainText, { targetFormat: 'woff2' });
  writeFileSync(destPath, out);
  before += prevSize;
  after += out.length;
  const pct = (100 * (1 - out.length / prevSize)).toFixed(0);
  console.log(`${dest.replace('public/fonts/', '').padEnd(28)} ${kib(prevSize).padStart(9)} -> ${kib(out.length).padStart(9)}  (-${pct}%)`);
}

console.log(`\nTOTAL  ${kib(before)} -> ${kib(after)}  (saved ${kib(before - after)}, -${(100 * (1 - after / before)).toFixed(0)}%)`);
