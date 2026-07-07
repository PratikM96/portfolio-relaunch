# UTM tagging — mehtapratik.com

The site goal is turning a visit into a job / freelance inquiry. The useful question is
not "how many visitors" but "which channel sent someone who read a case study and reached
out." You control every link you hand out, so tag each one. Without tags, LinkedIn, your
email signature, and the resume PDF all collapse into GA4's "direct / none" bucket and
attribution is lost.

This is a **you-paste-it habit**, not site code. Nothing here changes the build. GA4
reads the five `utm_*` params off the landing URL automatically and maps them to
Session source / medium / campaign.

---

## The scheme (keep it boringly consistent)

GA4 lowercases nothing for you — pick one casing and never vary it, or `LinkedIn` and
`linkedin` become two sources. **Rule: all lowercase, hyphen-separated, no spaces.**

Params, in priority order:

| Param | Required | What it answers | Example values |
|---|---|---|---|
| `utm_source` | yes | Where the click came from (the platform/site) | `linkedin`, `resume-pdf`, `email-sig`, `behance`, `github` |
| `utm_medium` | yes | The kind of link | `profile`, `post`, `pdf`, `signature`, `bio`, `dm` |
| `utm_campaign` | when it applies | The specific push/application | `job-search-2026`, `acme-application`, `launch-announce` |
| `utm_content` | optional | A/B or which link when several point the same place | `header-cta`, `footer-link` |
| `utm_term` | skip | Paid-search keywords only. Not used here. | — |

Only `source` + `medium` are needed for the everyday links. Add `campaign` when you want
to isolate one effort (a launch post, a specific job application) from the steady drip.

---

## Ready-to-paste table

Base URL is whatever page the link should land on. Append the query string as-is.

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
| A specific job application | home or most-relevant case study | `?utm_source=application&utm_medium=direct&utm_campaign=<company>-application` |
| Launch / announcement post | home | `?utm_source=<platform>&utm_medium=post&utm_campaign=launch-announce` |

**Examples fully assembled:**

```
https://mehtapratik.com/?utm_source=linkedin&utm_medium=profile
https://mehtapratik.com/work/dealnews?utm_source=resume-pdf&utm_medium=pdf
https://mehtapratik.com/?utm_source=application&utm_medium=direct&utm_campaign=acme-application
```

---

## Rules that keep the data clean

- **Only tag inbound links you control from OFF the site.** Never put `utm_*` on an
  internal link (one mehtapratik.com page to another) — GA4 treats a tagged internal click
  as a brand-new session from that source, wrecking attribution and inflating sessions.
- **Tag the canonical host + path**: bare `mehtapratik.com`, no `www`, no trailing slash
  (matches the site's canonical + redirects, so no extra redirect hop).
- **Casing is load-bearing.** `resume-pdf` forever, never `Resume-PDF` or `resume_pdf`.
- **`utm_campaign` is for a thing with a start and end** (a job hunt, one application, a
  launch). The always-on links (LinkedIn profile, email sig) don't need a campaign.
- A shortener (bit.ly etc.) is fine for the printed resume so the raw query string isn't
  ugly in print — the redirect preserves the params. Not required.

---

## Where this shows up in GA4

After a tagged visit: **Reports → Acquisition → Traffic acquisition**, dimension
*Session source / medium*. To connect a channel to an actual inquiry, secondary-dimension
by *Session source / medium* on the `generate_lead` Key event, or build a free-form
exploration: rows = Session source / medium, values = `generate_lead` count. That answers
"which channel produced people who emailed me."

At portfolio traffic volume, read this on a **28-day rolling window** and ignore
day-to-day swings — any single week is anecdote.

---

## Related

- `docs/ga4-analytics-plan.md` — full analytics plan; the `generate_lead` (mailto) and
  `select_content` (case-study open) events that make this attribution useful are wired in
  `src/scripts/analytics.ts`.
