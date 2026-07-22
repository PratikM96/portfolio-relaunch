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
- **Self-initiated concepts** (The Ninth, Level, WISP) are never professional
  work. They carry **scope, never results**. When Cloud9 is named, The Ninth
  carries its disclosure verbatim.
- **Orange is reserved for real results** — this is a proof rule wearing a colour.
  One signal per surface, one job. Concept scope and neutral data never get it.
  (`/brand` owns the rest of the accent rules; it does not state this one.)
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
`motion.ts` and `card-video.ts` (all video behavior). Don't re-implement
video/reveal per page. The only hand-written inline script is the pre-paint
no-flash theme set in `Base.astro` (the JSON-LD block is data, not behavior).

Where those bundles *land* is Vite's call, not a decision: anything under its
4096-byte `assetsInlineLimit` gets inlined into every page; anything over is
emitted as a hashed, cached `/_astro/` file. Today `consent + site-chrome` is
~3.6 KB and inlines into all 23 pages; `motion` and `card-video` hoist. That
means it flips silently when a bundle crosses 4 KB. **Don't assert which side a
script is on — run `npm run build` and look.**

**Shared primitives live in `global.css`,** promoted out of per-page styles so
they can't drift: `.card` / `.card--interactive`, `.badge` / `.badge-lg`,
`.prose`, `.tag`. Add the class; don't re-write the surface.

**Reveal — pick by position.** `.rev` = below-the-fold scroll reveal (opacity +
slide, IntersectionObserver). `.rev-load` = above-the-fold, **transform only, no
opacity**. Use `.rev-load` for any hero holding the LCP element: Chromium
excludes `opacity:0` elements from LCP, so a faded hero hands LCP to a
late-painting element and inflates it. Both respect reduced-motion.

**Type: eight tiers, and nothing outside them.** Defined as `--t-*` tokens in
`tokens.css`, applied as `.t-*` classes in `global.css`. A rule sets **size only**
and composes a tier; family, weight and tracking are the system.

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

If you're hand-writing family + weight + tracking, you've left the system. That's
how this drifted into seven different label trackings (+2/4/5/6/7/8/10%) around a
scale that existed in `tokens.css` with **zero uses**.

Kicker: `label` tier, 11px, accent-text, 22px below. Section label: `[ 0N ]`
(accent mono) + uppercase mono title (muted) + flex rule line.

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
  `poster.webp`, `hero_1080.webm` (the underscore is intentional), and vendor
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
discipline. Real-work proof = verified metric; concept proof = scope + rationale.

**Concept microsites** are embedded proof inside their case study, not a parallel
front door. Each is its own world with its own brand, CSS, and fonts, served as
static passthrough HTML from `public/concepts/<slug>/`.

**Media is opt-in and convention-located by slug — never a path in content.**
`heroVideo: true`, `cardVideo: true`, `cardVideoLight: true`. Templates derive
paths from the slug. Recipes and caps live in `docs/`:

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
in the file that needs the fix, where the person editing it will see it — the way
`cover: "" # [NEEDS: cover image url]` already does.

**No second homes.** If the code enforces it, point at the code. If a master owns
it, point at the master.

**Anything verifiable gets verified, not asserted.** "~90 assets" was wrong by
60. Counts belong in output, not prose.
