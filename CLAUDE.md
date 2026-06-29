# CLAUDE.md — mehtapratik.com (One System portfolio)

This file is the operating contract for building this site. Read it before any work.

## What this is
Pratik Mehta's personal portfolio, rebuilt from scratch in **Astro**, launching the **One System** brand for the first time. This is a full replacement of the old live site (different stack, different brand), not an edit of it.

## Stack & infra
- **Framework:** Astro (TypeScript)
- **Deploy:** Cloudflare Workers (page serving) via `@astrojs/cloudflare`
- **Assets:** Cloudflare R2 is **media + font only**, served from `cdn.mehtapratik.com`. Page source lives in this repo. Never blur this line.
- **Repo:** this is the NEW repo. The OLD site (hand-edited HTML/CSS/JS, teal/coral brand) still serves production from a separate repo + Worker.

## Deploy safety (do not violate)
- Build and deploy to the **staging** Worker / `*.workers.dev` URL only.
- `mehtapratik.com` is served by the OLD deployment. **Do not touch the live domain, the old repo, or the old Worker.**
- The domain cutover from old to new is a **manual human step** Pratik takes in the Cloudflare dashboard when the new site is proven. It is never part of a build task.

## Non-negotiable content rules
- **Never invent** metrics, clients, roles, revenue, awards, responsibilities, outcomes, or claims. If a fact is missing or uncertain, say so and leave a clear TODO. Do not fill gaps with plausible-sounding numbers.
- **Self-initiated concepts** (The Ninth, Level, WISP) are NOT client work. Label them as concepts everywhere. They carry **scope, never performance results**.
- **Apr 2024 to present** = "Independent Creative Systems Practice" / "AI-assisted creative systems practice". Not a company, agency, traditional full-time role, or AI consultancy.
- Source-of-truth docs govern everything: **System Master** (positioning, voice, proof logic), **Resume Master** (titles, dates, metrics), **Brand Visual Reference** (tokens), **IA-Master-mehtapratik.md** (structure). Consult before proposing.

## Voice (external-facing copy)
Direct, specific, natural, not over-polished, not obviously AI-written. Lead with the answer. **No em dashes or en dashes.** No inflated claims, no buzzwords, no unsupported proof.

## One System design tokens (single source of truth → `src/styles/tokens.css`)
Neutral ramp (warm): `--n-0:#FBFAF6 --n-50:#F4F2EB --n-100:#EAE7DE --n-200:#DBD8CD --n-300:#C6C2B5 --n-400:#A6A294 --n-500:#847F72 --n-550:#6E6A5D --n-600:#615D52 --n-700:#46433B --n-800:#2B2924 --n-900:#171713 --n-950:#0B0B0A`
Signal orange: `--o-300:#FF8F66 --o-400:#FF7038 --o-500:#FF5A1F (signal) --o-600:#E8480F --o-700:#C13A0A`
- **Orange is used once per surface, one job, and is RESERVED for real results.** Concept scope and neutral data never use it.
- `accent-text` = o-400 on dark, o-700 on light.

Token naming (reconciled — brand kit is the source of truth): the build's `src/styles/tokens.css` mirrors the brand `Design-Tokens/one-system-tokens.css`. Code uses the brand names, not the old mockup names: `--accent-50…900` (not `--o-*`), `--font-display` / `--font-sans` / `--font-mono`, `--radius-none/sm/md/lg/xl/full`, `--ease-standard` / `--ease-exit` / `--ease-in-out`, `--surface-raised`, `--text-secondary`, plus the full type scale (`--h1…`, `--body…`, etc.), spacing (`--space-2xs…5xl`), and grid tokens. The signal fill is `--accent-fill` (= `--accent-500`); orange text is `--accent-text` (= accent-400 dark / accent-700 light). Site-only additions layered on top: `--rail`, `--badge-concept-bg` / `--badge-concept-tx`, `--img-frame`, and the light/dark `[data-theme]` switch. The `--n-*` ramp names are unchanged.

Type:
- Headlines: **Clash Display** 700 (Fontshare)
- Body: **Clash Grotesk** 400/600/700 (Fontshare; weights locked to 400/600/700 per brand README)
- System layer (labels, coordinates, data, console rail): **Berkeley Mono (TX-02)**, self-hosted from R2.

Font wiring (already proven in the mockups):
```css
--font-mono: 'Berkeley Mono','JetBrains Mono',ui-monospace,monospace; /* Berkeley FIRST */
@font-face{font-family:'Berkeley Mono';font-weight:400;font-display:swap;src:url('https://cdn.mehtapratik.com/Fonts/TX-02/WOFF2/TX-02-Regular.woff2') format('woff2')}
@font-face{font-family:'Berkeley Mono';font-weight:500;font-display:swap;src:url('https://cdn.mehtapratik.com/Fonts/TX-02/WOFF2/TX-02-Medium.woff2') format('woff2')}
```
JetBrains Mono stays only as a network-failure fallback. (Confirm the embedded TX-02 license tier permits public web embedding before launch.)

CSS / `<head>` split (confirmed): `src/styles/tokens.css` owns the design tokens (ramp, signal orange, font/radius/motion vars, theme maps) and the Berkeley Mono `@font-face` blocks. The font **`<link rel="preconnect">` + Fontshare/Google `<link rel="stylesheet">` tags live in `Base.astro` `<head>`**, not in tokens.css, because those are HTML head elements and cannot exist in a CSS file. Clash (Display 600/700, Grotesk 400/600/700) loads from Fontshare; JetBrains Mono loads from Google Fonts as the mono fallback. `src/styles/global.css` holds the reset, shared primitives, and site chrome (console rail, mobile bar, footer). Future option (not yet done, needs WOFF2 uploaded to R2): self-host Clash on R2 like Berkeley Mono to drop the third-party preconnects + Fontshare dependency.

Radius: **sharp 0** on mono/data layer; 8–12 on content; pill on actions. This split is a deliberate brand tell.
Spacing (locked): page-head padding 104/64, section 96, horizontal margin 64px (28 tablet, 20 mobile), console rail 264px.
Theme: dark + light both first-class. No-flash inline script in `<head>`, `localStorage` persistence (try/catch), follows OS until manual override, respects reduced-motion.

Canonical heading system (match across all pages):
- Page h1: `clamp(38px,5vw,68px)`, line-height .96, letter-spacing -.03em, Clash Display 700
- Kicker: mono 11px, .1em, uppercase, accent-text, 22px below
- Section label: `[ 0N ]` (accent mono) + uppercase mono title (muted) + flex rule line

## Content model
- **Case studies:** one design for client and concept. Spine: Scoreboard → Problem → System → Decisions → Output → Proof → Reflection. Optional modules render only when data exists.
- **Client vs concept** is a typed, filterable facet, never separate sections.
- Client proof = verified metric. Concept proof = scope + rationale, no results claimed.
- **Concept microsites** (`/concepts/[project]/[view]`) are embedded proof inside case studies, not a parallel front door. Each has its own brand/CSS.
- Journal: notes on systems, brand, AI.

## Verified facts (locked — never alter)
- B.S. Computer Science, NYU. Email mehtadpratik@gmail.com. New York. "Open to creative or marketing leadership roles."
- SPORTIME Clubs (client, 2023–24): 11.7M cross-platform impressions/yr, 16.8K net new followers/yr, IG publishing +510%, Reels +2,115%. Testimonial verified. A content lead in each club to one central strategy.
- The Ninth = self-initiated esports membership concept, 5 surfaces (app, clipper, broadcast, social, brand).
- Client work also: DealNews, Richard Attias & Associates, Pipeline Medical, Agency FiveEighty, The Forest Road Company, SR Love & Care (self-initiated nonprofit, built team 5→15+, handed off).
- Covers: `https://cdn.mehtapratik.com/covers/{slug}-cover.webp`. Headshot: `https://cdn.mehtapratik.com/about/about-headshot-01.webp`.

## Current TODOs / placeholders (do not treat as final)
- ALL body copy is placeholder until Phase 4.
- Resume titles, dates, and the 2016–2023 grouping are placeholders → replace from Resume Master.
- Resume PDF download and LinkedIn URLs are placeholders.
- Output-section interior screens are placeholder tiles.
- **Brand guidelines docs (Drive) need a weight-policy fix:** the "weights 400/600/700 only" rule applies to the Clash families (Display, Grotesk). Berkeley Mono (TX-02) ships Regular 400 + Medium 500, and the UI intentionally uses **Berkeley Mono Medium (500)** for emphasis labels (e.g. the primary button). Update `one-system-brand-guidelines.html` + the README to state mono = 400/500, so the docs match the build.
