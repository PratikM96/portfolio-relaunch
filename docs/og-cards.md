# OG share cards

Branded 1200x630 Open Graph / Twitter images, one per route, served same-origin from `public/og/`. Rendered from a single parametric template so a new page or journal post is mechanical, never a hand-drawn image.

## How pages consume them
`Base.astro` owns the head. It emits `og:*` / `twitter:*` / `canonical` / `theme-color` from an `image` prop (default `/og/default.png`) resolved to an absolute URL via `Astro.site`. Each page passes its card:
- Site pages: `image="/og/<page>.png"` (`about`, `work`, `resume`, `journal`, `brand`; `default` for home/contact/404).
- Case studies (`work/[slug].astro`): `image={`/og/${d.slug}.png`}`, `ogType="article"`.
- Concept microsites (`public/concepts/**`) are raw HTML, so they hardcode `og:image`/`twitter:image` = `https://mehtapratik.com/og/<slug>.png` in their own `<head>`.

## Brand
- **One System** (warm near-black, Clash Display, JetBrains Mono, one orange accent) for the site + all non-concept case studies.
- **Own brand** for the 3 concept cards, matching each microsite: `the-ninth` = Cloud9 blue on cloud-white + Array; `level` = ink + amber + Zodiak; `wisp` = warm dark + Sentient. Driven by the template's `brand` param.

## Template
`scripts/og/og-template.html` — a standalone HTML card. Query params: `brand` (`onesystem|the-ninth|level|wisp`), `badge`, `kick` (kicker/eyebrow), `title`, `meta` (footer line), `tag` (bottom-right word). The title **auto-fits**: after the fonts load it measures itself and steps down from 92px until it fits its box, so short names sit large and long titles shrink and wrap. Tune the range in the `fit()` function (`min`/starting size). Fonts are the repo's self-hosted woff2, referenced by absolute `file://` path — adjust the base path if the repo moves.

## Regenerate / add a card
Render with headless Chrome at exactly 1200x630 (Chrome's `--screenshot` fails on paths with spaces, so render to a space-free dir, then copy into `public/og/`):

```bash
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
TPL="file:///<abs-path>/scripts/og/og-template.html"
Q="brand=onesystem&badge=JOURNAL&kick=NOTES%20ON%20SYSTEMS&title=<url-encoded-title>&meta=JOURNAL%20%C2%B7%20MEHTAPRATIK.COM&tag=One%20System"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --force-color-profile=srgb --window-size=1200,630 --virtual-time-budget=6000 \
  --screenshot="/tmp/og-out.png" "$TPL?$Q"
cp /tmp/og-out.png public/og/<name>.png
```

Percent-encode param values (space `%20`, `&` `%26`, middot `·` `%C2%B7`). Then reference the new PNG via the page's `Base` `image` prop. The site-wide generation used the same recipe looped over `src/content/work/*.md`.

## Future: build-time generation
For journal posts that change often, wire the render into the build (satori + resvg, or a small headless-render step over the content collections) so each post self-generates instead of being rendered by hand. The static committed images cover the current fixed page set.
