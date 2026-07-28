/**
 * Measure the published JavaScript figure, the one number on /work/portfolio-system that nothing derives.
 *
 *   npm run build && npm run perf:js
 *
 * The three Lighthouse figures resolve at build from portfolio-perf.json via src/lib/perf-claim.ts, so a re-run moves them on its own. This one is script weight measured from the built output, so it has to be re-measured by hand after any bundle change, and it is the figure that drifts when nobody does.
 *
 * The basis is fixed and must not be renegotiated per measurement, because raw and gzip differ here by more than a rounding: the HEAVIEST page, its external /_astro/ bundles plus its inline scripts, JSON-LD excluded (it is data, not behavior), gzipped, then FLOORED. Floored because lower is better for a weight claim, so the published figure must never undercut what was measured.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const DIST = 'dist/client';
const ENTRY = 'src/content/work/portfolio-system.md';

if (!fs.existsSync(DIST)) {
  console.error(`No ${DIST}. Run \`npm run build\` first.`);
  process.exit(1);
}

const gzip = (buf) => zlib.gzipSync(Buffer.isBuffer(buf) ? buf : Buffer.from(buf, 'utf8'), { level: 9 }).length;

/** Every built page except the concept microsites, which are passthrough HTML and not part of the claim. */
function pages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'concepts' ? [] : pages(full);
    return e.name.endsWith('.html') ? [full] : [];
  });
}

function weigh(file) {
  const html = fs.readFileSync(file, 'utf8');
  const external = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]);
  const inline = [...html.matchAll(/<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter((m) => !/ld\+json/.test(m[1]))
    .map((m) => m[2]);

  let raw = 0;
  let gz = 0;
  for (const src of external) {
    const asset = path.join(DIST, src.replace(/^\//, ''));
    if (!fs.existsSync(asset)) continue;
    const bytes = fs.readFileSync(asset);
    raw += bytes.length;
    gz += gzip(bytes);
  }
  raw += inline.reduce((n, s) => n + Buffer.byteLength(s, 'utf8'), 0);
  if (inline.length) gz += gzip(inline.join('\n'));

  return { page: path.relative(DIST, file).replace(/\.html$/, '') || 'index', raw, gz, files: external.length };
}

const rows = pages(DIST).map(weigh).sort((a, b) => b.gz - a.gz);
const worst = rows[0];
const published = (Math.floor((worst.gz / 1024) * 10) / 10).toFixed(1);

console.log('Heaviest pages by transferred script weight\n');
console.log('  page'.padEnd(34) + 'raw'.padStart(8) + 'gzip'.padStart(9) + '  bundles');
for (const r of rows.slice(0, 5)) {
  console.log('  ' + r.page.padEnd(32) + String(r.raw).padStart(8) + String(r.gz).padStart(9) + String(r.files).padStart(9));
}

console.log(`\nPublish: ${published}KB   (${worst.page}, ${worst.gz} bytes gzipped, floored)`);

// Compare against what the entry currently claims, so the check is an answer rather than a number to eyeball.
const entry = fs.readFileSync(ENTRY, 'utf8');
const claim = entry.match(/value:\s*"([\d.]+)",\s*unit:\s*"KB",\s*label:\s*"JS, heaviest page"/);
if (!claim) {
  console.log(`\nCould not find the JS figure in ${ENTRY}. Check it by hand.`);
} else if (claim[1] === published) {
  console.log(`\nOK - the entry already publishes ${claim[1]}KB. Nothing to change.`);
} else {
  console.log(`\nDRIFTED - the entry publishes ${claim[1]}KB, the build measures ${published}KB.`);
  console.log(`  1. ${ENTRY}: set value: "${published}"`);
  console.log(`  2. _reference/masters/resume-master.md: the Portfolio System bullet + the Claim Registry row (Drive, not git, so nothing updates it for you)`);
  process.exitCode = 1;
}
