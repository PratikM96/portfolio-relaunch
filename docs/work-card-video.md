# Work-card hover video pipeline

Short logo animations that play on hover in the work index. Distinct from the
case-study **hero** video (`docs/hero-pipeline.md`), which is large,
click-to-play, and carries audio.

## Contract (convention-located by slug)

- **Served files (committed):** `public/wc/<slug>/`.
- **Not opt-in:** every work entry carries a card clip, derived from the slug —
  no paths in content, no frontmatter flag. A new entry needs its own set.
- **Filenames are a contract:** exactly `card.webm`, `poster.webp`,
  `card-light.webm`, `poster-light.webp`. All four required; a typo is a silent 404.
- **webm only.** No H.264 fallback; don't add one.
- **Masters (NOT in repo):** gitignored `_reference/media/wc-animations/`.

## Surfaces that render a card clip

Two are collection-driven and pick up any new entry automatically:
- the shared index + sticky **preview pane** (`WorkIndex.astro`, home + /work)
- the `/work` **featured pair** (`work/index.astro`)

The home **bento** "Featured" tiles (`index.astro`) are hardcoded markup, NOT
collection-driven. A clip must be added by hand there: mirror an existing
`.tile-video` block. Which tiles carry one is a
`grep tile-video src/pages/index.astro` away.

## Behavior

`muted loop playsinline preload="none"`, so only the ~10 KB active-theme poster
loads until a clip actually plays. Two interaction modes:

- **Featured pair (/work) and bento tiles (home):** hover-to-play. `mouseenter` →
  `play()`, `mouseleave` → `pause()` + `load()`, which restores the poster (the
  resolved-logo last frame) so leaving mid-animation never freezes awkwardly.
- **Index preview pane:** the active row's clip. The initial selection is
  poster-only — no `<source>`, no `load()` — because the pane is hidden below
  1100px; a real hover upgrades it.

**Everything is gated on `(hover: hover)`, never on width.** A touch device can
never play these, and `load()` with a fresh `<source>` fetches the file despite
`preload="none"` — so a width gate ships the bytes anyway. No-hover devices get
the theme-correct poster only. Reduced motion is likewise poster-only.

## Encode recipe

720p is oversampled for the render sizes, so files land at 50-250 KB. The poster
is the **last** frame (the resolved logo). From the repo root, per master:

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

Every entry has dark + light animations. The three concepts (`level`, `the-ninth`,
`wisp`) break the `-light` master-naming convention: theirs are
`light/<slug>-wc_2160.mov` (same stem, `light/` dir), not `<slug>-wc-light_2160.mov`.

## Light mode

The masters are ProRes 422 (no alpha), so the dark background is baked in. Light
versions are **separate exports**, staged in `_reference/media/wc-animations/light/`
and encoded to `-light` siblings with the identical recipe.

Resolution lives in `src/scripts/card-video.ts`; a `MutationObserver` on
`[data-theme]` reswaps live on toggle, and all three surfaces call the shared
helper. Only the active theme's poster loads, so the light variant costs repo
size, never page weight.
