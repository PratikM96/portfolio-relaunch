// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// One System portfolio — deploys to the STAGING Cloudflare Worker only.
// The live domain (mehtapratik.com) is served by the OLD deployment; never target it here.
// Pages are static by default (portfolio content). The Cloudflare adapter
// stays wired for Worker deployment (build/preview) and lets any future page
// opt into SSR with `export const prerender = false`.
//
// The adapter is intentionally NOT applied during `astro dev`: Astro 7's dev
// server runs requests through the Cloudflare workerd sandbox, whose runtime
// lacks Node's `process` global, which crashes Astro's JSON logger and turns
// every page into a 500. Dev needs none of the adapter's Worker bindings (R2
// is read over plain CDN URLs), so dev uses the standard Node Vite server.
const isDev = process.argv.includes('dev');

export default defineConfig({
  output: 'static',
  adapter: isDev ? undefined : cloudflare(),
});
