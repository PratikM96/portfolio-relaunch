import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collections — the typed build guardrail (Build-Spec §"Content schema").
 *
 * `work` is the canonical case-study list. The schema below is the build-spec
 * sketch extended with the structured section data both templates already use,
 * so /work/[slug] can render the SPORTIME (client) and The Ninth (concept)
 * pages identically from data. A required field that is missing or wrong-shaped
 * FAILS THE BUILD rather than shipping empty:
 *   - type 'client' MUST carry a verified headline `metric`
 *   - type 'concept' MUST carry `scope`
 * enforced by the .refine() at the bottom.
 */

// A margin-rail module — mirrors MarginRail.astro's prop union exactly.
const marginModule = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('meta'),
    label: z.string(),
    rows: z.array(z.object({ k: z.string(), v: z.string() })),
  }),
  z.object({
    type: z.literal('stat'),
    label: z.string(),
    value: z.string(),
    unit: z.string().optional(),
    desc: z.string(),
  }),
  z.object({
    type: z.literal('quote'),
    quote: z.string(),
    who: z.string(),
  }),
  z.object({
    type: z.literal('note'),
    label: z.string(),
    text: z.string(),
  }),
]);

// A prose paragraph; `lead` becomes the bold lead-in run when present.
const paragraph = z.object({ lead: z.string().optional(), text: z.string() });

// A section that pairs prose with a margin rail.
const proseSection = z.object({
  prose: z.array(paragraph),
  margin: z.array(marginModule).default([]),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z
    .object({
      // --- identity / facet (build-spec core) ---
      title: z.string(),
      slug: z.string(),
      type: z.enum(['client', 'concept']), // drives the visible facet + filtering
      role: z.string(), // rail scoreboard Role
      year: z.string(), // rail scoreboard Year
      disciplines: z.array(z.string()),
      // accepts a real URL or "" (image not yet supplied — ships as a placeholder)
      cover: z.string().url().or(z.literal('')),
      featured: z.boolean().default(false),
      description: z.string(), // <meta name="description">

      // --- hero ---
      badge: z.string(),
      lede: z.string(),
      // Non-affiliation / self-initiated disclosure, rendered PROMINENTLY in the
      // hero (right under the lede, above the scoreboard) — never a footnote.
      // REQUIRED for any concept that names a real company (e.g. The Ninth →
      // Cloud9) so the work can't read as commissioned or endorsed.
      disclosure: z.string().optional(),
      coverAlt: z.string(),
      coverCaption: z.string(),
      // Optional click-to-play hero video for the scoreboard wall. Root-relative
      // paths under /hero (served same-origin by the Worker), webm + mp4 + a
      // poster still. When present it replaces the cover image / placeholder.
      heroVideo: z
        .object({
          webm: z.string(),
          mp4: z.string(),
          poster: z.string(),
        })
        .optional(),
      hero: z.array(
        z.object({
          k: z.string(),
          v: z.string(),
          stat: z.boolean().optional(), // render v as a large proof figure (+ optional unit)
          unit: z.string().optional(),
        }),
      ),

      // --- spine sections ---
      problem: proseSection,
      system: proseSection.extend({
        steps: z.array(z.object({ ix: z.string(), title: z.string(), text: z.string() })),
      }),
      decisions: proseSection.extend({
        items: z.array(z.object({ n: z.string(), title: z.string(), text: z.string() })),
      }),
      output: z.object({
        tiles: z.array(
          z.object({
            // data-driven grid span: a 'wide' asset takes its own full-width row
            span: z.enum(['standard', 'wide']).default('standard'),
            img: z.string().url().or(z.literal('')).optional(), // "" or omitted -> placeholder tile

            alt: z.string().optional(),
            ph: z.string().optional(),
            caption: z.string(),
          }),
        ),
        note: z.string().optional(),
      }),
      reflection: proseSection,
      next: z.object({ kicker: z.string(), title: z.string(), href: z.string() }),

      // --- proof (one uniform shape for every entry; no metric vs scope split) ---
      // Every entry must carry at least one proof figure. The non-empty `figures`
      // array IS the guardrail — the build fails only if an entry has no proof.
      proof: z.object({
        figures: z
          .array(z.object({ value: z.string(), unit: z.string().optional(), label: z.string() }))
          .min(1, 'every entry needs at least one proof value'),
        note: z.object({ label: z.string(), text: z.string() }).optional(),
      }),
      // embedded demo: tabbed island linking to /concepts/[project]/
      demo: z
        .object({
          project: z.string(),
          heading: z.string(),
          foot: z.string(),
          alt: z.string().optional(),
          // each tab links to its live view under /concepts/[project]/; `featured`
          // marks the centerpiece view (shown by default).
          tabs: z.array(
            z.object({
              label: z.string(),
              cap: z.string(),
              img: z.string().url().or(z.literal('')).optional(), // preview image, supplied later
              href: z.string(),
              featured: z.boolean().optional(),
            }),
          ),
        })
        .optional(),
    }),
});

/**
 * `journal` — notes on systems, brand, and AI. Empty until launch (posts are
 * written post-launch); the index + article template render from this collection
 * so adding a markdown file under src/content/journal/ ships a new post.
 */
const journal = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    topic: z.string().optional(), // rail/meta topic line, e.g. "Brand systems · AI"
    tags: z.array(z.string()).default([]),
    readingTime: z.string().optional(), // e.g. "5 min"
    cover: z.string().url().optional(),
    coverAlt: z.string().optional(),
    pullquote: z.string().optional(), // optional margin pull-quote
    related: z.string().optional(), // optional margin "Related" note
    featured: z.boolean().default(false), // surfaces as the lead post
    draft: z.boolean().default(false),
  }),
});

export const collections = { work, journal };
