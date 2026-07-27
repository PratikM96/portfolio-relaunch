/**
 * Subset JetBrains Mono from its vendor original into the face the site ships.
 *
 *   node scripts/fonts/subset-mono.mjs
 *
 * JetBrains Mono was the largest face on the site and carries the least text: only the three mono tiers (`label` / `data` / `emphasis`). All three woff2 files preload at High priority, so its weight sat on every page's critical path and the three fonts together were most of mobile FCP.
 *
 * **Only this face may be subset.** Subsetting is modification, and the Fontshare licence covering Clash Display and Clash Grotesk grants embedding without it, so those two ship whole, always. JetBrains Mono is OFL-1.1 with no Reserved Font Name, which grants both. CLAUDE.md §6 carries the licensing rule and §9 (2026-07-15) named this as the first lever to pull.
 *
 * **The vendor original is the input, never the shipped file.** Re-running against an already-subset file would work once and then quietly narrow the set every time after. `_reference/fonts/site/` holds the untouched original; if it is missing (the junction is gitignored) this refuses rather than guessing.
 *
 * **The character set is a fixed floor, not a scan of the build.** A scan looks safe and isn't: `▶` exists only inside a JS string, so a set derived from rendered HTML would drop it and the glyph would silently fall back to Courier New. The floor is printable ASCII plus Latin-1 letters plus the symbols below, more than the site uses, leaving room for copy to change.
 *
 * If a genuinely new symbol does get used in a mono tier, nothing errors: the glyph renders in the metric-matched fallback and looks subtly wrong. Add it to EXTRA and re-run.
 */
import fs from 'node:fs';
import path from 'node:path';
import subsetFont from 'subset-font';

const ROOT = path.resolve(import.meta.dirname, '../..');
const SRC = path.join(ROOT, '_reference/fonts/site/jetbrains-mono/JetBrainsMono-Variable.woff2');
const OUT = path.join(ROOT, 'public/fonts/JetBrainsMono-Variable.woff2');

/** Every printable ASCII character, U+0020 to U+007E. The mono tiers are uppercase Latin and digits, but punctuation turns up in data rows and the whole range costs almost nothing. */
const ASCII = Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => String.fromCharCode(0x20 + i)).join('');

/** Latin-1 letters, so an accented name or loanword cannot silently fall back. `é` is already on the site. */
const LATIN1 = Array.from({ length: 0xff - 0xc0 + 1 }, (_, i) => String.fromCharCode(0xc0 + i)).join('');

/**
 * Symbols the design uses, gathered from rendered HTML *and* from the JS bundles, because some are injected at runtime and appear in neither the markup nor the content files.
 *
 * `→ ← ↓ ↗` link and button arrows · `▶` the hero play chip, which exists only inside a JS string · `·` structural separator in Base.astro and /brand · `✕` the drawer close · `×` device-by-theme labels · `©` the footer · `’ “ ”` typographic quotes · `° – …` absent from the site today, included as cheap insurance against a stray paste.
 *
 * **Three of these are absent from JetBrains Mono itself and always were:** `❚` (U+275A), `★` (U+2605), `▢` (U+25A2). Subsetting the vendor original to just those three yields 984 bytes, i.e. an empty shell. They render from a system fallback and always did, so don't read them as a subsetting bug when a glyph audit flags them.
 */
const EXTRA = '→←↓↗▶❚·★✕▢×©’“”°–…';

const TEXT = ASCII + LATIN1 + EXTRA;

if (!fs.existsSync(SRC)) {
  console.error(`Vendor original not found: ${SRC}`);
  console.error('_reference/ is a gitignored junction to Drive. Restore it before subsetting; do NOT subset public/fonts/ in place, which would narrow the set on every run.');
  process.exit(1);
}

const before = fs.existsSync(OUT) ? fs.statSync(OUT).size : 0;
const srcSize = fs.statSync(SRC).size;

const subset = await subsetFont(fs.readFileSync(SRC), TEXT, {
  targetFormat: 'woff2',
  // Keep the weight axis: tokens.css declares 100-800 and the tiers use 400 and 600, so pinning an instance would silently flatten `emphasis` back to regular.
  variationAxes: { wght: { min: 100, max: 800 } },
});

fs.writeFileSync(OUT, subset);

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`vendor original : ${kb(srcSize)}`);
console.log(`previous shipped: ${kb(before)}`);
console.log(`new shipped     : ${kb(subset.length)}  (${TEXT.length} characters requested)`);
console.log(`saved off the critical path of every page: ${kb(before - subset.length)}`);
