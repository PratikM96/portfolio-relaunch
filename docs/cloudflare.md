# Cloudflare — mehtapratik.com (One System)

How this site is configured on Cloudflare, and which dashboard settings to set for
what it is. **Free plan throughout** — every recommendation below is a Free-tier
control, and anything Pro+ is called out as such so it isn't chased.

## What this site is (and why it changes the advice)

A **static Astro build served as Cloudflare Workers Static Assets**: `output: 'static'`,
no `main`, no bindings, no SSR. The custom domain `mehtapratik.com` is bound to the
`portfolio-relaunch` worker. Deploys are manual (`npm run deploy` → `wrangler deploy`);
see `docs/deploy.md`.

**There is no origin server.** The worker *is* the origin. That single fact voids a
whole column of classic Cloudflare settings — origin SSL modes, Polish, Mirage, Smart
Placement, Argo — because there is no origin fetch to optimize. Keep that lens on
everything here.

## The governing rule: repo is the source of truth, the dashboard must not override it

The real control surface for this site is **checked into the repo**, not the dashboard.
The dashboard's job is to *not interfere*. Three dashboard settings can silently break
the tuned repo config; they lead the checklist below.

## Repo-side control surface (do not duplicate these in the dashboard)

| Concern | Lives in | Notes |
| --- | --- | --- |
| Security headers + the **enforced** CSP + cache policy | `public/_headers` | The CSP is the *only* CSP enforcement (Free can't enforce one at the edge — see Page Shield below). Caching split (immutable vs 30-day) is deliberate; read the file's own comments. |
| All redirects (legacy WordPress, vanity, sitemaps) | `public/_redirects` | Keep redirects **here**, never as dashboard Bulk Redirects / Page Rules. Two sources of redirect truth is how conflicts start. |
| Worker + static-assets config | `wrangler.jsonc` | `not_found_handling: 404-page`, no `main`, no bindings. `html_handling` is left default on purpose. |
| URL shape | `astro.config.mjs` | `trailingSlash: 'never'` + `format: 'file'` depend on Cloudflare's **default** `html_handling`. Don't override it in the dashboard. |

Same principle for headers: keep them in `_headers`, not dashboard Transform Rules.

## Dashboard checklist (advisory — apply these yourself)

The account/zone Cloudflare API is intentionally not wired into this repo's MCP (only
docs + observability are), so these can't be set programmatically from a session. Set
them by hand. Each row: **setting → value → why for this site.** All Free-tier.

### Top priority — these three can break the repo config

- **Caching → Browser Cache TTL = _Respect Existing Headers_.** The entire immutable
  caching strategy in `_headers` (year-long `immutable` for fonts/video, 30-day for
  favicons/OG) only holds if the dashboard doesn't override `Cache-Control`. Any fixed
  TTL here silently defeats it. Highest-impact toggle on the page.
- **Speed → Optimization → Rocket Loader = OFF.** It rewrites/defers `/_astro/*.js` and
  inline scripts, which would fight the consent gate (`consent.ts`), the pre-paint
  no-flash theme script, and `card-video.ts`, and can trip the CSP.
- **Zaraz / "Google tag gateway" = OFF.** GA4 is loaded by `consent.ts` behind the
  consent gate. The gateway previously bypassed consent and double-loaded GA. This is a
  permanent "leave off," not a one-time fix.

### SSL/TLS

- Mode **Full (Strict)**, **Always Use HTTPS ON**, **Min TLS 1.2**, **TLS 1.3 ON**,
  **Automatic HTTPS Rewrites ON** (harmless; the CSP already sends
  `upgrade-insecure-requests`). Universal SSL should cover apex **and** `www`.

### Speed

- **Early Hints ON** — small genuine win: it can 103-hint the three font preloads before
  the HTML lands.
- **HTTP/2 + HTTP/3 (QUIC) ON**, **Brotli / compression ON**.
- Auto Minify no longer exists (Cloudflare removed it in 2024); Astro minifies anyway.

### Caching

- **Tiered Cache ON** (Free-tier; Smart Topology is also free). Better cold-cache hit
  rates for the static assets.
- **Caching Level: Standard.**

### Security

- **Bot Fight Mode OFF**, **JS Detections OFF** — both already off; keep them off. Each
  injects a challenge/detection script that hurt load. (Super Bot Fight Mode is Pro+ and
  irrelevant here.)
- **Security Level: Medium** (or Essentially Off). A static portfolio has no attack
  surface worth aggressive challenging; over-challenging just risks blocking a recruiter.
- Free managed WAF ruleset: harmless if on, low value (no server, no forms, no query
  handling). Don't pay to expand it.

### Scrape Shield

- **Email Address Obfuscation → verify, and likely turn OFF.** If on, Cloudflare rewrites
  your HTML to obfuscate visible emails and injects a `/cdn-cgi/.../email-decode.min.js`.
  On a site where every byte and script is deliberate under an enforced CSP, that's an
  unwanted surprise — check the contact page renders the email as authored.
- **Hotlink Protection OFF** — assets are served same-origin; no benefit.

### DNS

- The custom-domain binding auto-creates a **proxied (orange-cloud)** record to the
  worker. Confirm it's proxied, not "DNS only."
- Confirm **apex and `www`** both resolve and one redirects to the other (apex is
  canonical, matching `site: https://mehtapratik.com`). This `www`→apex redirect is the
  one redirect that's cleaner as a dashboard **Redirect Rule** than in `_redirects`,
  because it's host-level, not path-level.

### Analytics

- **Cloudflare Web Analytics = OFF.** The auto-injected `static.cloudflareinsights.com`
  beacon slowed page load / LCP, so it's off — and its origins have been dropped from the
  `_headers` CSP allowlist (they were dead entries once the beacon stopped shipping).
  **GA4, consent-gated via `consent.ts`, is the sole analytics.** Do not re-enable Web
  Analytics on an "you should turn this on" reflex; if you ever do, re-add
  `static.cloudflareinsights.com` (script-src) and `cloudflareinsights.com` (connect-src)
  to the CSP or the beacon fails silently.

### Not available on Free (don't chase)

Polish, Mirage, Cache Reserve, Argo Smart Routing, full WAF managed rulesets, and Page
Shield **blocking** rules are all Pro+/paid (or need R2). None are needed for a static
site anyway.

## The console noise you saw (Page Shield "script monitor")

Opening the site in a browser shows a wall of **Report-Only** CSP violations quoting a
policy you didn't write (`script-src 'unsafe-inline' 'unsafe-eval'`, `connect-src 'none'`),
with reports POSTing to `csp-reporting.cloudflare.com/cdn-cgi/script_monitor/report`.

That is **Cloudflare Page Shield / Client-Side Security "script monitoring"** — a
Free-tier feature that injects its own report-only CSP to inventory the scripts on the
page. It is **not your policy** and **blocks nothing**: every `/_astro` script, gtag, and
GA `collect` still runs (GA returns `204`). On Free, Page Shield's positive/blocking
content-security rules are capped at **zero**, so Cloudflare cannot enforce a CSP at all —
which is why `_headers` is the only CSP that actually enforces anything.

There is no reliable Free-plan switch to stop the monitor, and it costs you nothing, so
treat it as expected noise. To quiet the console, add a browser filter (e.g. in Firefox's
console, filter out `csp-reporting.cloudflare.com` / `script_monitor`). See the CSP
review in this repo's history for the full breakdown.

## What the Cloudflare MCPs can and can't do here

Two Cloudflare MCP servers are wired in; the api/bindings/builds server is denied in
`.claude/settings.local.json` on purpose. Practical reach for *this* site:

- **`workers_get_worker` / docs search** — useful. Config verification and looking up
  Free-plan feature availability (this doc's facts were checked that way).
- **`query_worker_observability` / logs / traces** — mostly **empty**. A no-`main`
  static-assets worker runs no user code, so there's essentially nothing to log. Don't
  enable a wrangler `observability` block expecting data; there's no benefit here.
- **Zone settings (DNS, SSL, security toggles)** — not reachable (that MCP is denied).
  The dashboard checklist above is therefore manual by design.

## See also

- `docs/deploy.md` — deploy + rollback.
- `public/_headers`, `public/_redirects` — the live control surface.
- `CLAUDE.md` §2 (deploy), §6 (assets, fonts, CSP-adjacent build rules).
