# scripts/perf — the Portfolio System performance record

The `/work/portfolio-system` case study claims measured performance, so the
numbers have to be regenerable, not typed. This directory is how the committed
`src/data/portfolio-perf.json` (rendered by `PerfTable.astro`) is produced.

## Regenerate the perf table

```bash
bash scripts/perf/run.sh          # Lighthouse (mobile + desktop) over every URL
node scripts/perf/emit.mjs        # distill runs -> src/data/portfolio-perf.json
```

- `urls.txt` — the pages measured (the live portfolio, one per line, `slug|url`).
  Add a line when a page ships, then re-run both steps.
- `run.sh` writes raw Lighthouse JSON to `scripts/perf/out/` (gitignored).
- `emit.mjs` reads that and writes the committed JSON: per-page rows plus
  mobile/desktop averages, stamped with the Lighthouse version and fetch date.

Needs Chrome and network access to the live site. Runs against `mehtapratik.com`
(the deployed edge), not a local build, so the numbers reflect what visitors get.

## The Output screenshots

`src/assets/work/portfolio-system/{d,m}-<page>-<theme>.webp` are above-the-fold
captures of the live site: desktop (`d-`, 1440x810) home/brand/dealnews and mobile
(`m-`, 390x844 @2x) home/about/post, each in dark and light. Captured with a
headless Chrome (puppeteer-core), consent dismissed (`localStorage pm-consent`),
theme forced via `localStorage pm-theme` (the site's key, not `theme`), reduced
motion on so reveal content renders. Viewport shots, not full-page, so the fixed
nav never scrolls out of frame. Regenerate only when the visual design changes.
