/**
 * Copies `src/scripts/ga-core.js` to `public/concepts/ga-core.js` so the concept microsites can fetch it.
 *
 * The microsites are static passthrough HTML that Astro never processes, so they cannot import from `src/`. Rather than a second hand-maintained copy, which is exactly what drifted before (the old `public/concepts/analytics.js` carried its own measurement ID, its own Consent Mode object, and never got the idle-load fix), the copy is generated and `scripts/check/claims.mjs` fails the build when it stops matching its source.
 *
 * Same relationship `npm run fonts:subset` has with `public/fonts`: authored input under version control, generated output committed beside it so the deploy needs no toolchain.
 *
 * **Deliberately NOT wired into `prebuild`.** Regenerating automatically would silently overwrite a hand edit to the copy, which is the failure this whole arrangement exists to make loud. Instead `claims.mjs` compares the two and fails the build in either direction: edit the source without regenerating, or edit the copy at all, and the build stops and names this command.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = resolve(root, 'src/scripts/ga-core.js');
const OUT = resolve(root, 'public/concepts/ga-core.js');

/** Prepended to the copy. `claims.mjs` strips exactly this many lines before comparing, so changing it here means changing BANNER_LINES there. */
export const BANNER = `/* GENERATED FILE - DO NOT EDIT.
 * Source: src/scripts/ga-core.js  ·  regenerate with \`npm run concepts:ga\`
 * A hand edit here fails the build in scripts/check/claims.mjs rather than being silently overwritten.
 */
`;

const source = readFileSync(SRC, 'utf8');
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, BANNER + source);

console.log(`concepts:ga  ->  public/concepts/ga-core.js  (${source.length} bytes from src/scripts/ga-core.js)`);
