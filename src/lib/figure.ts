/**
 * figureRuns — split a stat string into runs. Numbers are accent; symbols, units,
 * magnitude letters and words are not. See CLAUDE.md §3.
 *
 *    "11.7M" -> [11.7] M    "+2,115%" -> + [2,115] %    "4 years" -> [4] years
 *
 * A number keeps its internal `.` and `,` inside one run. Matching bare digit groups
 * splits "11.7M" into two accent fragments around a neutral dot.
 */
export function figureRuns(s: string): { t: string; accent: boolean }[] {
  const tokens = s.match(/[0-9][0-9.,]*[0-9]|[0-9]|[A-Za-z]+|[^0-9A-Za-z]+/g) ?? [];
  return tokens.map((t) => ({ t, accent: /^[0-9]/.test(t) }));
}
