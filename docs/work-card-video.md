# Work-card hover video pipeline

Short logo animations that play on hover in the work index. Distinct from the
case-study **hero** video (`docs/hero-pipeline.md`): hero clips are large,
click-to-play, and carry audio; card clips are small, muted, looping, and
autoplay on pointer hover only.

## Contract (convention-located by slug)

- **Served files (committed):** `public/hero/…` is hero; card clips live at
  `public/wc/<slug>/card.webm` + `poster.webp`.
- **Not opt-in:** every work entry carries a card clip. Templates derive the
  paths from the slug — no paths in content, and no flag in frontmatter. Adding
  an entry means adding its `public/wc/<slug>/` set.
- **Filenames are a contract:** exactly `card.webm`, `poster.webp`,
  `card-light.webm`, `poster-light.webp`. All four are required. A typo is a
  silent 404.
- **webm only.** The H.264 fallback was dropped (2026-07-22); Safari has shipped
  WebM since 14.1. Do not reintroduce an `.mp4` sibling.
- **Masters (NOT in repo):** 4K ProRes exports live in gitignored
  `_reference/media/wc-animations/`; the After Effects project is
  `_reference/media/wc-animations/animation-master/`. The repo only holds the
  transcoded web deliverables.

## Surfaces that render a card clip

Two are collection-driven and pick up any new entry automatically:
- the shared index + sticky **preview pane** (`WorkIndex.astro`, home + /work)
- the `/work` **featured pair** (`work/index.astro`)

The home **bento** "Featured" tiles (`index.astro`) are hardcoded markup, NOT
collection-driven. A clip must be added by hand there: mirror an existing
`.tile-video` block. Which tiles carry one is a
`grep tile-video src/pages/index.astro` away.

## Behavior

`muted loop playsinline preload="none"`, so nothing but the ~10 KB active-theme
poster loads until a clip is actually played. Two interaction modes:

- **Featured pair (/work) and bento tile (home):** hover-to-play. Poster at rest;
  `mouseenter` → `play()`, `mouseleave` → `pause()` + `load()` (re-shows the
  poster = the resolved-logo last frame, so leaving mid-animation never freezes on
  an awkward frame).
- **Index preview pane:** plays whichever row is active. The first row is active on
  load, so if it's a card entry its clip autoplays (and loads) immediately;
  hovering another row swaps + plays it. It loops, so it isn't reset on leave.

Skipped under `prefers-reduced-motion` (poster only) everywhere.

## Encode recipe

720p is oversampled for the render sizes (preview 380px, cards ~600px), so files
land at 50-250 KB. The poster is pulled from
the **last** frame (the resolved logo). From the repo root, per master:

```bash
SRC=_reference/media/wc-animations/<stem>_2160.mov
DST=public/wc/<slug>
mkdir -p "$DST"
# webm (VP9) — primary, modern browsers
ffmpeg -y -i "$SRC" -vf "scale=1280:720:flags=lanczos" -c:v libvpx-vp9 -b:v 0 \
  -crf 34 -an -pix_fmt yuv420p -deadline good -cpu-used 2 "$DST/card.webm"
# poster — last frame
ffmpeg -y -sseof -0.1 -i "$SRC" -vf "scale=1280:720:flags=lanczos" \
  -frames:v 1 -c:v libwebp -quality 82 "$DST/poster.webp"
```


## Slug map (masters → slugs)

Most stems match their slug; two don't:

| master stem            | slug               |
|------------------------|--------------------|
| `sportime-wc`          | `sportime-clubs`   |
| `srlc-wc`              | `sr-love-and-care` |

Every entry has dark + light animations. The three concepts (`level`, `the-ninth`, `wisp`) differ only in master naming: Their light masters break the `-light` convention: they are
`light/<slug>-wc_2160.mov` (same stem as dark, just in the `light/` dir), not
`<slug>-wc-light_2160.mov` like the clients.

## Light mode

The masters are ProRes 422 (no alpha), so the dark background is baked in — light
versions are **separate exports** from the After Effects project, staged in
`_reference/media/wc-animations/light/` and encoded to `card-light.webm` /
`poster-light.webp` siblings with the identical recipe.

Resolution is theme-aware and lives in `src/scripts/card-video.ts`: the `-light`
set is used whenever the active theme is light, and every entry has one. A
`MutationObserver` on `[data-theme]` reswaps the sources live on theme toggle;
all three surfaces call the shared helper.

A new entry needs all four files before it ships. Clips stay `preload="none"` and
only the active theme's poster loads, so the light variant costs repo size only,
never page weight.
