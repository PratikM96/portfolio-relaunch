/**
 * The browser-UI tint, and the one place its two hexes are written.
 *
 * These are `--bg`'s two ends: `--n-50` light, `--n-950` dark. They exist as literals because the two places that set them cannot read a CSS variable — a `<meta>` attribute has no access to the cascade, and the no-flash script in `Base.astro` runs before any stylesheet has applied. That is a real constraint, so the values must be duplicated out of CSS; it is not a reason to duplicate them three more times.
 *
 * They previously sat hand-typed in `Base.astro`'s meta tag, again in its pre-paint script, and again in `site-chrome.ts`, with a comment on each saying "move all three." A tint that disagrees with `--bg` puts the browser chrome a shade off the page it frames.
 *
 * `public/site.webmanifest`'s `background_color` is a fourth copy that a build-time module cannot reach, and it tracks LIGHT (`#F4F2EB`) rather than the dark default: it paints an installed app's splash screen, not the browser chrome, so it is a different question from `theme-color`. It is why the light tint is `--n-50` and not `--n-0` — on `--n-0` the splash sat a shade off the page. Keep it equal to `light` by hand.
 */
export const THEME_COLOR = {
  light: '#F4F2EB', // --n-50
  dark: '#0B0B0A', // --n-950
} as const;

/** The tint for a resolved theme name. Anything that is not 'light' is dark, matching how the rest of the site treats the attribute. */
export const themeColorFor = (theme: string): string =>
  theme === 'light' ? THEME_COLOR.light : THEME_COLOR.dark;
