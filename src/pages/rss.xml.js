// Journal RSS feed → /rss.xml. Prerendered at build over the journal collection.
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('journal')).filter((p) => !p.data.draft);
  return rss({
    title: 'Pratik Mehta · Journal',
    description: 'Notes on building creative as a system, what makes work distinctive, and where AI changes the job.',
    site: context.site,
    // @astrojs/rss appends a trailing slash unless told not to, and the slash
    // form costs a Cloudflare 301 (astro.config sets trailingSlash 'never').
    trailingSlash: false,
    items: posts
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((p) => ({
        title: p.data.title,
        description: p.data.excerpt,
        pubDate: p.data.date,
        // No trailing slash — see above.
        link: `/journal/${p.id}`,
      })),
    customData: `<language>en-us</language>`,
  });
}
