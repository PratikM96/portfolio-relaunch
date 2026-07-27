/**
 * Shared motion policy. Everything that decides WHETHER motion runs lives here: the reduced-motion and hover checks, the one in-view threshold, autoplay-in-view, and the click-to-play → native-controls handoff. Controllers compose these; none of them re-derives the policy, which is how the site ended up with five video controllers holding five different opinions about the same question.
 *
 * The CSS side has its own kill switch (the prefers-reduced-motion block in global.css), but it cannot stop a <video>. Playback is gated here and only here.
 */

/** How much of a video must be on screen before it is worth playing. One value, not a per-caller opinion. */
export const IN_VIEW = 0.25;

/** True when the visitor asked the OS to minimise motion. Read at CALL time, never cached — a snapshot taken at module init ignores a mid-session flip. */
export const prefersReducedMotion = (): boolean =>
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Gate anything hover-driven on this, never on width. A touch device cannot play a hover clip, and the clip is not free: load() with a fresh <source> fetches the bytes despite preload="none".
 */
export const canHover = (): boolean => matchMedia('(hover: hover)').matches;

/** Run cb whenever the reduced-motion preference flips, so a mid-session change takes effect without a reload. Returns an unsubscribe fn. */
export function onReducedMotionChange(cb: (reduce: boolean) => void): () => void {
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e: MediaQueryListEvent) => cb(e.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}

/** Play a video if policy allows. The single play() path, so no caller can forget the reduced-motion check or the rejection handler. */
export function safePlay(video: HTMLVideoElement): void {
  if (prefersReducedMotion()) return;
  video.play().catch(() => {});
}

/**
 * Report whether an element is in view, on the shared threshold. The shape behind every pause-off-screen controller. Without IntersectionObserver the element is treated as always in view, which degrades to the pre-observer behaviour rather than to silence.
 */
export function observeInView(el: Element, cb: (inView: boolean) => void): IntersectionObserver | null {
  if (!('IntersectionObserver' in window)) {
    cb(true);
    return null;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => cb(e.isIntersecting)),
    { threshold: IN_VIEW },
  );
  io.observe(el);
  return io;
}

/**
 * Play each muted-loop <video> in view, pause it on leave. Nothing fetches until play(). Returns the observer, or null if there is nothing to watch.
 */
export function autoPlayInView(videos: HTMLVideoElement[]): IntersectionObserver | null {
  if (!videos.length || !('IntersectionObserver' in window)) return null;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) safePlay(v);
        else v.pause();
      }
    },
    { threshold: IN_VIEW },
  );
  videos.forEach((v) => io.observe(v));
  // a mid-session opt-in to reduced motion stops the loops that are already running
  onReducedMotionChange((reduce) => { if (reduce) videos.forEach((v) => v.pause()); });
  return io;
}

/**
 * First click enables native controls, marks the container `.is-playing`, and plays with sound. Deliberately NOT gated on reduced motion: a click is explicit intent.
 */
export function wireClickToPlay(
  container: Element,
  video: HTMLVideoElement,
  btn: Element,
): void {
  btn.addEventListener('click', () => {
    video.controls = true;
    container.classList.add('is-playing');
    // not safePlay: the visitor asked for this one, so reduced motion does not veto it
    video.play().catch(() => {});
  });
  // hand the overlay back exactly as it was — controls go too, or the poster returns underneath a native control bar
  video.addEventListener('ended', () => {
    container.classList.remove('is-playing');
    video.controls = false;
  });
}
