/**
 * GA4 custom events (consent-safe).
 *
 * One delegated document click listener. Every fire checks `window.gtag` first,
 * so it is a silent no-op for users who declined consent (gtag never loaded) or
 * whose choice is still pending. No new network origins — stays inside the CSP.
 * Bundled (not is:inline) alongside consent.ts / site-chrome.ts; load order is
 * irrelevant because gtag is looked up at click time, not import time.
 *
 * Covers only what GA4 Enhanced Measurement does NOT auto-collect:
 *  - generate_lead: mailto: clicks. Enhanced Measurement counts outbound links
 *    and file_download (the resume PDF) for free, but treats mailto/tel as
 *    neither. The email click is the site's primary conversion — mark
 *    `generate_lead` as a Key event in GA4.
 *  - select_content: per-study /work/<slug> opens, so reports show WHICH work
 *    gets clicked. The /work index and nav links are ordinary page_views already,
 *    so only the case-study destinations are tagged.
 *
 * GA4's default transport is sendBeacon, so select_content survives the ensuing
 * navigation without a manual transport_type. mailto clicks don't unload the
 * page (the mail client opens over it), so those fire normally too.
 */
type Gtag = (...args: unknown[]) => void;

function track(event: string, params: Record<string, unknown>): void {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== 'function') return;
  gtag('event', event, params);
}

document.addEventListener('click', (e) => {
  const a = (e.target as Element)?.closest?.('a[href]') as HTMLAnchorElement | null;
  if (!a) return;

  const raw = a.getAttribute('href') || '';

  // Primary conversion: email click.
  if (raw.startsWith('mailto:')) {
    track('generate_lead', { method: 'Email', link_url: raw });
    return;
  }

  // Case-study open: /work/<slug> only (not the /work index). Resolve to a
  // pathname so absolute + root-relative hrefs normalize the same way.
  let path: string;
  try {
    path = new URL(a.href, location.href).pathname;
  } catch {
    return;
  }
  const m = path.match(/^\/work\/([^/]+)$/);
  if (m) {
    track('select_content', { content_type: 'case_study', content_id: m[1] });
  }
});
