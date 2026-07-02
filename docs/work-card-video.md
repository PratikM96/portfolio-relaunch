# Work-card hover video pipeline

Short logo animations that play on hover in the work index. Distinct from the
case-study **hero** video (`docs/hero-pipeline.md`): hero clips are large,
click-to-play, and carry audio; card clips are small, muted, looping, and
autoplay on pointer hover only.

## Contract (convention-located by slug)

- **Served files (committed):** `public/hero/…` is hero; card clips live at
  `public/wc/<slug>/card.webm` + `card.mp4` + `poster.webp`.
- **Opt-in:** set `cardVideo: true` in the entry frontmatter. Templates derive
  the three paths from the slug — no paths in content. Omitted/false falls back
  to the cover image / placeholder, unchanged.
- **Filenames are a contract:** exactly `card.webm`, `card.mp4`, `poster.webp`,
  plus `card-light.webm` / `card-light.mp4` / `poster-light.webp` when a light
  variant exists (see Light mode). A typo is a silent 404.
- **Masters (NOT in repo):** 4K ProRes exports live in gitignored
  `_reference/wc-animations/`; the After Effects project is
  `_reference/wc-animations/animation-master/`. The repo only holds the
  transcoded web deliverables.

## Surfaces that read the flag

`cardVideo: true` lights up automatically on the two collection-driven surfaces:
- the shared index + sticky **preview pane** (`WorkIndex.astro`, home + /work)
- the `/work` **featured pair** (`work/index.astro`)

The home **bento** "Featured" tiles (`index.astro`) are hardcoded markup, NOT
collection-driven — a card clip there must be added by hand (currently only
SPORTIME). If a bento tile ever gains a clip, mirror the `.tile-video` block.

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
land at 50-250 KB (webm smaller, mp4 fallback larger). The poster is pulled from
the **last** frame (the resolved logo). From the repo root, per master:

```bash
SRC=_reference/wc-animations/<stem>_2160.mov
DST=public/wc/<slug>
mkdir -p "$DST"
# webm (VP9) — primary, modern browsers
ffmpeg -y -i "$SRC" -vf "scale=1280:720:flags=lanczos" -c:v libvpx-vp9 -b:v 0 \
  -crf 34 -an -pix_fmt yuv420p -deadline good -cpu-used 2 "$DST/card.webm"
# mp4 (H.264) — Safari fallback
ffmpeg -y -i "$SRC" -vf "scale=1280:720:flags=lanczos" -c:v libx264 -crf 24 \
  -preset slow -an -pix_fmt yuv420p -movflags +faststart "$DST/card.mp4"
# poster — last frame
ffmpeg -y -sseof -0.1 -i "$SRC" -vf "scale=1280:720:flags=lanczos" \
  -frames:v 1 -c:v libwebp -quality 82 "$DST/poster.webp"
```

Then set `cardVideo: true` in `src/content/work/<slug>.md`.

## Slug map (masters → slugs)

Most stems match their slug; two don't:

| master stem            | slug               |
|------------------------|--------------------|
| `sportime-wc`          | `sportime-clubs`   |
| `srlc-wc`              | `sr-love-and-care` |

The three concepts (`level`, `the-ninth`, `wisp`) have no animation and keep
their placeholders.

## Light mode (built)

The masters are ProRes 422 (no alpha), so the dark background is baked in — light
versions are **separate exports** from the After Effects project, staged in
`_reference/wc-animations/light/` and encoded to `card-light.webm` /
`card-light.mp4` / `poster-light.webp` siblings with the identical recipe.

Resolution is theme-aware and lives in `src/scripts/card-video.ts`: dark is the
default and always present; the `-light` set is used only when an entry sets
`cardVideoLight: true` AND the active theme is light. A `MutationObserver` on
`[data-theme]` reswaps the sources live on theme toggle. All three surfaces call
the shared helper. The home bento tile is hardcoded, so its light opt-in is the
`data-light="true"` attribute on the `.tile-video`, not a frontmatter flag.

To add a light variant later: drop the export in `_reference/wc-animations/light/`,
run the recipe with `-light` output names, then set `cardVideoLight: true` on the
entry (or `data-light="true"` on a bento tile). Clips stay `preload="none"` and
only the active theme's poster loads, so this is repo size only (~5 MB for all 16
clips), not page weight.
