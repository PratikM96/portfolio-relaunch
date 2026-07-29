/* GENERATED FILE - DO NOT EDIT.
 * Source: src/scripts/ga-core.js  ·  regenerate with `npm run concepts:ga`
 * A hand edit here fails the build in scripts/check/claims.mjs rather than being silently overwritten.
 */
// @ts-check
/**
 * The GA4 core: the measurement ID, the Consent Mode values, the storage key, and the load strategy.
 *
 * Two surfaces consume this and they are not built the same way. `src/scripts/consent.ts` imports it and Vite bundles it into the Base script, so the main site pays no extra request. The concept microsites are static passthrough HTML that Astro never processes, so they fetch the generated copy at `/concepts/ga-core.js` over the network. **The generated copy is produced from this file by `npm run concepts:ga` and is asserted identical at build time** — edit this one, never that one.
 *
 * Plain JS rather than TypeScript because the concept copy ships verbatim and a transpile step would mean a second bundler invocation for sixty lines. `// @ts-check` plus JSDoc is what keeps `astro check` reading it. Every export also makes this a module, which is what keeps these names out of the global script scope that `site-chrome.ts` and `embedded-demo.ts` still share.
 *
 * **Loading on arrival is not the same as loading immediately.** Where GA4 loads without a click the queue is primed on arrival but the library is fetched at idle, because 168KB of third-party script parsed inside the LCP window is what the perf claims are measured against. A click to Accept loads it inline instead: the page is long past LCP by then, and delaying a gesture only makes the button feel broken.
 */

/** Origin-scoped, so a choice made on the main site is the choice the concept demos read. That shared key is what makes an opt-out on a demo page carry back, and vice versa. */
export const KEY = 'pm-consent';

/** The only literal measurement ID in the repo. `scripts/check/claims.mjs` fails the build if a second one appears anywhere else, because re-hardcoding it is the drift that already happened once. */
export const GA = 'G-G5ZSN5RXX0';

/** Analytics granted, ads denied. Sent both before and after config, to override the property's container-scoped defaults, which would otherwise withhold every hit including page_view. Those defaults live in GA4 Admin -> Data streams -> Configure tag settings -> Consent settings. */
export const CONSENT = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'granted',
};

/** @type {any} */
const w = window;

/** The stored choice, or null when there is none or storage is unavailable. A null is not a grant: every caller treats it as "not yet decided". */
export function readChoice() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** @param {'granted' | 'denied'} value */
export function store(value) {
  try {
    localStorage.setItem(KEY, value);
  } catch {}
}

/** The queue only: no network, no third-party code. Cheap enough to run on arrival, which is what keeps `track()` working before the library lands. */
export function primeGA() {
  if (w.__ga) return;
  w.__ga = true;

  w.dataLayer = w.dataLayer || [];
  // Must push the `arguments` object itself. gtag.js silently ignores a real array, so a spread arrow function sends nothing at all — hence the plain function here.
  const gtag = function () {
    w.dataLayer.push(arguments);
  };
  w.gtag = gtag;

  // Queue before injecting the library, so gtag.js drains a fully-formed queue.
  gtag('consent', 'default', CONSENT);
  gtag('js', new Date());
  gtag('config', GA);
  gtag('consent', 'update', CONSENT);
}

/** The 168KB. Separate from the queue so it can be moved off the critical path, and skipped entirely if the visitor opts out before it fires. */
export function injectGA() {
  if (w.__gaSrc || w.__gaOff) return;
  w.__gaSrc = true;

  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
  document.head.appendChild(s);
}

/** Inline load, for a path where the page is already past LCP: a click to Accept, and nothing else. */
export function loadGA() {
  primeGA();
  injectGA();
}

/**
 * The load-on-arrival path: queue now, fetch the library once the main thread is free.
 *
 * Priming first is what makes the delay safe. `track()` checks gtag at click time, so without the queue in place a mailto click in the first seconds would drop `generate_lead`, the primary conversion, and a demo click would drop `demo_interaction`.
 *
 * **The timeout is the floor, not a hint.** `requestIdleCallback` never fires on a page that never goes idle, and Safari has only shipped it recently, so the `setTimeout` fallback is the guarantee that the tag loads at all.
 */
export function loadGADeferred() {
  primeGA();
  if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(injectGA, { timeout: 3000 });
  else setTimeout(injectGA, 1500);
}

/**
 * Opting out. Consent Mode stops further storage, and the cookies already written are expired here so nothing survives the choice — the privacy page promises exactly this. GA writes `_ga` and `_ga_<id>` on the registrable domain, so every host form is expired: a cookie set with a leading-dot domain is NOT removed by a delete that omits the domain.
 */
export function revokeGA() {
  // Also cancels a deferred injection that has not fired yet, so opting out inside the idle window never downloads the tag at all.
  w.__gaOff = true;
  if (typeof w.gtag === 'function') w.gtag('consent', 'update', { ...CONSENT, analytics_storage: 'denied' });

  const host = location.hostname;
  const domains = ['', host, '.' + host, '.' + host.split('.').slice(-2).join('.')];
  for (const pair of document.cookie.split(';')) {
    const name = pair.split('=')[0].trim();
    if (!name.startsWith('_ga')) continue;
    for (const d of domains) document.cookie = `${name}=; max-age=0; path=/${d ? '; domain=' + d : ''}`;
  }
}

/**
 * Custom events, on both surfaces.
 *
 * **The `__gaOff` check is the opt-out actually meaning something.** Denying `analytics_storage` stops the cookies but not the hits: gtag keeps sending them cookieless. A visitor who clicked Opt out has not asked to be measured anonymously, they have asked to stop, so nothing fires after that point.
 *
 * @param {string} event
 * @param {Record<string, unknown>} params
 */
export function track(event, params) {
  if (w.__gaOff) return;
  if (typeof w.gtag === 'function') w.gtag('event', event, params);
}
