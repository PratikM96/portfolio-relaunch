# mehtapratik.com

Pratik Mehta's personal portfolio, built on the **One System** brand. Brand, social, content, UI/UX, motion, and performance presented as one connected practice.

## Stack

- **Astro 7** (TypeScript)
- **Cloudflare Workers** for page serving, via `@astrojs/cloudflare`
- **All assets self-hosted in this repo**, served same-origin by the Worker (which edge-caches globally). No external CDN. Images go in `src/assets/` (run through Astro's image pipeline); files that can't be processed (video, fonts, favicons) go in `public/`. Only web-optimized deliverables are committed; raw masters stay in `_reference/` (gitignored).

## Getting started

```bash
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # production build (validates content collections)
npm run preview  # preview the build
npm run check    # astro check (types + content)
```

## Project structure

```
src/
  content/
    work/          # case studies (one .md per project; typed by content.config.ts)
    journal/       # journal posts (live: notes on systems, brand, AI)
  content.config.ts# zod schemas + the build guardrail
  pages/           # routes: home, /work, /work/[slug], /about, /resume, /brand, /journal, /contact
  components/      # shared pieces (WorkIndex, Scoreboard, ProofBox, OutputGrid, ...)
  layouts/Base.astro# site chrome: rail, footer, no-flash theme set, font preloads
  scripts/         # bundled client modules: site-chrome (theme/drawer/clock/
                   # reveal/spy), consent (GA gate), card-video + motion (video)
  styles/
    tokens.css     # design tokens (mirrors the brand kit) + all @font-face blocks
    global.css     # reset, site chrome, shared primitives (.card/.badge/.prose/.tag)
public/
  fonts/           # self-hosted, subset woff2 (JetBrains Mono, Clash Display, Clash Grotesk) + OFL.txt
  hero/            # case-study + home hero videos, by slug (webm + mp4 + webp poster)
  wc/              # work-card hover animations, by slug (dark + light: card/poster + -light)
  ov/              # in-gallery output videos, by slug (webm + mp4 + webp poster)
  og/              # rendered 1200x630 share cards (site + per-route + per-concept)
  concepts/        # concept microsites: static passthrough HTML, own brand/CSS/JS per slug
  placeholders/    # themed dark/light placeholder images, used until real media lands
  _headers         # security headers incl. the enforced CSP
  _redirects       # old-URL 301s from the pre-cutover site
scripts/           # build-time tooling (repo root): og/ card template, fonts/ subsetter
docs/
  deploy.md          # deploy procedure
  hero-pipeline.md   # hero video encode recipe + per-study checklist
  work-card-video.md # work-card hover animation recipe + slug map
  output-assets.md   # output-gallery block kinds + export caps
  og-cards.md        # share-card rendering
  utm-tagging.md     # UTM conventions + GA4 notes
```

Site-wide client behaviour is bundled, not inlined: only the pre-paint no-flash
theme set is `is:inline` in `Base.astro`; everything else (`consent.ts`,
`site-chrome.ts`, `card-video.ts`, `motion.ts`) is a hoisted, cached module.

## Adding a case study

Drop a markdown file in `src/content/work/`. The frontmatter is typed and validated by `src/content.config.ts`; the build fails if an entry is missing required fields (every entry needs at least one proof figure). One template renders every entry.

`type` is the engagement facet (`in-house` / `agency` / `concept`, see `src/lib/work-type.ts`) and drives the badge, the filters, and the proof rule: real work carries verified metrics, concepts carry scope only and never claim results. Employment type (Internship, Volunteer) belongs in the scoreboard `role` field, not the badge.

Optional per-entry media is opt-in and convention-located by slug (no paths in content): `heroVideo: true` adds a click-to-play case-study hero, and `cardVideo: true` (plus `cardVideoLight: true` for a light-theme variant) adds a hover-to-play logo animation on the work index. See `docs/hero-pipeline.md` and `docs/work-card-video.md` for the encode recipes.

## Design system

Tokens live in `src/styles/tokens.css` and mirror the brand kit (warm neutral ramp, single signal-orange accent reserved for real results, Clash Display / Clash Grotesk / JetBrains Mono). Dark and light themes are both first-class via a no-flash `data-theme` script. Repeated content patterns (`.card` / `.badge` / `.prose` / `.tag`) live once in `global.css`; pages keep only their own layout.

### Fonts

The self-hosted faces are **subset** to the glyphs the site actually uses. `scripts/fonts/subset.mjs` reads the OTF masters from `_reference/fonts/site/` and writes subset woff2 into `public/fonts/`; the retain set is printable ASCII + Latin-1 plus every non-ASCII glyph scanned from the built HTML and source, so runtime-injected marks (play/pause, arrows, ✕) can't be dropped. Re-run after adding a face or a new glyph, then rebuild:

```bash
npm run build                          # so the scan sees current pages
node scripts/fonts/subset.mjs          # all faces
node scripts/fonts/subset.mjs JetBrains  # or one family
```

**Subsetting is a modification, so it is licence-gated per family.** JetBrains Mono is OFL-1.1 with no Reserved Font Name, so subsetting is permitted and the name may be kept; `OFL.txt` ships beside the faces because the licence requires it to accompany the font. Check the licence in each `_reference/fonts/site/<family>/` folder before adding a face — the repo is public and the fonts ship in it.

## Deploy

The cutover is complete: `mehtapratik.com` now serves this repo (the previous hand-edited site and its separate Worker are retired). **`npm run deploy` ships straight to the live domain** — there is no staging URL in the loop. Deploys are manual; a push to `main` is not an auto-deploy, so shipping code is a separate step. Validate on a local/preview build (`npm run build` / `npm run preview`) first — concept-demo clean URLs resolve in preview but not under `npm run dev`. SEO migration artifacts (`public/_redirects`, `public/robots.txt`, `public/_headers` with the enforced CSP, generated `sitemap-index.xml`) now govern the live domain.

See `docs/deploy.md` for the full procedure and rollback.

## Operating contract

`CLAUDE.md` is the source of truth for stack, deploy safety, content rules, voice, and design tokens. Read it before any work. Source-of-truth docs (System Master, Resume Master, One-System-Brand-Guidelines (brand kit), IA-Master) govern positioning, facts, and structure.

## License

© 2026 Pratik Mehta. All rights reserved. This repository, including its code, copy, and design, is not licensed for reuse.

**Bundled fonts are excepted** — they carry their own licences and are not covered by the line above. JetBrains Mono (`public/fonts/JetBrainsMono-*.woff2`) is SIL Open Font License 1.1; see `public/fonts/OFL.txt`.
