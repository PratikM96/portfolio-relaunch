# Deploy — mehtapratik.com (One System)

How to publish this site to Cloudflare.

## Read this first

**`npm run deploy` ships to the live domain.** The cutover is done: the
`portfolio-relaunch` worker serves `mehtapratik.com`, and the old hand-edited
site and its separate worker are retired. There is no staging URL in the loop
anymore — a deploy is immediately public.

(Historically this doc described a pre-cutover flow where `npm run deploy` went
to a private `*.workers.dev` test URL and the real domain kept serving the old
site until a manual dashboard step. That is no longer true. Do not follow the old
"it's safe, nothing is live until Part 5" reasoning.)

Deploys are manual. A push to `main` is **not** an auto-deploy, so pushing code
and shipping it are separate acts.

## Prerequisites

- Node + npm.
- `wrangler` is a dev dependency (`npm install` pulls it in).
- Logged in once per machine:

```powershell
npx wrangler login
```

Authorize in the browser tab that opens; the terminal prints
`Successfully logged in.`

## Validate before you ship

Because the next step is public, prove the build locally first:

```powershell
npm run build      # runs astro check && astro build
npm run preview    # serve the built output
```

Check on the preview build:

- Home, Work, each case study, About, Journal, Resume, Contact.
- Concept demos (The Ninth / Level / WISP) **and their sub-pages** — these clean
  URLs resolve in preview and production but **not** under `npm run dev`, so
  preview is the only local place to catch a broken concept route.
- Light/dark toggle, mobile layout.

## Deploy

```powershell
npm run deploy
```

This runs `astro check && astro build`, deletes the adapter's generated redirect
file (`.wrangler/deploy/config.json`) so wrangler reads the clean
`wrangler.jsonc`, then runs `wrangler deploy`. On success the site is live at
`mehtapratik.com`.

The redirect deletion is the load-bearing part: skip it and wrangler deploys the
adapter's generated config, which carries the wrong worker name and a stray
SESSION KV binding.

## Manual deploy (bypassing the npm script)

```powershell
npm run build
Remove-Item .wrangler/deploy/config.json   # bash: rm .wrangler/deploy/config.json
npx wrangler deploy
```

## Rollback

Cloudflare dashboard → **Workers & Pages** → the **`portfolio-relaunch`** worker
→ **Deployments** → pick a previous version → **Rollback**.

## What governs the live domain

- `public/_redirects` — old-URL 301s. Redirect *sources* need explicit
  trailing-slash twins (both `/foo` and `/foo/`); the Worker only normalizes
  trailing slashes for real pages, not redirect sources.
- `public/robots.txt`
- `public/_headers` — security headers, including the **enforced** CSP. A new
  external origin that isn't in the allowlist fails silently in the browser.
- the generated `sitemap-index.xml`
