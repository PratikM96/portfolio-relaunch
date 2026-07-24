/**
 * Collection ordering + the small readers every page shares. The `work` order
 * in particular has to be one function: /work renders the index in it and
 * /work/[slug] walks it for the footer "next" link, so two copies would drift
 * and the footer would start lying about what comes next.
 */
import type { CollectionEntry } from 'astro:content';

/** Index order: featured first, then alphabetical. */
export function sortWork(entries: CollectionEntry<'work'>[]): CollectionEntry<'work'>[] {
  return [...entries].sort((a, b) => {
    if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1;
    return a.data.title.localeCompare(b.data.title);
  });
}

/** Published posts, newest first. Drafts never ship. */
export function publishedJournal(posts: CollectionEntry<'journal'>[]): CollectionEntry<'journal'>[] {
  return posts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * The one display date format. UTC because `z.coerce.date()` parses a
 * YYYY-MM-DD frontmatter date as UTC midnight — read it in a western timezone
 * without this and every post shows the day before.
 */
export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** First year of a `year` field, which may be a range like "2023-2024". */
export const firstYear = (year: string): string => year.match(/\d{4}/g)?.[0] ?? year;

/** True when a `year` field names more than one year. */
export const isYearRange = (year: string): boolean => (year.match(/\d{4}/g)?.length ?? 0) > 1;
