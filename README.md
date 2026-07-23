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
  fonts/           # 3 self-hosted variable woff2 (Clash Display, Clash Grotesk, JetBrains Mono) + OFL.txt
  hero/            # case-study + home hero videos, by slug (webm + webp poster)
  wc/              # work-card hover animations, by slug (dark + light: card/poster + -light)
  ov/              # in-gallery output videos, by slug (webm + webp poster)
  og/              # rendered 1200x630 share cards (site + per-route + per-concept)
  concepts/        # concept microsites: static passthrough HTML, own brand/CSS/JS per slug
  placeholders/    # themed dark/light placeholder images, used until real media lands
  _headers         # security headers incl. the enforced CSP
  _redirects       # old-URL 301s from the pre-cutover site
scripts/           # build-time tooling (repo root): og/ share-card template
docs/
  deploy.md          # deploy procedure
  hero-pipeline.md   # hero video encode recipe + per-study checklist
  work-card-video.md # work-card hover animation recipe + slug map
  output-assets.md   # output-gallery block kinds + export caps
  og-cards.md        # share-card rendering
  utm-tagging.md     # UTM conventions + GA4 notes
```

Site-wide client behaviour lives in `src/scripts/` (`consent.ts`,
`site-chrome.ts`, `card-video.ts`, `motion.ts`) rather than being re-typed per
page; the only hand-written inline script is the pre-paint no-flash theme set in
`Base.astro`. Whether a given bundle ships inline or as a hashed `/_astro/` file
is decided by Vite's 4 KB `assetsInlineLimit`, so check a real build rather than
assuming either.

## Adding a case study

Drop a markdown file in `src/content/work/`. The frontmatter is typed and validated by `src/content.config.ts`; the build fails if an entry is missing required fields (every entry needs at least one proof figure). One template renders every entry.

`type` is the engagement facet (`in-house` / `agency` / `concept`, see `src/lib/work-type.ts`) and drives the badge, the filters, and the proof rule: real work carries verified metrics, concepts carry scope only and never claim results. Employment type (Internship, Volunteer) belongs in the scoreboard `role` field, not the badge.

Optional per-entry media is opt-in and convention-located by slug (no paths in content): `heroVideo: true` adds a click-to-play case-study hero, and `cardVideo: true` (plus `cardVideoLight: true` for a light-theme variant) adds a hover-to-play logo animation on the work index. See `docs/hero-pipeline.md` and `docs/work-card-video.md` for the encode recipes.

## Design system

Tokens live in `src/styles/tokens.css` and mirror the brand kit (warm neutral ramp, single signal-orange accent reserved for real results, Clash Display / Clash Grotesk / JetBrains Mono). Dark and light themes are both first-class via a no-flash `data-theme` script. Repeated content patterns (`.card` / `.badge` / `.prose` / `.tag`) live once in `global.css`; pages keep only their own layout.

### Fonts

Three files, **one variable face per family**, shipped whole:

| file | KB | axis |
|---|---|---|
| `ClashDisplay-Variable.woff2` | 28.7 | wght 200–700 |
| `ClashGrotesk-Variable.woff2` | 46.1 | wght 200–700 |
| `JetBrainsMono-Variable.woff2` | 89.3 | wght 100–800 |

All three are preloaded, so every weight the type scale uses is already there — nothing else to fetch. Each `@font-face` declares a weight **range**, which is what makes a variable axis work; a static cut alongside them would shadow it.

Adding a face means dropping the variable woff2 in `public/fonts/` and pointing one `@font-face` at it. **Read its licence first** (each family's is in `_reference/fonts/site/<family>/`): a face needs both web-embedding *and* modification rights, and they don't come together. Clash is Fontshare FFL — embed yes, modify no, so it can never be subset or axis-pinned. JetBrains Mono is OFL-1.1 with no Reserved Font Name, so `OFL.txt` ships beside it as the licence requires.

Nothing is subset today — the deliberate call was to ship the full system and only optimize if PageSpeed asks. Subsetting JetBrains Mono (89.3 → 37.3 KB, axis intact) is the first lever if it does; git history has the retired `scripts/fonts/subset.mjs`.

## Deploy

The cutover is complete: `mehtapratik.com` now serves this repo (the previous hand-edited site and its separate Worker are retired). **`npm run deploy` ships straight to the live domain** — there is no staging URL in the loop. Deploys are manual; a push to `main` is not an auto-deploy, so shipping code is a separate step. Validate on a local/preview build (`npm run build` / `npm run preview`) first — concept-demo clean URLs resolve in preview but not under `npm run dev`. SEO migration artifacts (`public/_redirects`, `public/robots.txt`, `public/_headers` with the enforced CSP, generated `sitemap-index.xml`) now govern the live domain.

See `docs/deploy.md` for the full procedure and rollback.

## Operating contract

**`CLAUDE.md` first.** It owns the build rules for this repo — deploy safety, content rules, voice, naming, font licensing — and points at everything it doesn't own.

It deliberately owns very little. Facts and metrics come from the Resume Master, positioning and voice from the System Master, case-study copy from the live site itself, and design from the `/brand` page plus `src/styles/tokens.css`. Those governing docs live in gitignored `_reference/masters/` (this repo is public and they aren't all public-facing); `CLAUDE.md` §0 names them and sets the authority order.

The rule holding it together: **docs own rules and decisions, the repo owns state.** A doc that restates what the code already enforces gives the fact two homes, and the copies drift.

## License

© 2026 Pratik Mehta. All rights reserved. This repository, including its code, copy, and design, is not licensed for reuse.

**Bundled fonts are excepted** — they carry their own licences and are not covered by the line above. JetBrains Mono (`public/fonts/JetBrainsMono-*.woff2`) is SIL Open Font License 1.1; see `public/fonts/OFL.txt`. Clash Display and Clash Grotesk (and the concept-microsite faces under `public/concepts/*/fonts/`) are Indian Type Foundry fonts under the Fontshare Font License, which grants no redistribution right: they are present here to serve this site only. Get them from [fontshare.com](https://www.fontshare.com) under your own licence rather than copying them from this repo.
