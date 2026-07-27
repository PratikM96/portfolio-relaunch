/**
 * Work-card hover clips. Every entry ships both theme variants: the clip at the contract path /wc/<slug>/card[-light].webm, and the poster through the image pipeline.
 *
 * **The clip path is derived, the poster path is handed over.** A contract filename can be rebuilt from a slug at runtime; a content-hashed one cannot, so whichever element carries the slug also carries both poster URLs as `data-poster` / `data-poster-light` (see `cardPosters` in src/lib/media.ts). `src` below is that element, which is the <video> itself for a hover card and the row for the /work preview pane, where one <video> is shared by every row.
 */
import { canHover, safePlay, onReducedMotionChange } from './motion';

export { canHover };

const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';

const clipFor = (slug: string) => `/wc/${slug}/card${isLight() ? '-light' : ''}.webm`;

const posterFor = (src: HTMLElement) =>
  (isLight() ? src.dataset.posterLight : src.dataset.poster) ?? src.dataset.poster ?? '';

/** Theme-correct poster only — no <source>, no load(), so no clip is fetched. */
export function applyCardPoster(v: HTMLVideoElement, src: HTMLElement): void {
  v.poster = posterFor(src);
}

/** Point a <video> at the current theme's variant and reload. No-ops if already wired to it. */
export function applyCardSources(v: HTMLVideoElement, slug: string, src: HTMLElement): void {
  const webm = clipFor(slug);
  if (v.dataset.wired === webm) return;
  v.dataset.wired = webm;
  v.poster = posterFor(src);
  v.innerHTML = `<source src="${webm}" type="video/webm">`;
  v.load();
}

const themeCbs = new Set<() => void>();
let themeObs: MutationObserver | null = null;

/**
 * Run cb whenever the [data-theme] attribute flips. Returns an unsubscribe fn.
 *
 * One observer serves every caller. Home and /work each register twice, once for a WorkIndex preview pane and once for a set of hover cards, and two MutationObservers watching the same element for the same attribute is two of everything for one signal. Module scope is what makes this shared: every importer gets the same Set.
 */
export function onThemeChange(cb: () => void): () => void {
  themeCbs.add(cb);
  if (!themeObs) {
    themeObs = new MutationObserver((muts) => {
      if (muts.some((m) => m.attributeName === 'data-theme')) themeCbs.forEach((f) => f());
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
  return () => {
    themeCbs.delete(cb);
    if (!themeCbs.size) { themeObs?.disconnect(); themeObs = null; }
  };
}

/**
 * Wire hover-to-play work cards: fetch and play the muted loop on first enter, snap back to the poster on leave, re-point at the matching variant on a theme flip. Used by the home bento tiles and the /work featured pair.
 *
 * **The clip is fetched on the hover, not on the capability.** `canHover()` says a pointer *could* hover, which is true of every laptop, so fetching there downloaded every card's webm on load whether the visitor touched one or not (~505KB on home, ~190KB on /work) — the `<source>` + `load()` trap in its own right. Reduced motion or no hovering pointer still means poster only, and now so does simply not hovering.
 */
export function wireHoverCards(cardSelector: string, videoSelector: string): void {
  // Snapshotted because it decides whether a fetch is possible at all, and a fetch can't be taken back. Playback is not snapshotted: safePlay re-reads reduced motion each time, so a mid-session flip is honored.
  const hover = canHover();
  const vids: HTMLVideoElement[] = [];
  document.querySelectorAll<HTMLElement>(cardSelector).forEach((card) => {
    const v = card.querySelector<HTMLVideoElement>(videoSelector);
    if (!v) return;
    vids.push(v);
    applyCardPoster(v, v);
    if (!hover) return;
    // applyCardSources no-ops once wired, so this costs one dataset read per re-enter
    card.addEventListener('mouseenter', () => {
      applyCardSources(v, v.dataset.slug!, v);
      safePlay(v);
    });
    card.addEventListener('mouseleave', () => { v.pause(); v.load(); });
  });
  onThemeChange(() => vids.forEach((v) => {
    // Only re-point what was already fetched. Re-pointing an untouched card would fetch the other theme's clip for a card that never got the first one.
    if (!hover || !v.dataset.wired) { applyCardPoster(v, v); return; }
    const wasPlaying = !v.paused;
    applyCardSources(v, v.dataset.slug!, v);
    if (wasPlaying) safePlay(v);
  }));
  // opting into reduced motion mid-session stops the clip under the cursor
  onReducedMotionChange((reduce) => { if (reduce) vids.forEach((v) => v.pause()); });
}
