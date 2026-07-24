# UTM tagging — mehtapratik.com

Tag every link you hand out. Untagged, LinkedIn, the email signature and the resume PDF all
collapse into GA4's "direct / none" bucket and you lose the answer to the only question that
matters: which channel sent someone who read a case study and reached out.

A **paste-it habit**, not site code — nothing here changes the build. GA4 reads `utm_*` off
the landing URL and maps it to Session source / medium / campaign.

---

## The scheme (keep it boringly consistent)

Pick one casing and never vary it, or `LinkedIn` and `linkedin` become two sources.
**Rule: all lowercase, hyphen-separated, no spaces.**

| Param | Required | What it answers | Example values |
|---|---|---|---|
| `utm_source` | yes | Where the click came from | `linkedin`, `resume-pdf`, `email-sig`, `behance`, `github` |
| `utm_medium` | yes | The kind of link | `profile`, `post`, `pdf`, `signature`, `bio`, `dm` |
| `utm_campaign` | when it applies | The specific push/application | `job-search-2026`, `acme-application`, `launch-announce` |
| `utm_content` | optional | A/B or which link when several point the same place | `header-cta`, `footer-link` |
| `utm_term` | skip | Paid-search keywords only. Not used here. | — |

Only `source` + `medium` are needed for everyday links. Add `campaign` to isolate one effort
(a launch post, a specific application) from the steady drip.

---

## Ready-to-paste table

| Where you're putting the link | Landing page | Append |
|---|---|---|
| LinkedIn profile "website" field | home | `?utm_source=linkedin&utm_medium=profile` |
| LinkedIn post / comment | home or a case study | `?utm_source=linkedin&utm_medium=post` |
| LinkedIn DM to a recruiter | home | `?utm_source=linkedin&utm_medium=dm` |
| Email signature | home | `?utm_source=email-sig&utm_medium=signature` |
| URL printed inside the resume PDF | home | `?utm_source=resume-pdf&utm_medium=pdf` |
| A case-study link inside the resume PDF | that case study | `?utm_source=resume-pdf&utm_medium=pdf` |
| Behance / Dribbble bio | home | `?utm_source=behance&utm_medium=bio` |
| GitHub profile | home | `?utm_source=github&utm_medium=bio` |
| Instagram / X bio link | home | `?utm_source=instagram&utm_medium=bio` |
| A specific job application | home or best-fit case study | `?utm_source=application&utm_medium=direct&utm_campaign=<company>-application` |
| Launch / announcement post | home | `?utm_source=<platform>&utm_medium=post&utm_campaign=launch-announce` |

Fully assembled:

```
https://mehtapratik.com/?utm_source=linkedin&utm_medium=profile
https://mehtapratik.com/work/dealnews?utm_source=resume-pdf&utm_medium=pdf
https://mehtapratik.com/?utm_source=application&utm_medium=direct&utm_campaign=acme-application
```

---

## Rules that keep the data clean

- **Only tag inbound links you control from OFF the site.** Never put `utm_*` on an internal
  link (one mehtapratik.com page to another) — GA4 treats a tagged internal click as a
  brand-new session from that source, wrecking attribution and inflating sessions.
- **Tag the canonical host + path**: bare `mehtapratik.com`, no `www`, no trailing slash
  (matches the site's canonical + redirects, so no extra redirect hop).
- **Casing is load-bearing.** `resume-pdf` forever, never `Resume-PDF` or `resume_pdf`.
- **`utm_campaign` is for a thing with a start and end** (a job hunt, one application, a
  launch). Always-on links (LinkedIn profile, email sig) don't need a campaign.
- A shortener is fine for the printed resume so the query string isn't ugly in print — the
  redirect preserves the params. Not required.

---

## Where this shows up in GA4

**Reports → Acquisition → Traffic acquisition**, dimension *Session source / medium*. To tie a
channel to an actual inquiry, secondary-dimension that against the `generate_lead` Key event.

At portfolio volume, read a **28-day rolling window** — any single week is anecdote.

---

## GA4 setup: one required step + three saved Explorations

### Required: mark `generate_lead` as a Key event
`consent.ts` fires it on mailto clicks, but a custom event does nothing until it's flagged as a
conversion: **Admin → Events (Key events)** → toggle **`generate_lead`** on. It only appears in
that list after firing once, so if it's missing, click a mailto on the live site with consent
granted, wait a few minutes, then toggle.

### Explorations (Explore tab → Blank; saved Free-form tables, 28-day range)

The canvas is three columns: **Variables** (import via `+`), **Settings** (drag into Rows /
Values / Filters), and the table.

1. **Channel Scoreboard** — *which channel sends people who email you.*
   Rows: `Session source / medium`. Values: `Sessions`, `Engaged sessions`, `Key events`,
   `Session key event rate`. Sort by Key events. (`Key events` == `generate_lead` while it's
   the only Key event; if you add another, swap to `Event count` filtered to `generate_lead`.)
2. **Application Tracker** — *which specific application drove a visit or reply.*
   Rows: `Session campaign` (your `<company>-application` tags). Values: `Sessions`,
   `Engaged sessions`, `Key events`. Filter out `not set` / `direct` on Session campaign.
3. **Case Study Interest** — *which work gets opened, and from where.*
   Rows: `Page path and screen class` (then `Session source / medium` nested below).
   Values: `Views`, `Sessions`, `Key events`. Filter: Page path **begins with** `/work/`.
   (Upgrade: register `content_id` as an event-scoped custom dimension to slice by the
   `select_content` event directly instead of by page path.)

Realtime / DebugView confirm UTMs immediately; standard reports lag 24–48h. Visitors who
decline the cookie banner never fire GA4, so every count here undercounts — read trends.

---

## Related

- GA4 install + custom events (`generate_lead`, `select_content`) live in
  `src/scripts/consent.ts`; concept-demo events in `public/concepts/analytics.js`.
