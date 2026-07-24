/**
 * Distill the raw Lighthouse runs in scripts/perf/out/ (see run.sh) into the
 * committed src/data/portfolio-perf.json that PerfTable.astro renders on the
 * Portfolio System case study. One row per page, plus mobile/desktop averages.
 * Numbers are measured, never authored: this file IS the record of how they
 * were produced, so the case-study table can always be regenerated.
 *
 *   node scripts/perf/emit.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT = path.join(ROOT, 'scripts/perf/out');
const lines = fs.readFileSync(path.join(ROOT, 'scripts/perf/urls.txt'), 'utf8').trim().split('\n');

const LABEL = {
  home: 'Home', about: 'About', brand: 'Brand', contact: 'Contact', journal: 'Journal',
  privacy: 'Privacy', resume: 'Resume', work: 'Work index',
  'journal-engineer-to-creative': 'Journal: engineer to creative',
  'journal-handoff': 'Journal: the handoff', 'journal-ai': 'Journal: AI + creative',
  'work-agency-fiveeighty': 'Case: Agency FiveEighty', 'work-dealnews': 'Case: DealNews',
  'work-frc': 'Case: Forest Road', 'work-jmtp': 'Case: JMTP', 'work-level': 'Case: Level',
  'work-pipeline-medical': 'Case: Pipeline Medical', 'work-raa': 'Case: RAA',
  'work-sportime-clubs': 'Case: SPORTIME', 'work-sr-love-and-care': 'Case: SR Love & Care',
  'work-the-ninth': 'Case: The Ninth', 'work-wisp': 'Case: WISP',
  'work-portfolio-system': 'Case: Portfolio System',
};

function read(strat, slug) {
  const f = path.join(OUT, `${strat}-${slug}.json`);
  if (!fs.existsSync(f)) return null;
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

let lhVersion = '', fetchTime = '';
const build = (strat) => {
  const rows = lines.map((l) => {
    const slug = l.split('|')[0];
    const m = read(strat, slug);
    if (!m) return null;
    lhVersion = m.lhVersion; if (m.fetchTime > fetchTime) fetchTime = m.fetchTime;
    return { slug, label: LABEL[slug] || slug, perf: m.perf, a11y: m.a11y, bp: m.bp, seo: m.seo, lcp: m.lcp, cls: m.cls, tbt: m.tbt, fcp: m.fcp, kib: m.kib };
  }).filter(Boolean);
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
  return { rows, average };
};

const mobile = build('mobile');
const desktop = build('desktop');
if (!mobile.rows.length) { console.error('No runs found in scripts/perf/out/. Run scripts/perf/run.sh first.'); process.exit(1); }
const data = { measuredOn: fetchTime.slice(0, 10), lighthouseVersion: lhVersion, pages: mobile.rows.length, mobile, desktop };
const dest = path.join(ROOT, 'src/data/portfolio-perf.json');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(data, null, 2) + '\n');
console.log(`wrote src/data/portfolio-perf.json — ${data.pages} pages, LH ${lhVersion} on ${data.measuredOn}`);
console.log('mobile avg:', JSON.stringify(mobile.average));
console.log('desktop avg:', JSON.stringify(desktop.average));
