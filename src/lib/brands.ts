/**
 * Brands and organizations the work ran for or through. One source of truth for the grouped list on /work and the chip cluster on home.
 *
 * NEVER label these "clients" and never flatten the grouping: at the agencies they were the AGENCY's clients, and the grouping is the only thing carrying that. Names only, no years or outcomes. Years live in the Resume Master's roster table, which is the narrative source for this file. See CLAUDE.md §8.
 */
import type { WorkType } from './work-type';

/** `direct` is work commissioned straight by the org rather than held through a role, so it is not a work-collection engagement type. Never "freelance": the masters bar that frame. */
export type BrandGroupType = WorkType | 'direct';

export type BrandGroup = {
  /** Work-collection slug where a case study exists, otherwise a bare key. */
  key: string;
  label: string;
  type: BrandGroupType;
  /** Case study. Omitted for groups with no entry in the collection. */
  href?: string;
  /** Empty where the role had no separate brands under it. The row still renders, with nothing after the leader. */
  brands: string[];
};

/** In `sortWork` order, so the section reads in the same sequence as the index above it. A year is part of the name only where the engagement was a dated event. */
export const BRAND_GROUPS: BrandGroup[] = [
  {
    key: 'sportime-clubs',
    label: 'SPORTIME Clubs',
    type: 'in-house',
    href: '/work/sportime-clubs',
    brands: ['John McEnroe Tennis Academy', 'Johnny Mac Tennis Project', 'SPORTIME Pickleball', 'SPORTIME Volleyball'],
  },
  { key: 'dealnews', label: 'DealNews', type: 'in-house', href: '/work/dealnews', brands: [] },
  {
    key: 'frc',
    label: 'The Forest Road Company',
    type: 'in-house',
    href: '/work/frc',
    brands: ['Yuga Labs', 'Candle Media', 'Notables Marketplace', 'Dame Products', 'Morpho Energy'],
  },
  {
    key: 'raa',
    label: 'Richard Attias & Associates',
    type: 'agency',
    href: '/work/raa',
    brands: ['Bloomberg NEF 2019', 'FII Institute 2019', 'African Games 2019', 'Peace to Prosperity Workshop 2019'],
  },
  {
    key: 'agency-fiveeighty',
    label: 'Agency FiveEighty',
    type: 'agency',
    href: '/work/agency-fiveeighty',
    // Coca-Cola is deliberately here. It is absent from the source list Pratik supplied but named in the Resume Master and already published in `agency-fiveeighty.md` and /resume, so dropping it would put the site out of step with the master.
    brands: ['Spectrum', 'New York Jets', 'Coca-Cola', 'FISLL', 'Corona Extra', "Sticky's Finger Joint", 'HFactor Water', 'Solv Wellness'],
  },
  { key: 'pipeline-medical', label: 'Pipeline Medical', type: 'in-house', href: '/work/pipeline-medical', brands: [] },
  { key: 'sr-love-and-care', label: 'SR Love and Care', type: 'in-house', href: '/work/sr-love-and-care', brands: [] },
  { key: 'kumon', label: 'Kumon', type: 'in-house', brands: [] },
  // Commissioned directly, never "freelance". Deliberately NOT named after the Apr 2024 practice: these predate it (Ventura 2015, SQUIP 2016), and borrowing the role's name would date the role to 2014. SR Mission Dharampur is SR Love and Care's sister organization, engaged directly rather than through that role.
  { key: 'direct', label: 'Direct engagements', type: 'direct', brands: ['Ventura Air Services', 'SQUIP', 'SR Mission Dharampur'] },
];

/**
 * The home chip strip: the most recognizable names only, since home curates and /work lists. Long names are out on width alone rather than merit, because one that dominates a row costs two others.
 *
 * Hand-ordered so no two adjacent chips share a group, which stops the strip reading as a run of employers. Never shuffled at build, which would rewrite the markup every time, and the CSS trims from the end, so keep the order trim-safe.
 */
export const HOME_CHIPS: string[] = [
  'Coca-Cola',
  'Bloomberg NEF 2019',
  'Yuga Labs',
  'New York Jets',
  'FII Institute 2019',
  'Candle Media',
  'Spectrum',
  'SPORTIME Clubs',
];

const ALL_BRAND_NAMES = BRAND_GROUPS.flatMap((g) => g.brands);

/**
 * Dev-time signal only. These throws kill the pages that import this file but do NOT fail `astro build`, which exits 0 with a zero-byte index.html, so `scripts/check/claims.mjs` re-runs both and is the actual build gate. Change one, change the other.
 */
const CHIP_NAMES = new Set([...ALL_BRAND_NAMES, ...BRAND_GROUPS.map((g) => g.label)]);
for (const name of HOME_CHIPS) {
  if (!CHIP_NAMES.has(name)) throw new Error(`HOME_CHIPS names "${name}", which is not in BRAND_GROUPS`);
}

/** Guards the published "30+", excluding `direct`, which is a category header and not an organization. The count is NEVER rendered: a figure more precise than the registry's public wording is wrong. */
const ORG_COUNT = BRAND_GROUPS.filter((g) => g.type !== 'direct').length + ALL_BRAND_NAMES.length;
if (ORG_COUNT < 30) {
  throw new Error(`BRAND_GROUPS carries ${ORG_COUNT} organizations, which no longer supports the published "30+". Update the Claim Registry first.`);
}
