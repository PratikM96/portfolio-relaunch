#!/usr/bin/env bash
# Lighthouse batch for the Portfolio System case study. Runs every URL in urls.txt through Lighthouse (mobile + desktop), REPEATS times each, and writes the raw JSON into a timestamped folder under scripts/perf/out/ (gitignored). Then `node scripts/perf/emit.mjs` picks the median sample per page and distills it into the committed src/data/portfolio-perf.json the case study renders.
#
#   bash scripts/perf/run.sh && node scripts/perf/emit.mjs
#   REPEATS=5 bash scripts/perf/run.sh          # more samples, proportionally longer
#
# The numbers on /work/portfolio-system are measured, not asserted; this is how they are regenerated (e.g. after a deploy adds a page). Needs Chrome + npx.
#
# **Why it samples rather than measures once.** A single mobile run is not evidence. Four archived batches put the mobile average within half a point of itself every time while individual pages moved 4-5 score points, because a page whose LCP sits near a scoring threshold lands on either side of it by chance: pages that always score 100 have an LCP spread of 5-11ms, and every page that wobbles has a spread of ~600ms. Sampling shrinks that envelope; it does not remove it. Keep REPEATS odd so the median is one real sample rather than a choice between two.
#
# **One folder per run, named here rather than by hand**, so the name cannot disagree with the fetchTime inside it. Cost note: each repeat is ~30MB of raw JSON and ~8 minutes, so the default 3 is ~90MB and ~25 minutes. out/ is gitignored; prune old folders yourself.
#
# No `set -e`: Lighthouse can exit non-zero on a minor audit warning while still writing valid JSON, so each sample is independent and emit.mjs uses whatever samples exist per page.
cd "$(dirname "$0")/../.."
REPEATS="${REPEATS:-3}"
RUN_ID="$(date +%Y%m%d-%H%M)"
OUT_DIR="scripts/perf/out/$RUN_ID"
mkdir -p "$OUT_DIR"
echo "=== run $RUN_ID -> $OUT_DIR  ($REPEATS samples per page per strategy)"
while IFS='|' read -r slug url; do
  [ -z "$slug" ] && continue
  for strat in mobile desktop; do
    preset=""; [ "$strat" = "desktop" ] && preset="--preset=desktop"
    for i in $(seq 1 "$REPEATS"); do
      out="$OUT_DIR/${strat}-${slug}-${i}.json"
      echo ">>> $strat $slug [$i/$REPEATS]"
      npx --yes lighthouse "$url" --only-categories=performance,accessibility,best-practices,seo $preset \
        --output=json --output-path="$out" \
        --chrome-flags="--headless=new" --quiet --max-wait-for-load=45000 >/dev/null 2>&1
      [ -f "$out" ] && echo "    ok" || echo "    FAILED"
    done
  done
done < scripts/perf/urls.txt
echo "=== done ($RUN_ID). now: node scripts/perf/emit.mjs ==="
