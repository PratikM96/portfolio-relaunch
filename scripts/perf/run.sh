#!/usr/bin/env bash
# Lighthouse batch for the Portfolio System case study. Runs urls.txt through Lighthouse and writes raw JSON into a timestamped folder under scripts/perf/out/ (gitignored). `node scripts/perf/emit.mjs` then picks the median sample per page and distills it into the committed src/data/portfolio-perf.json the case study renders.
#
#   npm run perf                      # the whole loop: batch, distill, trend. ~17 min
#   npm run perf:quick home brand     # named pages, mobile only, ~1 min — for "did my change help?"
#   MOBILE_REPEATS=5 npm run perf     # tighter mobile medians, ~25 min
#
# **Lighthouse is a pinned devDependency, not `npx --yes`.** npx re-resolved the package on every invocation: 4.2s x 150 runs, roughly ten minutes of a twenty-five minute batch spent on package resolution. Worse, it pulled whatever version was current, so a Lighthouse release could silently shift every score mid-history and make the whole trend incomparable. The version is pinned exactly for that reason; bumping it is a deliberate act that deserves its own run.
#
# **Mobile and desktop are sampled differently, because they behave differently.** Measured across one 150-sample batch: 72% of pages changed mobile score between repeats, mean spread 4.1 points and worst 15, against 24% on desktop with a mean spread of 0.40 and a worst of 2. Mobile sampling buys real confidence; desktop sampling was spending a third of the wall clock re-confirming numbers that do not move. Keep repeat counts ODD so a median is one real sample rather than a coin flip between two.
#
# **Do not parallelize this.** Lighthouse defaults to SIMULATED throttling: it observes real task durations and multiplies them by cpuSlowdownMultiplier, 4x on mobile. Two runs sharing the host inflate each other's TBT fourfold in the mobile score. Same reason emit.mjs records environment.benchmarkIndex and flags a batch whose host was busy.
#
# **One folder per run, named here rather than by hand**, so the name cannot disagree with the fetchTime inside it. out/ is gitignored; prune old folders yourself.
#
# No `set -e`: Lighthouse can exit non-zero on a minor audit warning while still writing valid JSON, so each sample is independent and emit.mjs uses whatever samples exist per page.
cd "$(dirname "$0")/../.."

LH="./node_modules/.bin/lighthouse"
if [ ! -x "$LH" ]; then
  echo "No local Lighthouse at $LH. Run: npm install" >&2
  exit 1
fi

MOBILE_REPEATS="${MOBILE_REPEATS:-3}"
DESKTOP_REPEATS="${DESKTOP_REPEATS:-1}"

# Quick mode: mobile only, only the slugs named as arguments, and its own `quick-` folder so it can never be mistaken for a publishable batch or picked up as the newest run by emit.mjs.
QUICK_SLUGS="$*"
if [ -n "$QUICK_SLUGS" ]; then
  DESKTOP_REPEATS=0
  RUN_ID="quick-$(date +%Y%m%d-%H%M)"
else
  RUN_ID="$(date +%Y%m%d-%H%M)"
fi

OUT_DIR="scripts/perf/out/$RUN_ID"
mkdir -p "$OUT_DIR"
echo "=== run $RUN_ID -> $OUT_DIR  (mobile x$MOBILE_REPEATS, desktop x$DESKTOP_REPEATS)"

while IFS='|' read -r slug url; do
  [ -z "$slug" ] && continue
  if [ -n "$QUICK_SLUGS" ] && ! echo " $QUICK_SLUGS " | grep -q " $slug "; then continue; fi

  for strat in mobile desktop; do
    reps="$MOBILE_REPEATS"; preset=""
    if [ "$strat" = "desktop" ]; then reps="$DESKTOP_REPEATS"; preset="--preset=desktop"; fi
    [ "$reps" -eq 0 ] && continue

    for i in $(seq 1 "$reps"); do
      out="$OUT_DIR/${strat}-${slug}-${i}.json"
      echo ">>> $strat $slug [$i/$reps]"
      "$LH" "$url" --only-categories=performance,accessibility,best-practices,seo $preset \
        --output=json --output-path="$out" \
        --chrome-flags="--headless=new" --quiet --max-wait-for-load=45000 >/dev/null 2>&1
      [ -f "$out" ] && echo "    ok" || echo "    FAILED"
    done
  done
done < scripts/perf/urls.txt

if [ -n "$QUICK_SLUGS" ]; then
  echo "=== done ($RUN_ID). Mobile only, NOT publishable — compare it against the last full run by eye:"
  echo "    node scripts/perf/trend.mjs <slug>"
else
  echo "=== done ($RUN_ID)."
fi
