# CLAUDE.md — mehtapratik.com (One System portfolio)

```
updated:  2026-07-15
owns:     build rules for this repo that code cannot enforce
wins:     how to change this repo
defers:   facts -> Resume Master · copy -> the live site · positioning + voice
          -> System Master · design -> /brand + tokens.css · behavior -> AI Behavior
```

## 0. Read these first

The governing docs are **not in this repo**. They live in `_reference/masters/`,
which is gitignored (the repo is public; `system-master.md` §6 is explicitly not
public-facing). They are still the source of truth for this site. Read them
before proposing anything:

| Need | Read |
| --- | --- |
| Any number, title, date, metric, role fact | `_reference/masters/resume-master.md` — **the metrics master** |
| Positioning, voice, narrative, boundaries, governance | `_reference/masters/system-master.md` — the hub |
| How to operate, task modes, failure states | `_reference/masters/ai-behavior.md` |
| What is live at which URL | `_reference/masters/portfolio-url-index.md` |

`ai-behavior.md`: *"If a fact is not in one of these, it does not exist. Say so."*

`_reference/masters/` also holds `job-search-targeting.md` and
`system-locations.md` — job-search machinery, not site scope, and private.
`_reference/_archive/` is superseded; never read it as current.

**Authority order.** Resume Master wins any number, title, or date. The live site
wins case-study copy, framing, and scope presentation. System Master wins
positioning, voice, and boundaries. `/brand` + `src/styles/tokens.css` win design.
This file wins only on how to build. A site-vs-master conflict is flagged and
resolved, never silently adopted either way.

## 1. What this is

Pratik Mehta's portfolio, on the **One System** brand. Astro + TypeScript,
deployed to Cloudflare Workers via `@astrojs/cloudflare`.

## 2. Deploy — read before running anything

**`npm run deploy` publishes to the live domain.** The cutover is done;
`mehtapratik.com` serves this repo and there is no staging URL in the loop.
Deploys are manual: pushing to `main` is not a deploy, and Pratik runs it.
Validate on `npm run build` / `npm run preview` first — concept-demo clean URLs
resolve in preview but **not** under `npm run dev`. Full procedure and rollback:
`docs/deploy.md`.

Live-domain artifacts: `public/_redirects` (redirect *sources* need explicit
trailing-slash twins — the Worker only normalizes trailing slashes for real
pages), `public/robots.txt`, `public/_headers` (**the CSP is enforced** — a new
external origin that isn't allowlisted fails silently), and the generated
`sitemap-index.xml`.

## 3. Content rules (non-negotiable)

- **Never invent** metrics, clients, roles, revenue, awards, responsibilities,
  outcomes, or claims. Missing or uncertain → say so, leave a TODO in the file
  that needs it. Never fill a gap with a plausible number.
- **One value per metric, sourced from the Resume Master.** No exact-value
  variants, no invented precision, no ranges. If a figure on the site is more
  precise than the master's, the site is wrong.
- **Self-initiated concepts** are never professional work, and every concept
  still carries its non-affiliation `disclosure` (enforced by the schema refine;
  when Cloud9 is named, The Ninth carries its disclosure verbatim). But a concept
  is **not barred from results**: it follows the same case-study rules as real
  work. A concept that only exists as design (The Ninth, Level, WISP) carries
  **scope**, because it has no outcomes to show; a concept that actually shipped
  and runs (this site, Portfolio System) may carry **real, measured results**,
  same as any entry. The line is *did it ship and can the number be measured*, not
  *is it a concept*. The honesty rule above still governs: measured or sourced, or
  it does not go on the page.
- **Orange marks real, measured results** — this is a proof rule wearing a colour.
  One signal per surface, one job. It is **not gated on engagement type**: a
  concept's measured results earn it exactly like in-house work (the mechanism is
  `figureRuns` in `src/lib/figure.ts`, which keys off the *figure*, not the
  entry). Scope figures and neutral data don't trigger it. (`/brand` owns the rest
  of the accent rules; it does not state this one.)
- **Apr 2024 to present** = "Independent Creative Systems Practice", role
  "Creative Technologist". Not a company, agency, consultancy, or freelance shop.
  "Self-directed" is internal classification and never a visible label.
- **Creative Marketing Lead** is the single public identity.

## 4. Voice

Direct, specific, natural, not over-polished, not obviously AI-written. Lead with
the answer. No inflated claims, no buzzwords, no unsupported proof.

**No em or en dashes in external-facing copy, except date ranges.** Absolute.

Full rules — the declarative-reversal lead, the proof sentence, the honesty
register, the avoid list — are System Master §5. Don't write in his voice without
reading it. The `/brand` voice section defers to that doc by design.

## 5. Where things are enforced (point, don't restate)

If the code enforces it, read the code. Restating it here gives the fact a second
home, and the copies drift.

| Concern | Source of truth |
| --- | --- |
| Content model, required fields, the build guardrail | `src/content.config.ts` — a missing/wrong-shaped field **fails the build** |
| Routes and the sitemap | `src/pages/` — the filename is the URL |
| Design tokens, the ramp, the type scale (`--t-*`), `@font-face` | `src/styles/tokens.css` |
| Design law in prose (type, colour, radius, grid, motion, a11y) | the live `/brand` page |
| The engagement facet + its labels | `src/lib/work-type.ts` |
| Stack and versions | `package.json`, `astro.config.mjs` |

## 6. Build rules code can't enforce

**Assets.** Everything is same-origin, served by the Worker. No external CDN.
Images go in `src/assets/` (Astro's pipeline: responsive widths, hashing,
CLS-safe dims); anything the pipeline can't process — video, fonts, favicons —
goes in `public/` and is served verbatim. Only web-optimized deliverables get
committed; raw masters stay in gitignored `_reference/`. **Cloudflare caps Worker
static assets at 25 MiB per file** — design large video around it. Build-time
image optimization needs the adapter's `imageService: 'compile'`.

**Fonts.** Self-hosted, same-origin, woff2 only. No font CDN, and that's
deliberate: a CDN costs a second-origin handshake plus a CSS→font waterfall and
defeats preloading, while the cross-site cache benefit that once justified it
died when browsers partitioned HTTP cache by top-level site. Files live flat in
`public/fonts/`; OTF masters and the per-family licence stay in
`_reference/fonts/site/`.

**Three files, one VARIABLE face per family** — not static cuts, and nothing is
subset. Each declares a `font-weight` range, so every weight the type scale names
is real. That is the point: with static cuts a missing weight failed *silently*
(Clash Grotesk 500 rendered as 400; JetBrains 700 rendered as faux bold), because
browsers match the nearest face rather than erroring. Never add a static cut back
alongside these.

The three *additional* `@font-face` blocks in `tokens.css` are metric-matched
fallbacks, not cuts: `src: local()` plus measured overrides, zero bytes shipped.
They hold each face's space until `swap` fires. See the 2026-07-23 decision log
entry before touching them — the overrides are measured, and a stale one reflows
toward the wrong box.

*Licensing is a build constraint.* The repo is public and the fonts ship in it,
so a face needs **two separate rights, and they don't come together**: web
embedding **and** modification (subsetting is modification).
- **Clash Display / Clash Grotesk** — Fontshare FFL: embedding yes,
  **modification no**. Ship verbatim, always. Cannot be subset or axis-pinned.
- **JetBrains Mono** — OFL-1.1, no Reserved Font Name: both granted.
  `public/fonts/OFL.txt` ships beside it because OFL §2 requires the licence to
  accompany the font. It ships whole anyway (see the decision log) — subsetting it
  is the first lever if PageSpeed ever demands one.

**Client JS lives in `src/scripts/`, never re-typed per page.** `consent.ts` (GA4
consent gate), `site-chrome.ts` (theme, drawer, clock, reveal, scroll-spy),
`motion.ts` and `card-video.ts` (video behavior), `embedded-demo.ts` (concept
launcher tabs). Don't re-implement video/reveal per page. The only hand-written
inline script is the pre-paint no-flash theme set in `Base.astro` (the JSON-LD
block is data, not behavior).

Where those bundles *land* is Vite's call, not a decision: anything under its
4096-byte `assetsInlineLimit` is inlined into every page, anything over becomes a
hashed, cached `/_astro/` file, and a bundle can cross that line as it grows.
**Don't assert which side a script is on — run `npm run build` and look.**

**Shared primitives live in `global.css`,** promoted out of per-page styles so
they can't drift: `.card` / `.card--interactive`, `.badge` / `.badge-lg`,
`.prose`, `.tag`, `.lead`, `.h2` / `.h3`, `.page-h1` / `.page-kicker` /
`.close-h`, `.btn`. Add the class; don't re-write the surface. A local rule
keeps only its own delta (a margin, a size), never a copy of the primitive.

**Reveal — pick by position.** `.rev` = below-the-fold scroll reveal (opacity +
slide, IntersectionObserver). `.rev-load` = above-the-fold, **transform only, no
opacity**. Use `.rev-load` for any hero holding the LCP element: Chromium
excludes `opacity:0` elements from LCP, so a faded hero hands LCP to a
late-painting element and inflates it. Both respect reduced-motion.

**Type: eight tiers, and nothing outside them.** Defined as `--t-*` tokens in
`tokens.css`. A rule sets **size only** (plus colour / line-height) and composes a
tier; family, weight and tracking are the system.

**How a tier is applied.** Each tier is one grouped rule listing every selector
that needs it — the `.t-*` block at the top of `global.css`, and a matching block
at the top of each component's `<style>`. Add your selector to that group; never
re-declare the `font-family` + `font-weight` + `letter-spacing` triple inline.
The bare `.t-*` classes also work directly in markup. A group inside a media
query stays inside it — hoisting one to the top level leaks the tier to widths
where that element doesn't render.

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

**Every page head is `display`** — they're one family of pages, so they read as
one. `h1` is the wordmark's tier and its only consumer: the lockup is Pratik's
name, so it stays in the brand voice, and 600/-1% gives it presence without the
hero treatment that made it read cramped at 19px.

`/brand` §03 renders this same table from the live `.t-*` classes with a real
sample per tier, so it can't drift from the code. **If a tier moves, fix its
`where` column there too** — a spec page that lies is worse than none.

**Tracking is optical.** It tightens as type grows, sits at 0 for reading, and
opens for uppercase mono. That's why `label` (+10%) and `display` (-2%) are at
opposite ends, and why `data` exists at +5%: heavy tracking is an uppercase
device and falls apart on lowercase. **Never put display tracking on small text** —
Clash Display 700 at -2.5% on a 19px wordmark is what made the rail read cramped.

If you're hand-writing family + weight + tracking, you've left the system. **And
never set `letter-spacing` twice in one rule** — a hardcoded value after the tier
token silently overrides it, which is how this drifted before.

Kicker: `label` tier, 11px, accent-text. Section label: `[ 0N ]` (accent mono) +
uppercase mono title (muted) + flex rule line.

**Spacing: the `--space-*` scale, and nothing outside it.** Every `padding`,
`margin` and `gap` resolves to a token. Values under 4px are exempt and stay
literal — a 1px grid `gap` is a border trick, not rhythm. If a value doesn't fit
the scale, change the design or the scale; don't add a literal.

**Theme.** Dark and light are both first-class. No-flash inline script,
`localStorage` with try/catch, follows OS until manual override, respects
reduced-motion.

## 7. Naming (one standard — match it, don't invent)

- Components → `PascalCase.astro`. Routes → `kebab.astro`. Scripts / styles /
  lib → `kebab.ts`. Docs → `kebab.md`. Content slugs → `kebab`.
- Folders → **lowercase kebab**, with per-project slug subdirs
  (`public/wc/<slug>/`, `src/assets/work/<slug>/`). `wc` (work-card), `ov`
  (output-video), `og` (share cards) are the documented abbreviations — reuse
  them, don't invent more.
- **Contract-named assets are exempt and must not be "normalized".** They're
  fixed strings a typo turns into a silent 404: `card.webm` / `card-light.webm` /
  `poster.webp` (work cards), `hero_1080.webm` (the underscore is intentional;
  its poster is NOT here — it lives in `src/assets/hero/<slug>/` so the image
  pipeline can make it responsive), and vendor
  `@font-face` filenames (`ClashDisplay-Variable.woff2`, `JetBrainsMono-Variable.woff2`).
  Because they're fixed and unhashed, `public/_headers` caches them `immutable`
  for a year: **replacing one's bytes in place won't reach returning visitors.**
  Adding a new slug or face is always safe; changing an existing one means
  renaming it or dropping `immutable` first.
- **Windows:** the filesystem is case-insensitive. A Title-Case→lowercase rename
  is a case-only rename — go via a temp name (`mv Foo Foo__tmp && mv Foo__tmp foo`),
  and never create a lowercase twin of an existing dir before removing the
  original (a later `rm -rf` deletes both).

## 8. Content model

One case-study design for every entry. Spine: Scoreboard → Problem → System →
Decisions → Output → Proof → Reflection. Optional modules render only when data
exists. `src/content.config.ts` is the guardrail — every entry needs at least one
proof figure or the build fails.

**Engagement (`type`) is a typed, filterable facet, never a separate section.**
Three values (`src/lib/work-type.ts`): `in-house` (a role held inside the org),
`agency` (a role at an agency whose clients were other companies), `concept`
(self-initiated).

**Do not label these "client".** None were client engagements: every non-concept
entry is a position held, and at RAA / Agency FiveEighty the clients belonged to
the agency. Employment type (Internship, Volunteer) is disclosed in the
scoreboard `role` field, never the badge — the badge carries engagement +
discipline. Proof is one uniform shape for every type: a verified metric where one
was measured, scope + rationale where none exists. A design-only concept has only
scope; a shipped concept (Portfolio System) carries measured results like any
entry. Never invent one to fill the box.

**Concept microsites** are embedded proof inside their case study, not a parallel
front door. Each is its own world with its own brand, CSS, and fonts, served as
static passthrough HTML from `public/concepts/<slug>/`.

**Media is convention-located by slug — never a path in content.** Templates
derive every path from the slug, so adding an entry means adding its
`public/wc/<slug>/` set (all four files: dark + light clip and poster). The one
opt-in flag left is `heroVideo: true`, which is genuinely per-entry; when set,
`coverAlt` and `coverCaption` become required, enforced by a refine in the
schema. **Video is webm only** — the H.264 fallback was dropped, don't add one
back. Recipes and caps live in `docs/`:

| System | Doc |
| --- | --- |
| Case-study hero video (click-to-play, has audio) | `docs/hero-pipeline.md` |
| Work-card hover animation (muted, loops) | `docs/work-card-video.md` |
| Output gallery blocks + export caps | `docs/output-assets.md` |
| Share cards | `docs/og-cards.md` |
| UTM + GA4 | `docs/utm-tagging.md` |
| Deploy + rollback | `docs/deploy.md` |

## 9. Decision log

Dated so they don't get silently re-litigated. Rationale in the commit.

- **2026-07-24** — **Concept "scope, never results" carve-out retired.** The site
  itself ships as a case study (`portfolio-system`, `type: concept`), and a
  shipped concept has real, measured results. So concepts now follow the **same**
  case-study rules as real work: a concept may carry measured results and the
  orange accent; the honesty rule still gates every figure (measured or sourced,
  or it stays off the page). Design-only concepts (The Ninth, Level, WISP) still
  read as scope only — because that is all they have, not because a rule forbids
  results — and are **not** rewritten. Disclosure stays required for every
  concept (the schema refine is untouched); the live-demo launcher stays the one
  concept-only feature. The proof surfaces (`ProofBox`, hero `Scoreboard`) were
  never type-gated — accent is decided by `figureRuns` on the *figure*, not the
  entry — so measured concept results already earn orange there. **Full accent
  parity** was chosen for the engagement markers too: the rail Type line
  (`work/[slug].astro`, `accent: !isConcept` → `accent: true`), the corner
  `.badge.concept` (`global.css`, folded into the accent rule; `--badge-concept-*`
  in `tokens.css` now unused), and the `/work` index `.ty.concept` badge
  (`WorkIndex.astro`) all accent like real work now. Consequence: the three
  existing concepts' badges + Type lines turn orange (intended). Docs squared:
  §3 (both the concept + accent bullets), §8, and the comments in
  `src/lib/work-type.ts` + `src/content.config.ts`.

- **2026-07-24 (c)** — **Output width ladders are DEVICE pixels, and sources are
  captured at 2x.** The §Output galleries rendered soft because
  `OutputGrid.astro` sized its ladders to the CSS slot and gave every block under
  four columns the same `[320, 420, 560]`: a 2-up cell is ~516 CSS px at a 1440
  viewport, so a 2x display wanted ~1030 real px and the widest candidate on
  offer was 560. Ladders are now keyed to `cols` and top out near 2x their widest
  slot (`ladderFor`); `longpage` keeps a shorter one of its own (`W_LONG`)
  because its sources run 9000+px tall, so width multiplies against height rather
  than a cropped box. `sizes` also lied — it claimed `100/cols vw` while the
  fixed 264px rail plus `.pad` inset the stage, so it now resolves the real cell
  with `calc()` per breakpoint. **Astro never upscales**, which is why this was
  invisible: a too-short ladder just emits fewer candidates, silently. The six
  `d-*` portfolio-system shots were 1x captures and were re-shot at 2880x1620.
  **Screen captures must be shot at `deviceScaleFactor: 2`, never scaled up
  after.** `scripts/shots/capture.mjs` (`npm run shots`) is now the record of
  those captures — it was previously prose in `scripts/perf/README.md`, which had
  drifted (the mobile viewport is 390x694, exactly 9:16, not 390x844, and the
  third mobile shot is the journal index, not a post). `puppeteer-core` moved
  from a transitive dep to a declared one.

- **2026-07-24 (b)** — **The site ships as its own case study** (`portfolio-system`).
  Three one-offs bespoke to this single entry, so don't generalize or delete them
  wondering what they are:
  - **`perfTable: true`** (schema flag) renders `PerfTable.astro` inside §Proof,
    driven by **`src/data/portfolio-perf.json`** — a real, dated Lighthouse
    snapshot (per-page + mobile/desktop averages), not authored numbers.
    Regenerate it with **`scripts/perf/`** (`run.sh` measures the live site,
    `emit.mjs` writes the JSON; see its README). Off for every other entry.
  - **Hero-stat `accent` flag** (`Scoreboard.astro` + the `hero[]` schema) paints a
    unitless measured result (e.g. "100") the signal colour, since `figureRuns`
    only accents units/special chars on its own.
  - **Output is a device × theme matrix** (desktop + mobile, dark + light shots),
    not the tall-scroll `longpage` — captured above-the-fold so the fixed nav
    never scrolls out of frame. The snapshot is dated: after a deploy adds a page,
    re-run `scripts/perf/` (its `urls.txt` lists what's measured).

- **2026-07-23** — **Mobile weight pass + metric-matched font fallbacks.** `72af992`.
  - **Hover clips are gated on `(hover: hover)`, not on width.** Touch devices
    were downloading every work-card clip they can never play. The old code
    assumed `preload="none"` stopped `load()` from fetching; a Lighthouse trace
    showed the files arriving anyway, so **don't trust that assumption again** —
    if a `<video>` gets a `<source>` and a `load()`, budget for the bytes.
    No-hover devices get a theme-correct poster instead. The `/work` preview
    pane was a second offender, wiring a clip behind `display:none`.
  - **Six `@font-face` blocks now, and the three new ones are not a violation
    of §6.** They are `src: local()` metric-matched fallbacks (Arial, Courier
    New) that hold the real face's space until it swaps in. They download
    nothing, subset nothing, and modify nothing, so the Fontshare FFL is
    untouched. **They are not static cuts — that rule still stands.**
  - **The overrides are measured, and must be re-measured if a face changes.**
    Canvas `measureText` against the shipped woff2 at 1000px over a Latin
    sample. Clash Display 700 sets **7.08% wider** than Arial Bold; JetBrains
    Mono shares Courier New's 0.6 advance and needs vertical overrides only.
    A stale `size-adjust` is worse than none: it reflows *toward* the wrong box.
  - **CLS was 0 by accident, not by design.** The page was slow enough that
    fonts always beat first paint, so the swap never reflowed anything. Cutting
    ~100ms off FCP flipped that race and CLS went to 0.185 — the h1 re-wrapped
    and shoved the hero figure down. **Any future speedup can re-expose this**
    (subsetting JetBrains Mono is the next candidate). Check CLS on every perf
    change, not just the metric being optimized.
  - **`.rev-load` is .28s, and its duration is a Speed Index cost.** SI
    integrates visual incompleteness over time and that animation moves the
    whole hero, so the number lands on the metric. `.rev` stays at .5s: below
    the fold, off the SI clock.

- **2026-07-22** — **System audit sweep.** Six commits, `a90ced8`..`0c2a822`.
  - **`cover` removed entirely.** Empty on all 14 entries and typed
    `z.string().url()` — an absolute-URL-only field that only made sense under
    the old CDN. Took the placeholder subsystem with it (`still.ph`, `data-ph`,
    the `.ph-*` rules and the 12 placeholder PNGs), since every fallback branch
    was unreachable: all 93 output stills carry an `img`, which is now
    **required** so a missing asset fails the build. Don't reintroduce either.
  - **mp4 dropped, webm only.** 41 files, 123.3 MB — half the repo — behind a
    fallback Safari hasn't needed since 14.1.
  - **`cardVideo` / `cardVideoLight` removed.** `true` on all 11 entries, so
    they were constants, not flags. Every entry ships a card clip.
  - **Type scale actually adopted.** 170 rules hand-wrote the tier triple
    against 7 uses of the `.t-*` classes built to prevent it. Now one grouped
    rule per tier per style block (§6). Verified visually neutral by computed-
    style diff across 15 pages at three widths.
  - **Tracking overrides deleted.** Eight rules set `letter-spacing` twice; the
    tokens now win. Card titles, the case-study H1 and the pull-quotes render
    slightly looser than before — deliberate.
  - **Spacing scale adopted.** All 388 padding/margin/gap values resolve to
    `--space-*`; off-scale values snapped to the nearest step, ties rounding up.
    Pages are 0-1.7% taller. The scale had **zero** uses before this.
  - **Four live defects fixed.** The 404 was built but unreachable
    (`not_found_handling` defaulted to `none`); 36 legacy `/blog` redirects were
    inert because WordPress served those URLs with a trailing slash and only the
    slashless form had a rule; every RSS item link cost a 301
    (`@astrojs/rss` needs `trailingSlash: false`); `theme-color` followed the OS
    rather than the resolved theme. `favicon.svg` was 116 KB of base64 PNG
    wrapped in `<svg>` — rebuilt as real vector, 1.4 KB.

- **2026-07-15** — **Type scale adopted** (the eight tiers in §6) and swept across
  every rule. Before this there was no system: h1/h2 were Clash Display, h3 was
  Grotesk, and mono labels carried seven different trackings — around a scale that
  sat in `tokens.css` unused.
- **2026-07-15** — **Wordmark = `h1` tier** (Clash Display 600 / -1%), horizontal,
  sentence case, and `h1`'s only consumer. It stays in the brand voice: it is
  Pratik's name, not a system label. It was Display 700 / -2.5%, stacked, lh 1.05 —
  a *hero treatment at 19px*, and that is what read as cramped. **Display weight
  and display tracking are optical compensations for large type; never put them on
  UI-scale text.** The fix was weight + tracking, not the family. (Two wrong turns
  on the way: the mono `data` tier, which made the site's own name a system label;
  then `h2` at 500, which left it under-weighted for a lockup.)
- **2026-07-15** — **Fonts are VARIABLE, one file per family, shipped whole.**
  Static cuts made a missing weight fail *silently* (Grotesk 500 → 400; Mono 700 →
  faux bold), which is what blocked the scale. Payload 134.9 → 164.2 KB across
  3 files instead of 7; every byte is preloaded. Deliberate: ship the full system,
  measure, and only optimize if PageSpeed complains. First lever if it does is
  subsetting JetBrains Mono (89.3 → 37.3 KB, axis survives) — `scripts/fonts/`
  `subset.mjs` is in git history. Clash can never be subset (FFL).
- **2026-07-15** — Clash ships **unsubset**: Fontshare's FFL grants no
  modification right. Costs +13 KB on the critical path; measured, accepted. The
  FFL's broader "public server" / "font serving" clauses are known and accepted;
  closed, not pending.
- **2026-07-15** — **JetBrains Mono replaces Berkeley Mono (TX-02)**: no web
  licence was held and the repo is public. Metrics match (1000 upem / 600
  advance), so the swap was layout-neutral.
- **2026-07-15** — Work facet **`client` → `in-house` / `agency` / `concept`**.
  "Client" was false for all eight non-concept entries.
- **2026-07-15** — **Legacy `output.tiles` removed.** `blocks` is the only output
  model. A new asset family is a new block kind; don't reintroduce tiles.
- **2026-07-15** — Docs reconciled post-cutover. `docs/deploy.md` had claimed
  `npm run deploy` was safe because it targeted a staging URL. It is not.
- **2026-07-14** — Masters split into hub + Job Search Targeting + AI Behavior.
  Live site adopted as the case-study copy source; Resume Master confirmed as
  metrics master; exact-value metric variants retired; "Creative and Marketing
  Strategist" retired from public surfaces.
- **Earlier** — Domain cutover to this repo. R2 / `cdn.mehtapratik.com` dropped;
  all assets same-origin.

## 10. This file's own rules

**No state.** No inventories, no migration status, no "all X are done", no counts
that a command can answer. Every one of those rots and then lies. Open work goes
as a `# [NEEDS: …]` comment in the file that needs the fix, where the person
editing it will see it — not in a list here.

**No second homes.** If the code enforces it, point at the code. If a master owns
it, point at the master.

**Anything verifiable gets verified, not asserted.** Counts belong in output, not
prose. Two that were wrong here: "~90 assets" was off by 60, and §6 asserted a
bundle size and page count in the sentence *before* telling you never to assert
one. If you catch yourself writing a number, run the command instead.
