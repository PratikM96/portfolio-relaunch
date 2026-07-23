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
 * Does this device have a hovering primary pointer? A touch screen never fires
 * mouseenter, so every hover-to-play clip below is dead weight there — and it
 * is not free: a Lighthouse mobile trace showed all three card clips (343 KB)
 * downloading on the home page despite preload="none", because load() with a
 * fresh <source> fetches the resource anyway. Gate on this, not on width.
 */
export function canHover(): boolean {
  return window.matchMedia('(hover: hover)').matches;
}

/**
 * Point a <video> at the theme-correct POSTER only — no <source>, no load(), so
 * nothing but the still is ever fetched. This is what a no-hover device gets:
 * the clips can't play there, but the light/dark poster variant still has to
 * follow the theme.
 */
export function applyCardPoster(v: HTMLVideoElement, slug: string): void {
  v.poster = cardPaths(slug).poster;
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
 *
 * No hovering pointer → poster only, and the clip is never fetched at all.
 */
export function wireHoverCards(cardSelector: string, videoSelector: string): void {
  const reduce = prefersReducedMotion();
  const hover = canHover();
  const vids: HTMLVideoElement[] = [];
  document.querySelectorAll<HTMLElement>(cardSelector).forEach((card) => {
    const v = card.querySelector<HTMLVideoElement>(videoSelector);
    if (!v) return;
    vids.push(v);
    if (!hover) { applyCardPoster(v, v.dataset.slug!); return; }
    applyCardSources(v, v.dataset.slug!);
    card.addEventListener('mouseenter', () => { if (!reduce) v.play().catch(() => {}); });
    card.addEventListener('mouseleave', () => { v.pause(); v.load(); });
  });
  onThemeChange(() => vids.forEach((v) => {
    if (!hover) { applyCardPoster(v, v.dataset.slug!); return; }
    const wasPlaying = !v.paused;
    applyCardSources(v, v.dataset.slug!);
    if (wasPlaying && !reduce) v.play().catch(() => {});
  }));
}
