/**
 * Cookie consent for the main site: which surface a visitor gets, and the two custom conversion events.
 *
 * The measurement ID, the Consent Mode values, the storage key and the whole load strategy live in `./ga-core.js`, shared with the concept microsites. This file owns the region decision and the banner.
 *
 * Two regions, one banner element. Inside the EEA, the UK and Switzerland the banner is an opt-in GATE and nothing loads until Accept, because ePrivacy requires prior consent and continued browsing does not count as giving it. Everywhere else GA4 loads on arrival and the banner is a NOTICE with a one-click opt out, which is the opt-out posture US law actually asks for on first-party analytics with ad signals denied.
 *
 * Region comes from `/cdn-cgi/trace`, Cloudflare's edge echo. It is same-origin, so the enforced CSP already allows it under `connect-src 'self'`, and it needs no SSR route, which matters on a fully static build. **Anything that is not a confirmed two-letter non-European code falls through to the gate**: a timeout, an offline load, a blocked fetch, Tor's `T1` and the unknown `XX` all fail CLOSED to opt-in.
 *
 * Custom events cover only what Enhanced Measurement does not:
 *   generate_lead   -> mailto: clicks (the primary conversion; mark it a Key event)
 *   select_content  -> case-study opens (/work/<slug>)
 */
import { loadGA, loadGADeferred, readChoice, revokeGA, store, track } from './ga-core.js';

// The territories where prior opt-in is required: EU 27 + Iceland, Liechtenstein and Norway (the EEA), plus the UK and Switzerland. Adding a country here is always safe, since it only moves that country to the stricter surface. Removing one is a legal change, not a cleanup.
const OPT_IN_REGIONS = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'LI', 'NO',
  'GB', 'CH',
]);

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
  loadGADeferred();
  show('tell');
}

const choice = readChoice();

// The returning-visitor path, and the common one: deferred for the same reason as the notice branch.
if (choice === 'granted') loadGADeferred();
else if (choice !== 'denied') void decide();

if (banner) {
  banner.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest('[data-consent]');
    if (!btn) return;
    const action = btn.getAttribute('data-consent');

    if (action === 'grant') {
      store('granted');
      // Inline rather than deferred: this is a gesture on a page long past LCP, and delaying it only makes the button feel broken.
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

  /*
   * Footer "Cookies" button. **Always reopens in ask mode, deliberately** — do not "fix" this to match the visitor's region. A notice-region visitor who clicks it has gone looking for the control, and ask mode is the only surface carrying a real Decline; reopening the notice would just show them the informational copy again. The banner legitimately looking different from the one they saw on arrival is the point, not a bug.
   *
   * Related sighting with the same non-cause: under `astro dev` there is no `/cdn-cgi/trace`, so `country()` returns null and every dev load fails closed to this same ask surface. That is the fail-closed rule working.
   */
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
