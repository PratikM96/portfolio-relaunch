# GA4 / Analytics plan — mehtapratik.com

Working notes from a review of `_reference/reports/deep-research-report.md` (a GA4 best-practices
research report) against the actual codebase, July 2026. **Nothing here is built yet** beyond
what's marked "already done." This is a pick-up-later plan, not a build log.

Site goal that frames every decision: **turn a visit into a job / freelance inquiry.** The useful
question is not "how many visitors" but "which channel sent someone who read a case study and
reached out." That's an *attribution + depth* problem, not a traffic-counting one.

---

## Current state (already shipped — the research report is stale on all of these)

The report was generated from a surface crawl that never saw the `<head>`, so it flags as
"missing" a lot that already exists:

| Report claims missing | Reality |
|---|---|
| Meta titles/descriptions | Done — per-page `<title>` + `<meta description>`, `Base.astro:130-131` |
| Canonical tags | Done — `Base.astro:132`, self-canonical, `.html`/trailing-slash normalized |
| Structured data | Done — `Person` + `WebSite` @graph site-wide + per-page `CreativeWork`/`BlogPosting`/`BreadcrumbList` via `schema` prop (`Base.astro:95-122`) |
| GA4 install | Done — `G-G5ZSN5RXX0`, consent-gated, `localStorage` persisted (`Base.astro:369-395`) |
| Sitemap | Done — `@astrojs/sitemap` → `sitemap-index.xml`, concept routes added, priority-weighted |
| robots.txt | Done — references sitemap |
| Image optimization | Done — Astro `<Image>` pipeline (build-time webp, responsive srcset, no CLS) |
| OG/Twitter cards | Done — full set, 1200×630 branded PNGs |
| HTTPS / self-hosted fonts / no 3rd-party trackers | Done, plus an enforced CSP that already allowlists GA |

Also present, unmentioned by the report: enforced CSP allowlisting GA + googletagmanager +
google-analytics + Cloudflare insights (`public/_headers:21`), RSS feed, Cloudflare Web Analytics
allowed in CSP.

**GA loading model:** hard gate. `gtag` does not load *at all* until the user clicks Accept
(`Base.astro:369-395`). Declined users get zero tracking. Keep this.

Relevant history (from memory): the Cloudflare **Google tag gateway is OFF** — it had bypassed
consent and double-loaded GA. Keep GA purely in-code and consent-gated; do **not** re-enable any
edge-injected tag.

---

## The one real gap the report got right: custom event tracking

GA currently fires only the default `page_view` from `gtag('config')`. No CTAs are instrumented.

**Important refinement the report (and my first pass) missed:** GA4 **Enhanced Measurement**
auto-collects `file_download` (fires on `.pdf` links — the resume) and outbound `click`
(LinkedIn/IG/X) with **zero code**. So the custom-code surface is much smaller than the report
implies:

- **Toggle Enhanced Measurement ON** (verify in GA4 Admin) → covers resume download + outbound social clicks automatically.
- **Custom code needed only for `mailto:`** — GA4 does NOT count mailto/tel as outbound clicks. This is the primary conversion (`generate_lead`, `method: 'Email'`). Contact page + footer email links.
- **Optional:** `select_content` on case-study card clicks (`content_type=case_study`, `content_id=<slug>`).
- Site is a static MPA — every nav is a real page load — so do **NOT** use `send_page_view:false` or manual SPA pageviews. Default config event per page is correct.
- Implementation: one delegated `click` listener in `Base.astro` that checks `window.gtag` before firing (no-ops for users who declined). Stays inside the existing CSP, no new origins.

---

## Additional recommendations the report missed (ranked by decision-value)

### 1. UTM-tag your own outbound links — highest value
You control the links you hand out. Tag each so inquiries attribute to a channel instead of
collapsing into "direct/unknown":

```
mehtapratik.com/?utm_source=linkedin&utm_medium=profile
mehtapratik.com/work/dealnews?utm_source=resume-pdf&utm_medium=pdf
```

Sources to tag: LinkedIn profile/posts, email signature, the URL inside the resume PDF,
Behance/Dribbble bio, individual job applications. Then GA4 *Session source / landing page* shows
which channel produced people who dug in. **TODO: build a source/medium tag table.**

### 2. Run the two analytics tools as a deliberate split
Hard-gated GA only shows people who clicked Accept — unknown undercount (could be 40% or 90% of
real traffic). Cloudflare Web Analytics is cookieless / needs no consent and is already
CSP-allowlisted. Use them as layers:
- **Cloudflare Web Analytics** = honest topline traffic (the denominator).
- **GA4** = deep behavioral layer on the consenting subset.

First: confirm CF Web Analytics is actually *enabled* in the dashboard, not just allowed in CSP.

### 3. Link Google Search Console to GA4
Report said "submit the sitemap" and stopped. For a portfolio, GSC is arguably more valuable than
GA4 — shows the actual search queries surfacing your name/case studies, and it's pre-consent
(server-side). Verify property, submit `sitemap-index.xml`, link GSC into GA4.

### 4. Bump GA4 data retention to 14 months
Defaults to 2 months for exploration data. Admin → Data Settings → Data Retention → 14 months.
Cannot be recovered retroactively — do it before collecting.

### 5. Set the right analytical frame for low traffic
The report proposed daily time-series of email clicks — noise at portfolio volume. Use 28-day
rolling windows, ignore day-to-day, treat any single week as anecdote.

### 6. Track 404s / link rot
404 page is `noindex`. Fire a small `page_not_found` event (or watch the 404 `page_view` +
referrer) to catch dead shared links — e.g. an old case-study URL a recruiter bookmarked.

### 7. Read-depth on case studies (nice-to-have, later)
Enhanced Measurement scroll only fires at 90%. Case studies are long; 25/50/75% milestones or
time-in-section tells you which work holds attention and should lead. Only worth it once traffic
justifies it.

---

## Avoid (report advice that's wrong or a downgrade here)

- **GTM** — adds a 3rd-party dependency, a new CSP origin, and page weight to do what a ~15-line gtag listener does. Direct gtag is right.
- **Google Consent Mode v2** — the current hard gate is more private and simpler. Consent Mode v2 loads the tag and pings Google with "denied" signals; pointless with no ads.
- **`anonymize_ip: true`** — a no-op in GA4 (IP anonymization is automatic). Adds nothing.
- **Re-enabling any edge/gateway tag** at Cloudflare — it previously bypassed consent + double-loaded GA.
- The report's entire SEO/meta/structured-data/sitemap section — already done (see table above).

---

## Suggested order when we pick this back up

Do-first (free, pre-consent, answer "where do inquiries come from"):
1. UTM link scheme (#1)
2. Link GSC to GA4 (#3)

Then the code:
3. Toggle Enhanced Measurement + wire the `generate_lead` mailto event (+ optional `select_content`)

Then admin hygiene:
4. Data retention → 14 months (#4), confirm CF Web Analytics enabled (#2), GA4 Key events for `generate_lead` + `file_download`, internal-traffic filter, DebugView QA.

## Open build pieces I offered to do
- UTM source/medium tag table for LinkedIn / resume PDF / email signature / etc.
- Wire the one `generate_lead` mailto event (+ optional `select_content`) into `Base.astro`.

## Key files
- `src/layouts/Base.astro` — GA4 install + consent gate (`:369-395`), head/meta/canonical/OG/JSON-LD.
- `public/_headers` — enforced CSP (`:21`); any new external origin must be added or it fails silently.
- `astro.config.mjs` — `@astrojs/sitemap` config.
- `_reference/reports/deep-research-report.md` — the original (stale) research report.
