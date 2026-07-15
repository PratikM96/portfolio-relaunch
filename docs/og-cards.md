# OG share cards

Branded 1200x630 Open Graph / Twitter images, one per route, served same-origin from `public/og/`. Rendered from a single parametric template so a new page or journal post is mechanical, never a hand-drawn image.

## How pages consume them
`Base.astro` owns the head. It emits `og:*` / `twitter:*` / `canonical` / `theme-color` from an `image` prop (default `/og/default.png`) resolved to an absolute URL via `Astro.site`. Each page passes its card:
- Site pages: `image="/og/<page>.png"` (`about`, `work`, `resume`, `journal`, `brand`; `default` for home/contact/404).
- Case studies (`work/[slug].astro`): `image={`/og/${d.slug}.png`}`, `ogType="article"`.
- Concept microsites (`public/concepts/**`) are raw HTML, so they hardcode `og:image`/`twitter:image` = `https://mehtapratik.com/og/<slug>.png` in their own `<head>`.

## Brand
- **One System** (warm near-black, Clash Display, JetBrains Mono, one orange accent) for the site + all non-concept case studies. Follows the site type scale: title = `display`, wordmark = `h2`, badge/kick/meta = `label`.
- **Own brand** for the 3 concept cards, matching each microsite. The concept overrides the display face only: the wordmark stays Clash Display (it is Pratik's mark, constant across every card) and the system layer stays JetBrains Mono: `the-ninth` = Cloud9 blue on cloud-white + Array; `level` = ink + amber + Zodiak; `wisp` = warm dark + Sentient. Driven by the template's `brand` param.

## Template
`scripts/og/og-template.html` — a standalone HTML card. Query params: `brand` (`onesystem|the-ninth|level|wisp`), `badge`, `kick` (kicker/eyebrow), `title`, `meta` (footer line), `tag` (bottom-right word). The title **auto-fits**: after the fonts load it measures itself and steps down from 92px until it fits its box, so short names sit large and long titles shrink and wrap. Tune the range in the `fit()` function (`min`/starting size).

Fonts are the repo's self-hosted woff2, referenced by paths **relative to the template** (`../../public/fonts/…`). Keep them relative: an absolute `file:///C:/Users/…` path silently falls back to system fonts the moment the repo moves or another machine renders a card, and a card rendered in the wrong font looks fine until you compare it to the site.

## Render
`scripts/og/render-cards.mjs` **is** the record of what every card is made of. Case-study params derive from `src/content/work/*.md` (title, type, disciplines), so they can't drift from the site; only the six fixed site pages are listed by hand, in that file's `SITE` array.

```bash
node scripts/og/render-cards.mjs            # all 17
node scripts/og/render-cards.mjs dealnews   # one, by output name
```

Anything that changes every card — a font swap, a token change, the `client` → `in-house` relabel — is now one command. It needs Chrome (paths at the top of the script) and renders at exactly 1200x630 into `public/og/`.

**Adding a card:** a case study needs nothing, it derives from its entry. A new site page gets a line in `SITE`, then reference the PNG via the page's `Base` `image` prop.

*(Until 2026-07-15 the params were typed at the command line and never recorded, so the set couldn't be regenerated without reverse-engineering 17 PNGs. That is why the cards still read "CASE STUDY · CLIENT" long after the facet was renamed — the fix existed, but nobody could afford to re-run it.)*

## Future: build-time generation
Wiring the render into the build (satori + resvg, or a headless step over the content collections) would let journal posts self-generate instead of needing the script run. The script closes the reproducibility gap; this would close the "remember to run it" gap.
