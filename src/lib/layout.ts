/**
 * The layout scale: the shell's geometry, and every `sizes` string derived from it.
 *
 * An image's `sizes` is a promise about how wide it will render. Get it wrong and the browser picks the wrong candidate, silently, in the direction you did not measure: too small renders soft, too large wastes the LCP budget. The arithmetic is always `viewport - rail - padding - gaps`, so it belongs in one place rather than being recomputed by hand at each call site. Before this file there were five distinct strings in the build and the two that were hand-written were the two that were wrong, one of them on the LCP element of every case study.
 *
 * Same contract as the other scales: compose a helper, never type a literal. If a value does not fit, change the shell or change this file. `@media` cannot read a custom property, so the numbers below mirror `tokens.css` and `global.css` by hand and are the ONLY place they are typed. Change one there, change it here.
 */

/** The four widths at which the shell changes shape, mirroring the set documented in `tokens.css`. `rail` is where a two-up row stacks, `aside` where a content-plus-sticky-aside layout collapses, `md` where the console rail becomes the mobile bar, `sm` where the last grids go single-column. */
export const BP = { sm: 560, md: 900, aside: 1000, rail: 1100 } as const;

/** `--rail` in `tokens.css`. Present above `BP.md`, gone below it. */
const RAIL = 264;

/** `.pad`'s horizontal padding at each step: `--space-lg` / `--space-xl` / `--space-3xl` (`global.css`). */
const PAD = { sm: 24, md: 32, lg: 64 } as const;

/** `--space-md`, the gap between cells in every output grid. */
const GRID_GAP = 16;

/** Horizontal space the shell takes from the viewport before content gets any. Derived, so the 48 / 64 / 392 that used to be typed by hand can no longer disagree with the CSS. */
const INSET = {
  sm: PAD.sm * 2,
  md: PAD.md * 2,
  lg: RAIL + PAD.lg * 2,
} as const;

/** One cell of an n-column grid: the row's width less its gaps, split n ways. */
const cell = (inset: number, cols: number, gap = GRID_GAP) =>
  `calc((100vw - ${inset + gap * (cols - 1)}px) / ${cols})`;

/**
 * The `sizes` for a cell in an n-column grid. Below `BP.sm` every grid collapses to 2-up (or stays 1-up if it was already), which is why the first branch overrides the column count rather than carrying it through.
 */
export function sizesFor(cols: number): string {
  const c = Math.max(1, cols);
  return [
    `(max-width: ${BP.sm}px) ${cell(INSET.sm, c > 1 ? 2 : 1)}`,
    `(max-width: ${BP.md}px) ${cell(INSET.md, c)}`,
    cell(INSET.lg, c),
  ].join(', ');
}

/**
 * The full content column. This is what a case-study hero wall, a concept demo stage, and a single-column output block all actually are, so they share one string instead of three guesses.
 */
export const FULL = sizesFor(1);

/**
 * A fraction of the content column beside something else, for a split row like the home hero or the About portrait. While the row is side by side the image takes `fraction` of what is left after the gap; once it stacks it falls through to `stacked`, which defaults to the full column but takes a literal for the layouts that cap themselves when stacked.
 *
 * `sizes` is first-match-wins, hence the `min-width` branch leading.
 */
export function sizesForSplit(
  fraction: number,
  opts: { gap?: number; at?: number; stacked?: string } = {},
): string {
  const { gap = PAD.lg, at = BP.rail, stacked = FULL } = opts;
  return `(min-width: ${at + 1}px) calc((100vw - ${INSET.lg + gap}px) * ${fraction}), ${stacked}`;
}

/**
 * Responsive width ladders, in DEVICE pixels, not CSS px. Each tops out near twice its widest CSS slot so 2x displays get a sharp candidate. Astro never upscales: an over-wide ladder just emits fewer candidates, but a too-short one renders soft and says nothing about it.
 */
export const WIDTHS: Record<string, number[]> = {
  cols1: [640, 1000, 1400, 1800],
  cols2: [480, 800, 1200, 1600],
  cols3: [360, 600, 900, 1200],
  cols4: [280, 460, 700, 940],
};

/** The ladder for an n-column grid, clamped to the four that exist. */
export const ladderFor = (cols: number): number[] =>
  cols <= 1 ? WIDTHS.cols1 : cols === 2 ? WIDTHS.cols2 : cols === 3 ? WIDTHS.cols3 : WIDTHS.cols4;

/**
 * The ladder for a full-bleed content-column image: the case-study hero wall and the concept demo stage. Separate from `cols1` because these are the largest images on the site and are the LCP element on the pages that carry them, so they carry a step the gallery ladders do not need.
 */
export const WIDTHS_FULL: number[] = [480, 800, 1280, 1920, 2400];

/**
 * The scale, described for `/brand` §05 and rendered from these same constants, so the page cannot drift from the code the way its 12-column-grid paragraph did. Each breakpoint's `does` mirrors the one job it has in CLAUDE.md §6.
 */
export const SHELL = {
  breakpoints: [
    { px: BP.rail, does: 'a two-up row stacks' },
    { px: BP.aside, does: 'a content + sticky-aside layout collapses' },
    { px: BP.md, does: 'the rail becomes the mobile bar' },
    { px: BP.sm, does: 'the last grids go single-column' },
  ],
  insets: [
    { from: `above ${BP.md}px`, rail: RAIL, pad: PAD.lg, inset: INSET.lg },
    { from: `${BP.sm + 1} to ${BP.md}px`, rail: 0, pad: PAD.md, inset: INSET.md },
    { from: `${BP.sm}px and below`, rail: 0, pad: PAD.sm, inset: INSET.sm },
  ],
  gridGap: GRID_GAP,
};
