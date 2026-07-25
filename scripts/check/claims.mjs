/**
 * Claim check — fails when a metric on the site drifts from its approved public wording,
 * or when a retired claim comes back.
 *
 *   npm run check:claims
 *
 * The content schema validates an entry's SHAPE; this validates its VALUES.
 *
 * Approved wordings are embedded here rather than read from the Resume Master's Claim
 * Registry: that lives in gitignored `_reference/`, so a check reading it would pass
 * silently wherever the Drive junction is missing. Change both in the same commit.
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
  'src/components/CloseCTA.astro',
  'src/layouts/Base.astro',
  'public/llms.txt',
];

/** A banned pattern and why. `allow` exempts specific files. `pre` transforms the line first. */
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
  { re: /live AI moment-clipper/i, why: 'The clipper is a working PROTOTYPE, never "live".' },
  { re: /a live AI host\b/i, why: 'WISP is a scripted demonstration; its own disclosure says "not a live AI model".' },
  { re: /Cloud9|\bC9\b/, why: 'The Ninth does not name the organization on portfolio surfaces (CLAUDE.md §3). The microsite under public/concepts/ is the deliberate exception and is not checked here.' },
  { re: /volunteer-grade/i, why: 'Disparages volunteer work, which is also SR Love and Care’s proof.' },
  { re: /never trains a dopamine loop/i, why: 'Unsupported behavioural outcome. Describe the visual treatment instead.' },
  { re: /never falls into the uncanny valley/i, why: 'Absolute claim. Say it does not depend on human likeness.' },
  { re: /for a real launch/i, why: 'Pipeline Medical’s launch is not verified. Say "developer handoff and a planned launch".' },
  { re: /survived the founder leaving/i, why: 'Reads as the organisation’s founder. Say the team continued after the handoff.' },
  { re: /can’t drift from the real|can't drift from the real/i, why: '/brand only renders TOKEN VALUES live. Prose, examples and the contrast ratios can all drift.' },
  { re: /concept case studies carry scope only|scope and rationale, never performance results/i, why: 'A shipped concept follows the same rules as real work.' },

  // --- style defaults ---
  { re: /·/, why: 'The middle dot is retired from copy. Use | in titles, nothing in meta descriptions, / in label rows.', allow: ['src/layouts/Base.astro', 'src/pages/brand.astro'] },
  // Absolute: date ranges use hyphens everywhere, matching the `year` fields they derive from.
  { re: /[—–]/, why: 'No em or en dashes in external-facing copy. Date ranges use hyphens here (CLAUDE.md §4).' },
  { re: /Start a conversation|See the work\b|Read the resume/i, why: 'Retired CTA wording. Use "Get in touch", "View work", "View resume".' },
  { re: /roles\s*\/\s*New York|roles\s*·\s*New York/i, why: 'Availability and location must be separate lines; joined they read as a geographic restriction.' },

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
 * Every demo tab's `view` needs its still at src/assets/concepts/<project>/preview-<view>.webp.
 * EmbeddedDemo throws on a miss, but that throw does not fail `astro build` — verified by
 * removing a still and watching the build exit 0 with the demo silently absent. This does
 * fail it, because check:claims runs first.
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

for (const rel of TARGETS) {
  const abs = join(ROOT, rel);
  if (!existsSync(abs)) continue;
  const copy = visibleCopy(readFileSync(abs, 'utf8'), rel);
  const lines = copy.split('\n');
  for (const rule of BANNED) {
    if (rule.allow?.some((a) => rel.replace(/\\/g, '/').endsWith(a))) continue;
    lines.forEach((rawLine, i) => {
      const line = rule.pre ? rule.pre(rawLine) : rawLine;
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
