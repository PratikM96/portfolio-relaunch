# Cloudflare — mehtapratik.com (One System)

A **click-through walkthrough of every Cloudflare setting** for this site, in the order
the dashboard's left nav presents them. For each toggle: what to set and why *for this
site*. **Free plan throughout** — anything Pro+ or paid is marked 💰 and can be skipped.

## How to use this

Open [dash.cloudflare.com](https://dash.cloudflare.com), pick the `mehtapratik.com`
zone, and walk the left nav top to bottom against the sections below. The Worker's own
settings (§14) live under **Workers & Pages → portfolio-relaunch**, a different area.

**Legend:** ✅ set this · ⬜ leave default · 🚫 turn off · 💰 paid / not on Free · 🔒 repo owns it, don't set in dashboard

## What this site is (and why it changes the advice)

A **static Astro build served as Cloudflare Workers Static Assets**: `output: 'static'`,
no `main`, no bindings, no SSR. The custom domain is bound to the `portfolio-relaunch`
worker. Deploys are manual (`npm run deploy` → `wrangler deploy`); see `docs/deploy.md`.

**There is no origin server — the worker *is* the origin.** That voids a whole column of
settings (origin SSL, Polish, Mirage, Smart Placement, Argo, Load Balancing): there is no
origin fetch to secure or optimize. Keep that lens on everything.

## The one rule: the repo is the source of truth, the dashboard must not override it

The real control surface is **checked into the repo**. The dashboard's job is to not
interfere. These files own their concerns — 🔒 don't duplicate them in dashboard rules:

| Concern | Owned by |
| --- | --- |
| Security headers + the enforced CSP + cache policy | `public/_headers` |
| All redirects (legacy WordPress, vanity, sitemaps) | `public/_redirects` |
| Worker + static-assets config (compat date, 404 handling) | `wrangler.jsonc` |
| URL shape (`trailingSlash:'never'` + `format:'file'`) | `astro.config.mjs` |

**The three dashboard toggles that can break this repo config** (details in their
sections): Browser Cache TTL (§5), Rocket Loader (§4), Zaraz (§12). Get those right and
nothing else here can do real damage.

---

## 0. Account hygiene (before the zone)

- ✅ **Account Home → account 2FA / passkey** on. It gates the deploy credentials.
- ✅ **Manage Account → API Tokens** — if any exist, scope them to the minimum (this
  repo's MCP already runs read-only; don't mint a broad token).
- ⬜ **Members** — solo account, nothing to do.
- ⬜ **Audit Log** — read-only; glance after big changes.

## 1. Overview (zone landing)

Nothing to set. Confirms the plan is **Free** and the zone is **Active**. Note the
account/zone IDs here if you ever need them for `wrangler` or API calls.

## 2. Analytics & Logs

Read-only dashboards, no toggles that affect delivery.

- ⬜ **Traffic / Security / Performance / DNS Analytics** — inspect only.
- ⬜ **Web Analytics** — the RUM product. **Kept OFF** (see §13 — its beacon slowed LCP).
- 💰 **Logs (Logpush)** — Enterprise. Not available; ignore.

## 3. DNS

- ✅ **Records** — there should be a **proxied (orange-cloud)** record for the apex
  (`mehtapratik.com`) pointing at the worker (auto-created by the Custom Domain binding
  in §14), plus a record for **`www`**. Confirm both exist and are **proxied**, not
  "DNS only" (grey cloud). Grey-cloud would bypass Cloudflare entirely and 404.
- ✅ **`www` → apex** — make sure one canonical host wins (apex, matching
  `site: https://mehtapratik.com`). If `www` isn't already handled, add a **Redirect
  Rule** (§8) `www.mehtapratik.com/* → https://mehtapratik.com/$1`. This host-level
  redirect is the one redirect cleaner in the dashboard than in `_redirects` (which is
  path-level).
- ✅ **Settings → DNSSEC → Enable.** Free, good hygiene; then add the DS record it shows
  you at your registrar. One-time.
- ⬜ **Settings → CNAME Flattening** — default ("flatten at apex") is correct.
- ⬜ **Email/SPF records** — only if you send mail from the domain (see §10).

## 4. Speed → Optimization

**Content optimization:**
- 🚫 **Rocket Loader = OFF.** ⚠️ One of the three that can break the site. It defers and
  re-orders `/_astro/*.js` and inline scripts, fighting the consent gate (`consent.ts`),
  the pre-paint no-flash theme script, and `card-video.ts`, and can trip the CSP.
- ✅ **Speed Brain = ON** (on by default on Free). Prefetches the likely next navigation
  from cache — improves LCP/TTFB on second-and-later page views. Safe here: it skips
  Worker-logic routes (you have none — static assets don't run code) and your
  `'unsafe-inline'` CSP isn't the `nonce`/`strict-dynamic` kind it can't work with.
- ⬜ **Cloudflare Fonts** — N/A. It self-hosts *Google Fonts* through Cloudflare; this
  site self-hosts its own woff2 with no third-party fonts, so it does nothing either way.
- ⬜ **Auto Minify** — gone (Cloudflare removed it in 2024). Astro minifies at build.
- 💰 **Polish / Mirage** — Pro+ image optimization of *origin* images. You already
  optimize at build via Sharp and ship webp; irrelevant. Ignore.

**Protocol optimization** (may live under Speed or Network depending on dashboard
version — set wherever it appears):
- ✅ **HTTP/2 = ON**, ✅ **HTTP/3 (QUIC) = ON** (your traffic already negotiates h3).
- ✅ **0-RTT Connection Resumption = ON** — safe for idempotent static GETs, shaves a
  round-trip for returning visitors.
- ⬜ **Enhanced HTTP/2 Prioritization** — fine on; low impact for a small static site.
- ⬜ **gRPC / WebSockets** — N/A (no server endpoints), leave default.

## 5. Caching

**Configuration:**
- ✅ **Browser Cache TTL = _Respect Existing Headers_.** ⚠️ Highest-impact toggle on the
  whole dashboard. Your entire immutable strategy in `_headers` (year-long `immutable`
  for fonts/video, 30-day for favicons/OG) only holds if Cloudflare doesn't override
  `Cache-Control`. Any fixed value here silently defeats it.
- ⬜ **Caching Level = Standard** (default). Correct.
- ⬜ **Always Online = ON** (default). Serves an Archive.org snapshot if the origin is
  down; harmless, near-moot for a static worker that doesn't go "down."
- ⬜ **Crawler Hints = ON** (default) — lets Cloudflare tell crawlers when content
  changed; harmless.
- 🚫 **Development Mode** — leave OFF except when actively debugging cache; it bypasses
  cache for 3 hours and auto-expires. Never leave it on.
- **Purge Cache** — action, not a setting. After a deploy that changes a
  *contract-named* asset in place (rare — see `_headers` immutable note), purge that URL.
  Normal deploys hash `/_astro/*`, so no purge needed.

- ✅ **Tiered Cache → Enable** (free; Smart Topology free too). Better cold-cache hit
  rates by funnelling misses through an upper tier.
- 🔒 **Cache Rules** — leave empty. Cache policy is in `_headers`. Don't add rules that
  would compete with it.
- 💰 **Cache Reserve** — R2-backed, paid. Ignore.

## 6. SSL/TLS

Mostly moot (traffic terminates at the worker; there's no origin fetch), but set the
safe values:

**Overview:**
- ✅ **Encryption mode = Full (Strict)** (or leave **Automatic SSL/TLS** on, which
  selects it). "Flexible"/"Off" would be wrong; there's no origin to talk plaintext to
  anyway.

**Edge Certificates:**
- ✅ **Always Use HTTPS = ON.**
- ✅ **Minimum TLS Version = 1.2.**
- ✅ **TLS 1.3 = ON.**
- ✅ **Automatic HTTPS Rewrites = ON** — harmless; your CSP also sends
  `upgrade-insecure-requests`.
- ✅ **Universal SSL** — leave enabled; confirm the cert covers **apex + `www`**.
- ⬜ **Opportunistic Encryption / Certificate Transparency Monitoring** — defaults fine.
- ⬜ **HSTS** — you already send HSTS from `_headers` (🔒). You *may* also enable it here;
  if you do, keep the values in sync. `preload` is a hard-to-reverse commitment across
  all subdomains — only add it if you'll submit to the preload list. Optional.
- 💰 **Client Certificates / Authenticated Origin Pulls / mTLS** — no origin; N/A.

## 7. Security

**Security Center / Insights:** read-only; it'll nag to "enable Client-side security" —
that's Page Shield, already effectively on (see below).

**WAF:**
- ⬜ **Managed Rules → free Cloudflare Managed Ruleset** — harmless if on; low value (no
  server, no forms, no query handling to exploit). Don't chase the 💰 full ruleset.
- ⬜ **Rate limiting / Custom rules** — Free gets a very limited allowance; you don't need
  any. Leave empty.

**Page Shield (Client-Side Security):**
- ⬜ **Script monitoring** — on by Free default, and the source of the **report-only CSP
  noise** you saw in the browser console (reports POSTing to
  `csp-reporting.cloudflare.com/cdn-cgi/script_monitor`). It **blocks nothing**. On Free,
  Page Shield's positive/blocking content-security rules are capped at **zero**, so
  Cloudflare cannot enforce a CSP at all — `_headers` is your only enforcement. There's
  no reliable Free switch to disable the monitor; treat it as expected noise and filter
  `script_monitor` / `csp-reporting.cloudflare.com` in the browser console.
- 💰 **Connection / Cookie monitoring, alerts, blocking rules** — Business+/Advanced. N/A.

**Bots:**
- 🚫 **Bot Fight Mode = OFF.** It injects a JS challenge that hurt load. Keep off.
- 🚫 **JavaScript Detections = OFF.** Same reasoning; keep off.
- 💰 **Super Bot Fight Mode / Bot Management** — Pro+. N/A.

**DDoS:** ⬜ managed automatically on Free; nothing to set.

**Settings (Security):**
- ⬜ **Security Level = Medium** (or "Essentially Off"). A static portfolio has no attack
  surface worth aggressive challenging; over-challenging risks blocking a recruiter.
- ⬜ **Challenge Passage** — default (irrelevant at Medium/Off).
- ⬜ **Browser Integrity Check = ON** (default). Blocks obviously malformed/bot requests;
  low false-positive risk here.
- ⬜ **Privacy Pass / Replace insecure JS** — defaults fine.

## 8. Rules

Your redirects and headers live in the repo (🔒). Use dashboard rules only for the one
host-level thing the repo can't express.

- ✅ **Redirect Rules** — add exactly one if §3 didn't already: **`www` → apex**. Nothing
  else; all path redirects are in `public/_redirects`.
- 🔒 **Transform Rules (request/response headers, URL rewrite)** — leave empty. Headers
  are in `_headers`; URL shape is Astro's job.
- 🔒 **Bulk Redirects / Page Rules (legacy)** — leave empty. Two sources of redirect
  truth is how conflicts start. Prefer `_redirects`.
- ⬜ **Origin Rules / Configuration Rules / Compression Rules / Snippets / Cloud
  Connector** — none needed for a static worker. Leave empty.

## 9. Network

(Some overlap with §4 Protocol Optimization — set wherever your dashboard shows them.)
- ✅ **HTTP/3 (QUIC) = ON**, ✅ **0-RTT = ON**, ✅ **IPv6 Compatibility = ON**,
  ✅ **WebSockets = ON** (default; harmless).
- ⬜ **IP Geolocation = ON** (default; harmless).
- ⬜ **gRPC / Onion Routing / Pseudo IPv4 / Network Error Logging** — defaults; N/A.
- 💰 **Maximum Upload Size / HTTP/2 to Origin** — origin-side; N/A (no origin).

## 10. Email

- ⬜ **Email Routing** — only set up if you want `you@mehtapratik.com` forwarding. Not
  required by the site. If you do enable it, it adds MX/TXT records (§3).
- ⬜ **Email Security / DMARC Management** — if the domain sends no mail, consider a
  strict SPF/DMARC (`v=spf1 -all`) to stop spoofing. Optional, unrelated to the site.

## 11. Traffic

- 💰 **Argo Smart Routing / Tiered Cache Topology extras / Load Balancing / Waiting
  Room** — paid and/or origin-oriented. All N/A for a static, origin-less site. (Basic
  Tiered Cache, the free part, is in §5.)

## 12. Zaraz

- 🚫 **Zaraz / "Google tag gateway" = OFF.** ⚠️ One of the three. GA4 is loaded by
  `consent.ts` behind the consent gate; the gateway bypassed consent and double-loaded
  GA. Permanent "leave off," not a one-time fix. Don't manage GA through Cloudflare.

## 13. Web Analytics (account-level RUM)

- 🚫 **Cloudflare Web Analytics = OFF.** The auto-injected `static.cloudflareinsights.com`
  beacon slowed page load / LCP, so it's off — and its origins were removed from the
  `_headers` CSP allowlist (they were dead once the beacon stopped shipping). **GA4, via
  `consent.ts`, is the sole analytics.** Do not re-enable on a reflex; if you ever do,
  re-add `static.cloudflareinsights.com` (script-src) and `cloudflareinsights.com`
  (connect-src) to the CSP or the beacon fails silently. Trade-off to know: with RUM off,
  Speed Brain (§4) still works but you lose the dashboard view of its impact.

## 14. The Worker (Workers & Pages → portfolio-relaunch)

This is the delivery engine. **Most of its config is owned by `wrangler.jsonc` (🔒) and
`wrangler deploy` is authoritative** — settings you change here that also live in the
config can be reset on the next deploy. Set config in the repo, not the dashboard.

- ✅ **Settings → Domains & Routes** — confirm **`mehtapratik.com` is a _Custom Domain_**
  bound to this worker (not a "Route"). Add **`www`** here too, or handle it via the
  redirect in §3/§8. The Custom Domain binding is dashboard-managed and persists across
  deploys.
- 🔒 **Compatibility date / flags** — owned by `wrangler.jsonc` (`2026-06-25`). Don't edit
  in the dashboard; bump it in the repo alongside a `wrangler` upgrade.
- 🔒 **Static Assets / `not_found_handling`** — owned by `wrangler.jsonc`
  (`404-page`, `html_handling` default). Don't override.
- ⬜ **Variables & Secrets / Bindings** — **none.** A static, no-`main` worker can't use
  bindings. If you ever see a stray `SESSION` KV binding, it leaked from the adapter's
  generated config — the `deploy` script deletes that redirect so your clean config wins
  (see `wrangler.jsonc` comments). Don't add bindings.
- ⬜ **Observability (Workers Logs)** — leave **off**. Free tier exists (200k events/day,
  3-day retention) but a no-`main` worker runs no code and emits essentially nothing to
  log. Enabling it adds a `head_sampling` config for zero benefit here.
- ⬜ **Smart Placement** — N/A (no origin to place near). Leave default (off).
- ⬜ **Triggers (Cron) / Tail Workers / Queues** — none.
- ⬜ **Workers Builds (git-connected CI)** — **not connected, keep it that way.** Deploys
  are deliberately manual (`npm run deploy` from your machine). Connecting a git
  integration would turn a push to `main` into an auto-deploy and change the deploy model
  documented in `docs/deploy.md`.
- ⬜ **Usage Model / Limits** — Free defaults; a static site stays well within them.

## 15. Not applicable to this site (so you don't go looking)

Spectrum, Access / Zero Trust, Turnstile, Load Balancing, Waiting Room, Argo Smart
Routing, Cache Reserve, Polish, Mirage, Logpush, Authenticated Origin Pulls, R2/D1/KV
bindings, Cron triggers — all either paid, origin-oriented, or for app/server workloads.
None apply to a static-assets portfolio on the Free plan.

## What the Cloudflare MCPs can and can't do here

Two Cloudflare MCP servers are wired in; the api/bindings/builds server is denied in
`.claude/settings.local.json` on purpose. Reach for *this* site:
- **`workers_get_worker` + docs search** — useful (config verification; the Free-plan
  facts in this doc were checked that way).
- **Log/trace queries** — mostly **empty** (no `main`, no code to log).
- **Zone settings (this whole walkthrough)** — **not reachable**; the api MCP is denied,
  so every section above is set by hand in the dashboard, by you.

## See also

- `docs/deploy.md` — deploy + rollback.
- `public/_headers`, `public/_redirects` — the live control surface.
- `CLAUDE.md` §2 (deploy), §6 (assets, fonts, CSP-adjacent build rules).
