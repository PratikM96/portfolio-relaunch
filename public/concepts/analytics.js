/*
 * Consent-aware GA4 for the concept microsites.
 *
 * The concepts are standalone static HTML (public/concepts/<slug>/), not Astro
 * pages, so they can't import the site's bundled consent module. They also have
 * no cookie banner of their own. But they're SAME-ORIGIN with the main site, so
 * they can read the consent choice the visitor already made there.
 *
 * Rule: load GA only if the visitor ALREADY granted consent on the main site
 * (localStorage 'pm-consent' === 'granted'). Someone who reached a concept the
 * intended way — through a case study — has already chosen, and it's one GA4
 * session (same client_id, same origin), so the case-study -> demo journey is
 * captured. A direct-to-concept visitor with no prior choice is NOT tracked;
 * that's the privacy-correct default since there's no banner to ask them.
 *
 * gtag pushes the `arguments` OBJECT (not an array) — gtag.js ignores array-form
 * commands, which is the bug that once made the main site record nothing. Keep
 * this in sync with src/scripts/consent.ts.
 */
(function () {
  var GA = 'G-G5ZSN5RXX0';

  var choice = null;
  try {
    choice = localStorage.getItem('pm-consent');
  } catch (e) {}
  if (choice !== 'granted') return;
  if (window.__ga) return;
  window.__ga = true;

  var CONSENT = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted'
  };

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('consent', 'default', CONSENT);
  gtag('js', new Date());
  gtag('config', GA);
  gtag('consent', 'update', CONSENT);

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
  document.head.appendChild(s);
})();
