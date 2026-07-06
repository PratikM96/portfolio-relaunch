/**
 * Cookie consent + gated Google Analytics (GA4).
 *
 * gtag loads ONLY after an explicit Accept. Choice persists in localStorage;
 * the footer "Cookies" button reopens the banner. Bundled (not is:inline) so
 * the ~1.4 KB ships once as a hashed, cached module instead of being re-emitted
 * into every page's HTML. It does not need to run before paint.
 */
const KEY = 'pm-consent';
const GA = 'G-G5ZSN5RXX0';

function loadGA() {
  if ((window as any).__ga) return;
  (window as any).__ga = 1;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
  document.head.appendChild(s);
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: unknown[]) {
    (window as any).dataLayer.push(args);
  }
  (window as any).gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA);
}

const el = document.getElementById('consent');
let choice: string | null = null;
try {
  choice = localStorage.getItem(KEY);
} catch (e) {}

if (choice === 'granted') loadGA();
else if (choice !== 'denied' && el) el.hidden = false;

if (el) {
  el.addEventListener('click', (e) => {
    const b = (e.target as Element).closest('[data-consent]');
    if (!b) return;
    const grant = b.getAttribute('data-consent') === 'grant';
    try {
      localStorage.setItem(KEY, grant ? 'granted' : 'denied');
    } catch (e) {}
    el.hidden = true;
    if (grant) loadGA();
  });
}

document.addEventListener('click', (e) => {
  const t = (e.target as Element).closest('[data-consent-reopen]');
  if (!t) return;
  e.preventDefault();
  if (el) el.hidden = false;
});
