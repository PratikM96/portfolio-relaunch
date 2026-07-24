import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
// `z` is imported from 'astro/zod', not 'astro:content': Astro deprecated the
// `astro:content` re-export ("TODO: remove in Astro 7" in astro's source) and
// on 7.x every z.* call raised ts(6385) 'z' is deprecated in `astro check`.
// 'astro/zod' is the same zod v4 instance Astro's generated types reference.
import { z } from 'astro/zod';

/**
 * Content collections — the typed build guardrail (Build-Spec §"Content schema").
 *
 * `work` is the canonical case-study list. The schema below is the build-spec
 * sketch extended with the structured section data both templates already use,
 * so /work/[slug] can render SPORTIME (in-house) and The Ninth (concept)
 * pages identically from data. A required field that is missing or wrong-shaped
 * FAILS THE BUILD rather than shipping empty:
 *   - every entry MUST carry at least one proof figure (proof.figures.min(1))
 *   - type 'concept' MUST carry a non-empty `disclosure` (self-initiated /
 *     non-affiliation label), enforced by the .refine() at the bottom so the
 *     labeling can never be omitted.
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

/**
 * Output blocks — the typed case-study output gallery. The section is an ORDERED
 * list of blocks; each block is one asset family rendered by its own rule, so a
 * 1:1 social grid, a 16:9 mockup, and a tall scrolling website never share one
 * cropped grid. A factory (not a const) because the still `img` uses Astro's
 * `image()` helper, which only exists inside the schema function. Video is
 * convention-located by slug (no paths in content):
 * /ov/<case-slug>/<clip>.webm + <clip>-poster.webp. See docs/output-assets.md.
 */
const outputBlocks = (image: SchemaContext['image']) => {
  // Required `img` is the guardrail: an output block with a missing asset fails
  // the build rather than shipping an empty frame.
  const still = z.object({
    img: image(), // optimized local asset (light/base)
    // Optional dark-theme sibling. When present the still is theme-aware: `img`
    // shows in light, `imgDark` in dark (mockups mainly — they carry a themed
    // background). Omit for assets that read the same in both themes.
    imgDark: image().optional(),
    alt: z.string().optional(),
    caption: z.string().optional(),
  });
  return z.array(
    z.discriminatedUnion('kind', [
      // Mockups / flagship — full-width 16:9. `flagship` leads the section.
      z.object({
        kind: z.literal('mockup'),
        flagship: z.boolean().default(false),
        items: z.array(still),
      }),
      // Social posts — square, shown whole (never cropped).
      z.object({
        kind: z.literal('social'),
        label: z.string().optional(),
        cols: z.number().int().min(2).max(4).default(3),
        items: z.array(still),
      }),
      // Flyers / stories — portrait grid. `fit: contain` + `bg: paper` shows a
      // whole document on a paper card (for transparent/edge-light artwork).
      z.object({
        kind: z.literal('flyer'),
        label: z.string().optional(),
        ratio: z.enum(['3:4', '9:16']).default('3:4'),
        cols: z.number().int().min(1).max(4).default(3),
        fit: z.enum(['cover', 'contain']).default('cover'),
        bg: z.enum(['surface', 'paper']).default('surface'),
        items: z.array(still),
      }),
      // Photos & single-screen web shots — landscape grid. `fit: contain`
      // shows a whole landscape artwork (e.g. an infographic) without cropping.
      z.object({
        kind: z.literal('gallery'),
        label: z.string().optional(),
        ratio: z.enum(['3:2', '4:3', '16:9', '2:1']).default('3:2'),
        cols: z.number().int().min(1).max(4).default(3),
        fit: z.enum(['cover', 'contain']).default('cover'),
        items: z.array(still),
      }),
      // Long pages (websites, tall infographics) — capped internal-scroll frames,
      // laid out N-up so tall/narrow assets aren't stretched full width. One block
      // per family: e.g. websites at `cols: 2`, infographics at `cols: 3`. `chrome`
      // is a block default (all frames in a block are the same family) with an
      // optional per-item override.
      z.object({
        kind: z.literal('longpage'),
        cols: z.number().int().min(1).max(3).default(2),
        height: z.number().int().default(600), // px viewport height of each frame
        chrome: z.enum(['browser', 'plain']).default('plain'),
        items: z.array(still),
      }),
      // Video — muted loop (plays in view) or audio (click-to-play). Slug-located.
      z.object({
        kind: z.literal('video'),
        audio: z.boolean().default(false), // block default; per-item `audio` overrides
        ratio: z.enum(['16:9', '1:1']).default('16:9'),
        cols: z.number().int().min(1).max(3).default(1),
        items: z.array(
          z.object({
            clip: z.string(), // /ov/<case-slug>/<clip>.webm + <clip>-poster.webp
            audio: z.boolean().optional(), // overrides the block default for this clip
            alt: z.string().optional(),
            caption: z.string().optional(),
          }),
        ),
      }),
    ]),
  );
};

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  // `image()` (Astro's content-image helper) lets a frontmatter path resolve to
  // an optimized ImageMetadata (build-time webp, responsive widths, intrinsic
  // dims). Output stills use it so real assets never ship unoptimized. See
  // docs/output-assets.md.
  schema: ({ image }) =>
    z
    .object({
      // --- identity / facet (build-spec core) ---
      title: z.string(),
      slug: z.string(),
      // Engagement facet — drives the visible badge + filtering, and gates the
      // proof rule (concept = scope only, never results). See src/lib/work-type.ts
      // for why this is not `client`: every non-concept entry is a role held, not
      // a client engagement.
      type: z.enum(['in-house', 'agency', 'concept']),
      role: z.string(), // rail scoreboard Role
      year: z.string(), // rail scoreboard Year
      disciplines: z.array(z.string()),
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
      // Accessible name + caption for the hero wall. Rendered ONLY when
      // `heroVideo` is set (coverAlt becomes the <video> aria-label), so they
      // are optional here and required by the refine below when it is.
      coverAlt: z.string().optional(),
      coverCaption: z.string().optional(),
      // Opts this entry into a click-to-play hero wall. Files are located by
      // slug at /hero/<slug>/{hero_1080.webm,poster.webp}; the template derives
      // the paths. Without it the entry renders no hero wall at all.
      // See docs/hero-pipeline.md.
      heroVideo: z.boolean().default(false),
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
      // Output gallery: the typed `blocks` model (one asset family per block,
      // each rendered by its own rule). The whole section is OPTIONAL — an entry
      // with no output (e.g. frc, whose only asset is its hero film) omits it and
      // the template drops the §Output section + rail entry.
      // See docs/output-assets.md.
      output: z
        .object({
          blocks: outputBlocks(image).optional(),
          note: z.string().optional(),
        })
        .optional(),
      reflection: proseSection,
      // (No `next` field: the footer's next-case link is computed from the /work
      // page order in [slug].astro, not authored per entry. A required `next`
      // block used to sit here, unread by any template, quietly holding stale
      // "Next case study · Client" labels. Don't reintroduce it.)

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
          // each tab links to its live view under /concepts/[project]/; `featured`
          // marks the centerpiece view (shown by default).
          tabs: z.array(
            z.object({
              label: z.string(),
              cap: z.string(),
              img: z.string(), // /concepts/<slug>/preview-<view>.webp (root-relative, same-origin)
              href: z.string(),
              featured: z.boolean().optional(),
            }),
          ),
        })
        .optional(),
    })
    // Concept work must always carry its self-initiated / non-affiliation
    // disclosure. Making it required for type 'concept' means the labeling can
    // never be silently dropped from a concept case study.
    .refine(
      (d) => d.type !== 'concept' || (typeof d.disclosure === 'string' && d.disclosure.trim().length > 0),
      { message: 'concept entries must carry a non-empty `disclosure`', path: ['disclosure'] },
    )
    // A hero wall renders both an accessible name and a caption, so an entry
    // opting into one must supply both. Entries without heroVideo render no wall
    // and must not carry orphaned cover copy.
    .refine((d) => !d.heroVideo || (!!d.coverAlt?.trim() && !!d.coverCaption?.trim()), {
      message: '`heroVideo: true` requires both `coverAlt` and `coverCaption`',
      path: ['coverAlt'],
    }),
});

/**
 * `journal` — notes on systems, brand, and AI. The index + article template render
 * from this collection, so adding a markdown file under src/content/journal/ ships
 * a new post.
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
    pullquote: z.string().optional(), // optional margin pull-quote
    featured: z.boolean().default(false), // surfaces as the lead post
    draft: z.boolean().default(false),
  }),
});

export const collections = { work, journal };
