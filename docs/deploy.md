# Deploy — mehtapratik.com (One System relaunch)

Step-by-step for publishing the new Astro site to Cloudflare. Written for a
first-time deploy. Nothing here can break the live site until **Part 5**, which
is a manual step you take in the Cloudflare dashboard.

## The mental model

Two separate websites are involved:

- **Old site** — what visitors see at `mehtapratik.com` today. Runs on a
  different Cloudflare worker. You do not touch it.
- **New site** (this repo) — publishes to a private `*.workers.dev` **test URL**
  first. The real domain keeps serving the old site until *you personally* add
  the custom domain in the dashboard (Part 5).

The `deploy` worker is named **`portfolio-relaunch`**, deliberately different
from the old production worker, so a deploy can never overwrite what's live.

## Prerequisites (already done, listed for completeness)

- Node + npm (the project already builds).
- `wrangler` is a dev dependency (`npm install` pulls it in).
- A Cloudflare account — the same one that runs the old site.

No KV namespace, no Pages project, no extra services. This is a purely static
site served as Cloudflare Workers Static Assets (Pages was folded into Workers).

## Part 1 — Terminal in the project folder

```powershell
cd "C:\Users\Pratik Mehta\Documents\Projects\mehtapratik-site"
```

(Use the `portfolio-relaunch` path if you renamed the local folder.)

## Part 2 — Log in to Cloudflare (one time)

```powershell
npx wrangler login
```

Authorize in the browser tab that opens. **Use the same Cloudflare account as
the old site.** Terminal shows `Successfully logged in.` Only needed once per
machine.

## Part 3 — Publish to the test URL

```powershell
npm run deploy
```

This runs `astro check && astro build`, deletes the adapter's redirect file
(`.wrangler/deploy/config.json`) so wrangler uses the clean `wrangler.jsonc`
instead of the auto-generated config, then runs `wrangler deploy`. On success it
prints a URL like:

```
https://portfolio-relaunch.<your-subdomain>.workers.dev
```

That URL is a live-but-private **test site** — a different website from your
domain, so deploying here is safe. Re-run `npm run deploy` anytime to update it.

## Part 4 — Test everything on the workers.dev URL

- Home, Work, each case study, About, Journal.
- Concept demos (The Ninth / Level / WISP) **and their sub-pages** — these clean
  URLs only resolve in production/preview, not the local `npm run dev` server,
  so this is the first real test of them.
- Light/dark toggle, mobile.

Fix, then `npm run deploy` again. Same test URL every time.

## Part 5 — Go live (manual cutover, when proven)

In the Cloudflare dashboard:

1. **Workers & Pages** → open the **`portfolio-relaunch`** worker.
2. **Settings** → **Domains & Routes** → **Add** → **Custom Domain**.
3. Enter **`mehtapratik.com`** and confirm.

Cloudflare provisions the cert and repoints DNS. Within ~1-2 minutes the domain
serves the new site. The old worker stays intact; you've only moved the domain.

## Part 6 — Rollback

- **Before cutover:** nothing to undo — the domain is still on the old worker.
- **After cutover:** worker → **Deployments** → pick a previous version →
  **Rollback**. Or move the custom domain back to the old worker.

## Manual deploy (if you ever bypass the npm script)

```powershell
npm run build
rm .wrangler/deploy/config.json   # PowerShell: Remove-Item .wrangler/deploy/config.json
npx wrangler deploy
```

The redirect deletion is the important part: skip it and wrangler deploys the
adapter's generated config, which has the wrong worker name and a stray SESSION
KV binding.
