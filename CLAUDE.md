# CLAUDE.md — mehtapratik.com (One System portfolio)

```
updated:  2026-08-03
owns:     build rules for this repo that code cannot enforce
wins:     how to change this repo
defers:   facts -> Resume Master · copy -> the live site · positioning + voice -> System Master · design -> /brand + tokens.css · behavior -> AI Behavior
```

## 0. Read these first

The governing docs are **not in this repo**. They live in `_reference/masters/`, gitignored because the repo is public and `system-master.md` §6 is not public-facing. They are still the source of truth. Read them before proposing anything:

| Need | Read |
| --- | --- |
| Any number, title, date, metric, role fact | `resume-master.md` — **the metrics master** |
| Positioning, voice, narrative, boundaries, governance | `system-master.md` — the hub |
| How to operate, task modes, failure states | `ai-behavior.md` |
| What is live at which URL | `portfolio-url-index.md` |

A fact not supported by one of these is **unverified**: don't publish it, name the gap. `job-search-targeting.md` and `system-locations.md` are private job-search machinery, not site scope. `_reference/_archive/` is superseded.

**Authority order.** Resume Master wins any number, title, or date. The live site wins case-study copy and scope presentation. System Master wins positioning, voice, and boundaries. `/brand` + `tokens.css` win design. This file wins only on how to build. A site-vs-master conflict is flagged and resolved, never silently adopted either way.

## 1. What this is

Pratik Mehta's portfolio, on the **One System** brand. Astro + TypeScript, deployed to Cloudflare Workers via `@astrojs/cloudflare`.

## 2. Deploy — read before running anything

**`npm run deploy` publishes to the live domain.** The cutover is done; `mehtapratik.com` serves this repo and there is no staging URL. Deploys are manual: pushing to `main` is not a deploy, and Pratik runs it. Validate on `npm run build` / `npm run preview` first — concept-demo clean URLs resolve in preview but **not** under `npm run dev`. **`npm run preview` serves the built `dist/`, never source**, so a change you have not rebuilt is not the thing you are looking at. Procedure and rollback: `docs/deploy.md`.

Live-domain artifacts: `public/_redirects` (redirect *sources* need explicit trailing-slash twins — the Worker only normalizes them for real pages), `public/robots.txt`, `public/_headers` (**the CSP is enforced**, so an un-allowlisted external origin fails silently), and the generated `sitemap-index.xml`. Dashboard settings the repo can't enforce, and the three toggles that can break its config: `docs/cloudflare.md`.

## 3. Content rules (non-negotiable)

- **Never invent** metrics, clients, roles, revenue, awards, responsibilities, outcomes, or claims. Uncertain → say so and leave a `# [NEEDS: …]` in the file. Never fill a gap with a plausible number.
- **One value per metric, in the Claim Registry's exact public wording.** No variants, no invented precision, no ranges; a figure more precise than its public wording is wrong. **Hedges are part of the value** ("roughly 300", "nearly 17K"), and **never add a `+` the registry does not carry.** Enforced by `scripts/check/claims.mjs`.
- **Self-initiated concepts** are never professional work, and each carries its non-affiliation `disclosure` (schema refine). A concept is **not barred from results** — the line is *did it ship and can the number be measured*. Design-only concepts carry scope; Portfolio System shipped and carries measured results. **Four:** The Ninth, Level, WISP, Portfolio System.
- **The Ninth does not name the organization it is built around.** Public copy says "a global esports organization". The microsite under `public/concepts/the-ninth/` is the exception, since the sub-brand is built on that identity and every page carries its own non-affiliation footer. Don't reintroduce the name into `src/` or `llms.txt`; don't strip it from the microsite.
- **Orange marks numbers.** Numeral runs are accent; symbols, units, magnitude letters and words stay normal. `figureRuns` in `src/lib/figure.ts` is the mechanism and `StatFigure.astro` its only consumer, so every stat surface moves together. **A number keeps its internal `.` and `,` inside one run**, or `11.7M` splits into two orange fragments around a neutral dot. It is a typographic signal, not a claim: nothing is gated on engagement type.
- **Apr 2024 to Aug 2026** = "Independent Creative Systems Practice", role "Creative Technologist". Not a company, agency, consultancy, or freelance shop. "Self-directed" is internal classification, never a visible label. The period is **closed**: nothing on the site may say it runs to present.
- **Aug 2026 to present**, role "Director of Marketing", and **Director of Marketing is the single public identity**. No figure from it is publishable until it is measured; the role's targets are not results.
- **The site does not name the current employer outside `/resume`.** Public copy says "an international nonprofit" in prose, "International Nonprofit" in a label row. `/resume` and the JSON-LD `worksFor` are the two deliberate exceptions, both allowlisted in `scripts/check/claims.mjs`. Same shape as The Ninth's rule above.

## 4. Voice

Direct, specific, natural, not over-polished, not obviously AI-written. Lead with the answer. No inflated claims, no buzzwords, no unsupported proof.

**No em or en dashes in external-facing copy.** Date ranges use hyphens. A style rule, not a claim rule (System Master §7), so it is arguable for a specific sentence.

**American spelling, everywhere.** color, behavior, program, labeled, gray, organize, license, center. The audience is US hiring teams, so a British variant reads as an inconsistency rather than a voice. Enforced by `scripts/check/claims.mjs` over visible copy; comments and docs were swept to match, so no second dialect hides behind a `/* */`. **Machine-readable surfaces get the same copy sweep as pages** — `llms.txt`, meta descriptions, JSON-LD and the sitemap carry claims too, and a sweep that only looks at what renders leaves the wrong figure sitting in the file an LLM reads. Words correct in both (advertising, analysis, emphasis) are deliberately absent from the list, and `public/fonts/OFL.txt` is third-party license text that ships verbatim.

**Separators are contextual.** `|` in `<title>`, none in meta descriptions (write sentences), ` / ` in on-page label and data rows. No middle dot in copy; the ones left are structural and commented where they sit.

Full rules — the declarative-reversal lead, the proof sentence, the honesty register, the avoid list — are System Master §5. Don't write in his voice without reading it.

## 5. Where things are enforced (point, don't restate)

| Concern | Source of truth |
| --- | --- |
| Content model, required fields, the build guardrail | `src/content.config.ts` — a missing or wrong-shaped field **fails the build** |
| Published perf figures and their rounding direction | `src/lib/perf-claim.ts` — a figure with `from` derives from the measured run, so it cannot drift from `PerfTable` |
| Metric wording, retired claims, style defaults | `scripts/check/claims.mjs` — the schema checks shape, this checks values, and `npm run build` runs it first. **Every guard that must fail the build lives here**, because a `throw` in a lib or component does not: `astro build` kills only the importing pages and exits 0, writing them zero-byte |
| What Pratik owned vs didn't, per case study | `contribution` in the entry + `ContributionBox.astro` |
| Which projects answer which problem | the `ROUTES` table in `src/pages/work/index.astro` |
| Who gets the consent gate vs the notice, and what GA4 is allowed to store | `src/scripts/consent.ts` — the region list is the legal boundary, and `/privacy` is the public statement of the same posture, so the two move together or the site publishes something untrue |
| Routes and the sitemap | `src/pages/` — the filename is the URL |
| Every design token | `src/styles/tokens.css` |
| Design law in prose | the live `/brand` page |
| The engagement facet + its labels | `src/lib/work-type.ts` |
| Brands, partners and organizations + the home subset | `src/lib/brands.ts` — the roster guards the published "30+" |
| Collection order, dates, year parsing | `src/lib/content.ts` |
| Every media path derived from a slug | `src/lib/media.ts` — video paths are derived; **poster stills go through the image pipeline**, so their hashed URLs resolve there and are handed to the client on the element |
| Breakpoints, shell inset, every `sizes` string | `src/lib/layout.ts` — the layout scale, rendered live on `/brand` |
| JSON-LD entity refs + breadcrumbs | `src/lib/schema.ts` |
| Stack and versions | `package.json`, `astro.config.mjs` |
| How perf is measured, and what a single run is worth | `scripts/perf/README.md` — the loop, the median-not-average rule, and the optimizations already measured and rejected |
| The above-the-fold reveal contract | `scripts/check/claims.mjs` — pages own their hero element, and the check fails the build when the first reveal-bearing element is `.rev` rather than `.rev-load` |
| The numbered section head, every page | `src/components/SectionLabel.astro` + `.blabel` in `global.css` — styles stay global on purpose, see §9 |

## 6. Build rules code can't enforce

**Assets.** Everything is same-origin, served by the Worker. No external CDN. Images go in `src/assets/` (Astro's pipeline: responsive widths, hashing, CLS-safe dims); anything the pipeline can't process — video, fonts, favicons — goes in `public/` and ships verbatim. Only web-optimized deliverables get committed; raw masters stay in gitignored `_reference/`. **Never re-compress a `src/assets/` file to save bytes**: the pipeline re-encodes it at build, so a lossy pass there buys nothing and softens the master it re-encodes from. **Cloudflare caps Worker static assets at 25 MiB per file.** Build-time image optimization needs the adapter's `imageService: 'compile'`.

**Fonts.** Self-hosted, same-origin, woff2 only. No font CDN: it costs a second-origin handshake plus a CSS→font waterfall, defeats preloading, and the cross-site cache benefit died when browsers partitioned cache by top-level site. Files live flat in `public/fonts/`; OTF masters and licenses stay in `_reference/fonts/site/`.

**Three files, one VARIABLE face per family.** Each declares a `font-weight` range, so every weight the type scale names is real. With static cuts a missing weight failed *silently*, because browsers match the nearest face rather than erroring. Never add one back. The three *additional* `@font-face` blocks in `tokens.css` are metric-matched fallbacks, not cuts: `src: local()` plus **measured** overrides, zero bytes shipped, holding each face's box until `swap` fires. Re-measure if a face changes; a stale override reflows toward the wrong box.

*Licensing is a build constraint.* The repo is public and the fonts ship in it, so a face needs **two separate rights, and they don't come together**: web embedding **and** modification (subsetting is modification).
- **Clash Display / Clash Grotesk** — Fontshare FFL: embedding yes, **modification no**. Ship verbatim, never subset or axis-pin.
- **JetBrains Mono** — OFL-1.1, no Reserved Font Name: both granted. `public/fonts/OFL.txt` ships beside it per OFL §2. **It is subset, and it is the only face that may be** (`scripts/fonts/subset-mono.mjs`, `npm run fonts:subset`).

**The subset's input is the vendor original in `_reference/`, never the shipped file** — re-running against an already-subset face narrows the set a little more every time, silently. Its character set is a deliberate fixed floor rather than a scan of the build, because **a scan misses anything a script injects** (`▶` lives only in a JS string) and a missing glyph doesn't error, it renders in the fallback and looks subtly wrong. To verify, measure advance widths: a mono face gives every glyph the same advance, so anything that fell back stands out. Three symbols the design uses (`❚ ★ ▢`) are absent from JetBrains Mono itself and always were.

**Client JS lives in `src/scripts/`, never re-typed per page.** `consent.ts` (region decision + banner), `ga-core.js` (the GA4 install itself, shared with the concept microsites via a generated copy at `public/concepts/ga-core.js` — `npm run concepts:ga`, and `claims.mjs` fails the build if the two drift), `site-chrome.ts` (theme, drawer, clock, reveal, scroll-spy), `motion.ts` and `card-video.ts` (video behavior), `embedded-demo.ts` (concept launcher tabs). The only hand-written inline script is the pre-paint no-flash theme in `Base.astro`. Where bundles *land* is Vite's call — under the 4096-byte `assetsInlineLimit` they inline into every page, over it they become hashed `/_astro/` files, and a bundle can cross that line as it grows. **Don't assert which side a script is on; run `npm run build` and look.**

**Shared primitives live in `global.css`** so they can't drift: `.card` / `.card--interactive`, `.badge` / `.badge-lg`, `.prose`, `.tag`, `.lead`, `.h2` / `.h3`, `.page-h1` / `.page-kicker` / `.close-h`, `.btn`, `.frame` (anything holding an image or video — set the aspect ratio at the point of use). `PlayButton.astro` is the same idea as a component; its triangle nudge is derived (`w/6`), never hand-placed. Add the class; don't rewrite the surface. A local rule keeps only its own delta.

**Reveal — pick by position.** `.rev` = below-the-fold scroll reveal (opacity + slide). `.rev-load` = above-the-fold, **transform only, no opacity**, because Chromium excludes `opacity:0` elements from LCP and a faded hero hands LCP to a late-painting element. Both respect reduced-motion. `.rev`'s trigger point is the observer's bottom `rootMargin` alone; its `threshold` is 0 and stays 0. **A ratio threshold on a variable-height set is the bug** — a tall block would need a fraction of *itself* in view and reveal late. To make a reveal wait longer, change `rootMargin`.

**Verifying a reveal needs a foreground tab.** An unfocused or occluded Chrome tab is throttled to the point that rendering stops, so `IntersectionObserver` never fires and every `.rev` element reads as un-revealed in the DOM. Screenshot first, then read the DOM; a DOM read alone will report a bug that isn't there.

**Reveal the item, not the container**, wherever the container is taller than the viewport: a wrapper `.rev` around a long list fades everything at once, most of it still far below the fold. Stagger a *short* list with `--rev-i` per item and **cap the index** so a long list's last row isn't still waiting after it is on screen. A scroll-triggered list wants no stagger — the scroll already sequences it. **Never stagger `.rev-load`**: holding above-the-fold content back pushes the pixels Speed Index is timing.

**Type: eight tiers, and nothing outside them** (`--t-*` in `tokens.css`). A rule sets **size only** (plus color / line-height) and composes a tier; family, weight and tracking are the system.

**Size: eleven steps, and nothing outside them.** A tier says which face, a `--fs-*` step says how big; `--fs-fluid-*` covers type that scales with the viewport. Never a px value or a hand-rolled `clamp()`. Two exemptions, both commented where they sit: container-query sizing (`cqi`), measured against a cell rather than the page, and `/brand`'s format mockups and logo specimens, which are export-pixel canvases.

**A `cqi` is only legal in the same component as the `container-type` it measures against.** With no such ancestor it silently resolves against the viewport, which makes it a worse `vw`, not a container query — and it fails *quietly*, since a `clamp()` around it still returns a plausible size at both ends. `PerfTable` shipped that bug: `5cqi` needed a 760px cell to reach the top of its own range, so a figure sized to an ~88px track just pinned to one clamp bound or the other. Three uses are correct and are the reference — `ProofBox.astro`, `Scoreboard.astro`, and `/brand`'s motion track — each declaring `container-type: inline-size` beside the rule that consumes it.

**How a tier is applied.** Each tier is one grouped rule listing every selector that needs it — the `.t-*` block at the top of `global.css`, and a matching block at the top of each component's `<style>`. Add your selector to that group; never re-declare the `font-family` + `font-weight` + `letter-spacing` triple inline. The bare `.t-*` classes also work in markup. A group inside a media query stays inside it — hoisting it leaks the tier to widths where that element doesn't render.

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

**Tracking is optical.** It tightens as type grows, sits at 0 for reading, and opens for uppercase mono — hence `label` (+10%) and `display` (-2%) at opposite ends, `data` at +5% for sentence case. **Never put display tracking on small text** — it reads cramped at UI scale. If you're hand-writing family + weight + tracking, you've left the system. **And never set `letter-spacing` twice in one rule** — a hardcoded value after the tier token silently overrides it.

**Spacing: the `--space-*` scale, and nothing outside it.** Every `padding`, `margin` and `gap` resolves to a token. Values under 4px stay literal — a 1px grid `gap` is a border trick, not rhythm. If a value doesn't fit, change the design or the scale.

**Measure: nine steps, and nothing outside them.** Every prose `max-width` resolves to a `--measure-*` token, never a hand-written `ch`. `--measure-lg` (56ch) and `--measure-2xl` (68ch) are the anchors everything else was picked around — `.lead` and `.prose` in `global.css`.

**Motion: six durations, three curves, and nothing outside them** (`--dur-*` / `--ease-*`). **The names are semantic, not numeric** — a rule picks by what the motion *means*, so a color swap is `--dur-quick` wherever it sits and a slide is `--dur-move` whatever the distance. `--dur-quick` is the anchor. Transform magnitudes are tokens too (`--travel-*`, `--scale-*`, `--stagger-step`), so a hand-written hover scale can't drift from its neighbours.

**Page transitions are the native CSS `@view-transition`, never Astro's `<ClientRouter />`.** The router ships a client-side navigation runtime and takes over routing to buy the same effect; the CSS at-rule is declarative, costs no JS, and degrades to a normal navigation where it isn't supported.

**Animate `transform`, `opacity`, and color, and nothing else. Never a layout property.** Transform and opacity are compositable and are the default; color, `background-color` and `border-color` repaint but do not reflow, and they are the site's entire hover and theme-switch language, so they are in. Layout properties are the actual ban: they reflow every frame, and Lighthouse audits it on a site whose desktop perf claim has no headroom. Hence the status dot's halo as a pseudo-element rather than a `box-shadow`, and the row hover nudge as `.row-nudge`, a transform on the row's *contents*. Never nudge with `padding-left`: padding is layout, so it re-wraps a title mid-gesture.

**Reduced motion means REMOVE, not "instantly".** Killing the tween still lets a hover end-state apply, so a card would jump 3% larger in one frame; the block in `global.css` neutralizes every positional end-state too. Two traps live in it: `scroll-behavior` needs its own `html` selector (the `*` reset is (0,0,0) and loses to `html`), and the transform neutralization needs `!important` because **Astro scopes component styles with a bare `[data-astro-cid-*]` attribute, not `:where()`**, so a component's own rule outranks the same selector written globally.

**Color and radius are tokens too.** Every `border-radius` composes `--radius-*`. Overlays on media use `--scrim-*` / `--shadow-*`, which are `color-mix` on the ramp rather than a frozen `rgba()` copy. The ramp is warm and `--n-0` is its top step, so nothing reaches for white by default. **One deliberate exception:** `--surface-raised` is literal `#FFFFFF` in light theme, because `--n-0` is already `--surface` and a surface that must read as raised above the page has no warmer step left to take. It is commented where it sits. The other literals are the browser tint, now owned once by `src/lib/theme.ts` and read by both the `theme-color` meta and the pre-paint script, neither of which can read a CSS variable. **A token typo fails *silently* inside a shorthand**: an unresolvable `var()` in `border` invalidates the whole declaration at computed-value time, giving `border-style: none` rather than a fallback. Grep `tokens.css` before trusting a name.

**Four breakpoints, each with one job**: 1100 (a two-up row stacks), 1000 (a content + sticky-aside layout collapses), 900 (the rail becomes the mobile bar), 560 (the last grids go single-column). Listed in `tokens.css` as documentation, because `@media` can't read a custom property. Don't invent a fifth.

**The content column is not monotonic.** The rail costs 264px until it collapses at 900, so the column is *narrower* at 1100 than at 899 and the tightest band on the site sits just above 900, not at the smallest screen. Anything sized to fill a row has to survive that jump, which is why the home brand strip lets its chips share the row rather than being counted to fit: a set tuned to fill at one width strands a short, spread-out last row at another.

**Layout: one scale, and no `sizes` string written by hand.** `src/lib/layout.ts` owns the breakpoints, the shell inset (`--rail` + `.pad` x 2, derived so it can't disagree with the CSS), and every `sizes` an image renders: `sizesFor(cols)`, `FULL`, `sizesForSplit(fraction)`. **An image's `sizes` is a promise about how wide it will render, and a wrong one fails silently in whichever direction you didn't measure** — too small renders soft, too large spends the LCP budget. There is no column grid and no `max-width` anywhere: content is whatever the viewport has left after the rail and the padding.

**A `<video poster>` cannot be responsive**, so a poster still is emitted once rather than as a ladder. It still belongs in `src/assets/` for the hashing: a contract path can be rebuilt from a slug in JS, a hashed one can't, so the server writes it onto the element (`data-poster` / `data-poster-light`) and the script reads it.

**It cannot be theme-aware either, and `card-video.ts` only ever *adds* a poster, never replaces one.** A `poster` written into markup is therefore permanent until a live theme flip, which is how /work's LCP card served the dark still in light theme. Set it from the theme instead, and note that `rel=preload` can't be theme-conditional, so a preloaded poster is wrong for half of visitors.

**Gate a fetch on the gesture, never on the capability.** `(hover: hover)` says a pointer *could* hover, which is true of every laptop; wiring a `<source>` on that basis downloads every clip on the page at parse time. Attach the fetch to `mouseenter`/`focus`. Related: **a `<video>` given a `<source>` and a `load()` fetches the bytes despite `preload="none"`.**

**A conditional around a `<script>` does not remove it** — Astro hoists component scripts at build time, so `{cond && <script>}` still ships. Put the script in its own component and render *that* conditionally.

**A bare `1fr` grid track floors at min-content.** Use `minmax(0, 1fr)` for any track whose content must be allowed to shrink, or it overflows its parent instead.

**Theme.** Dark and light are both first-class. No-flash inline script, `localStorage` with try/catch, follows OS until manual override, respects reduced-motion.

**There is no ESLint, Prettier, husky or CI, and that is a decision rather than an omission.** `npm run build` is the only gate: `astro check` covers types, `claims.mjs` covers the values that actually break, and CI cannot deploy because deploys are manual and Pratik runs them. A second config would be a second thing to keep true for a solo static site. Considered and declined 2026-07-29; don't re-propose it without a failure it would have caught.

**Prose and comments are never hard-wrapped.** One paragraph, list item, or comment thought is one continuous line, however long; the viewer's soft-wrap handles display width. Never break mid-sentence to hit a column target. Applies to docs, code comments, JSDoc, YAML and HTML comments, and commit message bodies. Markdown/JSON/YAML *structural* breaks are unaffected.

**Comments say what the code is for and what breaks if you get it wrong.** Not how the problem was found — that belongs in the commit. Same length discipline as §9.

## 7. Naming (one standard — match it, don't invent)

- Components → `PascalCase.astro`. Routes → `kebab.astro`. Scripts / styles / lib → `kebab.ts`. Docs → `kebab.md`. Content slugs → `kebab`.
- Folders → **lowercase kebab**, with per-project slug subdirs (`public/wc/<slug>/`, `src/assets/work/<slug>/`). `wc` (work-card), `ov` (output-video), `og` (share cards) are the documented abbreviations — reuse them, don't invent more.
- **Contract-named assets are exempt and must not be "normalized".** They're fixed strings a typo turns into a silent 404: `card.webm` / `card-light.webm` / `poster.webp`, `hero_1080.webm` (its poster is NOT here — it lives in `src/assets/hero/<slug>/` so the pipeline can make it responsive), and vendor `@font-face` filenames. Because they're fixed and unhashed, `public/_headers` caches them `immutable` for a year: **replacing one's bytes in place won't reach returning visitors.** Adding a new slug or face is always safe; changing an existing one means renaming it or dropping `immutable` first.
- **Case-only renames:** macOS (APFS) and Windows are both case-insensitive by default, so a Title-Case→lowercase rename changes nothing the filesystem can see. Go via a temp name, and never create a lowercase twin of an existing dir before removing the original (a later `rm -rf` deletes both).

## 8. Content model

One case-study design for every entry. Spine: Scoreboard → Problem → System → Decisions → Output → Proof → Reflection. Optional modules render only when data exists. `src/content.config.ts` is the guardrail — every entry needs at least one proof figure or the build fails.

**The site ships as its own case study (`portfolio-system`), and its extras are one-offs.** `perfTable: true` and the device x theme Output matrix exist because the subject *is* this site; they are not a richer template for other entries and must not be generalized to one.

**The brands roster is `src/lib/brands.ts`, and the section is never headed or introduced as a "client list."** /work bands it by engagement type (`BRAND_BANDS`) and carries the employer-vs-brand hierarchy in **contrast, not structure**: full contrast is the organization that engaged Pratik, secondary is a brand that ran through it. Keep both, since the band alone would say a brand was an agency's without saying whose. **`Direct Engagements` is deliberately not named after the Apr 2024 practice**, which it predates, and is never called freelance. The Resume Master's roster table is the narrative source and the only place years live; the site renders bare names, except where a year is part of the event's own name.

**Engagement (`type`) is a typed, filterable facet, never a separate section.** Three values (`src/lib/work-type.ts`): `in-house`, `agency`, `concept`. **Do not label these "client".** Every non-concept entry is a position held, and at RAA / Agency FiveEighty the clients belonged to the agency. Employment type (Internship, Volunteer) goes in the scoreboard `role` field, never the badge, which carries engagement + discipline. Proof is one shape for every type — a verified metric where one was measured, scope + rationale where none exists. Never invent one to fill the box. **`collaborators` stays blank on every entry**, because the master does not carry it.

**Concept microsites** are embedded proof inside their case study, not a parallel front door. Each is its own world with its own brand, CSS, and fonts, served as static passthrough HTML from `public/concepts/<slug>/`. Their launcher stills are NOT there: they are case-study assets, so they sit in `src/assets/concepts/<slug>/preview-<view>.webp` and go through the image pipeline. A demo tab authors only its `view`; the link and the still both derive from it.

**Media is convention-located by slug — never a path in content.** Adding an entry means adding its work-card set, and **clips and posters ship from different trees**: the two clips are contract-named under `public/wc/<slug>/`, the two posters are hashed by the image pipeline under `src/assets/wc/<slug>/`. Output clips split the same way (`public/ov/` + `src/assets/ov/`). A poster left beside its clip is read by nothing and fails the build. The one opt-in flag left is `heroVideo: true`, which then requires `coverAlt` + `coverCaption` via a schema refine. **Video is webm only.** Recipes and caps:

| System | Doc |
| --- | --- |
| Machine prerequisites (toolchain, `_reference` link, ffmpeg build) | `docs/local-setup.md` |
| Case-study hero video (click-to-play, has audio) | `docs/hero-pipeline.md` |
| Work-card hover animation (muted, loops) | `docs/work-card-video.md` |
| Output gallery blocks + export caps | `docs/output-assets.md` |
| Share cards | `docs/og-cards.md` |
| UTM + GA4 | `docs/utm-tagging.md` |
| Deploy + rollback | `docs/deploy.md` |

**Output width ladders are DEVICE pixels and sources are shot at 2x. Astro never upscales**, so a too-short ladder fails silently and galleries render soft. Screen captures need `deviceScaleFactor: 2` (`scripts/shots/capture.mjs`).

## 9. Decision log

**A fixed-size recency window, not a history. Eight entries, newest first, one per DAY.** Same-day changes are merged into that day's entry by rewriting it, never appended as (a) / (b) / (c). That suffixing is what turns a log into a changelog, and git already is one.

**Adding a ninth entry evicts the oldest, in the same commit.** Eviction is a fork, never a plain delete: a rule that is still load-bearing gets promoted into §3-§8, or into the code or doc it governs, and only then is the entry cut. Nothing load-bearing ever leaves with its entry.

**Admission test, applied before writing: would someone about to make a change be MISLED without this?** Uninformed does not qualify. Rationale belongs in the commit and only traps earn a line, so "we added a guard" is a commit message: once the guard exists it is its own record.

**Only the newest entry may run to two or three sentences.** Every older one is a single sentence, two only when a second trap would otherwise be lost.

- **2026-08-07** — Ported to macOS, and the audit of everything marked "contract" mattered more than the port. **`public/fonts/OFL.txt` was not the OFL**: a scraped page saved as text, every soft wrap deleted without a space (`must not bedistributed`), one `&` left as `&amp;`, and a wrong copyright line, with `_reference/`'s "vendor original" byte-identical to it, so the usual restore-from-vendor rule could not fix it. **Poster stills live in `src/assets/`, never beside their clips**, and `docs/work-card-video.md` + `docs/output-assets.md` still documented the old `public/` layout, so following either recipe put the file where nothing reads it and failed the build. Also: Homebrew's slim `ffmpeg` has **no libwebp** while `ffmpeg-full` does, and a `.gitignore` entry with a **trailing slash matches directories only**, so `_reference/` silently stopped ignoring a symlink that a Windows junction had satisfied.
- **2026-08-03** — The independent practice is **closed at Aug 2026** and Director of Marketing is the single public identity, with the employer named on `/resume` and in the JSON-LD only; `src/pages/journal/[slug].astro` was outside `claims.mjs` TARGETS, leaving the author bio it renders on every post unguarded.
- **2026-07-29** — **Passing a class into an Astro component moves that element into the COMPONENT's style scope**, so every page rule naming the class silently stops matching. A `PageHero` component was built and reverted the same day for exactly this: it took `.bhero`, `.rhead`, `.chero`, `.legal`, `.phead`, `.ahead` and `.nf-inner` with it and shipped seven pages with no hero padding. Astro adds the attribute to **every compound part**, so `.bhero p` dies with `.bhero`, and `:global()` is not a general escape — `.phead` is shared by two pages with different padding. **Verify a rule MATCHES, not that a class is present**: a class with no matching rule is invisible, and checking for the class is what let this ship. Pages own their hero element; `claims.mjs` enforces `rev-load` on the first reveal, since `.rev` is `opacity: 0` and Chromium excludes it from LCP (/brand: 4238ms LCP against 973ms FCP, and 100 on desktop throughout; the fix took it to 2299ms and /resume from an intermittent 85 to 100). **A new guard is not trusted until a known-bad case makes it fail** — that check's first draft was inert, passing everything because `visibleCopy(src, file)` was called with its arguments reversed. `SectionLabel` then absorbed `CaseSectionHead` and 20 hand-rolled copies, and **its styles stay in `global.css` precisely because of the scoping trap above** — which nearly bit again via `resume.astro`'s `.raside .blabel`, fixed with `:global()` on that half alone. Two more axes got scales: `--z-*` (nine values ending 9998 and 99999) and the reading half of `--lh-*` (78 raw values across 23 numbers, frequency-derived so nothing moved more than 0.05). **`docs/` is in `TARGETS`** — tracked, public, and `docs/og-cards.md` had been naming the organization a rule already banned against a guard pointed at nothing; docs take the claim and spelling rules but not the four `copyOnly` style rules, since all 34 produced 111 violations that were almost entirely em dashes. Two rules here were **wrong rather than unenforced**: the `cqi` exemption claimed to be "wired up nowhere" while wired correctly in three places, which is why nobody caught `PerfTable` measuring against the viewport; and "animate transform and opacity, nothing else" was contradicted by ten shipped rules including the theme switch. **`--surface-raised` is literal `#FFFFFF` on purpose**: `--n-0` is the ramp's top and is already `--surface`.
- **2026-07-28** — Consent went **geo-split** (opt-in gate in the EEA/UK/CH, notice with one-click opt out elsewhere, failing closed to the gate on anything short of a confirmed non-European code), and gtag moved to an idle load after inline injection cost /brand ~300ms of TBT: **the queue is primed on arrival and the library fetched later**, because `track()` checks gtag at click time and an unprimed delay drops the clicks inside it. The install is one file with a generated microsite copy, and **the generator is deliberately not a `prebuild` hook** — regenerating automatically would silently overwrite a hand edit to the copy, the exact failure the arrangement exists to make loud. Also: **nothing fails the build when a perf claim drifts**, only `npm run perf:js` catches it; and **a tsconfig `exclude` REPLACES the inherited array** rather than merging, which had been feeding `dist`'s minified bundles to `astro check`.
- **2026-07-27** — Perf became a measured system rather than an authored one: published figures derive from the run (`src/lib/perf-claim.ts`), a published row is a **median sample** and never an average of metrics, and JetBrains Mono was subset after 165KB of high-priority woff2 gated mobile FCP/LCP. Home's hero also split from the per-slug system and is **versioned**, being the one hero whose bytes get replaced under a year of `immutable`.
- **2026-07-26** — Motion rebuilt as a semantic system, six durations named for intent plus `--travel-*` / `--scale-*` / `--stagger-step`, alongside the `--measure-*` tokenization and the repo-wide hard-wrap cleanup that §6's rule exists to stop recurring.
- **2026-07-25** — Audit sweep after 13 metric figures were found inflated against the Resume Master, every one upward, plus the small-screen pass below 1100 and scales for the remaining axes (`--fs-*`, duration / radius / scrim / shadow).
- **2026-07-24** — The concept "scope, never results" carve-out retired: a shipped concept follows the same case-study rules, with disclosure still required.

## 10. This file's own rules

**No state.** No inventories, no migration status, no "all X are done", no counts a command can answer. Every one of those rots and then lies. Open work goes as a `# [NEEDS: …]` comment in the file that needs the fix.

**No second homes.** If the code enforces it, point at the code. If a master owns it, point at the master. Never cite a `/brand` section by number — that page's numbering changes; use the section name.

**Anything verifiable gets verified, not asserted.** If you catch yourself writing a number, run the command instead.

**Cut first; promote only what would otherwise be lost.** Compressing or evicting a §9 entry means deleting whatever is already stated elsewhere, which is most of it. A rule that is load-bearing *and* written down nowhere else moves into the existing §3-§8 section that owns its subject, or into the code or doc that governs it. Never into a new section invented to hold it, and never back into a fresh log entry.
