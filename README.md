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
  fonts/           # self-hosted, subset woff2 (Berkeley Mono, Clash Display, Clash Grotesk)
  hero/            # case-study + home hero videos, by slug (webm + mp4 + webp poster)
  wc/              # work-card hover animations, by slug (dark + light: card/poster + -light)
  placeholders/    # themed dark/light placeholder images, used until real media lands
scripts/           # build-time tooling (repo root): og/ card template, fonts/ subsetter
docs/
  hero-pipeline.md   # hero video encode recipe + per-study checklist
  work-card-video.md # work-card hover animation recipe + slug map
```

Site-wide client behaviour is bundled, not inlined: only the pre-paint no-flash
theme set is `is:inline` in `Base.astro`; everything else (`consent.ts`,
`site-chrome.ts`, `card-video.ts`, `motion.ts`) is a hoisted, cached module.

## Adding a case study

Drop a markdown file in `src/content/work/`. The frontmatter is typed and validated by `src/content.config.ts`; the build fails if an entry is missing required fields (every entry needs at least one proof figure). The same template renders both client and concept work. Client proof is a verified metric; concept proof is scope only, never performance results.

Optional per-entry media is opt-in and convention-located by slug (no paths in content): `heroVideo: true` adds a click-to-play case-study hero, and `cardVideo: true` (plus `cardVideoLight: true` for a light-theme variant) adds a hover-to-play logo animation on the work index. See `docs/hero-pipeline.md` and `docs/work-card-video.md` for the encode recipes.

## Design system

Tokens live in `src/styles/tokens.css` and mirror the brand kit (warm neutral ramp, single signal-orange accent reserved for real results, Clash Display / Clash Grotesk / Berkeley Mono). Dark and light themes are both first-class via a no-flash `data-theme` script. Repeated content patterns (`.card` / `.badge` / `.prose` / `.tag`) live once in `global.css`; pages keep only their own layout.

### Fonts

The seven self-hosted faces are **subset** to the glyphs the site uses (~35% smaller). `scripts/fonts/subset.mjs` reads the OTF masters from `_reference/fonts/site/` and writes subset woff2 into `public/fonts/`; the retain set is printable ASCII + Latin-1 plus every non-ASCII glyph scanned from the built HTML and source, so runtime-injected marks (play/pause, arrows, ✕) can't be dropped. Re-run after adding a face or a new glyph, then rebuild:

```bash
npm run build            # so the scan sees current pages
node scripts/fonts/subset.mjs
```

## Deploy

The cutover is complete: `mehtapratik.com` now serves this repo (the previous hand-edited site and its separate Worker are retired). Deploys are live-facing and done manually; a push to `main` is not an auto-deploy, so shipping code is a separate step. Validate on a local/preview build (`npm run build` / `npm run preview`) before deploying. SEO migration artifacts (`public/_redirects`, `public/robots.txt`, generated `sitemap-index.xml`) now govern the live domain.

## Operating contract

`CLAUDE.md` is the source of truth for stack, deploy safety, content rules, voice, and design tokens. Read it before any work. Source-of-truth docs (System Master, Resume Master, One-System-Brand-Guidelines (brand kit), IA-Master) govern positioning, facts, and structure.

## License

© 2026 Pratik Mehta. All rights reserved. This repository, including its code, copy, and design, is not licensed for reuse.
