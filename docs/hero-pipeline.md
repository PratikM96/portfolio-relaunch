# Hero video pipeline

How to produce and wire the click-to-play hero video in a case study's scoreboard wall. Convention over configuration: name the files right, drop them in the slug folder, flip one flag. No code or path edits per study.

The hover-to-play logo animations on the work index are a separate system — `docs/work-card-video.md`.

## The contract (do not improvise names)

**Served files (committed) — one folder per case study:**

```
public/hero/<slug>/hero_1080.webm       VP9, 1080p, with audio
src/assets/hero/<slug>/poster.webp      still shown before play
```

**The poster lives in `src/assets/`, not beside the video.** It is the LCP element, so it goes through Astro's image pipeline — export it at full size and let the pipeline downscale. It renders as a real `<img>` (`.cs-poster`), not the video's `poster` attribute, which can't be responsive. The build throws if `heroVideo` is set and the poster is missing.

The home page uses the same shape at `public/hero/home/`, but autoplays muted and loops since it has no audio.

**Masters — local, gitignored, never committed:**

```
_reference/media/case-study-animations/<slug>/
  <name>-hero.aep      After Effects project
  hero_2160.mov        the master (ProRes; some are hero_1920.mov / .mp4)
  poster.webp          the chosen still
  (Footage)/           source footage for the comp
```

Only the two web deliverables above ship. Not every hero has a project here — a supplied brand film is just transcoded, with no comp to keep.

**Hard limits:**
- Each served file must stay under Cloudflare's **25 MiB** per-file cap. 1080p at the CRF below lands well under it; check after encoding.
- Filenames are exact. A typo is a silent 404, not an error.

## Step 1 - master out of After Effects / Media Encoder

Export a visually-lossless master, do no scaling here (that happens in Step 2):

- Format **QuickTime**, codec **Apple ProRes 422 HQ** (not 4444 - no alpha needed).
- Keep native **3840x2160 / 30 fps / Progressive / Square pixels** (Match Source).
- Check **Use Maximum Render Quality** and **Render at Maximum Depth**.
- Audio **Uncompressed (PCM) 48 kHz 24-bit**.
- Save it beside its project at `_reference/media/case-study-animations/<slug>/`.

## Step 2 - transcode the web deliverables (FFmpeg)

Set `$slug`, point `$master` at your local copy of the Drive master, and run. Outputs land straight in the served folders.

```powershell
$slug   = "dealnews"   # <-- change per case study
$master = "_reference/media/case-study-animations/$slug/hero_2160.mov"
$out    = "public/hero/$slug"
New-Item -ItemType Directory -Force $out | Out-Null


# VP9 webm (two-pass; pass 1 analyzes, pass 2 writes)
ffmpeg -i $master -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 1 -an -f null NUL
ffmpeg -i $master -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 2 -row-mt 1 `
  -vf "scale=1920:1080:flags=lanczos" -pix_fmt yuv420p `
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 `
  -c:a libopus -b:a 192k "$out/hero_1080.webm"

# Poster still (pick a strong frame; adjust -ss). Goes to src/assets/hero/<slug>/,
# NOT beside the video — Astro's pipeline downscales it into a responsive srcset,
# so export at full size and don't hand-optimize it.
ffmpeg -ss 00:00:03 -i $master -frames:v 1 -vf "scale=1920:1080" `
  -c:v libwebp -quality 82 -compression_level 6 "src/assets/hero/<slug>/poster.webp"

# cleanup + size check
Remove-Item ffmpeg2pass-0.log* -ErrorAction SilentlyContinue
Get-ChildItem $out | Select-Object Name, @{n='MiB';e={[math]::Round($_.Length/1MB,2)}}
```

**Tuning knobs (only if needed):**
- **CRF** is quality; lower = sharper/bigger. 30 is a good start, 28 for motion-heavy footage. If a file creeps toward ~20 MB, raise CRF by 2.
- Keep the `-color_*` tags — they prevent the washed-out browser colour bug.
- `preload="none"` means nothing downloads until the click, so a 15 MB clip costs nothing on load.

## Step 3 - wire it in (one line)

In `src/content/work/<slug>.md` frontmatter:

```yaml
heroVideo: true
```

That is the whole wiring — the template derives both paths from the slug. Set the caption via `coverCaption` (the schema requires it, plus `coverAlt`, whenever `heroVideo` is on). Leave the flag off and the entry renders no wall at all.

## Which studies have one

The repo answers this; a list here would just rot:

```bash
ls public/hero/                          # slugs with shipped files
grep -l "^heroVideo: true" src/content/work/*.md   # slugs with the flag on
```

The two should always agree. Files without the flag render nothing; the flag without files is a silent 404. An entry without a hero renders no wall.
