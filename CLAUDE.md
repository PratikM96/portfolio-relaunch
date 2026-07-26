# CLAUDE.md — mehtapratik.com (One System portfolio)

```
updated:  2026-07-25
owns:     build rules for this repo that code cannot enforce
wins:     how to change this repo
defers:   facts -> Resume Master · copy -> the live site · positioning + voice
          -> System Master · design -> /brand + tokens.css · behavior -> AI Behavior
```

## 0. Read these first

The governing docs are **not in this repo**. They live in `_reference/masters/`, which is gitignored (the repo is public; `system-master.md` §6 is explicitly not public-facing). They are still the source of truth for this site. Read them before proposing anything:

| Need | Read |
| --- | --- |
| Any number, title, date, metric, role fact | `_reference/masters/resume-master.md` — **the metrics master** |
| Positioning, voice, narrative, boundaries, governance | `_reference/masters/system-master.md` — the hub |
| How to operate, task modes, failure states | `_reference/masters/ai-behavior.md` |
| What is live at which URL | `_reference/masters/portfolio-url-index.md` |

`ai-behavior.md`: a fact not supported by one of these is **unverified**. Do not publish it; name the gap.
`_reference/masters/` also holds `job-search-targeting.md` and `system-locations.md` — job-search machinery, not site scope, and private.
`_reference/_archive/` is superseded; never read it as current.

**Authority order.** Resume Master wins any number, title, or date. The live site wins case-study copy, framing, and scope presentation. System Master wins positioning, voice, and boundaries. `/brand` + `src/styles/tokens.css` win design. This file wins only on how to build. A site-vs-master conflict is flagged and resolved, never silently adopted either way.

## 1. What this is

Pratik Mehta's portfolio, on the **One System** brand. Astro + TypeScript, deployed to Cloudflare Workers via `@astrojs/cloudflare`.

## 2. Deploy — read before running anything

**`npm run deploy` publishes to the live domain.** The cutover is done; `mehtapratik.com` serves this repo and there is no staging URL in the loop.
Deploys are manual: pushing to `main` is not a deploy, and Pratik runs it.
Validate on `npm run build` / `npm run preview` first — concept-demo clean URLs resolve in preview but **not** under `npm run dev`. Full procedure and rollback: `docs/deploy.md`.

Live-domain artifacts: `public/_redirects` (redirect *sources* need explicit trailing-slash twins — the Worker only normalizes trailing slashes for real pages), `public/robots.txt`, `public/_headers` (**the CSP is enforced** — a new external origin that isn't allowlisted fails silently), and the generated `sitemap-index.xml`.

## 3. Content rules (non-negotiable)

- **Never invent** metrics, clients, roles, revenue, awards, responsibilities, outcomes, or claims. Missing or uncertain → say so, leave a TODO in the file that needs it. Never fill a gap with a plausible number.
- **One value per metric, sourced from the Resume Master's Claim Registry**, in its exact public wording. No variants, no invented precision, no ranges. A figure more precise than its public wording is wrong. **Hedges are part of the value** ("roughly 300", "nearly 60", "nearly 17K"), and **never add a `+` the registry does not carry.** Enforced by `scripts/check/claims.mjs`.
- **Self-initiated concepts** are never professional work, and every concept carries its non-affiliation `disclosure` (enforced by the schema refine). A concept is **not barred from results**: the line is *did it ship and can the number be measured*. Design-only concepts carry scope; Portfolio System shipped and carries measured results. **Four self-initiated systems:** The Ninth, Level, WISP, Portfolio System.
- **The Ninth does not name the organization it is built around.** Public copy says "a global esports organization". The microsite under `public/concepts/the-ninth/` is the exception, since the sub-brand is built on that identity and each page carries its own non-affiliation footer. Don't reintroduce the name into `src/` or `llms.txt`; don't strip it from the microsite.
- **Orange marks numbers.** In any stat string the numeral runs are accent; symbols, units, magnitude letters and words take normal text colour. `figureRuns` in `src/lib/figure.ts` is the whole mechanism and `StatFigure.astro` its only consumer, so every stat surface moves together. **A number keeps its internal `.` and `,` inside one run**, or `11.7M` splits into two orange fragments around a neutral dot. The colour is a typographic signal, not a claim: nothing about it is gated on engagement type. (`/brand` owns the rest of the accent rules.)
- **Apr 2024 to present** = "Independent Creative Systems Practice", role "Creative Technologist". Not a company, agency, consultancy, or freelance shop. "Self-directed" is internal classification and never a visible label.
- **Creative Marketing Lead** is the single public identity.

## 4. Voice

Direct, specific, natural, not over-polished, not obviously AI-written. Lead with the answer. No inflated claims, no buzzwords, no unsupported proof.

**No em or en dashes in external-facing copy.** Date ranges use hyphens. A style rule, not a claim rule (System Master §7), so it is arguable for a specific sentence.

**Separators are contextual.** `|` in `<title>`, none in meta descriptions (write sentences), ` / ` in on-page label and data rows. No middle dot in copy; the only ones left are structural and commented where they sit, in `Base.astro` and `/brand`.

Full rules — the declarative-reversal lead, the proof sentence, the honesty register, the avoid list — are System Master §5. Don't write in his voice without reading it. The `/brand` voice section defers to that doc by design.

## 5. Where things are enforced (point, don't restate)

If the code enforces it, read the code. Restating it here gives the fact a second home, and the copies drift.

| Concern | Source of truth |
| --- | --- |
| Content model, required fields, the build guardrail | `src/content.config.ts` — a missing/wrong-shaped field **fails the build** |
| Metric wording, retired claims, style defaults | `scripts/check/claims.mjs` — a drifted figure or a retired phrase **fails the build** (`npm run build` runs it first). The schema checks shape; this checks values. |
| What Pratik owned vs didn't, per case study | `contribution` in the entry + `ContributionBox.astro` |
| Which projects answer which hiring need | the `ROUTES` table in `src/pages/work/index.astro`, mirroring Job Search Targeting §4 |
| Routes and the sitemap | `src/pages/` — the filename is the URL |
| Every design token — ramp, tiers, sizes, spacing, motion, `@font-face` | `src/styles/tokens.css` |
| Design law in prose (type, colour, radius, grid, motion, a11y) | the live `/brand` page |
| The engagement facet + its labels | `src/lib/work-type.ts` |
| Collection order, dates, year parsing | `src/lib/content.ts` |
| Every media path derived from a slug | `src/lib/media.ts` |
| JSON-LD entity refs + breadcrumbs | `src/lib/schema.ts` |
| Stack and versions | `package.json`, `astro.config.mjs` |

## 6. Build rules code can't enforce

**Assets.** Everything is same-origin, served by the Worker. No external CDN. Images go in `src/assets/` (Astro's pipeline: responsive widths, hashing, CLS-safe dims); anything the pipeline can't process — video, fonts, favicons — goes in `public/` and is served verbatim. Only web-optimized deliverables get committed; raw masters stay in gitignored `_reference/`. **Cloudflare caps Worker
static assets at 25 MiB per file** — design large video around it. Build-time image optimization needs the adapter's `imageService: 'compile'`.

**Fonts.** Self-hosted, same-origin, woff2 only. No font CDN — it costs a second-origin handshake plus a CSS→font waterfall and defeats preloading, and the cross-site cache benefit died when browsers partitioned cache by top-level site. Files live flat in `public/fonts/`; OTF masters and licences stay in `_reference/fonts/site/`.

**Three files, one VARIABLE face per family** — not static cuts, nothing subset. Each declares a `font-weight` range, so every weight the type scale names is real. With static cuts a missing weight failed *silently*, because browsers match the nearest face rather than erroring. Never add one back alongside these.

The three *additional* `@font-face` blocks in `tokens.css` are metric-matched fallbacks, not cuts: `src: local()` plus measured overrides, zero bytes shipped. They hold each face's space until `swap` fires. **The overrides are measured** — re-measure if a face changes, because a stale one reflows toward the wrong box.

*Licensing is a build constraint.* The repo is public and the fonts ship in it, so a face needs **two separate rights, and they don't come together**: web embedding **and** modification (subsetting is modification).
- **Clash Display / Clash Grotesk** — Fontshare FFL: embedding yes, **modification no**. Ship verbatim, always. Cannot be subset or axis-pinned.
- **JetBrains Mono** — OFL-1.1, no Reserved Font Name: both granted. `public/fonts/OFL.txt` ships beside it because OFL §2 requires the licence to accompany the font. It ships whole anyway (see the decision log) — subsetting it is the first lever if PageSpeed ever demands one.

**Client JS lives in `src/scripts/`, never re-typed per page.** `consent.ts` (GA4 consent gate), `site-chrome.ts` (theme, drawer, clock, reveal, scroll-spy), `motion.ts` and `card-video.ts` (video behavior), `embedded-demo.ts` (concept launcher tabs). Don't re-implement video/reveal per page. The only hand-written inline script is the pre-paint no-flash theme set in `Base.astro` (the JSON-LD
block is data, not behavior).

Where those bundles *land* is Vite's call: under the 4096-byte `assetsInlineLimit` they inline into every page, over it they become hashed `/_astro/` files, and a bundle can cross that line as it grows. **Don't assert which side a script is on — run `npm run build` and look.**

**Shared primitives live in `global.css`,** promoted out of per-page styles so they can't drift: `.card` / `.card--interactive`, `.badge` / `.badge-lg`, `.prose`, `.tag`, `.lead`, `.h2` / `.h3`, `.page-h1` / `.page-kicker` / `.close-h`, `.btn`, `.frame` (anything holding an image or video — set the aspect ratio at the point of use). `PlayButton.astro` is the same idea as a component; its triangle nudge is derived (`w/6`), never hand-placed. Add the class; don't re-write the surface. A local rule keeps only its own delta (a margin, a size), never a copy of the primitive.

**Reveal — pick by position.** `.rev` = below-the-fold scroll reveal (opacity + slide). `.rev-load` = above-the-fold, **transform only, no opacity** — Chromium excludes `opacity:0` elements from LCP, so a faded hero hands LCP to a late-painting element. Both respect reduced-motion.

**Type: eight tiers, and nothing outside them.** Defined as `--t-*` tokens in `tokens.css`. A rule sets **size only** (plus colour / line-height) and composes a tier; family, weight and tracking are the system.

**Size: eleven steps, and nothing outside them.** A tier says which face, a `--fs-*` step says how big; `--fs-fluid-*` covers type that scales with the viewport. A rule composes a step and never writes a px value or a hand-rolled `clamp()`. Two exemptions, both commented where they sit: container-query sizing (`cqi`), which is measured against a cell rather than the page, and `/brand`'s format mockups and logo specimens, which are export-pixel canvases, not UI type.

**How a tier is applied.** Each tier is one grouped rule listing every selector that needs it — the `.t-*` block at the top of `global.css`, and a matching block at the top of each component's `<style>`. Add your selector to that group; never re-declare the `font-family` + `font-weight` + `letter-spacing` triple inline. The bare `.t-*` classes also work directly in markup. A group inside a media query stays inside it — hoisting one to the top level leaks the tier to widths where that element doesn't render.

| tier | face | wt | track | for |
| --- | --- | --- | --- | --- |
| `display` | Clash Display | 700 | -2% | **every** page head, closing CTA, stat figures |
| `h1` | Clash Display | 600 | -1% | the wordmark lockup |
| `h2` | Clash Display | 500 | -1% | section heads, journal lead post, mobile nav |
| `h3`-`h6` | Clash Grotesk | 500 | 0% | card titles, index rows, sub-heads |
| `body` | Clash Grotesk | 400 | 0% | copy (`strong` = 600) |
| `label` | JetBrains Mono | 400 | +10% | kickers, badges, section labels — **uppercase always** |
| `data` | JetBrains Mono | 400 | +5% | rail nav, scoreboard values, the clock — sentence case |
| `emphasis` | JetBrains Mono | 600 | +10% | buttons — **uppercase always** |

**Every page head is `display`**, so the pages read as one family. `h1` is the wordmark's tier and its only consumer: the lockup is Pratik's name, so it stays in the brand voice.

`/brand` §03 renders this table from the live `.t-*` classes with a real sample per tier, so it can't drift from the code. **If a tier moves, fix its `where` column there too.**

**Tracking is optical.** It tightens as type grows, sits at 0 for reading, and opens for uppercase mono — hence `label` (+10%) and `display` (-2%) at opposite ends, and `data` at +5% for sentence case. **Never put display tracking on small text**; that is what made the 19px wordmark read cramped.

If you're hand-writing family + weight + tracking, you've left the system. **And never set `letter-spacing` twice in one rule** — a hardcoded value after the tier token silently overrides it.

Kicker: `label` tier, 11px, accent-text. Section label: `[ 0N ]` (accent mono) + uppercase mono title (muted) + flex rule line.

**Spacing: the '--space-*' scale, and nothing outside it.*** Every `padding`, `margin` and `gap` resolves to a token. Values under 4px are exempt and stay literal — a 1px grid `gap` is a border trick, not rhythm. If a value doesn't fit the scale, change the design or the scale; don't add a literal.

**Motion, colour and radius are tokens too.** Every `transition` and `animation` duration composes `--dur-*`; every easing `--ease-*`; every `border-radius` `--radius-*`. Overlays on media use `--scrim-*` / `--shadow-*`, which are `color-mix` on the ramp rather than a frozen `rgba()` copy of it. There is no pure white on this site — `--n-0` is warm. The only literal colours left are the
`theme-color` meta and the pre-paint script, which cannot read a CSS variable.

**Four breakpoints, each with one job**: 1100 (a two-up row stacks), 1000 (a content + sticky-aside layout collapses), 900 (the rail becomes the mobile bar), 560 (the last grids go single-column). They're listed in `tokens.css` as documentation — `@media` can't read a custom property. Don't invent a fifth.

**Theme.** Dark and light are both first-class. No-flash inline script, `localStorage` with try/catch, follows OS until manual override, respects reduced-motion.

## 7. Naming (one standard — match it, don't invent)

- Components → `PascalCase.astro`. Routes → `kebab.astro`. Scripts / styles / lib → `kebab.ts`. Docs → `kebab.md`. Content slugs → `kebab`.
- Folders → **lowercase kebab**, with per-project slug subdirs (`public/wc/<slug>/`, `src/assets/work/<slug>/`). `wc` (work-card), `ov` (output-video), `og` (share cards) are the documented abbreviations — reuse them, don't invent more.
- **Contract-named assets are exempt and must not be "normalized".** They're fixed strings a typo turns into a silent 404: `card.webm` / `card-light.webm` / `poster.webp` (work cards), `hero_1080.webm` (the underscore is intentional; its poster is NOT here — it lives in `src/assets/hero/<slug>/` so the image pipeline can make it responsive), and vendor `@font-face` filenames (`ClashDisplay-Variable.woff2`, `JetBrainsMono-Variable.woff2`). Because they're fixed and unhashed, `public/_headers` caches them `immutable` for a year: **replacing one's bytes in place won't reach returning visitors.** Adding a new slug or face is always safe; changing an existing one means renaming it or dropping `immutable` first.
- **Windows:** the filesystem is case-insensitive. A Title-Case→lowercase rename is a case-only rename — go via a temp name (`mv Foo Foo__tmp && mv Foo__tmp foo`), and never create a lowercase twin of an existing dir before removing the original (a later `rm -rf` deletes both).

## 8. Content model

One case-study design for every entry. Spine: Scoreboard → Problem → System → Decisions → Output → Proof → Reflection. Optional modules render only when data exists. `src/content.config.ts` is the guardrail — every entry needs at least one proof figure or the build fails.

**Engagement (`type`) is a typed, filterable facet, never a separate section.** Three values (`src/lib/work-type.ts`): `in-house` (a role held inside the org), `agency` (a role at an agency whose clients were other companies), `concept` (self-initiated).

**Do not label these "client".** None were client engagements: every non-concept entry is a position held, and at RAA / Agency FiveEighty the clients belonged to the agency. Employment type (Internship, Volunteer) goes in the scoreboard `role` field, never the badge, which carries engagement + discipline. Proof is one shape for every type — a verified metric where one was measured, scope + rationale where none exists. Never invent one to fill the box.

**Concept microsites** are embedded proof inside their case study, not a parallel front door. Each is its own world with its own brand, CSS, and fonts, served as static passthrough HTML from `public/concepts/<slug>/`. Their launcher stills are NOT there: they are case-study assets, so they sit in `src/assets/concepts/<slug>/preview-<view>.webp` and go through the image pipeline. A demo tab authors only its `view`; the link and the still both derive from it.

**Media is convention-located by slug — never a path in content.** Adding an entry means adding its `public/wc/<slug>/` set (all four files). The one opt-in flag left is `heroVideo: true`, which then requires `coverAlt` + `coverCaption` via a schema refine. **Video is webm only** — don't add an H.264 fallback back. Recipes and caps live in `docs/`:

| System | Doc |
| --- | --- |
| Case-study hero video (click-to-play, has audio) | `docs/hero-pipeline.md` |
| Work-card hover animation (muted, loops) | `docs/work-card-video.md` |
| Output gallery blocks + export caps | `docs/output-assets.md` |
| Share cards | `docs/og-cards.md` |
| UTM + GA4 | `docs/utm-tagging.md` |
| Deploy + rollback | `docs/deploy.md` |

## 9. Decision log

Dated so they don't get silently re-litigated. Full rationale in the commit.

**Adding an entry compresses the ones above it.** Only the newest entry keeps its detail; everything older gets cut back to a line or two holding the decision and any trap it left behind. If a rule from an old entry is still load-bearing, it belongs in §3-§8 or in the code it governs, not in a paragraph down here.

- **2026-07-25 (c)** — **Small-screen pass.** Layout and copy fixes below 1100, plus four defects the pass exposed that were not visual at all.
  - **`--swatch-border` was never declared.** `/brand` used it twice. An unresolvable `var()` inside the `border` shorthand is invalid at computed-value time, so the whole declaration resolves to `border-style: none` — **not** a fallback border. Both the surface panels and every ramp swatch had silently had no border at all. A token typo fails *silently* in a shorthand; grep tokens.css before trusting a `var()` name.
  - **`.rev` cannot reveal a tall above-the-fold block.** The observer fires at `threshold: 0.1`, so a 4600px article needs 460px in view; only ~290px sat under the journal header, and the body copy stayed at `opacity: 0` until the reader scrolled. §6's "pick by position" rule is load-bearing, not stylistic: **above the fold takes `.rev-load`.** Audited every page at four widths; the journal post was the only one.
  - **A bare `1fr` track floors at min-content**, so PerfTable's wider column refused to shrink and overflowed its `overflow: hidden` parent, clipping the Mobile figures. `minmax(0, 1fr)` for any grid track whose content must be allowed to shrink. The category row is `auto-fit` now, so it folds to 2x2 on its own rather than clipping at whatever width a breakpoint missed.
  - **`cqi` with no `container-type` ancestor resolves against the VIEWPORT.** PerfTable's figure reads `5cqi` and no ancestor declares a container, so it has always been `5vi`. It happens to clamp to the intended 38px on desktop, so it is left alone — but §6's container-query exemption is not actually wired up anywhere. Don't cite it as precedent.
  - **The per-page perf table is hidden below 1100** rather than scrolled sideways: its intrinsic width is ~666px, and the rail is still present down to 900, so the content column is *narrower* at 1024 than at 900. The averages carry the claim alone.
  - **`astro preview` outlives `npm run preview`.** Stopping the npm wrapper leaves a `workerd.exe` child holding `dist/client`, so `rm -rf dist` fails and a rebuild silently serves the old HTML — the 07-25 (b) trap, one level deeper. Kill the `workerd` PID too, and verify `dist` actually deleted before believing a build.
  - Copy: the availability line drops "leadership" and **location now leads** (System Master §2, both dated there). Six site instances, `llms.txt` included.

- **2026-07-25 (b)** — **Audit sweep**, triggered by 13 metric figures inflated against the Resume Master, every one of them upward. Set the claim rules now in §3 and the separator rules in §4, and put values under `scripts/check/claims.mjs`. Two traps it left that live nowhere else: **machine-readable surfaces need the same copy sweep as pages** (`llms.txt` was asserting a rule retired the day before), and **`collaborators` stays blank on every entry**, because the master does not carry it.

- **2026-07-25** — **The remaining axes got scales** (`--fs-*`, `--fs-fluid-*`, and duration / radius / scrim / shadow tokens), and the logic duplicated across pages moved into `src/lib/`. The rules are §6 and the `src/lib/` row in §5. Deliberately **not** done, so don't re-propose it: a `.meta-label` primitive for the 38 rules reading `--fs-2xs / uppercase / --text-muted` — they already resolve to the same tokens, so a class shipped on every page buys nothing.

- **2026-07-24** — Concept "scope, never results" carve-out retired: a shipped concept follows the same case-study rules as real work, accent included, still gated by the honesty rule. Accent parity is full, so the three design-only concepts' badges and Type lines turned orange (intended). Disclosure stays required for every concept.

- **2026-07-24 (c)** — Output width ladders are DEVICE pixels and sources are shot at 2x. **Astro never upscales**, so a too-short ladder fails silently and the galleries just render soft. Screen captures must use `deviceScaleFactor: 2`; `scripts/shots/capture.mjs` is the record of them.

- **2026-07-24 (b)** — The site ships as its own case study (`portfolio-system`). Two one-offs bespoke to that entry, so don't generalize or delete them: `perfTable: true` (renders `PerfTable.astro` from a dated Lighthouse snapshot, regenerate with `scripts/perf/`), and an Output section that is a device x theme matrix captured above the fold rather than a `longpage`. *The third, the hero-stat `accent` flag, was deleted 2026-07-25: the numbers-orange rule accents a unitless `100` on its own, so the override had nothing left to do.*

- **2026-07-23** — Mobile weight pass + metric-matched font fallbacks (`72af992`). Hover clips gate on `(hover: hover)`, never width: **a `<video>` given a `<source>` and a `load()` fetches the bytes despite `preload="none"`.** The three extra `@font-face` blocks are `src: local()` fallbacks, not static cuts, and their overrides are measured (see `tokens.css`). **CLS was 0 only because the page was slow** — cutting ~100ms off FCP exposed a 0.185 font-swap shift, so check CLS on every perf change, not just the metric being optimized.

- **2026-07-22** — System audit sweep, `a90ced8`..`0c2a822`. Removed `cover` and the whole placeholder subsystem (`img` is now required, so a missing asset fails the build), the mp4 fallback, and the `cardVideo` flags. Actually adopted the type and spacing scales, which had near-zero uses, and deleted the duplicate `letter-spacing` overrides. Fixed four live defects: an unreachable 404, inert `/blog` redirects, a 301 on every RSS item, and OS-following `theme-color`.

- **2026-07-15** — Type scale adopted (the eight tiers in §6); before it, h1/h2/h3 disagreed on family and mono labels carried seven different trackings.
- **2026-07-15** — **Wordmark = `h1` tier** (Clash Display 600 / -1%), sentence case, and `h1`'s only consumer — it is Pratik's name, not a system label. It was Display 700 / -2.5%, a hero treatment at 19px, which is what read as cramped. **Display weight and tracking are optical compensations for large type; never put them on UI-scale text.**
- **2026-07-15** — Fonts are VARIABLE, one file per family, shipped whole. Static cuts made a missing weight fail silently, which is what blocked the scale. Subsetting JetBrains Mono is the first lever if PageSpeed ever asks.
- **2026-07-15** — Clash ships unsubset (FFL grants no modification right); the +13 KB is measured and accepted, and the FFL's broader clauses are closed.
- **2026-07-15** — JetBrains Mono replaced Berkeley Mono (no web licence held, repo is public). Metrics matched, so the swap was layout-neutral.
- **2026-07-15** — Work facet `client` → `in-house` / `agency` / `concept`.
- **2026-07-15** — Legacy `output.tiles` removed; `blocks` is the only model.
- **2026-07-15** — Docs reconciled post-cutover: `npm run deploy` is not safe.
- **2026-07-14** — Masters split into hub + Job Search Targeting + AI Behavior; live site adopted as the case-study copy source, Resume Master as metrics master.
- **Earlier** — Domain cutover to this repo. R2 / `cdn.mehtapratik.com` dropped; all assets same-origin.

## 10. This file's own rules

**No state.** No inventories, no migration status, no "all X are done", no counts that a command can answer. Every one of those rots and then lies. Open work goes as a `# [NEEDS: …]` comment in the file that needs the fix, not in a list here.

**No second homes.** If the code enforces it, point at the code. If a master owns it, point at the master.

**Anything verifiable gets verified, not asserted.** If you catch yourself writing a number, run the command instead.

**Comments state what the code is for, not its history.** A rule or a trap earns a line; the story of how it was found belongs in the commit. This applies to the whole repo, not just this file — see §9 for how the log compresses.
