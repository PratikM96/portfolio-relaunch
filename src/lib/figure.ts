/**
 * figureRuns — split a stat string into neutral vs accent runs. One rule for every
 * metrics surface: NUMBERS ARE ACCENT, everything else takes normal text colour.
 * Symbols, units, magnitude letters and words are all neutral.
 *
 *    "11.7M"   -> [11.7] M        "300+ assets" -> [300] + assets
 *    "+2,115%" -> + [2,115] %     "4 years"     -> [4] years
 *    "$75M"    -> $ [75] M        "0→1"         -> [0] → [1]
 *
 * A number keeps its internal `.` and `,` inside one run. Matching bare digit groups
 * splits "11.7M" into two accent fragments around a neutral dot. That is the only trap here.
 *
 * Replaced a proof-signal rule where symbols accented and digits did not. See CLAUDE.md §3.
 */
export function figureRuns(s: string): { t: string; accent: boolean }[] {
  const tokens = s.match(/[0-9][0-9.,]*[0-9]|[0-9]|[A-Za-z]+|[^0-9A-Za-z]+/g) ?? [];
  return tokens.map((t) => ({ t, accent: /^[0-9]/.test(t) }));
}
