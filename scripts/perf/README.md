# scripts/perf — the Portfolio System performance record

The `/work/portfolio-system` case study claims measured performance, so the numbers have to be regenerable, not typed. This directory is how the committed `src/data/portfolio-perf.json` (rendered by `PerfTable.astro`) is produced, and how runs are compared over time.

## Regenerate the perf table

```bash
bash scripts/perf/run.sh          # 3 samples per page, mobile + desktop, every URL
REPEATS=5 bash scripts/perf/run.sh
node scripts/perf/emit.mjs        # median sample per page -> src/data/portfolio-perf.json (+ history)
node scripts/perf/trend.mjs       # how the numbers have moved across runs
```

- `urls.txt` — the pages measured (the live portfolio, one per line, `slug|url`). Add a line when a page ships, then re-run.
- `run.sh` takes **`REPEATS` samples per page per strategy** (default 3) and writes raw Lighthouse JSON into **`out/<YYYYMMDD-HHMM>/`**, one folder per run, gitignored. It names the folder itself from the clock at start, so the name cannot disagree with the `fetchTime` inside it. Keep `REPEATS` odd so the median is one real sample rather than a choice between two. Cost: roughly 8 minutes and 30MB per repeat, so the default is ~25 minutes and ~90MB.
- `emit.mjs` distills the **newest** folder by default, or a named one (`node scripts/perf/emit.mjs 20260727-1307`) to re-emit an older batch. Per page it publishes the **median sample, not an average of them** — averaging each metric independently would print a row that never happened, an FCP from one load beside an LCP from another, and a score no real load produced. Samples are ordered by score then LCP, and an even count takes the lower middle so the published figure is never the flattering half of a coin flip. Each row carries `samples` and `lcpSpread`; each strategy carries a `sampling` summary. It writes the committed JSON plus one line in `history.jsonl`, keyed on run id so re-emitting corrects that line instead of duplicating it, and still refuses to stamp a set whose pages span more than one day.
- `history.jsonl` — **committed**, one distilled snapshot per line, a few KB each. The raw runs are ~30MB a batch and stay gitignored; this file is what makes the trend survive a machine. Lines suffixed `g` were recovered from git commits before the history existed, and carry `recoveredFrom` for audit.
- `trend.mjs` — averages per run, then mobile score per page with an LCP spread column. `node scripts/perf/trend.mjs home` for one page across every run.

Needs Chrome and network access to the live site. Runs against `mehtapratik.com` (the deployed edge), not a local build, so the numbers reflect what visitors get — **and nothing can be confirmed until it is deployed.**

## Read the mean, not the run

A single mobile run is not evidence, and the history exists because that took several runs to learn. Across four batches the mobile average sat at **98.3 / 98.8 / 98.5 / 98.4** while individual pages swung ~600ms of LCP and 4-5 score points. The identity of the "worst page" changed completely every run, and two pages a fix targeted improved *before* the fix shipped.

The pattern `trend.mjs` makes visible: pages that always score 100 have an LCP spread of **5-11ms**, and every page that wobbles has a spread of **~600ms**. They are not slower pages. They are pages whose LCP sits near a scoring threshold inside a 600ms noise envelope, so which side they land on is chance. So:

- Compare **averages** between runs, never page scores.
- Trust a **CPU metric** like TBT, which barely moves on network variance. TBT going 0 to 65 is what caught the hero's decode cost while every LCP number was too noisy to read.
- Treat one page's one-run LCP as weather until two runs agree.
- Read the **`n` and within-run spread columns** in `trend.mjs`. The four archived runs are all `n=1`, i.e. one coin flip per page; sampling is what fixed that going forward. Sampling shrinks the envelope, it does not remove it — a median of 3 is roughly half the spread of a single sample, so expect pages to still move a point or two.

## The Output screenshots

Not here — they are `scripts/shots/capture.mjs` (`npm run shots`), which is the record of its own URLs, viewports, and theme forcing. Regenerate only when the visual design changes.
