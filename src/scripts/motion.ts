/**
 * Shared motion/video helpers: the reduced-motion check, muted-loop
 * autoplay-in-view, and the click-to-play → native-controls handoff.
 */

/** True when the visitor asked the OS to minimise motion. Read at call time. */
export const prefersReducedMotion = (): boolean =>
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Play each muted-loop <video> in view, pause it on leave. Nothing fetches until
 * play(). Returns the observer, or null if there's nothing to watch.
 */
export function autoPlayInView(
  videos: HTMLVideoElement[],
  opts: { threshold?: number } = {},
): IntersectionObserver | null {
  if (!videos.length || !('IntersectionObserver' in window)) return null;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      }
    },
    { threshold: opts.threshold ?? 0.25 },
  );
  videos.forEach((v) => io.observe(v));
  return io;
}

/**
 * First click enables native controls, marks the container `.is-playing`, and
 * plays with sound. The flag clears on `ended` so the overlay returns.
 */
export function wireClickToPlay(
  container: Element,
  video: HTMLVideoElement,
  btn: Element,
): void {
  btn.addEventListener('click', () => {
    video.controls = true;
    container.classList.add('is-playing');
    video.play();
  });
  video.addEventListener('ended', () => container.classList.remove('is-playing'));
}
