/**
 * Work-card hover clips. Every entry ships both variants at /wc/<slug>/: the
 * dark set (card.webm / poster.webp) and a `-light` sibling.
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
 * Gate hover clips on this, never on width. A touch device can't play them, and
 * they aren't free: load() with a fresh <source> fetches despite preload="none".
 */
export function canHover(): boolean {
  return window.matchMedia('(hover: hover)').matches;
}

/** Theme-correct poster only — no <source>, no load(), so nothing is fetched. */
export function applyCardPoster(v: HTMLVideoElement, slug: string): void {
  v.poster = cardPaths(slug).poster;
}

/** Point a <video> at the current theme's variant and reload. No-ops if already wired. */
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
 * Wire hover-to-play work cards: play the muted loop on enter, snap back to the
 * poster on leave, re-point at the matching variant on a theme flip. Used by the
 * home bento tiles and the /work featured pair. Reduced motion or no hovering
 * pointer → poster only (and no hover means the clip is never fetched).
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
