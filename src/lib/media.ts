/**
 * Media paths derived from a slug. Nothing is authored in content: templates call these, so adding an entry means adding its files under the same convention and nothing else.
 *
 * **Two kinds live here.** Video filenames are a contract: unhashed, and `public/_headers` caches them immutable for a year, so replacing one's bytes in place will not reach a returning visitor. Adding a slug is safe; changing an existing file means renaming it. Encode recipes live in docs/.
 *
 * Poster stills are the opposite, and are resolved through the image pipeline below so they are content-hashed and a re-export reaches everyone. They used to sit beside the clips in `public/`, which broke §6's own rule and left 35 raster files under a year of immutable caching at fixed names.
 */
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

/** Work-card hover clip. `-light` is the light-theme sibling. */
export const cardClip = (slug: string, light = false) =>
  `/wc/${slug}/card${light ? '-light' : ''}.webm`;

/** Case-study hero video. Its poster is NOT here — it goes through the image pipeline from src/assets/hero/<slug>/ because it is the LCP element. */
export const heroVideo = (slug: string) => `/hero/${slug}/hero_1080.webm`;

/** In-gallery output video. Its poster comes from `outputPoster`. */
export const outputClip = (slug: string, clip: string) => `/ov/${slug}/${clip}.webm`;

/** Share card. Rendered by scripts/og/render-cards.mjs. */
export const ogCard = (name: string) => `/og/${name}.png`;

/** A concept microsite view. */
export const conceptView = (project: string, view?: string) =>
  view ? `/concepts/${project}/${view}` : `/concepts/${project}/`;

const wcPosters = import.meta.glob<{ default: ImageMetadata }>('../assets/wc/*/poster*.webp', { eager: true });
const ovPosters = import.meta.glob<{ default: ImageMetadata }>('../assets/ov/*/*-poster.webp', { eager: true });

async function resolve(
  map: Record<string, { default: ImageMetadata }>,
  key: string,
  what: string,
): Promise<string> {
  const mod = map[key];
  if (!mod) throw new Error(`Missing ${key.replace('../', 'src/')} for ${what}`);
  return (await getImage({ src: mod.default, format: 'webp' })).src;
}

/**
 * Both theme variants of a work card's poster, hashed. A `<video poster>` attribute takes one URL and cannot carry a srcset, so each is emitted once at its source width rather than as a ladder: the pipeline is here for hashing and format handling, not responsiveness. Templates put the pair on the element as `data-poster` / `data-poster-light`, because a hashed URL cannot be re-derived at runtime the way a contract clip path can.
 */
export async function cardPosters(slug: string): Promise<{ dark: string; light: string }> {
  const what = `work card "${slug}"`;
  return {
    dark: await resolve(wcPosters, `../assets/wc/${slug}/poster.webp`, what),
    light: await resolve(wcPosters, `../assets/wc/${slug}/poster-light.webp`, what),
  };
}

/** An output clip's poster, hashed. Single variant: these stills are footage, not UI, so they do not flip with the theme. */
export const outputPoster = (slug: string, clip: string): Promise<string> =>
  resolve(ovPosters, `../assets/ov/${slug}/${clip}-poster.webp`, `output clip "${slug}/${clip}"`);
