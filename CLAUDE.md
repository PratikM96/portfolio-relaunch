# CLAUDE.md — mehtapratik.com (One System portfolio)

```
updated:  2026-07-27
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

**`npm run deploy` publishes to the live domain.** The cutover is done; `mehtapratik.com` serves this repo and there is no staging URL. Deploys are manual: pushing to `main` is not a deploy, and Pratik runs it. Validate on `npm run build` / `npm run preview` first — concept-demo clean URLs resolve in preview but **not** under `npm run dev`. **`astro preview` outlives `npm run preview`**, leaving a `workerd.exe` child holding `dist/client`, so kill the PID and verify `dist` is gone before believing a rebuild. Procedure and rollback: `docs/deploy.md`.

Live-domain artifacts: `public/_redirects` (redirect *sources* need explicit trailing-slash twins — the Worker only normalizes them for real pages), `public/robots.txt`, `public/_headers` (**the CSP is enforced**, so an un-allowlisted external origin fails silently), and the generated `sitemap-index.xml`. Dashboard settings the repo can't enforce, and the three toggles that can break its config: `docs/cloudflare.md`.

## 3. Content rules (non-negotiable)

- **Never invent** metrics, clients, roles, revenue, awards, responsibilities, outcomes, or claims. Uncertain → say so and leave a `# [NEEDS: …]` in the file. Never fill a gap with a plausible number.
- **One value per metric, in the Claim Registry's exact public wording.** No variants, no invented precision, no ranges; a figure more precise than its public wording is wrong. **Hedges are part of the value** ("roughly 300", "nearly 17K"), and **never add a `+` the registry does not carry.** Enforced by `scripts/check/claims.mjs`.
- **Self-initiated concepts** are never professional work, and each carries its non-affiliation `disclosure` (schema refine). A concept is **not barred from results** — the line is *did it ship and can the number be measured*. Design-only concepts carry scope; Portfolio System shipped and carries measured results. **Four:** The Ninth, Level, WISP, Portfolio System.
- **The Ninth does not name the organization it is built around.** Public copy says "a global esports organization". The microsite under `public/concepts/the-ninth/` is the exception, since the sub-brand is built on that identity and every page carries its own non-affiliation footer. Don't reintroduce the name into `src/` or `llms.txt`; don't strip it from the microsite.
- **Orange marks numbers.** Numeral runs are accent; symbols, units, magnitude letters and words stay normal. `figureRuns` in `src/lib/figure.ts` is the mechanism and `StatFigure.astro` its only consumer, so every stat surface moves together. **A number keeps its internal `.` and `,` inside one run**, or `11.7M` splits into two orange fragments around a neutral dot. It is a typographic signal, not a claim: nothing is gated on engagement type.
- **Apr 2024 to present** = "Independent Creative Systems Practice", role "Creative Technologist". Not a company, agency, consultancy, or freelance shop. "Self-directed" is internal classification, never a visible label.
- **Creative Marketing Lead** is the single public identity.

## 4. Voice

Direct, specific, natural, not over-polished, not obviously AI-written. Lead with the answer. No inflated claims, no buzzwords, no unsupported proof.

**No em or en dashes in external-facing copy.** Date ranges use hyphens. A style rule, not a claim rule (System Master §7), so it is arguable for a specific sentence.

**American spelling, everywhere.** color, behavior, program, labeled, gray, organize, license, center. The audience is US hiring teams, so a British variant reads as an inconsistency rather than a voice. Enforced by `scripts/check/claims.mjs` over visible copy; comments and docs were swept to match, so no second dialect hides behind a `/* */`. Words correct in both (advertising, analysis, emphasis) are deliberately absent from the list, and `public/fonts/OFL.txt` is third-party license text that ships verbatim.

**Separators are contextual.** `|` in `<title>`, none in meta descriptions (write sentences), ` / ` in on-page label and data rows. No middle dot in copy; the ones left are structural and commented where they sit.

Full rules — the declarative-reversal lead, the proof sentence, the honesty register, the avoid list — are System Master §5. Don't write in his voice without reading it.

## 5. Where things are enforced (point, don't restate)

| Concern | Source of truth |
| --- | --- |
| Content model, required fields, the build guardrail | `src/content.config.ts` — a missing or wrong-shaped field **fails the build** |
| Published perf figures and their rounding direction | `src/lib/perf-claim.ts` — a figure with `from` derives from the measured run, so it cannot drift from `PerfTable` |
| Metric wording, retired claims, style defaults | `scripts/check/claims.mjs` — the schema checks shape, this checks values, and `npm run build` runs it first. **Every guard that must fail the build lives here**, because a `throw` in a lib or component does not: `astro build` kills only the importing pages and exits 0, writing them zero-byte |
| What Pratik owned vs didn't, per case study | `contribution` in the entry + `ContributionBox.astro` |
| Which projects answer which hiring need | the `ROUTES` table in `src/pages/work/index.astro` |
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

## 6. Build rules code can't enforce

**Assets.** Everything is same-origin, served by the Worker. No external CDN. Images go in `src/assets/` (Astro's pipeline: responsive widths, hashing, CLS-safe dims); anything the pipeline can't process — video, fonts, favicons — goes in `public/` and ships verbatim. Only web-optimized deliverables get committed; raw masters stay in gitignored `_reference/`. **Never re-compress a `src/assets/` file to save bytes**: the pipeline re-encodes it at build, so a lossy pass there buys nothing and softens the master it re-encodes from. **Cloudflare caps Worker static assets at 25 MiB per file.** Build-time image optimization needs the adapter's `imageService: 'compile'`.

**Fonts.** Self-hosted, same-origin, woff2 only. No font CDN: it costs a second-origin handshake plus a CSS→font waterfall, defeats preloading, and the cross-site cache benefit died when browsers partitioned cache by top-level site. Files live flat in `public/fonts/`; OTF masters and licenses stay in `_reference/fonts/site/`.

**Three files, one VARIABLE face per family.** Each declares a `font-weight` range, so every weight the type scale names is real. With static cuts a missing weight failed *silently*, because browsers match the nearest face rather than erroring. Never add one back. The three *additional* `@font-face` blocks in `tokens.css` are metric-matched fallbacks, not cuts: `src: local()` plus **measured** overrides, zero bytes shipped, holding each face's box until `swap` fires. Re-measure if a face changes; a stale override reflows toward the wrong box.

*Licensing is a build constraint.* The repo is public and the fonts ship in it, so a face needs **two separate rights, and they don't come together**: web embedding **and** modification (subsetting is modification).
- **Clash Display / Clash Grotesk** — Fontshare FFL: embedding yes, **modification no**. Ship verbatim, never subset or axis-pin.
- **JetBrains Mono** — OFL-1.1, no Reserved Font Name: both granted. `public/fonts/OFL.txt` ships beside it per OFL §2. **It is subset, and it is the only face that may be** (`scripts/fonts/subset-mono.mjs`, `npm run fonts:subset`).

**The subset's input is the vendor original in `_reference/`, never the shipped file** — re-running against an already-subset face narrows the set a little more every time, silently. Its character set is a deliberate fixed floor rather than a scan of the build, because **a scan misses anything a script injects** (`▶` lives only in a JS string) and a missing glyph doesn't error, it renders in the fallback and looks subtly wrong. To verify, measure advance widths: a mono face gives every glyph the same advance, so anything that fell back stands out. Three symbols the design uses (`❚ ★ ▢`) are absent from JetBrains Mono itself and always were.

**Client JS lives in `src/scripts/`, never re-typed per page.** `consent.ts` (GA4 gate), `site-chrome.ts` (theme, drawer, clock, reveal, scroll-spy), `motion.ts` and `card-video.ts` (video behavior), `embedded-demo.ts` (concept launcher tabs). The only hand-written inline script is the pre-paint no-flash theme in `Base.astro`. Where bundles *land* is Vite's call — under the 4096-byte `assetsInlineLimit` they inline into every page, over it they become hashed `/_astro/` files, and a bundle can cross that line as it grows. **Don't assert which side a script is on; run `npm run build` and look.**

**Shared primitives live in `global.css`** so they can't drift: `.card` / `.card--interactive`, `.badge` / `.badge-lg`, `.prose`, `.tag`, `.lead`, `.h2` / `.h3`, `.page-h1` / `.page-kicker` / `.close-h`, `.btn`, `.frame` (anything holding an image or video — set the aspect ratio at the point of use). `PlayButton.astro` is the same idea as a component; its triangle nudge is derived (`w/6`), never hand-placed. Add the class; don't rewrite the surface. A local rule keeps only its own delta.

**Reveal — pick by position.** `.rev` = below-the-fold scroll reveal (opacity + slide). `.rev-load` = above-the-fold, **transform only, no opacity**, because Chromium excludes `opacity:0` elements from LCP and a faded hero hands LCP to a late-painting element. Both respect reduced-motion. `.rev`'s trigger point is the observer's bottom `rootMargin` alone; its `threshold` is 0 and stays 0. **A ratio threshold on a variable-height set is the bug** — a tall block would need a fraction of *itself* in view and reveal late. To make a reveal wait longer, change `rootMargin`.

**Reveal the item, not the container**, wherever the container is taller than the viewport: a wrapper `.rev` around a long list fades everything at once, most of it still far below the fold. Stagger a *short* list with `--rev-i` per item and **cap the index** so a long list's last row isn't still waiting after it is on screen. A scroll-triggered list wants no stagger — the scroll already sequences it. **Never stagger `.rev-load`**: holding above-the-fold content back pushes the pixels Speed Index is timing.

**Type: eight tiers, and nothing outside them** (`--t-*` in `tokens.css`). A rule sets **size only** (plus color / line-height) and composes a tier; family, weight and tracking are the system.

**Size: eleven steps, and nothing outside them.** A tier says which face, a `--fs-*` step says how big; `--fs-fluid-*` covers type that scales with the viewport. Never a px value or a hand-rolled `clamp()`. Two exemptions, both commented where they sit: container-query sizing (`cqi`), measured against a cell rather than the page, and `/brand`'s format mockups and logo specimens, which are export-pixel canvases.

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

**Animate `transform` and `opacity`, nothing else.** They are the only compositable properties; everything else repaints, and Lighthouse audits it on a site whose desktop perf claim has no headroom. Hence the status dot's halo as a pseudo-element rather than a `box-shadow`, and the row hover nudge as `.row-nudge`, a transform on the row's *contents*. Never nudge with `padding-left`: padding is layout, so it reflows every hover frame and can re-wrap a title mid-gesture.

**Reduced motion means REMOVE, not "instantly".** Killing the tween still lets a hover end-state apply, so a card would jump 3% larger in one frame; the block in `global.css` neutralizes every positional end-state too. Two traps live in it: `scroll-behavior` needs its own `html` selector (the `*` reset is (0,0,0) and loses to `html`), and the transform neutralization needs `!important` because **Astro scopes component styles with a bare `[data-astro-cid-*]` attribute, not `:where()`**, so a component's own rule outranks the same selector written globally.

**Color and radius are tokens too.** Every `border-radius` composes `--radius-*`. Overlays on media use `--scrim-*` / `--shadow-*`, which are `color-mix` on the ramp rather than a frozen `rgba()` copy. There is no pure white — `--n-0` is warm. The only literal colors left are the `theme-color` meta and the pre-paint script, which cannot read a CSS variable. **A token typo fails *silently* inside a shorthand**: an unresolvable `var()` in `border` invalidates the whole declaration at computed-value time, giving `border-style: none` rather than a fallback. Grep `tokens.css` before trusting a name.

**Four breakpoints, each with one job**: 1100 (a two-up row stacks), 1000 (a content + sticky-aside layout collapses), 900 (the rail becomes the mobile bar), 560 (the last grids go single-column). Listed in `tokens.css` as documentation, because `@media` can't read a custom property. Don't invent a fifth.

**The content column is not monotonic.** The rail costs 264px until it collapses at 900, so the column is *narrower* at 1100 than at 899 and the tightest band on the site sits just above 900, not at the smallest screen. Anything sized to fill a row has to survive that jump, which is why the home brand strip lets its chips share the row rather than being counted to fit: a set tuned to fill at one width strands a short, spread-out last row at another.

**Layout: one scale, and no `sizes` string written by hand.** `src/lib/layout.ts` owns the breakpoints, the shell inset (`--rail` + `.pad` x 2, derived so it can't disagree with the CSS), and every `sizes` an image renders: `sizesFor(cols)`, `FULL`, `sizesForSplit(fraction)`. **An image's `sizes` is a promise about how wide it will render, and a wrong one fails silently in whichever direction you didn't measure** — too small renders soft, too large spends the LCP budget. There is no column grid and no `max-width` anywhere: content is whatever the viewport has left after the rail and the padding.

**A `<video poster>` cannot be responsive**, so a poster still is emitted once rather than as a ladder. It still belongs in `src/assets/` for the hashing: a contract path can be rebuilt from a slug in JS, a hashed one can't, so the server writes it onto the element (`data-poster` / `data-poster-light`) and the script reads it.

**It cannot be theme-aware either, and `card-video.ts` only ever *adds* a poster, never replaces one.** A `poster` written into markup is therefore permanent until a live theme flip, which is how /work's LCP card served the dark still in light theme. Set it from the theme instead, and note that `rel=preload` can't be theme-conditional, so a preloaded poster is wrong for half of visitors.

**Gate a fetch on the gesture, never on the capability.** `(hover: hover)` says a pointer *could* hover, which is true of every laptop; wiring a `<source>` on that basis downloads every clip on the page at parse time. Attach the fetch to `mouseenter`/`focus`. Related: **a `<video>` given a `<source>` and a `load()` fetches the bytes despite `preload="none"`.**

**A conditional around a `<script>` does not remove it** — Astro hoists component scripts at build time, so `{cond && <script>}` still ships. Put the script in its own component and render *that* conditionally.

**A bare `1fr` grid track floors at min-content.** Use `minmax(0, 1fr)` for any track whose content must be allowed to shrink, or it overflows its parent instead.

**Theme.** Dark and light are both first-class. No-flash inline script, `localStorage` with try/catch, follows OS until manual override, respects reduced-motion.

**Prose and comments are never hard-wrapped.** One paragraph, list item, or comment thought is one continuous line, however long; the viewer's soft-wrap handles display width. Never break mid-sentence to hit a column target. Applies to docs, code comments, JSDoc, YAML and HTML comments, and commit message bodies. Markdown/JSON/YAML *structural* breaks are unaffected.

**Comments say what the code is for and what breaks if you get it wrong.** Not how the problem was found — that belongs in the commit. Same length discipline as §9.

## 7. Naming (one standard — match it, don't invent)

- Components → `PascalCase.astro`. Routes → `kebab.astro`. Scripts / styles / lib → `kebab.ts`. Docs → `kebab.md`. Content slugs → `kebab`.
- Folders → **lowercase kebab**, with per-project slug subdirs (`public/wc/<slug>/`, `src/assets/work/<slug>/`). `wc` (work-card), `ov` (output-video), `og` (share cards) are the documented abbreviations — reuse them, don't invent more.
- **Contract-named assets are exempt and must not be "normalized".** They're fixed strings a typo turns into a silent 404: `card.webm` / `card-light.webm` / `poster.webp`, `hero_1080.webm` (its poster is NOT here — it lives in `src/assets/hero/<slug>/` so the pipeline can make it responsive), and vendor `@font-face` filenames. Because they're fixed and unhashed, `public/_headers` caches them `immutable` for a year: **replacing one's bytes in place won't reach returning visitors.** Adding a new slug or face is always safe; changing an existing one means renaming it or dropping `immutable` first.
- **Windows:** the filesystem is case-insensitive, so a Title-Case→lowercase rename is a case-only rename. Go via a temp name, and never create a lowercase twin of an existing dir before removing the original (a later `rm -rf` deletes both).

## 8. Content model

One case-study design for every entry. Spine: Scoreboard → Problem → System → Decisions → Output → Proof → Reflection. Optional modules render only when data exists. `src/content.config.ts` is the guardrail — every entry needs at least one proof figure or the build fails.

**The brands roster is `src/lib/brands.ts`, grouped by how the work came in and never a "client list."** At RAA and FiveEighty they were the agency's clients, and the grouping is the only thing carrying that, so it is never flattened and the honesty sentence stays in /work's section lead. **`Direct engagements` is deliberately not named after the Apr 2024 practice**, which it predates, and is never called freelance. The Resume Master's roster table is the narrative source and the only place years live; the site renders bare names, except where a year is part of the event's own name.

**Engagement (`type`) is a typed, filterable facet, never a separate section.** Three values (`src/lib/work-type.ts`): `in-house`, `agency`, `concept`. **Do not label these "client".** Every non-concept entry is a position held, and at RAA / Agency FiveEighty the clients belonged to the agency. Employment type (Internship, Volunteer) goes in the scoreboard `role` field, never the badge, which carries engagement + discipline. Proof is one shape for every type — a verified metric where one was measured, scope + rationale where none exists. Never invent one to fill the box. **`collaborators` stays blank on every entry**, because the master does not carry it.

**Concept microsites** are embedded proof inside their case study, not a parallel front door. Each is its own world with its own brand, CSS, and fonts, served as static passthrough HTML from `public/concepts/<slug>/`. Their launcher stills are NOT there: they are case-study assets, so they sit in `src/assets/concepts/<slug>/preview-<view>.webp` and go through the image pipeline. A demo tab authors only its `view`; the link and the still both derive from it.

**Media is convention-located by slug — never a path in content.** Adding an entry means adding its `public/wc/<slug>/` set (all four files). The one opt-in flag left is `heroVideo: true`, which then requires `coverAlt` + `coverCaption` via a schema refine. **Video is webm only.** Recipes and caps:

| System | Doc |
| --- | --- |
| Case-study hero video (click-to-play, has audio) | `docs/hero-pipeline.md` |
| Work-card hover animation (muted, loops) | `docs/work-card-video.md` |
| Output gallery blocks + export caps | `docs/output-assets.md` |
| Share cards | `docs/og-cards.md` |
| UTM + GA4 | `docs/utm-tagging.md` |
| Deploy + rollback | `docs/deploy.md` |

**Output width ladders are DEVICE pixels and sources are shot at 2x. Astro never upscales**, so a too-short ladder fails silently and galleries render soft. Screen captures need `deviceScaleFactor: 2` (`scripts/shots/capture.mjs`).

## 9. Decision log

**Only the newest entry may run to two or three sentences. Every older one is a single sentence, two only when a second trap would otherwise be lost.** Adding an entry means compressing the one it displaces, in the same commit. The rationale lives in the commit; a rule that is still load-bearing gets moved up into §3-§8 or into the code it governs before the entry is cut, never deleted with it.

- **2026-07-28 (i)** — The roster's last group is **Direct engagements**, not the practice's name: Ventura (2015) and SQUIP (2016) predate Apr 2024, and borrowing the role's name would have dated the role to 2014 and run a twelve-year entry under eight overlapping jobs. The roster folded into the Resume Master's Claim Registry and `client-list.txt` was deleted, since two homes for one roster is §10's failure mode and the two had already disagreed on three claim-controlled facts. **`brands.ts`'s throws never failed the build** and were shipping a zero-byte home page, so both guards now live in `claims.mjs` (§5) and the ones in the lib are a dev signal only.
- **2026-07-28 (h)** — The /work filter bar is bounded by a wrapper around the list and unsticks below 900, because **a sticky element is constrained by its containing block**, so as a sibling of the list its block was the page and it followed into the brands section.
- **2026-07-28 (g)** — Build targets pinned to Safari 16.2 / Chrome 111 / Firefox 113, the floor `color-mix()` already sets, because the minifier otherwise rewrote `@media` into range syntax needing 16.4 and **an unsupported media condition drops the whole block**, which would have served 16.0 to 16.3 the desktop layout on a phone.
- **2026-07-28 (f)** — The mobile drawer sizes to `100dvh`, since a fixed `inset: 0` resolves against the large viewport and left the bottom-pinned readout under the toolbar; the `max-height` query compressing its nav is a height axis, not a fifth breakpoint.
- **2026-07-28 (e)** — /work's LCP card sets its poster from an `is:inline` script, since a static attribute cannot know the theme (§6) and the preload it replaced was wrong for half of visitors, leaving /work's LCP to be re-measured.
- **2026-07-28 (d)** — The Claim Registry said `claims.mjs` enforced the retired "zero layout shift" and the brand-systems count; neither rule existed, so both are now real.
- **2026-07-28 (c)** — The /work brands row puts names on their own full-width line, after **a preview harness without the shell inset overstated the column** and the shared row wrapped even at 1440.
- **2026-07-28 (b)** — /about expanded in place with six dated path steps, a fuller AI section, and Working with me plus Influences from System Master §6, whose wrong-fit bullet ships reframed toward what Pratik looks for.
- **2026-07-28** — The brands roster shipped grouped by role and never as a client list (§8), moving the registry aggregate to 30+ behind a build-time guard, because a published `+` outlives whoever next edits the array.
- **2026-07-27 (h)** — Published proof figures derive from the measured run via `src/lib/perf-claim.ts`, after a run measured 99.4 mobile against a proof box asserting 98; the JS figure stays authored and is the one that can still rot.
- **2026-07-27 (g)** — A perf run is a sample set and the published row is the **median** sample, because averaging metrics independently would publish a row that never happened.
- **2026-07-27 (f)** — Perf runs are archived per run with a distilled history in `scripts/perf/history.jsonl`, which settled that there is no page-specific mobile problem: **compare averages, never page scores**.
- **2026-07-27 (e)** — JetBrains Mono subset (89KB → 35KB) after 165KB of High-priority woff2 gated mobile FCP/LCP. Measured and deliberately **not** done, so don't re-propose: splitting `PerfTable`/`EmbeddedDemo` CSS out of the case-study bundle, and dropping home's 1.15MB hero video on mobile.
- **2026-07-27 (d)** — The "zero layout shift" claim retired as a second number saying what the Lighthouse score already says; `PerfTable` keeps per-page CLS as measured detail.
- **2026-07-27 (c)** — Layout became a scale (`src/lib/layout.ts`) after five hand-maintained `sizes` strings drifted; **`frc` is a 720p source, not a bad export**, so leave its hero alone.
- **2026-07-27 (b)** — Home's hero re-cut and split from the per-slug system: square, silent, autoplaying, and **versioned**, because it is the one hero whose bytes get replaced under a year of `immutable` (`docs/hero-pipeline.md`).
- **2026-07-27** — American spelling adopted and enforced (§4), after `/brand` shipped "Color" in one heading and "Colour" in another.
- **2026-07-26 (d)** — Motion rebuilt as a semantic system, six durations renamed for intent plus `--travel-*` / `--scale-*` / `--stagger-step`; page transitions are the native CSS `@view-transition`, **never Astro's `<ClientRouter />`**.
- **2026-07-26 (c)** — The reveal observer's `threshold` is 0 (§6), and **an unfocused or occluded Chrome tab throttles rendering so IntersectionObserver stops firing**: screenshot first, then read the DOM.
- **2026-07-26 (b)** — Prose `max-width` tokenized into the nine-step `--measure-*` scale.
- **2026-07-26** — Repo-wide hard-wrap cleanup; the §6 rule is what stops it recurring.
- **2026-07-25 (c)** — Small-screen pass below 1100, whose traps are now in §6 and §2, plus one that lives only here: **`cqi` with no `container-type` ancestor resolves against the viewport**, so §6's container-query exemption is not wired up anywhere and is not precedent.
- **2026-07-25 (b)** — Audit sweep after 13 metric figures were found inflated against the Resume Master, every one upward; **machine-readable surfaces need the same copy sweep as pages**.
- **2026-07-25** — The remaining axes got scales (`--fs-*`, `--fs-fluid-*`, duration / radius / scrim / shadow); a `.meta-label` primitive was deliberately not added, since those rules already resolve to the same tokens.
- **2026-07-24** — The concept "scope, never results" carve-out retired: a shipped concept follows the same case-study rules, with disclosure still required.
- **2026-07-24 (c)** — Output width ladders are device pixels and Astro never upscales (§8).
- **2026-07-24 (b)** — The site ships as its own case study (`portfolio-system`), whose `perfTable: true` and device x theme Output matrix are one-offs and must not be generalized.
- **2026-07-23** — Mobile weight pass + metric-matched font fallbacks, which proved **CLS was 0 only because the page was slow**: check CLS on every perf change, not just the metric being optimized.
- **2026-07-22** — System audit sweep: removed `cover`, the placeholder subsystem, the mp4 fallback and the `cardVideo` flags, and adopted the type and spacing scales.
- **2026-07-15** — Type scale adopted (§6), fonts became variable one file per family, and JetBrains Mono replaced Berkeley Mono (no web license, repo is public) layout-neutrally. **Wordmark = `h1` tier** and its only consumer: display weight and tracking are optical compensations for large type, never for UI-scale text.
- **2026-07-14** — Masters split into hub + Job Search Targeting + AI Behavior; the live site became the case-study copy source and the Resume Master the metrics master.
- **Earlier** — Domain cutover to this repo; R2 / `cdn.mehtapratik.com` dropped, all assets same-origin.

## 10. This file's own rules

**No state.** No inventories, no migration status, no "all X are done", no counts a command can answer. Every one of those rots and then lies. Open work goes as a `# [NEEDS: …]` comment in the file that needs the fix.

**No second homes.** If the code enforces it, point at the code. If a master owns it, point at the master. Never cite a `/brand` section by number — that page's numbering changes; use the section name.

**Anything verifiable gets verified, not asserted.** If you catch yourself writing a number, run the command instead.

**Cut, don't relocate.** Compressing an entry means deleting what is already stated elsewhere, not moving it into a new section here.
