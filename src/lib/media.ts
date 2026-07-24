/**
 * Every media path on the site, derived from a slug. Nothing here is authored
 * in content — the templates call these, so adding an entry means adding its
 * files under the same convention and nothing else.
 *
 * These filenames are a contract: they are unhashed and `public/_headers`
 * caches them immutable for a year, so replacing one's bytes in place will not
 * reach a returning visitor. Adding a new slug is always safe; changing an
 * existing file means renaming it. Encode recipes live in docs/.
 */

/** Work-card hover clip + poster. `-light` is the light-theme sibling. */
export const cardPath = (slug: string, light = false) => {
  const s = light ? '-light' : '';
  return { webm: `/wc/${slug}/card${s}.webm`, poster: `/wc/${slug}/poster${s}.webp` };
};

/** Case-study hero video. Its poster is NOT here — it goes through the image
 *  pipeline from src/assets/hero/<slug>/ because it is the LCP element. */
export const heroVideo = (slug: string) => `/hero/${slug}/hero_1080.webm`;

/** In-gallery output video + its poster. */
export const outputClip = (slug: string, clip: string) => ({
  webm: `/ov/${slug}/${clip}.webm`,
  poster: `/ov/${slug}/${clip}-poster.webp`,
});

/** Share card. Rendered by scripts/og/render-cards.mjs. */
export const ogCard = (name: string) => `/og/${name}.png`;

/** A concept microsite view, and its preview still. */
export const conceptView = (project: string, view?: string) =>
  view ? `/concepts/${project}/${view}` : `/concepts/${project}/`;
export const conceptPreview = (project: string, view: string) =>
  `/concepts/${project}/preview-${view}.webp`;
