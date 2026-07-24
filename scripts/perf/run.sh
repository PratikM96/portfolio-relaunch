#!/usr/bin/env bash
# Lighthouse batch for the Portfolio System case study. Runs every URL in
# urls.txt through Lighthouse (mobile + desktop) and writes the raw JSON to
# scripts/perf/out/ (gitignored). Then `node scripts/perf/emit.mjs` distills
# those into the committed src/data/portfolio-perf.json the case study renders.
#
#   bash scripts/perf/run.sh && node scripts/perf/emit.mjs
#
# The numbers on /work/portfolio-system are measured, not asserted; this is how
# they are regenerated (e.g. after a deploy adds a page). Needs Chrome + npx.
# No `set -e`: Lighthouse can exit non-zero on a minor audit warning while still
# writing valid JSON, so each run is independent and emit.mjs skips any misses.
cd "$(dirname "$0")/../.."
mkdir -p scripts/perf/out
while IFS='|' read -r slug url; do
  [ -z "$slug" ] && continue
  for strat in mobile desktop; do
    preset=""; [ "$strat" = "desktop" ] && preset="--preset=desktop"
    out="scripts/perf/out/${strat}-${slug}.json"
    echo ">>> $strat $slug"
    npx --yes lighthouse "$url" --only-categories=performance,accessibility,best-practices,seo $preset \
      --output=json --output-path="$out" \
      --chrome-flags="--headless=new" --quiet --max-wait-for-load=45000 >/dev/null 2>&1
    [ -f "$out" ] && echo "    ok" || echo "    FAILED"
  done
done < scripts/perf/urls.txt
echo "=== done. now: node scripts/perf/emit.mjs ==="
