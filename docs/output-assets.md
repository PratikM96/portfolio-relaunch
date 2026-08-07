# Output gallery pipeline

The case-study **Output** section is an ordered list of typed **blocks**, one asset family per block. Rendered by `OutputGrid.astro` from `output.blocks`.

The site's other two video systems are separate: **hero** (`docs/hero-pipeline.md`) and **work-card** (`docs/work-card-video.md`).

## Authoring model (`output.blocks`)

Blocks render top to bottom in the order listed. `blocks` is the only output model, so a new asset family is a new block kind.

A **composite** of the common kinds, not a real entry — for a working reference read `src/content/work/dealnews.md` (stills) or `sportime-clubs.md` (video):

```yaml
output:
  blocks:
    - kind: mockup            # flagship leads the section
      flagship: true
      items:
        - img: ../../assets/work/dealnews/flagship.webp        # light / base
          imgDark: ../../assets/work/dealnews/flagship-dark.webp
          alt: "DealNews in-house design across social, email, paid, and web"
          caption: "In-house design system · social, paid, email, web"
    - kind: longpage          # websites, 2-up, browser chrome
      cols: 2
      height: 620
      chrome: browser          # block default (per-item override allowed)
      items:
        - { img: ../../assets/work/dealnews/website-marketplace.webp, caption: "Marketplace site" }
        - { img: ../../assets/work/dealnews/website-2.webp, caption: "Landing page" }
    - kind: longpage          # infographics, 3-up, plain frames
      cols: 3
      height: 560
      items:                   # chrome omitted -> default 'plain'
        - { img: ../../assets/work/dealnews/infographic-buying.webp, caption: "Buying behaviors" }
        - { img: ../../assets/work/dealnews/infographic-2.webp, caption: "Editorial infographic" }
        - { img: ../../assets/work/dealnews/infographic-3.webp, caption: "Editorial infographic" }
    - kind: social            # square posts, shown whole
      label: "Social"
      cols: 4
      items:
        - { img: ../../assets/work/dealnews/social-1.webp, alt: "DealNews social post" }
        # …
    - kind: video             # muted loop, plays when scrolled into view
      audio: false
      items:
        - { clip: <clip>, alt: "Motion study", caption: "Website motion" }
  note: "Optional mono footnote under the gallery."
```

## Block kinds

| kind | layout | source ratio | notes |
|------|--------|--------------|-------|
| `mockup` | full-width 16:9, or `cols: '2'` | 16:9 | `flagship: true` for the lead. Theme-aware: `img` (light) + `imgDark`. |
| `social` | `cols` 2–4 grid, whole | 1:1 | optional `label`. |
| `flyer` | `cols` 2–4 grid, portrait | `ratio: '3:4'` or `'9:16'` | flyers / stories. optional `label`. |
| `gallery` | `cols` 2–4 grid, cropped | `ratio: '3:2'/'4:3'/'16:9'/'1:1'/'2:1'` | landscape photos, single-screen web shots, banners. optional `label`. |
| `longpage` | capped internal-scroll frames, **N-up** (`cols` 1–3) | tall | one family per block (websites `cols:2`, infographics `cols:3`). `chrome: 'browser'`/`'plain'` is a block default with per-item override; `height` px (≈560–640) applies to every frame. Collapses to 1-up under 900px. |
| `video` | full-width 16:9, or `cols: '2'` | 16:9 | `audio:false` muted loop (plays in view) / `audio:true` click-to-play. |

## Asset pipeline

**Stills** live in `src/assets/work/<slug>/`, referenced by relative path from the entry `.md`. They go through Astro's `image()` helper, so `<Image>` emits build-time webp, a responsive `srcset`, and intrinsic dims. Only web-optimized deliverables are committed; masters stay in gitignored `_reference/`.

**A source has to be ~2x its widest CSS slot, not 1x.** The ladders in `OutputGrid.astro` are device pixels, and Astro never upscales — a 1x source silently tops the ladder out and renders soft on retina. The caps below are already 2x-sized; treat them as floors when a block is wider than its default.

Export caps (source webp, before Astro re-optimizes per width):

- **mockup** — 2160p (3840×2160) master → cap **1600w**, webp q82 (~85 KB). Two files: `flagship.webp` (light/base) + `flagship-dark.webp`.
- **social** — cap **1000w**, webp q82 (~40–70 KB).
- **flyer** — cap **1000w**, webp q82. Screen captures instead: shoot the CSS viewport at `deviceScaleFactor: 2` rather than scaling a 1x shot up.
- **gallery** — cap **1600w** at `cols: 2` (the widest cell), **1000w** at 3–4.
- **longpage** — cap **1400w**, webp q82; keep under ~600 KB even when very tall (q78 for the longest). Keeps a shorter ladder than the rest (`W_LONG`) because its height runs to 9000+px.

```bash
# still → capped webp (adjust scale per kind)
ffmpeg -y -i in.png -vf scale=1600:-2 -c:v libwebp -quality 82 out.webp
```

**Video** is convention-located by slug — no paths in content. The clip ships from `public/ov/<case-slug>/<clip>.webm`; its poster is hashed by the image pipeline and lives at `src/assets/ov/<case-slug>/<clip>-poster.webp`. `OutputGrid` derives both from the entry slug + the block item's `clip`. 720p, under Cloudflare's 25 MiB per-file cap; muted loops carry no audio track. A poster left in `public/ov/` is read by nothing and fails the build.

```bash
slug=agency-fiveeighty   # <-- the case-study slug
clip=glitch              # <-- the block item's `clip` value
IN=master.mp4
OUT="public/ov/$slug"        # clip: served verbatim, contract-named
POST="src/assets/ov/$slug"   # poster: hashed by the image pipeline
mkdir -p "$OUT" "$POST"
ffmpeg -y -i "$IN" -vf scale=1280:-2 -an -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 "$OUT/$clip.webm"
ffmpeg -y -ss 0 -i "$IN" -vf scale=1280:-2 -frames:v 1 -c:v libwebp -quality 82 "$POST/$clip-poster.webp"
```

## Performance

The gallery sits below the fold, so it never touches LCP. Stills are lazy; videos are `preload="none"` and their posters deferred. Muted loops play/pause via `IntersectionObserver`. Long pages scroll *inside* a capped frame.

Theme-aware mockups render both variants and toggle in CSS. Tradeoff: both can download. Acceptable at ~85 KB each below the fold — revisit with a JS src-swap only if an entry stacks many themed mockups.

## Filenames are a contract

Video: exactly `<clip>.webm` under `public/ov/<slug>/`, and `<clip>-poster.webp` under `src/assets/ov/<slug>/`. A typo is a silent 404 — don't improvise names.
