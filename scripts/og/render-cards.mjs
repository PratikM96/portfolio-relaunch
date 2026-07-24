/**
 * OG share cards — render every card from source.
 *
 * The params (badge / kick / title / meta / tag) used to be typed by hand at the
 * command line and were never recorded anywhere, so the set could not be
 * regenerated: anything that changed every card (a font swap, a token change, the
 * client -> in-house relabel) meant reverse-engineering 17 PNGs. This file IS the
 * record. Case-study params derive from the content entries, so they cannot drift
 * from the site; only the fixed site pages are listed by hand.
 *
 *   node scripts/og/render-cards.mjs            # all
 *   node scripts/og/render-cards.mjs dealnews   # one, by output name
 *
 * Requires Chrome. Renders at exactly 1200x630 into public/og/.
 * Recipe + the brand-per-concept rules live in docs/og-cards.md.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = resolve(import.meta.dirname, '../..');
const TPL = 'file:///' + join(ROOT, 'scripts/og/og-template.html').replace(/\\/g, '/').replace(/ /g, '%20');
const OUT = join(ROOT, 'public/og');

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
].find((p) => existsSync(p));
if (!CHROME) { console.error('Chrome not found — edit the CHROME list.'); process.exit(1); }

// --- read the work collection: the params below derive from it, never from memory
const workDir = join(ROOT, 'src/content/work');
const entries = readdirSync(workDir).filter((f) => f.endsWith('.md')).map((f) => {
  const src = readFileSync(join(workDir, f), 'utf8');
  const get = (k) => (src.match(new RegExp('^' + k + ': *"?(.*?)"? *$', 'm')) || [])[1] || '';
  const disciplines = (src.match(/^disciplines: *\[(.*)\]/m) || [])[1] || '';
  return {
    slug: get('slug'),
    title: get('title'),
    type: get('type'),
    disciplines: disciplines.split(',').map((s) => s.trim()).filter(Boolean),
  };
});

const TYPE_LABEL = { 'in-house': 'In-house', agency: 'Agency', concept: 'Concept' };
// Concepts with their own invented microsite brand (public/concepts/<slug>/) get
// that brand + name tag. Portfolio System is the exception: it IS the One System
// brand (the site itself), so it falls back to the onesystem palette + tag below.
const CONCEPT_TAG = { 'the-ninth': 'The Ninth', level: 'Level', wisp: 'WISP' };
const CONCEPT_BRAND = { 'the-ninth': 'the-ninth', level: 'level', wisp: 'wisp' };

// --- fixed site pages (no collection to derive from)
const SITE = [
  { name: 'default', badge: 'Portfolio', kick: 'Creative Marketing Lead', title: 'One system, end to end.', meta: 'mehtapratik.com', tag: 'One System' },
  { name: 'about', badge: 'About', kick: 'The full creative stack', title: 'Pratik Mehta', meta: 'mehtapratik.com', tag: 'One System' },
  { name: 'work', badge: 'Work', kick: 'In-house · Agency · Concept', title: 'The work, as one index.', meta: 'mehtapratik.com', tag: 'One System' },
  { name: 'resume', badge: 'Resume', kick: 'Ten years, one system', title: 'Pratik Mehta', meta: 'mehtapratik.com', tag: 'One System' },
  { name: 'journal', badge: 'Journal', kick: 'Notes on systems, brand, AI', title: 'Working notes, not takes.', meta: 'mehtapratik.com', tag: 'One System' },
  { name: 'brand', badge: 'Brand', kick: 'One System · v1.0', title: 'The brand, built like a product.', meta: 'mehtapratik.com', tag: 'One System' },
];

// --- per-case-study, derived
const WORK = entries.map((e) => {
  const isConcept = e.type === 'concept';
  return {
    name: e.slug,
    brand: isConcept ? (CONCEPT_BRAND[e.slug] || 'onesystem') : 'onesystem',
    badge: isConcept ? 'Concept' : `Case study · ${TYPE_LABEL[e.type]}`,
    kick: e.disciplines.join(' · '),
    title: e.title,
    meta: isConcept ? 'Self-initiated · mehtapratik.com' : 'Case study · mehtapratik.com',
    tag: isConcept ? (CONCEPT_TAG[e.slug] || 'One System') : 'One System',
  };
});

const ALL = [...SITE, ...WORK];
const only = process.argv[2];
const cards = only ? ALL.filter((c) => c.name === only) : ALL;
if (!cards.length) { console.error('No card named "' + only + '". Known: ' + ALL.map((c) => c.name).join(', ')); process.exit(1); }

// Chrome's --screenshot fails on paths containing spaces, so render to a temp dir.
const tmp = join(tmpdir(), 'og-render');
mkdirSync(tmp, { recursive: true });
mkdirSync(OUT, { recursive: true });

for (const c of cards) {
  const q = new URLSearchParams({
    brand: c.brand || 'onesystem',
    badge: c.badge, kick: c.kick, title: c.title, meta: c.meta, tag: c.tag,
  }).toString();
  const shot = join(tmp, c.name + '.png');
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--force-color-profile=srgb',
    '--window-size=1200,630', '--virtual-time-budget=6000',
    '--screenshot=' + shot, TPL + '?' + q,
  ], { stdio: 'ignore' });
  writeFileSync(join(OUT, c.name + '.png'), readFileSync(shot));
  console.log('  ' + (c.name + '.png').padEnd(24) + (c.brand || 'onesystem').padEnd(11) + c.badge);
}
rmSync(tmp, { recursive: true, force: true });
console.log('\n' + cards.length + ' card(s) -> public/og/');
