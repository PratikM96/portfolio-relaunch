/**
 * Distill one raw Lighthouse batch from scripts/perf/out/ (see run.sh) into the committed src/data/portfolio-perf.json that PerfTable.astro renders, and append the same distilled snapshot to scripts/perf/history.jsonl. One row per page, plus mobile/desktop averages. Measured, never authored.
 *
 *   node scripts/perf/emit.mjs                  # newest run folder
 *   node scripts/perf/emit.mjs 20260727-1307    # a specific one, to re-emit an older batch
 *
 * **Why the history exists.** A single mobile run is not evidence: across three consecutive runs the worst page changed identity, unchanged pages swung +/-750ms, and only the mean was readable. `history.jsonl` is committed (raw runs are ~30MB a batch and gitignored), one JSON object per line so a new run is one added line in a diff.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT_ROOT = path.join(ROOT, 'scripts/perf/out');
const HISTORY = path.join(ROOT, 'scripts/perf/history.jsonl');
const lines = fs.readFileSync(path.join(ROOT, 'scripts/perf/urls.txt'), 'utf8').trim().split('\n');

/**
 * Which batch to distill. An explicit argument wins, so an older run can be re-emitted; otherwise the newest folder by name, which sorts chronologically because run.sh names them YYYYMMDD-HHMM. Falls back to OUT_ROOT itself for a batch written before runs were foldered.
 */
function resolveRun() {
  const arg = process.argv[2];
  if (arg) {
    const dir = path.isAbsolute(arg) ? arg : path.join(OUT_ROOT, arg);
    if (!fs.existsSync(dir)) {
      console.error(`No such run folder: ${dir}`);
      process.exit(1);
    }
    return dir;
  }
  if (!fs.existsSync(OUT_ROOT)) {
    console.error('scripts/perf/out/ does not exist. Run scripts/perf/run.sh first.');
    process.exit(1);
  }
  const folders = fs.readdirSync(OUT_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  if (folders.length) return path.join(OUT_ROOT, folders[folders.length - 1]);
  return OUT_ROOT;
}

const OUT = resolveRun();
const runId = path.basename(OUT);

/** Display name per urls.txt slug. A slug with no entry here falls back to the raw slug, which PerfTable then renders publicly on /work/portfolio-system, so adding a URL to urls.txt means adding its label in the same change. */
const LABEL = {
  home: 'Home', about: 'About', brand: 'Brand', contact: 'Contact', journal: 'Journal',
  privacy: 'Privacy', resume: 'Resume', work: 'Work index',
  'journal-engineer-to-creative': 'Journal: engineer to creative',
  'journal-handoff': 'Journal: the handoff', 'journal-ai': 'Journal: AI + creative',
  'journal-machine-readable-brand': 'Journal: machine-readable brand',
  'journal-sub-brands': 'Journal: sub-brands',
  'work-agency-fiveeighty': 'Case: Agency FiveEighty', 'work-dealnews': 'Case: DealNews',
  'work-frc': 'Case: Forest Road', 'work-jmtp': 'Case: JMTP', 'work-level': 'Case: Level',
  'work-pipeline-medical': 'Case: Pipeline Medical', 'work-raa': 'Case: RAA',
  'work-sportime-clubs': 'Case: SPORTIME', 'work-sr-love-and-care': 'Case: SR Love & Care',
  'work-the-ninth': 'Case: The Ninth', 'work-wisp': 'Case: WISP',
  'work-portfolio-system': 'Case: Portfolio System',
};

/**
 * Every sample file for one page and strategy, newest naming first. run.sh writes `<strat>-<slug>-<i>.json`; the unsuffixed form is a batch from before it sampled, and counts as a single sample.
 */
function sampleFiles(strat, slug) {
  const legacy = path.join(OUT, `${strat}-${slug}.json`);
  const numbered = fs.existsSync(OUT)
    ? fs.readdirSync(OUT)
        .filter((f) => new RegExp(`^${strat}-${slug}-\\d+\\.json$`).test(f))
        .sort((a, b) => Number(a.match(/-(\d+)\.json$/)[1]) - Number(b.match(/-(\d+)\.json$/)[1]))
        .map((f) => path.join(OUT, f))
    : [];
  if (numbered.length) return numbered;
  return fs.existsSync(legacy) ? [legacy] : [];
}

function readOne(f) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const a = d.audits;
  const nv = (k) => (a[k] && typeof a[k].numericValue === 'number' ? a[k].numericValue : null);
  const cat = (k) => (d.categories[k] ? Math.round(d.categories[k].score * 100) : null);
  return {
    fetchTime: d.fetchTime, lhVersion: d.lighthouseVersion,
    perf: cat('performance'),
    a11y: cat('accessibility'),
    bp: cat('best-practices'),
    seo: cat('seo'),
    lcp: Math.round(nv('largest-contentful-paint')),
    cls: Number(nv('cumulative-layout-shift').toFixed(3)),
    tbt: Math.round(nv('total-blocking-time')),
    fcp: Math.round(nv('first-contentful-paint')),
    kib: Math.round(nv('total-byte-weight') / 1024),
  };
}
const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;

/**
 * The representative sample for a page: **the median one, not an average of all of them.**
 *
 * Averaging each metric independently would publish a row that never happened: an FCP from one load beside an LCP from another. Distributions are right-skewed too, so one slow sample drags a mean while barely moving a median. One median sample keeps the row mutually consistent and real, same as Lighthouse CI.
 *
 * Ordered by performance score, then LCP as the tiebreak, since scores tie constantly. With an even count this takes the LOWER middle, so the published figure is never the flattering half of a coin flip.
 */
function median(samples) {
  const sorted = [...samples].sort((a, b) => a.perf - b.perf || a.lcp - b.lcp);
  return sorted[Math.floor((sorted.length - 1) / 2)];
}

const spread = (samples, key) => (samples.length > 1
  ? Math.max(...samples.map((s) => s[key])) - Math.min(...samples.map((s) => s[key]))
  : 0);

let lhVersion = '', fetchTime = '';
const runDays = new Set();
/** Per-strategy sampling summary, so the history records how much confidence a run carries. */
const sampling = {};
const build = (strat) => {
  const counts = [];
  const lcpSpreads = [];
  const perfSpreads = [];
  const rows = lines.map((l) => {
    const slug = l.split('|')[0];
    const samples = sampleFiles(strat, slug).map(readOne);
    if (!samples.length) return null;
    const m = median(samples);
    counts.push(samples.length);
    lcpSpreads.push(spread(samples, 'lcp'));
    perfSpreads.push(spread(samples, 'perf'));
    // stamped from the newest sample, since fetchTime is per load
    for (const s of samples) {
      lhVersion = s.lhVersion;
      if (s.fetchTime > fetchTime) fetchTime = s.fetchTime;
      runDays.add(s.fetchTime.slice(0, 10));
    }
    return {
      slug, label: LABEL[slug] || slug,
      perf: m.perf, a11y: m.a11y, bp: m.bp, seo: m.seo,
      lcp: m.lcp, cls: m.cls, tbt: m.tbt, fcp: m.fcp, kib: m.kib,
      // what the median hides: how far this page moved between samples of the same batch
      samples: samples.length,
      lcpSpread: spread(samples, 'lcp'),
    };
  }).filter(Boolean);
  sampling[strat] = {
    samplesPerPage: counts.length ? Math.min(...counts) === Math.max(...counts) ? counts[0] : `${Math.min(...counts)}-${Math.max(...counts)}` : 0,
    meanLcpSpread: lcpSpreads.length ? Math.round(avg(lcpSpreads)) : 0,
    maxLcpSpread: lcpSpreads.length ? Math.max(...lcpSpreads) : 0,
    maxPerfSpread: perfSpreads.length ? Math.max(...perfSpreads) : 0,
  };
  const average = {
    perf: Number(avg(rows.map((r) => r.perf)).toFixed(1)),
    a11y: Number(avg(rows.map((r) => r.a11y)).toFixed(1)),
    bp: Number(avg(rows.map((r) => r.bp)).toFixed(1)),
    seo: Number(avg(rows.map((r) => r.seo)).toFixed(1)),
    lcp: Math.round(avg(rows.map((r) => r.lcp))),
    cls: Number(avg(rows.map((r) => r.cls)).toFixed(3)),
    tbt: Math.round(avg(rows.map((r) => r.tbt))),
    fcp: Math.round(avg(rows.map((r) => r.fcp))),
    kib: Math.round(avg(rows.map((r) => r.kib))),
    perfect: rows.filter((r) => r.perf === 100).length,
    zeroCls: rows.filter((r) => r.cls === 0).length,
    count: rows.length,
  };
  return { rows, average, sampling: sampling[strat] };
};

const mobile = build('mobile');
const desktop = build('desktop');
if (!mobile.rows.length) { console.error(`No runs found in ${path.relative(ROOT, OUT)}. Run scripts/perf/run.sh first.`); process.exit(1); }
// `measuredOn` is the newest fetchTime, so a half-finished batch would silently inherit today's date while carrying rows from an older run. out/ is gitignored and never cleared, so leftovers survive an interrupted run.sh. Refuse to stamp a mixed set.
if (runDays.size > 1) {
  console.error(`Runs span ${runDays.size} days: ${[...runDays].sort().join(', ')}.`);
  console.error('A snapshot must come from one batch. Re-run scripts/perf/run.sh to completion, then retry.');
  process.exit(1);
}
/**
 * Was the machine busy while this ran?
 *
 * Lighthouse records `environment.benchmarkIndex`, a CPU score taken at measurement time, in every sample. It is the only objective record of how fast the host actually was, and it matters more than it looks: `run.sh` passes no throttling flags, so Lighthouse SIMULATES throttling — it observes real task durations and multiplies them by `cpuSlowdownMultiplier`, which is **4x on mobile and 1x on desktop**. A main-thread task stretched by background load is therefore amplified fourfold into the mobile TBT and score, and barely at all into desktop. That asymmetry is the tell: mobile sagging while desktop holds is host load, not the site.
 *
 * The floor below is this machine's own idle baseline, from the 150-sample 20260728-1651 batch (min 2822, median 3060, 1.10x spread end to end). It is a property of that laptop, not a universal number: re-derive it from a known-quiet run if the hardware changes.
 */
const BENCH_FLOOR = 2800;
const BENCH_SPREAD_MAX = 1.25;
const benches = fs.readdirSync(OUT).filter((f) => f.endsWith('.json'))
  .map((f) => { try { return JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')).environment?.benchmarkIndex; } catch { return null; } })
  .filter((b) => typeof b === 'number').sort((a, b) => a - b);
const host = benches.length
  ? {
      samples: benches.length,
      min: Math.round(benches[0]),
      median: Math.round(benches[Math.floor(benches.length / 2)]),
      max: Math.round(benches[benches.length - 1]),
      spread: Number((benches[benches.length - 1] / benches[0]).toFixed(2)),
    }
  : null;

const data = { measuredOn: fetchTime.slice(0, 10), lighthouseVersion: lhVersion, pages: mobile.rows.length, mobile, desktop };
const dest = path.join(ROOT, 'src/data/portfolio-perf.json');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(data, null, 2) + '\n');
console.log(`wrote src/data/portfolio-perf.json — ${data.pages} pages, LH ${lhVersion} on ${data.measuredOn}`);
console.log('mobile  sampling:', JSON.stringify(mobile.sampling));
console.log('desktop sampling:', JSON.stringify(desktop.sampling));
console.log('mobile avg:', JSON.stringify(mobile.average));
console.log('desktop avg:', JSON.stringify(desktop.average));
if (mobile.sampling.samplesPerPage === 1) {
  console.log('\nNOTE: one sample per page. A single mobile run is not evidence — pages near a scoring threshold land either side of it by chance. Use REPEATS=3 (or 5) so each row is a median.');
}

if (host) {
  console.log('host CPU:', JSON.stringify(host));
  const slow = host.median < BENCH_FLOOR;
  const unstable = host.spread > BENCH_SPREAD_MAX;
  if (slow || unstable) {
    console.log('\n' + '='.repeat(72));
    console.log('SUSPECT RUN — the machine was not idle.');
    if (slow) console.log(`  median benchmarkIndex ${host.median} is below the ${BENCH_FLOOR} idle baseline: sustained load, or the laptop was on battery / not in a performance power mode.`);
    if (unstable) console.log(`  benchmarkIndex swung ${host.spread}x within the batch (min ${host.min}, max ${host.max}): something started or stopped mid-run, so early and late pages were not measured on the same machine.`);
    console.log('  Mobile scores take a 4x CPU multiplier under simulated throttling, so this lands in TBT and LCP.');
    console.log('  Do not publish this batch. Re-run idle, then compare AVERAGES against history.jsonl.');
    console.log('='.repeat(72));
  }
}

/* Keyed on runId and rewritten in place rather than blindly appended, so re-emitting a batch corrects its line instead of adding a duplicate. `fetchTime` rides along because runId comes from the clock when run.sh started while fetchTime is when Lighthouse actually loaded the page; they differ by however long the batch took. */
const entry = { runId, fetchTime, host, ...data };
const prior = fs.existsSync(HISTORY)
  ? fs.readFileSync(HISTORY, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l))
  : [];
const replaced = prior.some((e) => e.runId === runId);
const merged = [...prior.filter((e) => e.runId !== runId), entry].sort((a, b) => a.runId.localeCompare(b.runId));
fs.writeFileSync(HISTORY, merged.map((e) => JSON.stringify(e)).join('\n') + '\n');
console.log(`history.jsonl — ${replaced ? 'replaced' : 'added'} ${runId}, ${merged.length} run(s) recorded`);
