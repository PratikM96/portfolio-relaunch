/**
 * Media paths derived from a slug. Templates call these, so adding an entry means adding
 * its files under the same convention and nothing else. (Concept demo tabs are the
 * exception: those `img` paths are authored in content.)
 *
 * These filenames are a contract. They are unhashed and `public/_headers` caches them
 * immutable for a year, so replacing one's bytes in place will not reach a returning
 * visitor: adding a slug is safe, changing an existing file means renaming it. Encode
 * recipes live in docs/.
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

/** A concept microsite view. */
export const conceptView = (project: string, view?: string) =>
  view ? `/concepts/${project}/${view}` : `/concepts/${project}/`;
