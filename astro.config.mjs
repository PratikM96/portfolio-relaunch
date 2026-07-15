// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';

// One System portfolio. The cutover is done: this repo IS mehtapratik.com, and
// `npm run deploy` publishes straight to it — there is no staging worker in the
// loop. Validate on `npm run build` / `npm run preview` first. See docs/deploy.md.
// Pages are static by default (portfolio content). The Cloudflare adapter
// stays wired for Worker deployment (build/preview) and lets any future page
// opt into SSR with `export const prerender = false`.
//
// The adapter is intentionally NOT applied during `astro dev`: Astro 7's dev
// server runs requests through the Cloudflare workerd sandbox, whose runtime
// lacks Node's `process` global, which crashes Astro's JSON logger and turns
// every page into a 500. Dev needs none of the adapter's Worker bindings, so
// dev uses the standard Node Vite server.
const isDev = process.argv.includes('dev');

const SITE = 'https://mehtapratik.com';

// Concept microsites are static passthrough HTML in public/concepts/, not Astro
// routes, so @astrojs/sitemap can't discover them from the route table. List the
// live hub + view URLs here so they still land in the sitemap. Keep in sync with
// public/concepts/<slug>/*.html.
const conceptPages = [
  'concepts/level/',
  'concepts/level/explainer',
  'concepts/level/app',
  'concepts/level/motion',
  'concepts/level/brand',
  'concepts/the-ninth/',
  'concepts/the-ninth/clipper',
  'concepts/the-ninth/app',
  'concepts/the-ninth/broadcast',
  'concepts/the-ninth/social',
  'concepts/the-ninth/brand',
  'concepts/wisp/',
  'concepts/wisp/demo',
  'concepts/wisp/brand',
].map((p) => `${SITE}/${p}`);

// One shared lastmod = this build's date (i.e. the deploy that ships the URL).
const LASTMOD = new Date().toISOString();

// Per-route priority + changefreq, keyed by normalized pathname. Mirrors the
// old hand-authored sitemap's weighting: home 1.0, top pages 0.8, case studies
// 0.7, journal posts 0.6, concept views 0.5, privacy 0.3.
/** @param {string} rawPath */
function routeMeta(rawPath) {
  const p = rawPath !== '/' ? rawPath.replace(/\/$/, '') : '/';
  if (p === '/') return { priority: 1.0, changefreq: ChangeFreqEnum.MONTHLY };
  if (p === '/journal') return { priority: 0.8, changefreq: ChangeFreqEnum.WEEKLY };
  if (p === '/privacy') return { priority: 0.3, changefreq: ChangeFreqEnum.YEARLY };
  if (p.startsWith('/journal/')) return { priority: 0.6, changefreq: ChangeFreqEnum.YEARLY };
  if (p.startsWith('/work/')) return { priority: 0.7, changefreq: ChangeFreqEnum.MONTHLY };
  if (p.startsWith('/concepts/')) return { priority: 0.5, changefreq: ChangeFreqEnum.MONTHLY };
  // about, brand, contact, resume, and the /work + /journal index roots.
  return { priority: 0.8, changefreq: ChangeFreqEnum.MONTHLY };
}

export default defineConfig({
  output: 'static',
  // No-trailing-slash canonical URLs, sitewide. Default (directory format ->
  // /foo/index.html) made Cloudflare 307-redirect /foo -> /foo/, so every link
  // shared without a slash (the common case) ate a round-trip (~800ms on
  // mobile). 'file' format emits /foo.html, which Cloudflare's default
  // html_handling serves directly at /foo (200) and redirects /foo/ -> /foo.
  // Internal links + canonical + sitemap all follow trailingSlash. (The concept
  // microsites in public/ stay folder-based/slash-canonical — unaffected.)
  trailingSlash: 'never',
  // Canonical production URL. mehtapratik.com now serves this build, so canonical
  // links and the sitemap describe that domain.
  site: SITE,
  // @astrojs/sitemap reads `site` and emits /sitemap-index.xml + /sitemap-0.xml.
  // customPages injects the non-Astro concept microsites; filter drops the 404
  // page and the RSS endpoint; serialize applies per-route priority + lastmod.
  integrations: [
    sitemap({
      customPages: conceptPages,
      filter: (page) => !/\/(?:404|rss\.xml)\/?$/.test(page),
      serialize(item) {
        const { priority, changefreq } = routeMeta(new URL(item.url).pathname);
        return { url: item.url, changefreq, priority, lastmod: LASTMOD };
      },
    }),
  ],
  // imageService: 'compile' = optimize images with Sharp at BUILD time for the
  // prerendered (static) pages, instead of the adapter's passthrough default.
  // Safe here because every page is static; no Sharp runs in the Worker.
  adapter: isDev ? undefined : cloudflare({ imageService: 'compile' }),
  // Inline ALL page CSS into <style> instead of separate /_astro/*.css links.
  // Total CSS is tiny (~11 KB across Base/index/WorkIndex) but the three
  // stylesheets were render-blocking (~490 ms on mobile). 'always' folds them
  // into the HTML so first paint has no CSS round-trip. Safe under the enforced
  // CSP (style-src allows 'unsafe-inline').
  build: { inlineStylesheets: 'always', format: 'file' },
});
