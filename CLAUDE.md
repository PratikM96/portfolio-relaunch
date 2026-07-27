# CLAUDE.md — mehtapratik.com (One System portfolio)

```
updated:  2026-07-27
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
- **Orange marks numbers.** In any stat string the numeral runs are accent; symbols, units, magnitude letters and words take normal text color. `figureRuns` in `src/lib/figure.ts` is the whole mechanism and `StatFigure.astro` its only consumer, so every stat surface moves together. **A number keeps its internal `.` and `,` inside one run**, or `11.7M` splits into two orange fragments around a neutral dot. The color is a typographic signal, not a claim: nothing about it is gated on engagement type. (`/brand` owns the rest of the accent rules.)
- **Apr 2024 to present** = "Independent Creative Systems Practice", role "Creative Technologist". Not a company, agency, consultancy, or freelance shop. "Self-directed" is internal classification and never a visible label.
- **Creative Marketing Lead** is the single public identity.

## 4. Voice

Direct, specific, natural, not over-polished, not obviously AI-written. Lead with the answer. No inflated claims, no buzzwords, no unsupported proof.

**No em or en dashes in external-facing copy.** Date ranges use hyphens. A style rule, not a claim rule (System Master §7), so it is arguable for a specific sentence.

**American spelling, everywhere.** color, behavior, program, labeled, gray, organize, license, center. The audience is US hiring teams and the resume is a US resume, so a British variant reads as an inconsistency rather than a voice. Enforced by `scripts/check/claims.mjs`, which scans visible copy only — the repo's comments and docs were swept to match in the same change, so there is no second dialect hiding behind a `/* */`. Only unambiguous pairs are listed: words correct in both (advertising, analysis, emphasis) are deliberately absent, and `public/fonts/OFL.txt` is third-party license text that ships verbatim and is never touched.

**Separators are contextual.** `|` in `<title>`, none in meta descriptions (write sentences), ` / ` in on-page label and data rows. No middle dot in copy; the only ones left are structural and commented where they sit, in `Base.astro` and `/brand`.

Full rules — the declarative-reversal lead, the proof sentence, the honesty register, the avoid list — are System Master §5. Don't write in his voice without reading it. The `/brand` voice section defers to that doc by design.

## 5. Where things are enforced (point, don't restate)

If the code enforces it, read the code. Restating it here gives the fact a second home, and the copies drift.

| Concern | Source of truth |
| --- | --- |
| Content model, required fields, the build guardrail | `src/content.config.ts` — a missing/wrong-shaped field **fails the build** |
| Published perf figures, and their rounding direction | `src/lib/perf-claim.ts` — a proof figure with `from` derives from the measured run instead of being typed, so it cannot drift from `PerfTable` |
| Metric wording, retired claims, style defaults | `scripts/check/claims.mjs` — a drifted figure or a retired phrase **fails the build** (`npm run build` runs it first). The schema checks shape; this checks values. |
| What Pratik owned vs didn't, per case study | `contribution` in the entry + `ContributionBox.astro` |
| Which projects answer which hiring need | the `ROUTES` table in `src/pages/work/index.astro`, mirroring Job Search Targeting §4 |
| Routes and the sitemap | `src/pages/` — the filename is the URL |
| Every design token — ramp, tiers, sizes, spacing, measure, motion, `@font-face` | `src/styles/tokens.css` |
| Design law in prose (type, color, radius, grid, motion, a11y) | the live `/brand` page |
| The engagement facet + its labels | `src/lib/work-type.ts` |
| Collection order, dates, year parsing | `src/lib/content.ts` |
| Every media path derived from a slug | `src/lib/media.ts` — contract video paths are derived; **poster stills go through the image pipeline**, so their hashed URLs are resolved there and handed to the client on the element |
| Breakpoints, shell inset, and every `sizes` string | `src/lib/layout.ts` — the layout scale. `/brand` §05 renders it live |
| JSON-LD entity refs + breadcrumbs | `src/lib/schema.ts` |
| Stack and versions | `package.json`, `astro.config.mjs` |

## 6. Build rules code can't enforce

**Assets.** Everything is same-origin, served by the Worker. No external CDN. Images go in `src/assets/` (Astro's pipeline: responsive widths, hashing, CLS-safe dims); anything the pipeline can't process — video, fonts, favicons — goes in `public/` and is served verbatim. Only web-optimized deliverables get committed; raw masters stay in gitignored `_reference/`. **Cloudflare caps Worker
static assets at 25 MiB per file** — design large video around it. Build-time image optimization needs the adapter's `imageService: 'compile'`.

**Fonts.** Self-hosted, same-origin, woff2 only. No font CDN — it costs a second-origin handshake plus a CSS→font waterfall and defeats preloading, and the cross-site cache benefit died when browsers partitioned cache by top-level site. Files live flat in `public/fonts/`; OTF masters and licenses stay in `_reference/fonts/site/`.

**Three files, one VARIABLE face per family** — not static cuts, nothing subset. Each declares a `font-weight` range, so every weight the type scale names is real. With static cuts a missing weight failed *silently*, because browsers match the nearest face rather than erroring. Never add one back alongside these.

The three *additional* `@font-face` blocks in `tokens.css` are metric-matched fallbacks, not cuts: `src: local()` plus measured overrides, zero bytes shipped. They hold each face's space until `swap` fires. **The overrides are measured** — re-measure if a face changes, because a stale one reflows toward the wrong box.

*Licensing is a build constraint.* The repo is public and the fonts ship in it, so a face needs **two separate rights, and they don't come together**: web embedding **and** modification (subsetting is modification).
- **Clash Display / Clash Grotesk** — Fontshare FFL: embedding yes, **modification no**. Ship verbatim, always. Cannot be subset or axis-pinned.
- **JetBrains Mono** — OFL-1.1, no Reserved Font Name: both granted. `public/fonts/OFL.txt` ships beside it because OFL §2 requires the license to accompany the font. **It is subset, and it is the only face that may be** — `scripts/fonts/subset-mono.mjs`.

**The subset's input is the vendor original in `_reference/`, never the shipped file.** Re-running against an already-subset face narrows the set a little more every time, silently. Its character set is a deliberate fixed floor rather than a scan of the build, because **a scan misses anything a script injects** — `▶` lives only in a JS string — and a missing glyph doesn't error, it renders in the metric-matched fallback and looks subtly wrong. To check a subset, measure advance widths: a mono face gives every glyph the same advance, so any that fell back stands out. Three symbols the design uses (`❚ ★ ▢`) are absent from JetBrains Mono itself and always were; don't read them as a subsetting bug.

**Client JS lives in `src/scripts/`, never re-typed per page.** `consent.ts` (GA4 consent gate), `site-chrome.ts` (theme, drawer, clock, reveal, scroll-spy), `motion.ts` and `card-video.ts` (video behavior), `embedded-demo.ts` (concept launcher tabs). Don't re-implement video/reveal per page. The only hand-written inline script is the pre-paint no-flash theme set in `Base.astro` (the JSON-LD
block is data, not behavior).

Where those bundles *land* is Vite's call: under the 4096-byte `assetsInlineLimit` they inline into every page, over it they become hashed `/_astro/` files, and a bundle can cross that line as it grows. **Don't assert which side a script is on — run `npm run build` and look.**

**Shared primitives live in `global.css`,** promoted out of per-page styles so they can't drift: `.card` / `.card--interactive`, `.badge` / `.badge-lg`, `.prose`, `.tag`, `.lead`, `.h2` / `.h3`, `.page-h1` / `.page-kicker` / `.close-h`, `.btn`, `.frame` (anything holding an image or video — set the aspect ratio at the point of use). `PlayButton.astro` is the same idea as a component; its triangle nudge is derived (`w/6`), never hand-placed. Add the class; don't re-write the surface. A local rule keeps only its own delta (a margin, a size), never a copy of the primitive.

**Reveal — pick by position.** `.rev` = below-the-fold scroll reveal (opacity + slide). `.rev-load` = above-the-fold, **transform only, no opacity** — Chromium excludes `opacity:0` elements from LCP, so a faded hero hands LCP to a late-painting element. Both respect reduced-motion. `.rev`'s trigger point is the observer's bottom `rootMargin` alone; its `threshold` is 0 and stays 0, because a ratio is a fraction of the element and would make a tall block reveal late (see §9).

**Reveal the item, not the container**, wherever the container is taller than the viewport. A wrapper `.rev` around a long list fades everything at once, most of it still far below the fold; per-item `.rev` arrives as each item scrolls in. Stagger a *short* list by setting `--rev-i` per item (`global.css` turns it into a `--stagger-step` delay) and **cap the index** so a long list's last row isn't still waiting after it is on screen. A scroll-triggered list wants no stagger at all — the scroll already sequences it. **Never stagger `.rev-load`**: holding above-the-fold content back pushes the pixels Speed Index is timing.

**Type: eight tiers, and nothing outside them.** Defined as `--t-*` tokens in `tokens.css`. A rule sets **size only** (plus color / line-height) and composes a tier; family, weight and tracking are the system.

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

**Measure: nine steps, and nothing outside them.** Every prose `max-width` resolves to a `--measure-*` token — never a hand-written `ch` value. Frequency-derived like the Size scale: the steps sit where the 24 max-width rules already clustered before the scale existed. `--measure-lg` (56ch) and `--measure-2xl` (68ch) are the two anchors everything else was picked around — they're `.lead` and `.prose`, the shared measure primitives in `global.css`. `/brand` §03 renders the ladder live, same as the type-size table.

**Motion: six durations, three curves, and nothing outside them.** Defined as `--dur-*` / `--ease-*` in `tokens.css`. **The names are semantic, not numeric** — a rule picks by what the motion *means*, so a color swap is `--dur-quick` wherever it sits and a slide is `--dur-move` whatever the distance. `--dur-quick` is the anchor. Transform magnitudes are tokens too (`--travel-*`, `--scale-*`, `--stagger-step`), because three hand-written hover scales had already drifted apart. `/brand` §06 renders the whole axis live, with each demo driven by the token it documents — **if a duration moves, fix its `for` column there too.**

**Animate `transform` and `opacity`, nothing else.** They are the only compositable properties; everything else repaints, and Lighthouse audits it ("avoid non-composited animations") on a site whose desktop perf claim has no headroom. This is why the status dot's halo is a pseudo-element and not a `box-shadow`, and why the row hover nudge is `.row-nudge` (a transform on the row's *contents*) rather than the `padding-left` it used to be — padding is layout, so it reflowed on every hover frame.

**Reduced motion means REMOVE, not "instantly".** Killing the tween still lets a hover end-state apply, so a card would jump 3% larger in one frame. The block in `global.css` also neutralizes every positional end-state. Two traps live in it: `scroll-behavior` needs its own `html` selector (the `*` reset is (0,0,0) and loses to `html`), and the transform neutralization needs `!important` because **Astro scopes component styles with a bare `[data-astro-cid-*]` attribute, not `:where()`**, so a component's own rule outranks the same selector written globally.

**Color and radius are tokens too.** Every `border-radius` composes `--radius-*`. Overlays on media use `--scrim-*` / `--shadow-*`, which are `color-mix` on the ramp rather than a frozen `rgba()` copy of it. There is no pure white on this site — `--n-0` is warm. The only literal colors left are the `theme-color` meta and the pre-paint script, which cannot read a CSS variable.

**Four breakpoints, each with one job**: 1100 (a two-up row stacks), 1000 (a content + sticky-aside layout collapses), 900 (the rail becomes the mobile bar), 560 (the last grids go single-column). They're listed in `tokens.css` as documentation — `@media` can't read a custom property. Don't invent a fifth.

**Layout: one scale, and no `sizes` string written by hand.** `src/lib/layout.ts` owns the breakpoints, the shell inset (`--rail` + `.pad` x 2, derived so it can't disagree with the CSS), and every `sizes` an image renders: `sizesFor(cols)` for a grid cell, `FULL` for the content column, `sizesForSplit(fraction)` for a two-up row. **An image's `sizes` is a promise about how wide it will render, and a wrong one fails silently in whichever direction you didn't measure** — too small renders soft, too large spends the LCP budget. There is no column grid and no `max-width` anywhere: content is whatever the viewport has left after the rail and the padding, at every width. `/brand` §05 renders the ladder live, so **if a breakpoint or an inset moves, that page follows automatically — but check it did.**

**A `<video poster>` cannot be responsive**, so a poster still is emitted once rather than as a ladder. It still belongs in `src/assets/` for the hashing: a contract path can be rebuilt from a slug in JS, a hashed one can't, so the server writes it onto the element (`data-poster` / `data-poster-light`) and the script reads it.

**Gate a fetch on the gesture, never on the capability.** `(hover: hover)` says a pointer *could* hover, which is true of every laptop; wiring a `<source>` on that basis downloads every clip on the page at parse time. Attach the fetch to `mouseenter`/`focus`.

**A conditional around a `<script>` does not remove it** — Astro hoists component scripts at build time, so `{cond && <script>}` still ships. Put the script in its own component and render *that* conditionally.

**Theme.** Dark and light are both first-class. No-flash inline script, `localStorage` with try/catch, follows OS until manual override, respects reduced-motion.

**Prose and comments are never hard-wrapped.** Write one paragraph, list item, or comment thought as one continuous line, however long, and let the viewer's own soft-wrap handle display width — Notepad++, GitHub, and every other place this repo gets read already does that. Never insert a line break mid-sentence to hit a column target. Applies everywhere text is authored in this repo: docs, code comments, JSDoc, YAML frontmatter comments, HTML comments. Markdown/JSON/YAML *structural* line breaks (headers, list items, key/value pairs, code fences, table rows) are unaffected — those stay one per line.

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

- **2026-07-27 (h)** — **The published proof figures are derived from the measured run, not typed.** The trigger fired exactly as (d) predicted it would: the first sampled run measured a 99.4 mobile average against a proof box asserting `98`, which stops being a rounding and becomes a page contradicting the table printed directly beneath it. A figure now takes **`from`** instead of `value`, resolved at build by **`src/lib/perf-claim.ts`** out of the same `portfolio-perf.json` that `PerfTable` renders, so the two move together or neither does. Three figures derive (desktop Lighthouse, mobile Lighthouse, desktop LCP); **the JS figure stays authored because it is not a Lighthouse number** — it is transferred script weight measured from the built output, and nothing in that JSON carries it.
  - **Conservative rounding flips direction by metric, and getting it backwards makes a careful-looking figure lie.** A score rounds **down** (99.4 publishes as 99) because higher is better; a duration rounds **up** (0.466s publishes as 0.5s) because lower is better. Rounding the duration down would claim the site is faster than it measured.
  - **`desktopLighthouse` derives from the worst desktop page, not the average.** "100 across every page" is an absolute, and an average would hide a single page dropping to 99.
  - **Two build guards, both tested by deliberately breaking them.** The schema refine rejects a figure carrying both `value` and `from` or neither; an unknown source name throws with the valid list rather than rendering nothing. A derived figure that silently resolves to empty would be worse than the typed one it replaced.
  - The Resume Master cannot derive, being prose, so its registry now records the **method** plus a dated value and says plainly that the site will follow a re-run while the table will not. Read it there after a run rather than assuming.
  - First sampled run, for the record: mobile average 98.4 to **99.4**, desktop mean LCP 507ms to **466ms**. Two causes at once, the font subset and the median methodology, so do not attribute it to either alone. It also confirmed the variance is **intra-run**, not just across runs: mean within-batch LCP spread 443ms, worst 646ms.

- **2026-07-27 (g)** — **A perf run is a sample set, and the published row is the MEDIAN sample**, because averaging metrics independently would publish a row that never happened (an FCP from one load beside an LCP from another) and a mean is dragged by the right-skewed tail a median ignores. `REPEATS` loads per page, default 3, keep it odd; ties break on LCP and an even count takes the lower middle. Rows carry `samples` and `lcpSpread`. **Sampling halves the ±600ms envelope, it does not remove it.** Verified against a staged set with known values and against the single-sample archive, which still emits byte-identically. ~8 minutes and ~30MB per repeat.

- **2026-07-27 (f)** — **Perf runs are archived per run and the distilled history is committed** (`scripts/perf/history.jsonl`, keyed on run id; raw runs stay gitignored at ~30MB a batch). `run.sh` names its own folder because the first hand-named one was already a day out of step with the `fetchTime` inside it; `emit.mjs` reads the newest or a named one so an old batch can be re-emitted. Backfilled from git, minus the known-mixed 07-25 set. **What it settled: there is no page-specific mobile problem.** Four batches held the mobile average at 98.3 / 98.8 / 98.5 / 98.4 while individual pages moved 4-5 points, and `trend.mjs` shows why — pages that always score 100 have an LCP spread of 5-11ms, every page that wobbles has ~600ms. Home scored 95, 99, 98, 94 on identical-or-better code. The rule is in the README: **compare averages, never page scores.**

- **2026-07-27 (e)** — **Mobile FCP and LCP were gated by 165KB of High-priority woff2, so JetBrains Mono is subset**: 89.3KB to 35.4KB, three faces 163KB to 109KB. The largest face carried the least text. It is the only face that may ever be subset, and the rules that keep the subset honest are §6: vendor original as input, a fixed character floor rather than a scan of the build, and advance-width measurement to verify. `scripts/fonts/subset-mono.mjs` is the record. Home also stopped fetching four below-the-fold card posters (34KB) by applying them ~300px before scroll-in, while /work keeps its first featured poster in markup because that one is the preloaded LCP.
  - Two things measured and deliberately NOT done, so they are not re-proposed: **splitting PerfTable and EmbeddedDemo CSS** out of the shared case-study bundle (Astro keeps an unrendered component's CSS, a dynamic import fixes it, `astro check` rejects it, and the whole prize is ~2.4KB gzipped or about 10ms — the reasoning sits above the imports in `[slug].astro`); and **home's 1.15MB hero video on mobile**, which costs no score but is the largest real-user cost on the site, since the `frugal` guard only catches save-data and 2g/3g. Whether the loop should autoplay at phone widths is a design call.

- **2026-07-27 (d)** — **The "zero layout shift" claim retired**, after a `"Web font loaded"` shift on `/brand` §01 measured 0.009 desktop in two consecutive runs and put the claim in contradiction with the perf table printing it on the same page. The claim went, not the shift: 0.009 costs zero Lighthouse points, so chasing it would have bought nothing visible. A perfect score already entails a good CLS, so the figure was a second number saying the same thing and the only one that could rot. Removed from ten surfaces; the Resume Master carries a dated retirement note saying not to reinstate it, and `PerfTable` still renders per-page CLS as measured detail. The proof box kept four figures by taking the mobile Lighthouse average instead, and the JS figure became **4.5KB transferred** because `7KB` matched neither raw nor gzip. **Two of the four figures are hand-typed averages the table also renders live, so both are rounded down and both need re-checking after every run** (basis and rule are in the registry). Also recorded there: **single-run mobile LCP is not evidence** — across three runs the worst page rotated completely, unchanged pages swung ±750ms, and the mean (2065 / 2285 / 2153) is the only readable signal.

- **2026-07-27 (c)** — **Layout became a scale.** `src/lib/layout.ts` owns the breakpoints, the shell inset (`rail + 2*pad`, derived) and every `sizes` string; the rule is §6, and `/brand` §05 renders the ladder live. Five hand-maintained `sizes` strings had drifted and the two written by hand were the two that were wrong, one on the LCP element of every case study. The sweep it exposed, all fixed: work-card clips fetched at parse time because the gate was `canHover()` rather than the hover, no case study preloading its LCP poster, 35 poster stills in `public/` unhashed under a year of `immutable`, a 424KB `favicon.ico`, undeclared `Cache-Control` on HTML, a duplicated theme `MutationObserver`, and a phantom 12-column grid that only `/brand` ever read. Three traps that live nowhere else: **gate a fetch on the gesture, never on the capability**; **a conditional around a `<script>` does not remove it** (Astro hoists them, hence `OutputVideo.astro`); and **`frc` is a 720p source, not a bad export** — its hero webm is 1280x720 too, so leave it alone.

- **2026-07-27 (b)** — **Home hero re-cut, and the home hero split from the per-slug system**: square, silent, autoplaying, hand-wired, and versioned (`hero_900-v2.webm`) because `/hero/*` is immutable for a year and this is the one hero whose bytes get replaced. Resolution beat CRF on grain-heavy footage, landing weight-neutral. Its poster went through the image pipeline as a real `<img>` over the video. The recipe, the versioning rule, the January re-cut the "2026" lockup needs, and the two-pass `-vf` bug it fixed all live in `docs/hero-pipeline.md`; the preload contract lives on `Base.astro`'s props.

- **2026-07-27** — **American spelling adopted and enforced** (§4), after `/brand` shipped "Color" in one heading and "Colour" in another; 86 instances normalized in one sweep across copy, comments, docs and the masters, so no second dialect survives behind a `/* */`. The dialect traps (words correct in both, and the `-ise` group needing a known stem) live in `scripts/check/claims.mjs` beside the rule they govern; `public/fonts/OFL.txt` is third-party license text and is never corrected.

- **2026-07-26 (d)** — **Motion rebuilt as a semantic system.** The last un-governed axis: it stated no count, named no anchor, commented none of its tokens, and `/brand` §06 misreported it ("one ease-out curve, five durations" against three easings and six durations, with duration bars sized in hardcoded px — the only ladder on that page not driven by its token). The six durations were **renamed for intent, not speed** (`fast/base/reveal/slow/deliberate/pulse` → `instant/quick/enter/move/settle/ambient`), values unchanged, so nothing visibly retimed; §6 carries the rule. The two dead easings were given real jobs rather than deleted — `--ease-exit` for dismissals, `--ease-in-out` for moves that leave and arrive — so the page's "three curves, each with a job" is now true. Added `--travel-*`, `--scale-*` and `--stagger-step`, because transform magnitudes were literals and three hover scales (1.03, 1.03, 1.02) had already drifted.
  - **Four `padding-left` hover transitions became one `.row-nudge` primitive.** Padding is layout, so it reflowed every hover frame and could re-wrap a row's title mid-gesture. The nudge sits on the row's *contents*, never the row: these rows carry a `border-bottom` that must not slide, and a trailing column (`.nudge-fixed`) keeps its right edge the way `padding-left` on a grid already did.
  - **`scroll-behavior: smooth` had been escaping `prefers-reduced-motion` on every page.** `html` is (0,0,1); the `*` reset in that block is (0,0,0) and, unlike its `animation`/`transition` siblings, carried no `!important`. A universal reset does not reach a type selector. Reduced motion now also means *remove*: the eight hover transforms are neutralized, which needs `!important` because **Astro scopes component styles with a bare `[data-astro-cid-*]`, not `:where()`** — a global rule loses to the component rule it is trying to cancel.
  - **Page transitions are the native CSS `@view-transition`, never Astro's `<ClientRouter />`** — that is a client-side router and would spend the JS budget the site publishes a number for. Native cross-document transitions ship zero JS and cost nothing on Lighthouse, which measures a cold first load with no outgoing snapshot.
  - **Five video controllers collapsed onto `motion.ts`.** It now owns the whole policy: one `IN_VIEW` threshold (it existed in three copies), `safePlay` as the single `play()` path, and a live `onReducedMotionChange` so a mid-session flip is honored — the preference had been snapshotted at load in four of five call sites. The hero and the work-index preview compose those primitives instead of reimplementing them. **`(hover: hover)` now gates the work-index preview too**, which is the fix with real weight: `focus` fires on touch, so a phone was fetching a video clip into a pane that is `display:none` below 1100.
  - Cost: `motion.ts` grew, so the heaviest page's raw JS went 8.78 KB → 9.13 KB. Re-measure before restating the published figure.

- **2026-07-26 (c)** — **The reveal observer's `threshold` is 0** (§6). It was `0.1`, which tied reveal timing to element height and left a blank hole where the resume's `[ 02 ]` label belonged. **A ratio threshold on a variable-height set is the bug** — to make a reveal wait longer, change `rootMargin`, never the threshold.
  - Trap for anyone verifying motion in a browser: **an unfocused or occluded Chrome tab throttles rendering, and IntersectionObserver stops delivering.** Reveal state reads as "nothing revealed" until a screenshot forces a frame. Screenshot first, then read the DOM, or you will chase a defect that isn't there. Extension-injected JS also runs in an isolated world where IO never fires at all and `scrollY` reads stale — probe from a `<script>` appended to the page instead.

- **2026-07-26 (b)** — **Measure tokenized.** The 24 hand-written `max-width: Nch` prose-column rules became a nine-step `--measure-*` scale in `tokens.css`. `.lead` (56ch) and `.prose` (68ch) are the anchors and were kept exact; `/brand` §03 renders the ladder live.

- **2026-07-26** — **Repo-wide hard-wrap cleanup.** Docs and every code/content comment that had been manually line-broken mid-sentence (a pattern from prior AI-authored edits) got joined back to one line per paragraph or comment thought; rendered site copy and case-study YAML values were already clean and untouched. The §6 rule above is what stops it recurring.

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
- **2026-07-15** — JetBrains Mono replaced Berkeley Mono (no web license held, repo is public). Metrics matched, so the swap was layout-neutral.
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
