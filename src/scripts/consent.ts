/**
 * Cookie consent + Google Analytics (GA4) + custom conversion events.
 *
 * ── Consent gate ──────────────────────────────────────────────────────────
 * gtag loads ONLY after an explicit Accept (hard gate): declined or undecided
 * visitors get zero analytics. The choice persists in localStorage; the footer
 * "Cookies" button reopens the banner. Bundled (not is:inline) so it ships once
 * as a hashed, cached module rather than inline on every page.
 *
 * ── Consent Mode (the reason a naive gtag install recorded nothing) ────────
 * The GA4 property carries container-scoped consent defaults (Google tag
 * settings) that leave analytics_storage UNgranted. Under Consent Mode that
 * blocks the GA4 tag from transmitting — gtag loads but withholds every hit,
 * including page_view. Our banner IS the consent gate and only loads gtag after
 * the user clicks Accept, so we explicitly grant analytics_storage to gtag:
 *   - 'default' before config  -> the very first hit (page_view) is allowed out
 *   - 'update'  after config   -> overrides any container-scoped default that
 *                                 arrives with the tag config
 * Ad signals stay denied — this site runs no ads.
 * (If tracking still stalls, the authoritative lever is GA4 Admin -> Data
 *  streams -> Configure tag settings -> Consent settings, where those
 *  container-scoped defaults live.)
 *
 * ── Custom events (only what Enhanced Measurement does NOT auto-collect) ────
 *   generate_lead   -> mailto: clicks. The primary conversion; GA4 does not
 *                      count mailto/tel as outbound clicks. Mark it a Key event.
 *   select_content  -> case-study opens (/work/<slug>), to see which work gets
 *                      clicked. The /work index and nav links are page_views.
 * Enhanced Measurement already covers file_download (resume PDF) and outbound
 * social clicks, so those need no code. Handlers check gtag at click time, so
 * they no-op until consent is granted.
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
  const gtag = (...args: unknown[]) => {
    w.dataLayer!.push(args);
  };
  w.gtag = gtag;

  // Queue consent + config BEFORE injecting the library, so gtag.js drains a
  // fully-formed queue (consent already granted) the moment it executes.
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
