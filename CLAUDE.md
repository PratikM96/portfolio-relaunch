# CLAUDE.md — mehtapratik.com (One System portfolio)

This file is the operating contract for building this site. Read it before any work.

## What this is
Pratik Mehta's personal portfolio, rebuilt from scratch in **Astro**, launching the **One System** brand for the first time. This is a full replacement of the old live site (different stack, different brand), not an edit of it.

## Stack & infra
- **Framework:** Astro (TypeScript)
- **Deploy:** Cloudflare Workers (page serving) via `@astrojs/cloudflare`
- **Assets:** ALL assets live in this repo and are served same-origin by the Worker (which edge-caches globally). No external CDN / R2. Images go in `src/assets/` (run through Astro's pipeline: responsive widths, hashing, CLS-safe dims); files that can't be processed — video, fonts, favicons — go in `public/` (`/hero`, `/fonts`, etc.) and are served verbatim at the site root. Keep only web-optimized deliverables in the repo (webp / webm / ffmpeg mp4 / woff2); raw masters stay in `_reference/` (gitignored), never committed. Cloudflare's per-file cap on Worker static assets is 25 MiB — design large case-study video around it. (Historical: assets were briefly planned on R2 at `cdn.mehtapratik.com`; that was dropped — the asset volume never justified a separate bucket. Any lingering `cdn.mehtapratik.com` URL in code is stale and should become a local path.)
- **Repo:** this is the NEW repo. The OLD site (hand-edited HTML/CSS/JS, teal/coral brand) still serves production from a separate repo + Worker.

## Deploy safety (do not violate)
- Build and deploy to the **staging** Worker / `*.workers.dev` URL only.
- `mehtapratik.com` is served by the OLD deployment. **Do not touch the live domain, the old repo, or the old Worker.**
- The domain cutover from old to new is a **manual human step** Pratik takes in the Cloudflare dashboard when the new site is proven. It is never part of a build task.

## Non-negotiable content rules
- **Never invent** metrics, clients, roles, revenue, awards, responsibilities, outcomes, or claims. If a fact is missing or uncertain, say so and leave a clear TODO. Do not fill gaps with plausible-sounding numbers.
- **Self-initiated concepts** (The Ninth, Level, WISP) are NOT client work. Label them as concepts everywhere. They carry **scope, never performance results**.
- **Apr 2024 to present** = practice framing "Independent Creative Systems Practice" / "AI-assisted creative systems practice" (not a company, agency, traditional full-time role, or AI consultancy). The **resume + case-study role title for this period is "Creative Technologist" at org "Self-directed"** (locked; the site is source of truth, masters sync to match). The overall identity stays "Creative & Marketing Strategist" / "Creative Marketing Lead".
- Source-of-truth docs govern everything: **System Master** (positioning, voice, proof logic), **Resume Master** (titles, dates, metrics), **One-System-Brand-Guidelines (brand kit)** (tokens), **IA-Master** (structure). Consult before proposing.

## Voice (external-facing copy)
Direct, specific, natural, not over-polished, not obviously AI-written. Lead with the answer. **No em or en dashes in external-facing copy, except date ranges.** No inflated claims, no buzzwords, no unsupported proof.

## One System design tokens (single source of truth → `src/styles/tokens.css`)
Neutral ramp (warm): `--n-0:#FBFAF6 --n-50:#F4F2EB --n-100:#EAE7DE --n-200:#DBD8CD --n-300:#C6C2B5 --n-400:#A6A294 --n-500:#847F72 --n-550:#6E6A5D --n-600:#615D52 --n-700:#46433B --n-800:#2B2924 --n-900:#171713 --n-950:#0B0B0A`
Signal orange: `--o-300:#FF8F66 --o-400:#FF7038 --o-500:#FF5A1F (signal) --o-600:#E8480F --o-700:#C13A0A`
- **Orange is used once per surface, one job, and is RESERVED for real results.** Concept scope and neutral data never use it.
- `accent-text` = o-400 on dark, o-700 on light.

Token naming (reconciled — brand kit is the source of truth): the build's `src/styles/tokens.css` mirrors the brand `Design-Tokens/one-system-tokens.css`. Code uses the brand names, not the old mockup names: `--accent-50…900` (not `--o-*`), `--font-display` / `--font-sans` / `--font-mono`, `--radius-none/sm/md/lg/xl/full`, `--ease-standard` / `--ease-exit` / `--ease-in-out`, `--surface-raised`, `--text-secondary`, plus the full type scale (`--h1…`, `--body…`, etc.), spacing (`--space-2xs…5xl`), and grid tokens. The signal fill is `--accent-fill` (= `--accent-500`); orange text is `--accent-text` (= accent-400 dark / accent-700 light). Site-only additions layered on top: `--rail`, `--badge-concept-bg` / `--badge-concept-tx`, `--img-frame`, and the light/dark `[data-theme]` switch. The `--n-*` ramp names are unchanged.

Type:
- Headlines: **Clash Display** 600/700 (self-hosted)
- Body: **Clash Grotesk** 400/600/700 (self-hosted; weights locked to 400/600/700 per brand README)
- System layer (labels, coordinates, data, console rail): **Berkeley Mono (TX-02)** 400/500, self-hosted.

All fonts are self-hosted, same-origin, **woff2 only** — no third-party font CDN (no Fontshare, no Google Fonts). The cut list mirrors actual usage (7 files): Berkeley Mono 400/500, Clash Display 600/700, Clash Grotesk 400/600/700. Files live in `public/fonts/` (flat); otf/woff masters stay in `_reference/Fonts/` (gitignored).

Font wiring:
```css
--font-mono: 'Berkeley Mono','JetBrains Mono',ui-monospace,monospace; /* Berkeley FIRST; JetBrains is a local-install fallback only, not network-loaded */
@font-face{font-family:'Berkeley Mono';font-weight:400;font-display:swap;src:url('/fonts/TX-02-Regular.woff2') format('woff2')}
@font-face{font-family:'Berkeley Mono';font-weight:500;font-display:swap;src:url('/fonts/TX-02-Medium.woff2') format('woff2')}
/* + Clash Display 600/700 and Clash Grotesk 400/600/700, same pattern */
```
(Confirm the embedded TX-02 license tier permits public web embedding before launch.)

CSS / `<head>` split (confirmed): `src/styles/tokens.css` owns the design tokens (ramp, signal orange, font/radius/motion vars, theme maps) and **all** `@font-face` blocks. `Base.astro` `<head>` carries only `<link rel="preload">` for the three above-the-fold faces (Display 700, Grotesk 400, Mono 400; `crossorigin`) — there are no font stylesheet/preconnect tags anymore. `src/styles/global.css` holds the reset, shared primitives, and site chrome (console rail, mobile bar, footer).

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

## Hero video system (case-study cover wall)
Each case study can carry one click-to-play hero video in the scoreboard wall. It is **convention-located by slug** so adding one is mechanical, never a path edit. Full encode recipe and per-study checklist live in **`docs/hero-pipeline.md`**.
- **Served files (committed):** `public/hero/<slug>/hero_1080.webm` + `hero_1080.mp4` + `poster.webp`. Home page is the same shape at `public/hero/home/`.
- **Masters (NOT in repo):** the 4K ProRes masters live on Google Drive at `Career-System/01-Brand/Animations/`. Web deliverables are transcoded from a local copy of the master with FFmpeg. The repo never holds a master; `_reference/hero-video/<slug>/` (gitignored) is only optional local staging for the compressed mp4/webm/poster.
- **Opt-in:** set `heroVideo: true` in the entry frontmatter. The `[slug].astro` template derives the three paths from the slug; no paths in content. Omitted/false → cover image or placeholder, unchanged.
- **Behavior:** poster + centered play button, **no autoplay** (case-study heroes have audio); first click hands off to native controls. Files must stay under Cloudflare's 25 MiB per-file cap (1080p, CRF-tuned).
- Filenames are a contract: exactly `hero_1080.webm`, `hero_1080.mp4`, `poster.webp` inside the slug folder. A typo = silent 404, so don't improvise names.

## Work-card hover video system (index + featured covers)
Client case studies carry a short, muted, looping logo animation that plays on hover in the work index, standing in for the still-unshot static cover. **Convention-located by slug**; full encode recipe + slug map live in **`docs/work-card-video.md`**. This is distinct from the hero system: card clips are small, silent, and autoplay on hover; hero clips are large, click-to-play, and carry audio.
- **Served files (committed):** `public/wc/<slug>/card.webm` + `card.mp4` + `poster.webp`, plus `card-light.webm` / `card-light.mp4` / `poster-light.webp` light-theme siblings. 720p, ~50-250 KB per clip (webm smaller, mp4 fallback larger); render sizes are small, so 720p is already oversampled.
- **Masters (NOT in repo):** ProRes exports staged in gitignored `_reference/wc-animations/` (dark) and `_reference/wc-animations/light/` (light); the After Effects project is `animation-master/`. Web deliverables are transcoded with FFmpeg; the repo never holds a master.
- **Opt-in:** `cardVideo: true` opts an entry in; `cardVideoLight: true` enables its light variant. Templates derive paths from the slug; no paths in content. Three surfaces read the flag: the shared index preview pane (`WorkIndex.astro`), the `/work` featured pair, and the hardcoded home bento tile (light opt-in there is `data-light="true"` on the `.tile-video`, not frontmatter).
- **Behavior:** poster (the resolved-logo last frame) at rest; `preload="none"` so only the ~10 KB active-theme poster loads until a clip plays. The `/work` featured pair and home bento tile are hover-to-play (mouseenter plays muted, mouseleave reloads to poster); the shared index preview pane plays whichever row is active, so its first row autoplays on load. Theme selection + live reswap via `src/scripts/card-video.ts` keyed on `[data-theme]`. Reduced-motion → poster only.
- Filenames are a contract: exactly `card.webm`, `card.mp4`, `poster.webp` (+ `-light` siblings). A typo = silent 404, so don't improvise names.

## Verified facts (locked — never alter)
- B.S. Computer Science, NYU. Email mehtadpratik@gmail.com. New York. "Open to creative or marketing leadership roles."
- Client work also: DealNews, Richard Attias & Associates, Pipeline Medical, Agency FiveEighty, The Forest Road Company, SR Love & Care (self-initiated nonprofit, built team 5→15+, handed off).
- Headshot is in the repo (`src/assets/headshot-4x5.jpg`, a 1400px web-master; raw masters stay in gitignored `_reference/images/`), imported via Astro `<Image>` (downscaled webp) into the About portrait + home about module. Covers are still placeholders; when added they go in `src/assets/` (imported, never a CDN URL), named `{slug}-cover.webp`. Build-time image optimization requires the Cloudflare adapter's `imageService: 'compile'` (set in astro.config) so Sharp runs at build for the static pages.

## Current TODOs / placeholders (do not treat as final)
- Output-section interior screens are placeholder tiles.
- Concept microsites for live demos need to be added.
- The three concept entries (level, the-ninth, wisp) have no work-card hover animation; they fall back to placeholder tiles. Static cover images (`{slug}-cover.webp`) are still unshot for every entry.
