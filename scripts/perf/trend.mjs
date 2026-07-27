/**
 * Read scripts/perf/history.jsonl and print how the numbers have moved across runs.
 *
 *   node scripts/perf/trend.mjs           # averages per run, then per-page mobile perf
 *   node scripts/perf/trend.mjs home      # one page across every run
 *
 * **A single mobile run is not evidence.** Across three runs the worst page changed identity, unchanged pages swung +/-750ms, and two pages a fix targeted improved before the fix shipped. Read the mean column, or a CPU metric like TBT which barely moves on network variance. Treat one page's single-run LCP as noise until two runs agree.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const HISTORY = path.join(ROOT, 'scripts/perf/history.jsonl');

if (!fs.existsSync(HISTORY)) {
  console.error('No scripts/perf/history.jsonl yet. It is written by emit.mjs, so run a batch first.');
  process.exit(1);
}

const runs = fs.readFileSync(HISTORY, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
const slug = process.argv[2];

const pad = (v, n) => String(v).padStart(n);

if (slug) {
  const known = new Set(runs.flatMap((r) => r.mobile.rows.map((x) => x.slug)));
  if (!known.has(slug)) {
    console.error(`Unknown page "${slug}". Known: ${[...known].sort().join(', ')}`);
    process.exit(1);
  }
  console.log(`=== ${slug} across ${runs.length} run(s) ===`);
  console.log('run'.padEnd(16) + 'MOBILE perf   lcp   fcp  tbt   cls' + '    DESKTOP perf   lcp   fcp');
  for (const r of runs) {
    const m = r.mobile.rows.find((x) => x.slug === slug);
    const d = r.desktop.rows.find((x) => x.slug === slug);
    if (!m || !d) continue;
    console.log(
      r.runId.padEnd(16) + pad(m.perf, 11) + pad(m.lcp, 6) + pad(m.fcp, 6) + pad(m.tbt, 5) + pad(m.cls, 6) +
      pad(d.perf, 15) + pad(d.lcp, 6) + pad(d.fcp, 6),
    );
  }
  process.exit(0);
}

console.log(`=== averages across ${runs.length} run(s) ===`);
console.log('run'.padEnd(16) + 'MOBILE perf   lcp   fcp  tbt' + '   DESKTOP perf  lcp  fcp' + '   n  within-run lcp');
for (const r of runs) {
  const m = r.mobile.average;
  const d = r.desktop.average;
  // n and the within-run spread say how far to trust the row. n=1 means the numbers are one coin flip.
  const s = r.mobile.sampling;
  const n = s ? s.samplesPerPage : 1;
  const within = s && s.meanLcpSpread ? `±${s.meanLcpSpread}ms avg, ${s.maxLcpSpread}ms worst` : n === 1 ? 'unsampled' : '';
  console.log(
    r.runId.padEnd(16) + pad(m.perf, 11) + pad(m.lcp, 6) + pad(m.fcp, 6) + pad(m.tbt, 5) +
    pad(d.perf, 14) + pad(d.lcp, 5) + pad(d.fcp, 5) + pad(n, 4) + '  ' + within,
  );
}
if (runs.every((r) => !r.mobile.sampling || r.mobile.sampling.samplesPerPage === 1)) {
  console.log('\nEvery run here is a single sample per page, so each page score is one coin flip. REPEATS=3 makes each row a median.');
}

if (runs.length < 2) {
  console.log('\nOne run recorded. A trend needs at least two, and a mobile per-page trend realistically needs three.');
  process.exit(0);
}

// Per-page mobile perf across runs, worst current first. The spread column is what says whether a page has a problem or the run had weather.
const slugs = runs[runs.length - 1].mobile.rows.map((r) => r.slug);
console.log(`\n=== mobile perf per page, oldest to newest ===`);
console.log('page'.padEnd(30) + runs.map((r) => r.runId.slice(-4)).map((s) => pad(s, 6)).join('') + '   lcp spread');
for (const s of slugs) {
  const cells = runs.map((r) => r.mobile.rows.find((x) => x.slug === s));
  const lcps = cells.filter(Boolean).map((c) => c.lcp);
  const spread = lcps.length > 1 ? Math.max(...lcps) - Math.min(...lcps) : 0;
  console.log(s.padEnd(30) + cells.map((c) => pad(c ? c.perf : '-', 6)).join('') + pad(spread + 'ms', 12));
}
console.log('\nA spread of several hundred ms on a page nothing touched is variance, not a regression.');
