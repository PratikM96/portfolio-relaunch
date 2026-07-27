/**
 * Subset JetBrains Mono from its vendor original into the face the site ships.
 *
 *   node scripts/fonts/subset-mono.mjs
 *
 * JetBrains Mono is the largest face on the site and carries the least text. It ships 89KB and renders only the three mono tiers, `label` / `data` / `emphasis`: kickers, badges, section labels, the rail, scoreboard values, the clock, and buttons. Everything else is Clash. Because all three woff2 files are preloaded at High priority, that 89KB sits on the critical path of every page, and on a throttled mobile connection the three fonts together are most of FCP.
 *
 * **Only this face may be subset.** Subsetting is modification, and the Fontshare licence covering Clash Display and Clash Grotesk grants embedding without it, so those two ship whole, always. JetBrains Mono is OFL-1.1 with no Reserved Font Name, which grants both. CLAUDE.md §6 carries the licensing rule and §9 (2026-07-15) named this as the first lever to pull.
 *
 * **The vendor original is the input, never the shipped file.** Re-running against an already-subset file would work once and then quietly narrow the set every time after. `_reference/fonts/site/` holds the untouched original; if it is missing (the junction is gitignored) this refuses rather than guessing.
 *
 * **The character set is a fixed floor, not a scan of the current build.** A scan looks safe and is not: `▶` exists only inside a JS string that swaps the hero's play/pause chip, so a set derived from rendered HTML would have dropped it and the glyph would have silently fallen back to Courier New. So the floor is every printable ASCII character plus Latin-1 letters plus the symbols below, which is far more than the site uses today and leaves room for copy to change without anyone remembering this file exists.
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
 * **Three of these are not in JetBrains Mono at all and never were:** `❚` (U+275A, the pause chip), `★` (U+2605, the /brand anchor marker) and `▢` (U+25A2). Verified by subsetting the vendor original to just those three, which yields 984 bytes — smaller than the 1,020 bytes a font containing only `▶` produces, i.e. the empty shell. They have always rendered from a system fallback, before and after this script existed. They stay listed so the intent is on the record; do not go looking for a subsetting bug when a glyph audit flags them.
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
