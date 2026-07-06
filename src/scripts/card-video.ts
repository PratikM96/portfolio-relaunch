/**
 * Theme-aware source resolution for work-card hover clips.
 *
 * Dark is the default variant and is always present. A `-light` sibling set
 * (card-light.webm / card-light.mp4 / poster-light.webp) is used only when an
 * entry opts in (`cardVideoLight`) AND the active theme is light. Until light
 * exports exist every entry has `hasLight = false`, so this resolves to the dark
 * files in both themes and the theme swap below is a no-op — nothing to encode,
 * nothing breaks. See docs/work-card-video.md.
 */
import { prefersReducedMotion } from './motion';

export type CardPaths = { webm: string; mp4: string; poster: string };

function themeIsLight(): boolean {
  return document.documentElement.getAttribute('data-theme') === 'light';
}

function cardPaths(slug: string, hasLight: boolean): CardPaths {
  const suffix = hasLight && themeIsLight() ? '-light' : '';
  return {
    webm: `/wc/${slug}/card${suffix}.webm`,
    mp4: `/wc/${slug}/card${suffix}.mp4`,
    poster: `/wc/${slug}/poster${suffix}.webp`,
  };
}

/**
 * Point a <video> at the correct variant for the current theme and (re)load so
 * the poster reflects it. No-ops when it's already wired to that exact variant,
 * so a theme change on a dark-only clip costs nothing. preload="none" means
 * load() re-selects the resource without fetching media data until play().
 */
export function applyCardSources(v: HTMLVideoElement, slug: string, hasLight: boolean): void {
  const p = cardPaths(slug, hasLight);
  const key = `${slug}|${p.webm}`;
  if (v.dataset.wired === key) return;
  v.dataset.wired = key;
  v.poster = p.poster;
  v.innerHTML =
    `<source src="${p.webm}" type="video/webm">` +
    `<source src="${p.mp4}" type="video/mp4">`;
  v.load();
}

/** Run cb whenever the [data-theme] attribute flips. Returns a disconnect fn. */
export function onThemeChange(cb: () => void): () => void {
  const obs = new MutationObserver((muts) => {
    if (muts.some((m) => m.attributeName === 'data-theme')) cb();
  });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => obs.disconnect();
}

/**
 * Wire a set of hover-to-play work cards: each matched card plays its muted
 * loop on pointer enter and snaps back to the poster on leave (load() re-shows
 * the resolved-logo rest frame). On a theme flip every clip re-points at the
 * matching variant. Used by the home bento tiles and the /work featured pair —
 * only the selectors differ. Reduced motion → poster only, no playback.
 */
export function wireHoverCards(cardSelector: string, videoSelector: string): void {
  const reduce = prefersReducedMotion();
  const vids: HTMLVideoElement[] = [];
  document.querySelectorAll<HTMLElement>(cardSelector).forEach((card) => {
    const v = card.querySelector<HTMLVideoElement>(videoSelector);
    if (!v) return;
    applyCardSources(v, v.dataset.slug!, v.dataset.light === 'true');
    vids.push(v);
    card.addEventListener('mouseenter', () => { if (!reduce) v.play().catch(() => {}); });
    card.addEventListener('mouseleave', () => { v.pause(); v.load(); });
  });
  onThemeChange(() => vids.forEach((v) => {
    const wasPlaying = !v.paused;
    applyCardSources(v, v.dataset.slug!, v.dataset.light === 'true');
    if (wasPlaying && !reduce) v.play().catch(() => {});
  }));
}
