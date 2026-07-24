/**
 * JSON-LD helpers. Base.astro emits a site-wide Person + WebSite graph and
 * merges each page's extra nodes into it, so a page node references those two
 * by @id rather than restating them. These keep the ids in one place.
 */

/** Absolute origin. Astro.site is the production domain even in a local build. */
export const siteOrigin = (site: URL | undefined): string =>
  site ? site.origin : 'https://mehtapratik.com';

/** Reference to the site-wide Person node in Base's graph. */
export const personRef = (origin: string) => ({ '@id': `${origin}/#pratik` });

/** Reference to the site-wide WebSite node in Base's graph. */
export const websiteRef = (origin: string) => ({ '@id': `${origin}/#website` });

/**
 * A breadcrumb trail. The last crumb is the current page, so it carries a name
 * with no `item` — Google treats a self-link as redundant.
 */
export const breadcrumb = (origin: string, crumbs: { name: string; path?: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    ...(c.path === undefined ? {} : { item: `${origin}${c.path}` }),
  })),
});
