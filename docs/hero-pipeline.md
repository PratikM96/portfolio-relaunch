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

**`frc`'s hero is soft because its master is 720p, not because the export is bad.** Leave it alone: re-exporting cannot add detail the source never had, and the 1080 ladder above would upscale it. Check the master's resolution before treating a soft hero as an export defect.

**The home hero is NOT this system** — it only borrows the folder. It is square, silent, autoplaying, and wired by hand in `src/pages/index.astro`, not derived from a slug. Running the recipe below against it would scale a square master to 16:9 and mux an audio track into a clip that has none. Its own recipe is at the bottom of this file.

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


# VP9 webm (two-pass; pass 1 analyzes, pass 2 writes).
# BOTH passes take the SAME -vf and -pix_fmt. Pass 1 gathers its stats at whatever resolution it is fed, so scaling only in pass 2 hands pass 2 a stats file for a different frame size and the rate control is wrong.
ffmpeg -i $master -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 1 -an -row-mt 1 `
  -vf "scale=1920:1080:flags=lanczos" -pix_fmt yuv420p `
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 `
  -f null NUL
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
- Keep the `-color_*` tags — they prevent the washed-out browser color bug.
- `preload="none"` means nothing downloads until the click, so a 15 MB clip costs nothing on load.

### Audio-only re-export: remux, don't re-encode

When a master comes back with new audio and untouched picture, copy the video stream instead of running the recipe again. It takes seconds, and the shipped picture stays bit-identical rather than taking a second generation of VP9.

```powershell
ffmpeg -y -i "public/hero/$slug/hero_1080.webm" -i $master `
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a libopus -b:a 192k -shortest out.webm
```

**Prove the picture is really unchanged first**, or the copy silently pairs new audio with a stale cut: `ffprobe` both masters for matching `nb_frames`, duration and dimensions. Afterwards, `ffmpeg -map 0:v -c copy -f md5 -` on old and new should match, and the same over `-map 0:a` should differ.

## Step 3 - wire it in (one line)

In `src/content/work/<slug>.md` frontmatter:

```yaml
heroVideo: true
```

That is the whole wiring — the template derives both paths from the slug. Set the caption via `coverCaption` (the schema requires it, plus `coverAlt`, whenever `heroVideo` is on). Leave the flag off and the entry renders no wall at all.

## The home hero (different rules, read this before touching it)

Square, silent, autoplaying, and hand-wired in `src/pages/index.astro`. Four things differ from the per-slug system above:

**1. The filename is versioned, and that is the point.** `/hero/*` is `immutable` for a year in `public/_headers`, so re-encoding a fixed name reaches new visitors only. Home is the one hero whose bytes actually get replaced, so each re-cut ships under a new URL (`hero_900-v2.webm` → `-v3` → …) and the old file is deleted in the same change. Home hardcodes its own paths, so this never touches `src/lib/media.ts` or the eight case studies.

**2. The poster goes through the image pipeline**, at `src/assets/hero/home/poster.webp`, exported full size from the master. It is both the LCP element and the entire hero for reduced-motion and save-data visitors, so it renders as a real `<img>` with a srcset rather than the video's `poster` attribute. `getImage()` builds it once and feeds both the `<img>` and `Base.astro`'s preload — **pass `preloadImageSrcset` + `preloadImageSizes` together with `preloadImage`,** because a bare `href` preload against a srcset resolves to a different candidate and downloads the LCP image twice.

**3. Pick a resting frame for the poster,** not frame 0. The loop ends on a held lockup; that is the still. Frame 0 is black.

**4. Size is chosen by measurement, not by CRF default.** Grain and texture dominate the bitrate here, so CRF barely moves the file and resolution does. Encode a spread, compare at the size the figure actually renders (652px at a 1920 viewport, growing with it, full width once stacked below 1100), and take the smallest one that is indistinguishable. The current cut is 900x900 at CRF 36.

```powershell
$master = "_reference/media/case-study-animations/home/home-hero-N/hero_2160.mov"
$ver    = "v2"   # <-- BUMP THIS. Reusing the old name will not reach returning visitors.

# Square, silent. Both passes carry identical filters.
foreach ($pass in 1, 2) {
  $sink = if ($pass -eq 1) { "-f null NUL" } else { "public/hero/home/hero_900-$ver.webm" }
  ffmpeg -y -i $master -c:v libvpx-vp9 -b:v 0 -crf 36 -pass $pass -an -row-mt 1 `
    -vf "scale=900:900:flags=lanczos" -pix_fmt yuv420p `
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 $sink.Split(" ")
}

# Poster: the held final frame, full size. Astro downscales it into the srcset.
ffmpeg -y -ss 7.9 -i $master -frames:v 1 `
  -c:v libwebp -quality 82 -compression_level 6 "src/assets/hero/home/poster.webp"
```

Then update the `<source>` and delete the superseded webm. The animation carries a year in the lockup, so it needs a re-cut each January.

## Which studies have one

The repo answers this; a list here would just rot:

```bash
ls public/hero/                          # slugs with shipped files
grep -l "^heroVideo: true" src/content/work/*.md   # slugs with the flag on
```

The two should agree on every slug **except `home`**, which has files but no content entry because it is not a case study. Files without the flag render nothing; the flag without files is a silent 404. An entry without a hero renders no wall.
