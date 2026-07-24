# Output gallery pipeline

The case-study **Output** section (`§04`) is an ordered list of typed **blocks**.
Each block is one asset family rendered by its own rule, so a 1:1 social grid, a
16:9 mockup, and a tall scrolling website never share one cropped uniform grid.
Rendered by `OutputGrid.astro`, driven by `output.blocks` in each work entry.

This is distinct from the two video systems: **hero** (`docs/hero-pipeline.md`,
click-to-play, audio, scoreboard wall) and **work-card** (`docs/work-card-video.md`,
hover loops on the index). Output video is a third, in-gallery use.

## Authoring model (`output.blocks`)

An ordered array — blocks render top to bottom in the order listed. Every still's
`img` is optional: omit it and a ratio-matched placeholder renders until the
asset lands. `blocks` is the only output model: the legacy uniform `tiles` grid
was removed once every entry had migrated, so a new asset family is a new block
kind, not a fallback to a cropped grid.

Below is a **composite** showing the common kinds together — not a real entry. For
a working reference read an actual one (`src/content/work/dealnews.md` for stills,
`sportime-clubs.md` for video), since those are guaranteed to match what ships:

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

**Stills** live in `src/assets/work/<slug>/` and are referenced by relative path
from the entry `.md` (`../../assets/work/<slug>/…`). They go through Astro's
content `image()` helper → `<Image>` renders build-time webp, a responsive
`srcset`, and intrinsic dims (no CLS). Only web-optimized deliverables are
committed; masters stay in gitignored `_reference/`.

**A source has to be ~2x its widest CSS slot, not 1x.** The width ladders in
`OutputGrid.astro` are device pixels: a 2-up cell measures ~516 CSS px at a 1440
viewport, so a 2x display asks for ~1030 real px. Export a source at the CSS
width and it renders soft on every retina screen — Astro never upscales, so the
ladder silently tops out at whatever the source is. The caps below are already
2x-sized; treat them as floors when a block is wider than its default `cols`.

Export caps (source webp, before Astro re-optimizes per width):

- **mockup** — 2160p (3840×2160) master → cap **1600w**, webp q82 (~85 KB).
  Two files: `flagship.webp` (light/base) + `flagship-dark.webp`.
- **social** — cap **1000w**, webp q82 (~40–70 KB).
- **flyer** — cap **1000w**, webp q82. Screen captures instead: shoot the CSS
  viewport at `deviceScaleFactor: 2` rather than scaling a 1x shot up.
- **gallery** — cap **1600w** at `cols: 2` (the widest cell), **1000w** at 3–4.
- **longpage** — cap **1400w**, webp q82. Keep under ~600 KB even when very tall;
  drop quality to q78 for the longest infographics. This kind deliberately keeps
  a shorter ladder than the rest (`W_LONG`): its height runs to 9000+px, so each
  extra width multiplies against that, not against a cropped 16:9 box.

```bash
# still → capped webp (adjust scale per kind)
ffmpeg -y -i in.png -vf scale=1600:-2 -c:v libwebp -quality 82 out.webp
```

**Video** is convention-located by slug — no paths in content. Files:
`public/ov/<case-slug>/<clip>.webm` + `<clip>-poster.webp`.
`OutputGrid` derives the paths from the entry slug + the block item's `clip`.
720p, under Cloudflare's 25 MiB per-file cap; muted loops carry no audio track.

```bash
IN=master.mp4; OUT=public/ov/<slug>
ffmpeg -y -i "$IN" -vf scale=1280:-2 -an -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 "$OUT/<clip>.webm"
ffmpeg -y -ss 0 -i "$IN" -vf scale=1280:-2 -frames:v 1 -c:v libwebp -quality 82 "$OUT/<clip>-poster.webp"
```

## Performance

The whole gallery sits below the fold, so it never touches LCP. Stills are
`loading="lazy"`; videos are `preload="none"` (nothing but the poster loads until
in view). Muted loops play/pause via `IntersectionObserver`; reduced-motion keeps
them on the poster. Long pages scroll *inside* a capped frame, so a 12000px asset
never runs away with page height or payload.

Theme-aware mockups render both variants and toggle via CSS on `[data-theme]`
(no flash, no JS). Tradeoff: both variants can download. Acceptable at ~85 KB
each, below the fold — revisit with a JS src-swap (à la `card-video.ts`) only if a
case study stacks many themed mockups.

## Filenames are a contract

Video: exactly `<clip>.webm`, `<clip>-poster.webp` under
`public/ov/<slug>/`. A typo is a silent 404 — don't improvise names.
