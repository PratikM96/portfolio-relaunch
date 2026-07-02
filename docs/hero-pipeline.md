# Hero video pipeline

How to produce and wire the click-to-play hero video that sits in a case study's
scoreboard wall. The system is **convention over configuration**: name the files
right, drop them in the slug folder, flip one flag. No code or path edits per study.

## The contract (do not improvise names)

**Served files (committed) — one folder per case study:**

```
public/hero/<slug>/hero_1080.webm   VP9, 1080p, with audio
public/hero/<slug>/hero_1080.mp4    H.264, 1080p, with audio  (universal fallback)
public/hero/<slug>/poster.webp      still shown before play
```

The home page uses the same shape at `public/hero/home/` (but it autoplays muted
and loops, since it has no audio - see `src/pages/index.astro`).

**Masters — NOT in the repo:**

The 4K ProRes masters live on Google Drive at `Career-Systems/01-Brand/Animations/`.
You transcode the web deliverables from a local copy of the master (Drive desktop
sync, or download it for the encode). The repo never holds a master. If you want a
local backup of the compressed outputs, `_reference/hero-video/<slug>/` is the spot
(gitignored). Only the three web deliverables above ship.

**Hard limits:**
- Each served file must stay under Cloudflare's **25 MiB** per-file cap. 1080p at
  the CRF below lands well under it; check after encoding.
- Filenames are exact. A typo is a silent 404, not an error.

## Step 1 - master out of After Effects / Media Encoder

Export a visually-lossless master, do no scaling here (that happens in Step 2):

- Format **QuickTime**, codec **Apple ProRes 422 HQ** (not 4444 - no alpha needed).
- Keep native **3840x2160 / 30 fps / Progressive / Square pixels** (Match Source).
- Check **Use Maximum Render Quality** and **Render at Maximum Depth**.
- Audio **Uncompressed (PCM) 48 kHz 24-bit**.
- Save the master to Google Drive at `Career-Systems/01-Brand/Animations/`
  (e.g. `<slug>-master_2160.mov`).

## Step 2 - transcode the web deliverables (FFmpeg)

Set `$slug` and point `$master` at your local copy of the Drive master, then run the
three encodes. Everything else is templated, and the outputs land straight in the
served folder.

```powershell
$slug   = "dealnews"   # <-- change per case study
$master = "C:\path\to\$slug-master_2160.mov"   # <-- local copy synced/downloaded from Drive
$out    = "public/hero/$slug"
New-Item -ItemType Directory -Force $out | Out-Null

# H.264 mp4 (universal fallback)
ffmpeg -i $master -c:v libx264 -crf 20 -preset slow `
  -vf "scale=1920:1080:flags=lanczos" -pix_fmt yuv420p `
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 `
  -c:a aac -b:a 192k -movflags +faststart "$out/hero_1080.mp4"

# VP9 webm (two-pass; pass 1 analyzes, pass 2 writes)
ffmpeg -i $master -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 1 -an -f null NUL
ffmpeg -i $master -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 2 -row-mt 1 `
  -vf "scale=1920:1080:flags=lanczos" -pix_fmt yuv420p `
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 `
  -c:a libopus -b:a 192k "$out/hero_1080.webm"

# Poster still (pick a strong frame; adjust -ss)
ffmpeg -ss 00:00:03 -i $master -frames:v 1 -vf "scale=1920:1080" `
  -c:v libwebp -quality 82 -compression_level 6 "$out/poster.webp"

# cleanup + size check
Remove-Item ffmpeg2pass-0.log* -ErrorAction SilentlyContinue
Get-ChildItem $out | Select-Object Name, @{n='MiB';e={[math]::Round($_.Length/1MB,2)}}
```

**Tuning knobs (only if needed):**
- Quality is **CRF** - lower = sharper/bigger. mp4 `-crf 20`, webm `-crf 30` are
  good starting points. Motion-heavy footage may want mp4 18 / webm 28; calm
  graphics can go higher and stay tiny.
- If any file creeps toward ~20 MB, raise its CRF by 2.
- `-color_*` tags prevent the washed-out/oversaturated browser color bug. Keep them.
- `preload="none"` on the element means nothing downloads until the user clicks
  play, so a 15 MB mp4 costs nothing on page load.

## Step 3 - wire it in (one line)

In `src/content/work/<slug>.md` frontmatter:

```yaml
heroVideo: true
```

That is the whole wiring. `src/pages/work/[slug].astro` derives the three paths
from the slug and renders poster + play button automatically. Set the caption via
the existing `coverCaption` field. Leave `heroVideo` off (or omit it) and the wall
falls back to the cover image / placeholder as before.

## Status checklist

| Slug                | Hero video |
| ------------------- | ---------- |
| sportime-clubs      | done       |
| dealnews            | done       |
| raa                 | done       |
| agency-fiveeighty   | done       |
| pipeline-medical    | done       |
| frc                 | pending    |
| sr-love-and-care    | pending    |
| jmtp                | done       |
| the-ninth           | pending    |
| level               | pending    |
| wisp                | pending    |

Concepts (the-ninth, level, wisp) get a hero only if a brand video exists for the
concept; otherwise they keep the placeholder. Mark each `done` here as you ship it.
