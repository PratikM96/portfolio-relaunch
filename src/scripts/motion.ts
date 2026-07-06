/**
 * Shared motion/video helpers. Centralizes behaviour that was copy-pasted
 * across index / work / OutputGrid / case-study scripts: the reduced-motion
 * check, muted-loop autoplay-in-view, and click-to-play → native-controls
 * handoff.
 */

/** True when the visitor asked the OS to minimise motion. Read at call time. */
export const prefersReducedMotion = (): boolean =>
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Play each muted-loop <video> while it's in view, pause it when it leaves.
 * Nothing fetches until play() (the clips are preload="none"). Returns the
 * observer (or null if there's nothing to watch / no IO support).
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
 * Wire a click-to-play button: first click enables native controls, marks the
 * container `.is-playing`, and starts playback (with sound). Clears the flag
 * when the clip ends so the play overlay can return.
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
