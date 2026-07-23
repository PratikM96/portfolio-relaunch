/**
 * Theme-aware source resolution for work-card hover clips.
 *
 * Every entry ships both variants at /wc/<slug>/: the dark set (card.webm /
 * poster.webp) and a `-light` sibling, selected by the active theme.
 */
import { prefersReducedMotion } from './motion';

export type CardPaths = { webm: string; poster: string };

function cardPaths(slug: string): CardPaths {
  const suffix = document.documentElement.getAttribute('data-theme') === 'light' ? '-light' : '';
  return {
    webm: `/wc/${slug}/card${suffix}.webm`,
    poster: `/wc/${slug}/poster${suffix}.webp`,
  };
}

/**
 * Point a <video> at the correct variant for the current theme and (re)load so
 * the poster reflects it. No-ops when it's already wired to that exact variant.
 * preload="none" means load() re-selects the resource without fetching media
 * data until play().
 */
export function applyCardSources(v: HTMLVideoElement, slug: string): void {
  const p = cardPaths(slug);
  if (v.dataset.wired === p.webm) return;
  v.dataset.wired = p.webm;
  v.poster = p.poster;
  v.innerHTML = `<source src="${p.webm}" type="video/webm">`;
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
 * Wire a set of hover-to-play work cards: each plays its muted loop on pointer
 * enter and snaps back to the poster on leave (load() re-shows the resolved-logo
 * rest frame). On a theme flip every clip re-points at the matching variant.
 * Used by the home bento tiles and the /work featured pair — only the selectors
 * differ. Reduced motion → poster only, no playback.
 */
export function wireHoverCards(cardSelector: string, videoSelector: string): void {
  const reduce = prefersReducedMotion();
  const vids: HTMLVideoElement[] = [];
  document.querySelectorAll<HTMLElement>(cardSelector).forEach((card) => {
    const v = card.querySelector<HTMLVideoElement>(videoSelector);
    if (!v) return;
    applyCardSources(v, v.dataset.slug!);
    vids.push(v);
    card.addEventListener('mouseenter', () => { if (!reduce) v.play().catch(() => {}); });
    card.addEventListener('mouseleave', () => { v.pause(); v.load(); });
  });
  onThemeChange(() => vids.forEach((v) => {
    const wasPlaying = !v.paused;
    applyCardSources(v, v.dataset.slug!);
    if (wasPlaying && !reduce) v.play().catch(() => {});
  }));
}
