# Local setup

What a machine needs before it can build, encode media, or deploy. Everything here is a trap that fails quietly if you skip it; the ordinary parts (`npm install`, `npm run dev`) are in the README.

## Toolchain

| Tool | Why | Check |
| --- | --- | --- |
| Node | Astro's `engines` floor is 22.12 | `node -v` |
| ffmpeg **with libwebp** | every encode recipe in `docs/` | see below |
| Chrome | `npm run og:cards`, `npm run shots` | the script's own path list |
| gh | HTTPS pushes; `gh auth login` also wires git's credential helper | `gh auth status` |
| wrangler | ships with the repo as a devDependency, no global install | `npx wrangler whoami` |

`gh auth login` and `npx wrangler login` are once per machine and both need a browser.

## ffmpeg needs libwebp, and the default formula does not have it

Homebrew splits ffmpeg into a slim `ffmpeg` and a full build. **The slim one has libvpx but no libwebp**, so every `-c:v libwebp` line in `docs/hero-pipeline.md`, `docs/work-card-video.md` and `docs/output-assets.md` dies with `Unknown encoder 'libwebp'` after the video half has already succeeded. Install `ffmpeg-full`, which is keg-only, so put it ahead of the slim one on PATH.

```bash
brew install ffmpeg-full
echo 'export PATH="/opt/homebrew/opt/ffmpeg-full/bin:$PATH"' >> ~/.zshrc
```

Verify before trusting any media run. Both encoders must be listed:

```bash
ffmpeg -encoders | grep -E 'libvpx-vp9|libwebp'
```

## `_reference` is a link to Drive, not a directory in the repo

The masters, font originals and video masters live in Drive and are gitignored. Without the link, `npm run fonts:subset` refuses rather than guessing, and nothing can verify a claim.

```bash
ln -s "$HOME/Library/CloudStorage/GoogleDrive-<account>/My Drive/_reference" _reference
ls _reference/masters
```

Two things to know:

- **The `.gitignore` entry has no trailing slash on purpose.** A trailing-slash pattern matches directories only, so `_reference/` ignores a real directory but not a link, and the private masters become committable in a public repo. Do not add the slash back.
- **If Drive is stream-only, mark `_reference/media` available offline** before encoding, or every read stalls on a download.

## Shell

`brew shellenv` goes in `~/.zprofile`, which only login shells read. A non-login shell (anything scripted or spawned by a tool) will not find `node`, `npm` or `brew` unless it sources it first:

```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Two portability notes for anything you write against this repo: macOS `sed -i` requires an explicit empty argument (`sed -i ''`), and zsh does not word-split unquoted variables the way bash does, so a `for x in $list` loop written for bash runs once with the whole string.

## Fresh clone

```bash
npm ci
ln -s "$HOME/Library/CloudStorage/GoogleDrive-<account>/My Drive/_reference" _reference
npm install-scripts approve --all   # sharp, esbuild, workerd, fsevents all need their install scripts
npm run build
```

`npm run build` is the only gate this repo has. If it passes, the machine is set up.
