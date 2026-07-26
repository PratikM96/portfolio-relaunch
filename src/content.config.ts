import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
// 'astro/zod', not 'astro:content' — that re-export is deprecated and raises ts(6385) on Astro 7.
import { z } from 'astro/zod';

// Content collections. A missing or wrong-shaped required field fails the build.

// Margin-rail module — mirrors MarginRail.astro's prop union.
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

// Prose paragraph; `lead` becomes the bold lead-in run when present.
const paragraph = z.object({ lead: z.string().optional(), text: z.string() });

// Prose paired with a margin rail.
const proseSection = z.object({
  prose: z.array(paragraph),
  margin: z.array(marginModule).default([]),
});

/**
 * Output gallery — an ordered list of typed blocks, one asset family per block. A factory, not a const, because `image()` only exists inside the schema function. See docs/output-assets.md.
 */
const outputBlocks = (image: SchemaContext['image']) => {
  const still = z.object({
    img: image(), // required — a missing asset fails the build
    imgDark: image().optional(), // theme-aware pair; omit if the asset reads the same in both
    alt: z.string().optional(),
    caption: z.string().optional(),
  });
  return z.array(
    z.discriminatedUnion('kind', [
      // Mockups — full-width 16:9. `flagship` leads the section.
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
      // Flyers / stories — portrait grid. `fit: contain` + `bg: paper` suits transparent or edge-light artwork.
      z.object({
        kind: z.literal('flyer'),
        label: z.string().optional(),
        ratio: z.enum(['3:4', '9:16']).default('3:4'),
        cols: z.number().int().min(1).max(4).default(3),
        fit: z.enum(['cover', 'contain']).default('cover'),
        bg: z.enum(['surface', 'paper']).default('surface'),
        items: z.array(still),
      }),
      // Photos & single-screen web shots — landscape grid.
      z.object({
        kind: z.literal('gallery'),
        label: z.string().optional(),
        ratio: z.enum(['3:2', '4:3', '16:9', '2:1']).default('3:2'),
        cols: z.number().int().min(1).max(4).default(3),
        fit: z.enum(['cover', 'contain']).default('cover'),
        items: z.array(still),
      }),
      // Long pages (websites, tall infographics) — capped internal-scroll frames, laid out N-up. One block per family.
      z.object({
        kind: z.literal('longpage'),
        cols: z.number().int().min(1).max(3).default(2),
        height: z.number().int().default(600), // px viewport height of each frame
        chrome: z.enum(['browser', 'plain']).default('plain'),
        items: z.array(still),
      }),
      // Video — muted loop (plays in view) or audio (click-to-play).
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
  // `image()` resolves a frontmatter path to optimized ImageMetadata.
  schema: ({ image }) =>
    z
    .object({
      // --- identity / facet ---
      title: z.string(),
      slug: z.string(),
      // Engagement facet — drives the badge + filtering, and forces the `disclosure` refine below. Does not gate the proof rule.
      type: z.enum(['in-house', 'agency', 'concept']),
      role: z.string(), // rail scoreboard Role
      year: z.string(), // rail scoreboard Year
      disciplines: z.array(z.string()),
      featured: z.boolean().default(false),
      description: z.string(), // <meta name="description">

      // --- hero ---
      badge: z.string(),
      lede: z.string(),
      // Non-affiliation / self-initiated notice, rendered in the hero under the lede. Required for concepts (refine below).
      disclosure: z.string().optional(),
      // Hero-wall accessible name + caption; required when `heroVideo` is set.
      coverAlt: z.string().optional(),
      coverCaption: z.string().optional(),
      // Opts into the click-to-play hero wall, located by slug at /hero/<slug>/. See docs/hero-pipeline.md.
      heroVideo: z.boolean().default(false),
      hero: z.array(
        z.object({
          k: z.string(),
          v: z.string(),
          stat: z.boolean().optional(), // render v as a large proof figure
          unit: z.string().optional(),
          // No `accent` flag: figureRuns accents every numeral, including a unitless "100". Don't reintroduce it.
        }),
      ),

      // What Pratik owned on a case study, rendered under the hero scoreboard by ContributionBox.astro. Every row optional: omit one rather than guessing, since collaborator names are usually not in the Resume Master.
      contribution: z
        .object({
          owned: z.string().optional(),
          team: z.string().optional(),
          collaborators: z.string().optional(),
          constraints: z.string().optional(),
        })
        .optional(),

      // --- spine sections ---
      problem: proseSection,
      system: proseSection.extend({
        steps: z.array(z.object({ ix: z.string(), title: z.string(), text: z.string() })),
      }),
      decisions: proseSection.extend({
        items: z.array(z.object({ n: z.string(), title: z.string(), text: z.string() })),
      }),
      // Optional — an entry with no output drops the §Output section and its rail entry. See docs/output-assets.md.
      output: z
        .object({
          blocks: outputBlocks(image).optional(),
          note: z.string().optional(),
        })
        .optional(),
      reflection: proseSection,
      // No `next` field — the footer's next-case link is computed from the /work page order in [slug].astro. Don't reintroduce it.

      // Opt-in: renders PerfTable.astro (src/data/portfolio-perf.json) inside §Proof. Bespoke to the portfolio-system entry; off for every other.
      perfTable: z.boolean().default(false),

      // --- proof (one uniform shape for every entry) ---
      proof: z.object({
        figures: z
          .array(z.object({ value: z.string(), unit: z.string().optional(), label: z.string() }))
          .min(1, 'every entry needs at least one proof value'),
        note: z.object({ label: z.string(), text: z.string() }).optional(),
      }),
      // Embedded demo: tabbed island linking to /concepts/[project]/.
      demo: z
        .object({
          project: z.string(),
          heading: z.string(),
          foot: z.string(),
          tabs: z.array(
            z.object({
              label: z.string(),
              cap: z.string(),
              // The microsite route segment. Both the link (/concepts/<project>/<view>) and the still (src/assets/concepts/<project>/preview-<view>.webp) derive from it. scripts/check/claims.mjs fails the build on a missing still; EmbeddedDemo's own throw does not, so don't rely on it.
              view: z.string(),
              featured: z.boolean().optional(), // the centerpiece view, shown by default
            }),
          ),
        })
        .optional(),
    })
    // A concept's disclosure can never be silently dropped.
    .refine(
      (d) => d.type !== 'concept' || (typeof d.disclosure === 'string' && d.disclosure.trim().length > 0),
      { message: 'concept entries must carry a non-empty `disclosure`', path: ['disclosure'] },
    )
    // A hero wall needs both an accessible name and a caption.
    .refine((d) => !d.heroVideo || (!!d.coverAlt?.trim() && !!d.coverCaption?.trim()), {
      message: '`heroVideo: true` requires both `coverAlt` and `coverCaption`',
      path: ['coverAlt'],
    }),
});

// Journal. A markdown file under src/content/journal/ ships a new post.
const journal = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    topic: z.string().optional(), // rail/meta topic line, e.g. "Brand systems / AI"
    tags: z.array(z.string()).default([]),
    readingTime: z.string().optional(), // e.g. "5 min"
    pullquote: z.string().optional(), // optional margin pull-quote
    featured: z.boolean().default(false), // surfaces as the lead post
    draft: z.boolean().default(false),
  }),
});

export const collections = { work, journal };
