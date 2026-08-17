/**
 * Claim check — fails when a metric on the site drifts from its approved public wording, or when a retired claim comes back.
 *
 *   npm run check:claims
 *
 * The content schema validates an entry's SHAPE; this validates its VALUES.
 *
 * Approved wordings are embedded here rather than read from the Resume Master's Claim Registry: that lives in gitignored `_reference/`, so a check reading it would pass silently wherever the Drive link is missing. Change both in the same commit.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');

/** Files whose visible copy is checked. Comments are stripped first. */
const TARGETS = [
  ...readdirSync(join(ROOT, 'src/content/work')).map((f) => `src/content/work/${f}`),
  ...readdirSync(join(ROOT, 'src/content/journal')).filter((f) => f.endsWith('.md')).map((f) => `src/content/journal/${f}`),
  'src/pages/index.astro',
  'src/pages/about.astro',
  'src/pages/resume.astro',
  'src/pages/contact.astro',
  'src/pages/brand.astro',
  'src/pages/privacy.astro',
  'src/pages/work/index.astro',
  // The author bio here renders on every journal post, so it is copy like any page's.
  'src/pages/journal/[slug].astro',
  'src/components/CloseCTA.astro',
  'src/layouts/Base.astro',
  'src/lib/brands.ts',
  'public/llms.txt',
  // docs/ is git-tracked and this repo is public, so a doc leaks a claim exactly as far as a page does. It was outside this list while the Cloud9 rule below already existed, which is how `docs/og-cards.md` came to name the organization the rule forbids: the guard was written and simply never pointed at the file.
  ...readdirSync(join(ROOT, 'docs')).filter((f) => f.endsWith('.md')).map((f) => `docs/${f}`),
  // The concept microsites are shipped pages that state claims about the concepts, so they carry the same rules as a case study. Same blind spot as docs/ above: while they sat outside this list, /work/the-ninth said "moment-clipper prototype" and the microsite still said "live AI moment-clipper", and WISP's lede contradicted its own disclosure. The organization-name rule is exempted for them below; nothing else is.
  ...readdirSync(join(ROOT, 'public/concepts'), { recursive: true }).filter((f) => String(f).endsWith('.html')).map((f) => `public/concepts/${String(f).replace(/\\/g, '/')}`),
];

/**
 * A banned pattern and why. `allow` exempts specific files, or a whole directory when the entry ends in `/`.
 *
 * `copyOnly` marks a rule that governs ONE SYSTEM'S EXTERNAL-FACING COPY rather than truth: dashes, separators, CTA wording. Those are reader-facing style (CLAUDE.md §4) and are skipped for two surfaces that are not that copy: `docs/`, which is build documentation the public never reads as prose, and `public/concepts/`, where each microsite is its own brand with its own voice. Claim rules, spelling and the rot bans carry no flag and apply everywhere, because a doc or a concept leaks a wrong metric exactly as far as a page does and §4 puts spelling in docs explicitly.
 */
const BANNED = [
  // --- counts the registry carries exactly: no "+" ---
  { re: /\b40\+\s*(UI )?screens?/i, why: 'The Ninth is 40 screens exactly, not "40+".' },
  { re: /\b8\+\s*(AI-assisted )?features?/i, why: 'The Ninth is 8 AI-assisted features, not "8+".' },
  { re: /\b5\+\s*(demo )?views?/i, why: 'The Ninth has 5 demo views, not "5+"; its own foot copy says "Five".' },
  { re: /\b30\+\s*(UI )?screens?/i, why: 'Level is 30 screens exactly, not "30+".' },
  { re: /\b12\+\s*(total |core )?screens?/i, why: 'WISP is 12 core screens, not "12+".' },
  { re: /\b3\+\s*(live |streamed )*use cases?/i, why: 'WISP is 3 use cases, not "3+".' },
  { re: /\b20\+\s*UI components?/i, why: 'Pipeline Medical is 20 UI components, not "20+".' },
  { re: /patterns coded/i, why: 'WISP has "prompt and response patterns"; "coded" overstates it as engineering.' },
  { re: /\b10K\+/i, why: 'Design assets produced is "10,000+". 10K+ is an abbreviated variant of the same value.' },

  // --- stripped hedges: the registry hedges, so the site must too ---
  { re: /\b300\+\s*(digital )?(production )?assets/i, why: 'RAA is "roughly 300" digital assets. Keep the hedge; never "300+".' },
  { re: /\b16\.8\s*K?\b/i, why: 'SPORTIME net new followers is "nearly 17K". 16.8K is more precise than the approved wording.' },
  // Bare 60 only: "nearly 60" is the approved wording.
  { re: /(?<!nearly\s)(?<!~)\b60\s+environmental/i, why: 'RAA is "nearly 60" environmental pieces. A bare 60 rounds up past the approved value.' },

  // --- retired exact-value variants ---
  { re: /29\.81|1\.74\s*%|6\.6\s*%|7\.5\s*%|\$70\.11/, why: 'Retired exact-value metric variant. Use the approved value.' },

  // --- claim boundaries ---
  // The Claim Registry names both of these as retired and says this file enforces them. It did not, so the only thing stopping either from returning was memory.
  { re: /zero layout shift|\bzero\s+CLS\b|\b0\s+CLS\b/i, why: 'Retired: a perfect Lighthouse score already entails a good CLS, so this was a second number saying the same thing and the only one that could rot. PerfTable renders per-page CLS as measured detail instead.' },
  { re: /\b\d+\+?\s*(brand|identity)\s+systems?\b/i, why: 'The brand-systems / identity-systems count is retired and needs an approved count method before it returns.' },
  { re: /consent[- ]gated|behind a consent gate/i, why: 'Retired with the geo-split: analytics are gated only in the EEA, the UK and Switzerland, and load on arrival behind an opt-out notice everywhere else. "Consent-gated" describes the old global gate and is false for most visitors. Say opt-in in Europe, opt-out elsewhere.' },
  { re: /live AI moment-clipper/i, why: 'The clipper is a working PROTOTYPE, never "live".' },
  { re: /a live AI host\b/i, why: 'WISP is a scripted demonstration; its own disclosure says "not a live AI model".' },
  { re: /Cloud9|\bC9\b/, why: 'The Ninth does not name the organization on portfolio surfaces (CLAUDE.md §3). Its microsite is the deliberate exception, since the sub-brand is built on that identity and every page carries its own non-affiliation footer.', allow: ['public/concepts/the-ninth/'] },
  { re: /volunteer-grade/i, why: 'Disparages volunteer work, which is also SR Love and Care’s proof.' },
  { re: /never trains a dopamine loop/i, why: 'Unsupported behavioral outcome. Describe the visual treatment instead.' },
  { re: /never falls into the uncanny valley/i, why: 'Absolute claim. Say it does not depend on human likeness.' },
  { re: /for a real launch/i, why: 'Pipeline Medical’s launch is not verified. Say "developer handoff and a planned launch".' },
  { re: /survived the founder leaving/i, why: 'Reads as the organization’s founder. Say the team continued after the handoff.' },
  { re: /can’t drift from the real|can't drift from the real/i, why: '/brand only renders TOKEN VALUES live. Prose, examples and the contrast ratios can all drift.' },
  { re: /concept case studies carry scope only|scope and rationale, never performance results/i, why: 'A shipped concept follows the same rules as real work.' },
  { re: /open to (creative or marketing )?roles?\b/i, why: 'Retired: the search ended. The meta pair states location and role instead, and the rail status reads "Open to conversations".' },
  { re: /Marketing Director at a nonprofit|Director \/ Nonprofit/i, why: 'The employer is named: "International Student Exchange" in prose, "ISE" in a label row. Unrelated nonprofit copy (JMTP, SR Love and Care) is untouched by this pattern.' },
  { re: /Director of Marketing/i, why: 'The title is "International Marketing Director". "Social Media Director" is a different string and unaffected.' },

  // --- style defaults ---
  { re: /·/, copyOnly: true, why: 'The middle dot is retired from copy. Use | in titles, nothing in meta descriptions, / in label rows.', allow: ['src/layouts/Base.astro', 'src/pages/brand.astro'] },
  // Absolute: date ranges use hyphens everywhere, matching the `year` fields they derive from.
  { re: /[—–]/, copyOnly: true, why: 'No em or en dashes in external-facing copy. Date ranges use hyphens here (CLAUDE.md §4).' },
  { re: /Start a conversation|See the work\b|Read the resume/i, copyOnly: true, why: 'Retired CTA wording. Use "Get in touch", "View work", "View resume".' },
  // American spelling in copy: the audience is US hiring teams, and /brand once shipped "Color" in one heading and "Colour" in another. Only unambiguous pairs are listed. Words correct in both (advertising, raised, analysis, emphasis) are absent on purpose, and the -ise group requires a known stem so surprise/exercise/comprise can't trip it.
  {
    re: /\b(colour(s|ed|ing)?|behaviour(s|al)?|honour(ed|s|ing)?|favour(ed|s)?|labour|humour|flavour|centre[sd]?|metre|theatre|fibre|litre|calibre|licence|defence|offence|pretence|programme|labell(ed|ing)|cancell(ed|ing)|modelled|signalled|travelled|levelled|marvellous|grey(ed)?|whilst|amongst|learnt|spelt|storey|sceptical|instalment|skilful|judgement|(?:organi|recogni|reali|optimi|normali|prioriti|customi|minimi|maximi|summari|standardi|speciali|categori|initiali|visuali|utili|tokeni|capitali|neutrali|analy)s(e|es|ed|ing|ation))\b/i,
    why: 'Use American spelling in copy (color, behavior, program, labeled, gray, organize). CLAUDE.md §4.',
  },
  { re: /roles\s*\/\s*New York|roles\s*·\s*New York/i, copyOnly: true, why: 'Availability and location must be separate lines; joined they read as a geographic restriction.' },

  // --- rot ---
  { re: /\b1[0-9]{2}\s+commits\b/i, why: 'Never publish a commit count; it rots immediately (CLAUDE.md §10).' },
  { re: /all \d+ pages/i, why: 'Never publish a page count; PerfTable derives it from portfolio-perf.json.' },
  { re: /Lighthouse \d+\.\d+/i, why: 'Never publish the Lighthouse version in copy; PerfTable renders it from portfolio-perf.json, and a hardcoded one goes stale on the next run.' },
];

/** Strip comments so an intentional note ABOUT a banned string does not trip the check. */
function visibleCopy(src, file) {
  let s = src;
  if (file.endsWith('.md')) {
    // YAML comments: whole-line only, so a "#" inside a quoted value survives.
    s = s.replace(/^\s*#.*$/gm, '');
  } else {
    s = s
      .replace(/\/\*[\s\S]*?\*\//g, '')      // block comments (incl. JSX {/* */} bodies)
      .replace(/(^|[^:\w])\/\/.*$/gm, '$1'); // line comments; [^:\w] spares "https://"
  }
  return s;
}

let failures = 0;

/**
 * Every demo tab's `view` needs its still at src/assets/concepts/<project>/preview-<view>.webp. EmbeddedDemo throws on a miss, but that throw does not fail `astro build` — verified by removing a still and watching the build exit 0 with the demo silently absent. This does fail it, because check:claims runs first.
 */
for (const f of readdirSync(join(ROOT, 'src/content/work')).filter((x) => x.endsWith('.md'))) {
  const src = readFileSync(join(ROOT, 'src/content/work', f), 'utf8');
  const project = src.match(/^\s*project:\s*(\S+)/m)?.[1];
  if (!project) continue;
  for (const m of src.matchAll(/^\s*-\s*\{\s*view:\s*([^,\s]+)/gm)) {
    const view = m[1];
    const still = join(ROOT, 'src/assets/concepts', project, `preview-${view}.webp`);
    if (!existsSync(still)) {
      failures++;
      console.error(`\n  src/content/work/${f}`);
      console.error(`    demo tab view "${view}" has no still at src/assets/concepts/${project}/preview-${view}.webp`);
    }
  }
}

/**
 * Above-the-fold reveals. `.rev` is opacity-based and Chromium excludes an element starting at `opacity: 0` from LCP entirely, so a hero built with it hands LCP to whatever paints next. Six of eleven page templates had this wrong, and the cost was invisible on desktop: /brand measured 4238ms mobile LCP against 973ms FCP while its pixels were on screen by 1144ms, and scored 100 on desktop the whole time.
 *
 * Nothing else catches it. It is not a type error, not a schema violation, and the page renders correctly — only the metric moves.
 *
 * A shared `PageHero` component was tried and reverted: passing a page's layout class into a component moves that element into the COMPONENT's style scope, so every page rule targeting the wrapper (`.bhero`, `.bhero p`, and their media-query overrides) silently stopped matching and seven pages lost their hero padding in production. `:global()` was not an escape either, since `.phead` is shared by two pages with different padding. So pages own their hero element, and this check is what holds the line.
 *
 * Scans source rather than the build, since this runs before `astro build`. Comments are stripped first so the rule's own prose cannot trip it.
 */
for (const rel of readdirSync(join(ROOT, 'src/pages'), { recursive: true })
  .map((f) => `src/pages/${String(f).replace(/\\/g, '/')}`)
  .filter((f) => f.endsWith('.astro'))) {
  const body = visibleCopy(readFileSync(join(ROOT, rel), 'utf8'), rel);
  // The first reveal-bearing element a page declares IS its hero, so it must be the transform-only variant.
  const first = body.match(/class(?::list)?=(?:"|\{?\[)[^"}]*\brev(-load)?\b/);
  if (first && !first[1]) {
    failures++;
    console.error(`\n  ${rel}`);
    console.error(`    the first reveal above the fold is \`.rev\`, which is opacity:0 and therefore excluded from LCP`);
    console.error(`    put \`rev-load\` on the hero wrapper instead; keep \`.rev\` for below-the-fold blocks`);
  }
}

/**
 * The roster guards in `src/lib/brands.ts` throw at module load, which kills only the pages that import it: verified by pointing a chip at a missing name and watching the build exit 0 with a ZERO-BYTE index.html and work.html. Same trap as the demo stills above, so the same fix. Parsed as text because brands.ts is TypeScript and this is plain node.
 */
{
  const rel = 'src/lib/brands.ts';
  const src = readFileSync(join(ROOT, rel), 'utf8');
  const strings = (block) => [...block.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, "'"));
  const groupsBlock = src.match(/BRAND_GROUPS[^=]*=\s*\[([\s\S]*?)\n\];/)?.[1] ?? '';
  const chipsBlock = src.match(/HOME_CHIPS[^=]*=\s*\[([\s\S]*?)\n\];/)?.[1] ?? '';

  const labels = [...groupsBlock.matchAll(/label:\s*'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]);
  const brands = [...groupsBlock.matchAll(/brands:\s*\[([^\]]*)\]/g)].flatMap((m) => strings(m[1]));
  // A chip may name a group as well as a brand: SPORTIME Clubs is a roster name too, and the guard's job is catching typos and stale names, not policing which tier a chip comes from.
  const known = new Set([...labels, ...brands]);

  for (const chip of strings(chipsBlock)) {
    if (known.has(chip)) continue;
    failures++;
    console.error(`\n  ${rel}`);
    console.error(`    HOME_CHIPS names "${chip}", which is not a brand or group in BRAND_GROUPS`);
  }

  // Excludes the `direct` group: a category header, not an organization. Mirrors the ORG_COUNT guard in brands.ts.
  const orgCount = labels.length - 1 + brands.length;
  if (orgCount < 30) {
    failures++;
    console.error(`\n  ${rel}`);
    console.error(`    roster carries ${orgCount} organizations, which no longer supports the published "30+"`);
  }
}

/**
 * The GA4 install. Three ways it has drifted or could drift again, all invisible at runtime and none caught by anything else.
 *
 * The concept microsites are static passthrough HTML, so they cannot import from `src/`. They load a GENERATED copy of `src/scripts/ga-core.js`, produced by `npm run concepts:ga`. The generator is deliberately not wired into `prebuild`: regenerating automatically would silently overwrite a hand edit to the copy, which is exactly the failure this checks for.
 */
{
  const CORE_SRC = 'src/scripts/ga-core.js';
  const CORE_GEN = 'public/concepts/ga-core.js';
  /** Lines of "generated, do not edit" banner the generator prepends. Changing it in scripts/concepts/build-ga-core.mjs means changing this. */
  const BANNER_LINES = 4;

  // 1. One measurement ID, one home. Re-hardcoding it elsewhere is the drift that already happened: the old concepts file carried its own copy and never got the deferred load.
  const scan = (dir) => {
    const out = [];
    for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) {
        if (rel === 'scripts/perf/out' || e.name === 'node_modules') continue;
        out.push(...scan(rel));
      } else if (/\.(js|mjs|ts|astro|md|txt|json|html)$/.test(e.name)) out.push(rel);
    }
    return out;
  };
  for (const rel of [...scan('src'), ...scan('public'), ...scan('scripts'), ...scan('docs')]) {
    if (rel === CORE_SRC || rel === CORE_GEN) continue;
    const hit = readFileSync(join(ROOT, rel), 'utf8').match(/G-[A-Z0-9]{8,}/);
    if (!hit) continue;
    failures++;
    console.error(`\n  ${rel}`);
    console.error(`    hardcodes the measurement ID ${hit[0]}. It belongs only in ${CORE_SRC}; import GA from there.`);
  }

  // 2. The generated copy must still be its source. Catches both directions: a hand edit to the copy, and a source edit that never regenerated.
  if (existsSync(join(ROOT, CORE_GEN))) {
    const source = readFileSync(join(ROOT, CORE_SRC), 'utf8');
    const generated = readFileSync(join(ROOT, CORE_GEN), 'utf8').split('\n').slice(BANNER_LINES).join('\n');
    if (generated !== source) {
      failures++;
      console.error(`\n  ${CORE_GEN}`);
      console.error(`    no longer matches ${CORE_SRC}. Edit the source, then run: npm run concepts:ga`);
    }
  } else {
    failures++;
    console.error(`\n  ${CORE_GEN}`);
    console.error(`    missing. Run: npm run concepts:ga`);
  }

  // 3. A concept page shipping without the module is a page with no analytics and, worse, no opt-out control while /privacy promises one.
  for (const slug of readdirSync(join(ROOT, 'public/concepts'), { withFileTypes: true }).filter((e) => e.isDirectory())) {
    for (const f of readdirSync(join(ROOT, 'public/concepts', slug.name)).filter((x) => x.endsWith('.html'))) {
      const rel = `public/concepts/${slug.name}/${f}`;
      if (readFileSync(join(ROOT, rel), 'utf8').includes('type="module" src="/concepts/analytics.js"')) continue;
      failures++;
      console.error(`\n  ${rel}`);
      console.error(`    does not load <script type="module" src="/concepts/analytics.js">, so it runs with no analytics and no opt-out control`);
    }
  }
}

/**
 * Perf prose, checked against the measured run.
 *
 * Structured figures derive: a scoreboard cell or proof figure carrying `from` resolves through `src/lib/perf-claim.ts` out of `portfolio-perf.json`, so a re-run moves them and nothing can drift. **Sentences cannot derive**, and the reason is not laziness. When the desktop score stopped being 100 the honest rewrite was "98 or better, every page", not "98 on every page" — the number changed shape, not just value, and a template swapping the digit would have published a claim that understated 22 pages at 100 while sounding more precise than the truth.
 *
 * So prose is GUARDED instead. Every sentence that names a perf figure is listed here with the resolver it must agree with. Change the measurement and the build stops, naming the file and the value, and a human writes the sentence.
 */
{
  const perf = JSON.parse(readFileSync(join(ROOT, 'src/data/portfolio-perf.json'), 'utf8'));
  const measured = {
    desktopLighthouse: String(Math.floor(Math.min(...perf.desktop.rows.map((r) => r.perf)))),
    mobileLighthouse: String(Math.floor(perf.mobile.average.perf)),
    desktopLcp: (Math.ceil((perf.desktop.average.lcp / 1000) * 10) / 10).toFixed(1),
  };

  // Each entry: the file, the figure it quotes, and a regex capturing the number as written. The capture group is what must equal the measured value.
  const PROSE = [
    { file: 'src/content/work/portfolio-system.md', source: 'desktopLighthouse', re: /(\d+) or better on desktop Lighthouse/ },
    { file: 'src/pages/index.astro', source: 'desktopLighthouse', re: /scores (\d+) or better on desktop Lighthouse/ },
    { file: 'src/pages/resume.astro', source: 'desktopLighthouse', re: /scoring (\d+) or better on desktop Lighthouse/ },
    { file: 'public/llms.txt', source: 'desktopLighthouse', re: /scores (\d+) or better on desktop Lighthouse/ },
  ];

  for (const p of PROSE) {
    const abs = join(ROOT, p.file);
    if (!existsSync(abs)) continue;
    const src = readFileSync(abs, 'utf8');
    const hits = [...src.matchAll(new RegExp(p.re, 'g'))];
    if (!hits.length) {
      failures++;
      console.error(`\n  ${p.file}`);
      console.error(`    expected a sentence quoting the ${p.source} figure and found none. If the claim moved or was cut, update the PROSE list in scripts/check/claims.mjs.`);
      continue;
    }
    for (const h of hits) {
      if (h[1] === measured[p.source]) continue;
      failures++;
      console.error(`\n  ${p.file}`);
      console.error(`    says ${JSON.stringify(h[0])}, but the measured run gives ${p.source} = ${measured[p.source]}.`);
      console.error(`    Rewrite the sentence; do not just swap the digit if the claim's shape changed.`);
    }
  }
}

for (const rel of TARGETS) {
  const abs = join(ROOT, rel);
  if (!existsSync(abs)) continue;
  const copy = visibleCopy(readFileSync(abs, 'utf8'), rel);
  const lines = copy.split('\n');
  const posix = rel.replace(/\\/g, '/');
  // Each concept microsite is its own brand with its own voice, so One System's copy conventions (separators, dashes, CTA wording) do not govern it. Its claims and spelling still do: a concept can state something untrue exactly as far as a case study can.
  const styleExempt = posix.startsWith('docs/') || posix.startsWith('public/concepts/');
  for (const rule of BANNED) {
    // An `allow` entry ending in `/` exempts the whole directory, so a microsite's pages do not have to be listed one by one and a new page inherits the exemption instead of failing the build on its first commit.
    if (rule.allow?.some((a) => (a.endsWith('/') ? posix.startsWith(a) : posix.endsWith(a)))) continue;
    if (styleExempt && rule.copyOnly) continue;
    lines.forEach((line, i) => {
      const m = line.match(rule.re);
      if (!m) return;
      failures++;
      console.error(`\n  ${rel}:${i + 1}`);
      console.error(`    found:  ${JSON.stringify(m[0])}`);
      console.error(`    why:    ${rule.why}`);
      console.error(`    line:   ${line.trim().slice(0, 120)}`);
    });
  }
}

if (failures) {
  console.error(`\n${failures} claim violation(s). Source of truth: the Resume Master's Claim Registry.\n`);
  process.exit(1);
}
console.log(`claims OK - ${TARGETS.length} files, ${BANNED.length} rules, 0 violations`);
