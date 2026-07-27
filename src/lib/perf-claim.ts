/**
 * Published performance figures, derived from the measured run instead of typed.
 *
 * These resolve from the same `portfolio-perf.json` that `PerfTable` renders, so a re-run moves the figure and the table together or neither. Typed figures drifted from the table within a day, which is a contradiction on a page whose claim is that the numbers are measured.
 *
 * **Rounding is conservative, and which way that is depends on the metric.** For a score, higher is better, so it rounds DOWN: 99.4 publishes as 99. For a duration, lower is better, so it rounds UP: 0.466s publishes as 0.5s. Rounding a duration down would claim the site is faster than it measured, which is the same flattering error in the opposite direction. Get this backwards and the figure lies while looking careful.
 *
 * Not everything belongs here. The JavaScript figure is measured from the built output, not from Lighthouse, so it is not in this JSON and stays authored in the entry.
 */
import perf from '../data/portfolio-perf.json';

export type PerfSource = 'desktopLighthouse' | 'mobileLighthouse' | 'desktopLcp';

type Resolved = { value: string; unit?: string };

/** Floor, because a score claim must never exceed what was measured. */
const floorScore = (n: number) => String(Math.floor(n));

/** Ceil to one decimal of a second, because a duration claim must never undercut what was measured. */
const ceilSeconds = (ms: number) => (Math.ceil((ms / 1000) * 10) / 10).toFixed(1);

const RESOLVERS: Record<PerfSource, () => Resolved> = {
  /**
   * "100 across every page" is an absolute, so it derives from the WORST desktop page rather than the average. If one page ever drops to 99, this figure drops with it instead of an average hiding it.
   */
  desktopLighthouse: () => ({ value: floorScore(Math.min(...perf.desktop.rows.map((r) => r.perf))) }),
  /** An average, and labeled as one in the entry: mobile ranges across pages, so a floor here would read as a per-page guarantee it cannot make. */
  mobileLighthouse: () => ({ value: floorScore(perf.mobile.average.perf) }),
  desktopLcp: () => ({ value: ceilSeconds(perf.desktop.average.lcp), unit: 's' }),
};

/** Resolve one figure. Throws rather than falling back, so a renamed source fails the build instead of silently publishing nothing. */
export function perfFigure(source: string): Resolved {
  const r = RESOLVERS[source as PerfSource];
  if (!r) {
    throw new Error(`Unknown perf figure source "${source}". Known: ${Object.keys(RESOLVERS).join(', ')}`);
  }
  return r();
}

/** The date the published figures were measured, for anything that needs to state it. */
export const perfMeasuredOn = perf.measuredOn;
