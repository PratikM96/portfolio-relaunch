/**
 * Cookie consent + GA4 + custom conversion events.
 *
 * gtag loads only after an explicit Accept; the choice persists in localStorage
 * and the footer "Cookies" button reopens the banner. The banner IS the consent
 * gate, so Consent Mode is granted explicitly (see CONSENT below) to override
 * the property's container-scoped defaults, which would otherwise withhold every
 * hit including page_view. Those defaults live in GA4 Admin -> Data streams ->
 * Configure tag settings -> Consent settings.
 *
 * Custom events cover only what Enhanced Measurement does not:
 *   generate_lead   -> mailto: clicks (the primary conversion; mark it a Key event)
 *   select_content  -> case-study opens (/work/<slug>)
 * Handlers check gtag at click time, so they no-op until consent is granted.
 */
const KEY = 'pm-consent';
const GA = 'G-G5ZSN5RXX0';

const w = window as unknown as {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  __ga?: boolean;
};

// Analytics granted, ads denied. Sent both before and after config.
const CONSENT = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'granted',
} as const;

function loadGA(): void {
  if (w.__ga) return;
  w.__ga = true;

  w.dataLayer = w.dataLayer || [];
  // Must push the `arguments` object itself. gtag.js silently ignores a real
  // array, so a spread arrow function sends nothing at all — hence the plain
  // function here, typed variadic only so the calls below type-check.
  const gtag: (...args: unknown[]) => void = function () {
    w.dataLayer!.push(arguments);
  };
  w.gtag = gtag;

  // Queue before injecting the library, so gtag.js drains a fully-formed queue.
  gtag('consent', 'default', CONSENT);
  gtag('js', new Date());
  gtag('config', GA);
  gtag('consent', 'update', CONSENT);

  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
  document.head.appendChild(s);
}

function track(event: string, params: Record<string, unknown>): void {
  if (typeof w.gtag === 'function') w.gtag('event', event, params);
}

/* ── Banner wiring ──────────────────────────────────────────────────────── */
const banner = document.getElementById('consent');

let choice: string | null = null;
try {
  choice = localStorage.getItem(KEY);
} catch {}

if (choice === 'granted') loadGA();
else if (choice !== 'denied' && banner) banner.hidden = false;

if (banner) {
  banner.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest('[data-consent]');
    if (!btn) return;
    const grant = btn.getAttribute('data-consent') === 'grant';
    try {
      localStorage.setItem(KEY, grant ? 'granted' : 'denied');
    } catch {}
    banner.hidden = true;
    if (grant) loadGA();
  });
}

/* ── Delegated document clicks: reopen banner + custom events ────────────── */
document.addEventListener('click', (e) => {
  const target = e.target as Element | null;
  if (!target) return;

  // Footer "Cookies" button reopens the banner.
  if (target.closest('[data-consent-reopen]')) {
    e.preventDefault();
    if (banner) banner.hidden = false;
    return;
  }

  const a = target.closest?.('a[href]') as HTMLAnchorElement | null;
  if (!a) return;

  const raw = a.getAttribute('href') || '';
  if (raw.startsWith('mailto:')) {
    track('generate_lead', { method: 'Email', link_url: raw });
    return;
  }

  let path: string;
  try {
    path = new URL(a.href, location.href).pathname;
  } catch {
    return;
  }
  const m = path.match(/^\/work\/([^/]+)$/);
  if (m) track('select_content', { content_type: 'case_study', content_id: m[1] });
});
