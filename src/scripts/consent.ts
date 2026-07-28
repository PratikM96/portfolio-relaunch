/**
 * Cookie consent + GA4 + custom conversion events.
 *
 * Two regions, one banner element. Inside the EEA, the UK and Switzerland the banner is an opt-in GATE and nothing loads until Accept, because ePrivacy requires prior consent and continued browsing does not count as giving it. Everywhere else GA4 loads on arrival and the banner is a NOTICE with a one-click opt out, which is the opt-out posture US law actually asks for on first-party analytics with ad signals denied.
 *
 * Region comes from `/cdn-cgi/trace`, Cloudflare's edge echo. It is same-origin, so the enforced CSP already allows it under `connect-src 'self'`, and it needs no SSR route, which matters on a fully static build. **Anything that is not a confirmed two-letter non-European code falls through to the gate**: a timeout, an offline load, a blocked fetch, Tor's `T1` and the unknown `XX` all fail CLOSED to opt-in.
 *
 * The choice persists in localStorage and the footer "Cookies" button reopens the banner, always in ask mode, so the notice region still gets a real Decline. Consent Mode is granted explicitly (see CONSENT) to override the property's container-scoped defaults, which would otherwise withhold every hit including page_view. Those defaults live in GA4 Admin -> Data streams -> Configure tag settings -> Consent settings.
 *
 * Custom events cover only what Enhanced Measurement does not:
 *   generate_lead   -> mailto: clicks (the primary conversion; mark it a Key event)
 *   select_content  -> case-study opens (/work/<slug>)
 * Handlers check gtag at click time, so they no-op until consent is granted.
 */
const KEY = 'pm-consent';
const GA = 'G-G5ZSN5RXX0';

// The territories where prior opt-in is required: EU 27 + Iceland, Liechtenstein and Norway (the EEA), plus the UK and Switzerland. Adding a country here is always safe, since it only moves that country to the stricter surface. Removing one is a legal change, not a cleanup.
const OPT_IN_REGIONS = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'LI', 'NO',
  'GB', 'CH',
]);

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
  // Must push the `arguments` object itself. gtag.js silently ignores a real array, so a spread arrow function sends nothing at all — hence the plain function here, typed variadic only so the calls below type-check.
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

/**
 * Opting out after gtag has already loaded, which is the normal path in notice mode. Consent Mode stops further storage, and the cookies already written are expired here so nothing survives the choice — the privacy page promises exactly this. GA writes `_ga` and `_ga_<id>` on the registrable domain, so every host form is expired: a cookie set with a leading-dot domain is NOT removed by a delete that omits the domain.
 */
function revokeGA(): void {
  if (typeof w.gtag === 'function') w.gtag('consent', 'update', { ...CONSENT, analytics_storage: 'denied' });

  const host = location.hostname;
  const domains = ['', host, '.' + host, '.' + host.split('.').slice(-2).join('.')];
  for (const pair of document.cookie.split(';')) {
    const name = pair.split('=')[0].trim();
    if (!name.startsWith('_ga')) continue;
    for (const d of domains) document.cookie = `${name}=; max-age=0; path=/${d ? '; domain=' + d : ''}`;
  }
}

function store(value: 'granted' | 'denied'): void {
  try {
    localStorage.setItem(KEY, value);
  } catch {}
}

function track(event: string, params: Record<string, unknown>): void {
  if (typeof w.gtag === 'function') w.gtag('event', event, params);
}

/* ── Region ─────────────────────────────────────────────────────────────── */

/** The visitor's country per Cloudflare's edge, or null when it cannot be established. `no-store` because an HTTP-cached copy would outlive a network change and answer for the wrong country. */
async function country(): Promise<string | null> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 2000);
  try {
    const res = await fetch('/cdn-cgi/trace', { cache: 'no-store', signal: ctl.signal });
    const loc = /(?:^|\n)loc=([A-Z]{2})(?:\n|$)/.exec(await res.text())?.[1];
    // `XX` is Cloudflare's explicit unknown; Tor exits report `T1` and fail the two-letter test above.
    return loc && loc !== 'XX' ? loc : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ── Banner wiring ──────────────────────────────────────────────────────── */
const banner = document.getElementById('consent');

function show(mode: 'ask' | 'tell'): void {
  if (!banner) return;
  banner.dataset.mode = mode;
  banner.hidden = false;
}

async function decide(): Promise<void> {
  const loc = await country();
  if (loc === null || OPT_IN_REGIONS.has(loc)) {
    show('ask');
    return;
  }
  // Notice region. The grant is stored now rather than on dismiss, so a visitor who reads the notice and never clicks is not asked again on the next page.
  store('granted');
  loadGA();
  show('tell');
}

let choice: string | null = null;
try {
  choice = localStorage.getItem(KEY);
} catch {}

if (choice === 'granted') loadGA();
else if (choice !== 'denied') void decide();

if (banner) {
  banner.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest('[data-consent]');
    if (!btn) return;
    const action = btn.getAttribute('data-consent');

    if (action === 'grant') {
      store('granted');
      loadGA();
    } else if (action === 'deny') {
      store('denied');
      revokeGA();
    }
    // `ack` only dismisses: notice mode stored its grant when the banner appeared.

    banner.hidden = true;
  });
}

/* ── Delegated document clicks: reopen banner + custom events ────────────── */
document.addEventListener('click', (e) => {
  const target = e.target as Element | null;
  if (!target) return;

  // Footer "Cookies" button reopens the banner. Always in ask mode, so a notice-region visitor gets a real Decline rather than the informational copy again.
  if (target.closest('[data-consent-reopen]')) {
    e.preventDefault();
    show('ask');
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
