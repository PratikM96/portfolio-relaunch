/**
 * figureRuns — split a stat string into neutral vs accent runs. One rule for
 * every metrics surface. Digits and separators stay neutral; symbols (+ $ # % ×)
 * and magnitude letters (M K B T) always accent; a plain word accents only when
 * the figure carries no symbol.
 *
 *    "300+ assets" -> 300 [+] assets      "4 years"  -> 4 [years]
 *    "11.7M"       -> 11.7 [M]            "$75-150"  -> [$] 75-150
 */
const MAG = new Set(['M', 'K', 'B', 'T']);
const isSym = (ch: string) => '+$#%×→'.includes(ch);

export function figureRuns(s: string): { t: string; accent: boolean }[] {
  const tokens = s.match(/[0-9]+|[A-Za-z]+|[^0-9A-Za-z]+/g) ?? [];
  // A "special" indicator present anywhere means accompanying words stay neutral.
  const hasSpecial = tokens.some(
    (t) => [...t].some(isSym) || (/^[A-Za-z]+$/.test(t) && MAG.has(t)),
  );
  const out: { t: string; accent: boolean }[] = [];
  for (const t of tokens) {
    if (/^[0-9]+$/.test(t)) {
      out.push({ t, accent: false }); // a number
    } else if (/^[A-Za-z]+$/.test(t)) {
      // magnitude letter (M/K) is always accent; a real word is accent only with no special char
      out.push({ t, accent: MAG.has(t) ? true : !hasSpecial });
    } else {
      // symbol/space run: accent only the special characters, char by char
      for (const ch of t) out.push({ t: ch, accent: isSym(ch) });
    }
  }
  return out;
}
