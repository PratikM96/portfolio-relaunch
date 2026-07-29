/*
 * Consent-aware GA4 for the concept microsites.
 *
 * The concepts are standalone static HTML (public/concepts/<slug>/), not Astro pages, so they cannot import the site's bundled module. They fetch `./ga-core.js` instead, which is the generated copy of `src/scripts/ga-core.js` and therefore carries the same measurement ID, the same Consent Mode values, the same storage key and the same deferred load as the main site. Nothing about GA is re-declared here.
 *
 * **These pages read a decision, they never create one.** They are same-origin with the main site, so `pm-consent` is the choice the visitor already has: in the gate region that was a deliberate click, in the notice region it was the region's default, stored on arrival. A visitor with no stored value is not tracked and is not asked, because these pages carry no site chrome and inventing a consent surface on fourteen hand-built pages would be worse than the data loss.
 *
 * What they DO carry is an off switch, mounted only when GA actually loaded here (see mountOptOut). Without it these pages would run analytics with no way to stop them, while /privacy promises a control that only exists in the main site's footer.
 */
import { loadGADeferred, readChoice, revokeGA, store, track } from './ga-core.js';

if (readChoice() === 'granted') {
  loadGADeferred();

  /* ---- Demo-interaction events ------------------------------------------
   * Enhanced Measurement already gives page_view + scroll + engagement time on these pages. These add the "did they actually play with it" layer.
   * concept/view come from the URL so every event is segmentable:
   *   /concepts/wisp/demo -> concept=wisp, view=demo
   *   /concepts/wisp/      -> concept=wisp, view=hub
   * (To slice by these in reports, register concept/view/control as custom dimensions in GA4 Admin -> Custom definitions; they're collected either way.)
   *
   * These fire correctly despite the deferred library for the same reason `generate_lead` does: `loadGADeferred` primes the queue synchronously, so a click at 200ms queues and drains when gtag.js lands.
   */
  const parts = location.pathname.replace(/^\/+concepts\/+/, '').replace(/\/+$/, '').split('/');
  const concept = parts[0] || 'unknown';
  const view = parts[1] || 'hub';

  let engaged = false;
  function markEngaged() {
    if (engaged) return;
    engaged = true;
    // Fires once: distinguishes "actually explored the demo" from "landed and left".
    track('demo_engaged', { concept: concept, view: view });
  }

  function labelOf(el) {
    const t = (el.getAttribute('aria-label') || el.textContent || el.id || '').replace(/\s+/g, ' ').trim();
    return t ? t.slice(0, 60) : 'unlabeled';
  }

  // Capture phase so a control that stops propagation is still counted.
  document.addEventListener('click', function (e) {
    const el = e.target && e.target.closest && e.target.closest('button, a[href], [role="button"], [role="tab"]');
    if (!el) return;
    markEngaged();
    track('demo_interaction', { concept: concept, view: view, control: labelOf(el) });
  }, true);

  // Typing into the demo (e.g. the WISP prompt box) is engagement too.
  document.addEventListener('keydown', function (e) {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) markEngaged();
  }, true);

  mountOptOut();
}

/**
 * The off switch. Not a consent prompt: it only appears when analytics are already running on this page, so there is never a choice to make here, only one to reverse.
 *
 * In normal flow at the end of <main>, never fixed. The back-to-case-study bar already owns the fixed layer at the top, and wisp/demo and the-ninth/clipper are interactive surfaces where a floating chip can cover a control.
 *
 * Styling inherits `font` and `color` rather than reaching for the microsites' own custom properties: the three are separate worlds with different token names, and inheriting is the only thing that works in all of them.
 */
function mountOptOut() {
  const host = document.querySelector('main') || document.body;
  const wrap = document.createElement('p');
  wrap.style.cssText = 'font: inherit; color: inherit; font-size: 12px; opacity: .6; margin: 2rem 0 1rem; text-align: center;';

  const label = document.createElement('span');
  label.textContent = 'Analytics are on. ';

  const off = document.createElement('button');
  off.type = 'button';
  off.textContent = 'Turn them off';
  off.style.cssText = 'font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; text-decoration: underline;';

  const privacy = document.createElement('a');
  privacy.href = '/privacy';
  privacy.textContent = 'Privacy';
  privacy.style.cssText = 'color: inherit; text-decoration: underline;';

  off.addEventListener('click', function () {
    // Both from the shared core, so the cookie expiry and the injection-cancel come along. Inside the idle window this means gtag.js is never fetched at all.
    store('denied');
    revokeGA();
    wrap.textContent = 'Analytics are off.';
  });

  wrap.append(label, off, document.createTextNode('. '), privacy);
  host.append(wrap);
}
