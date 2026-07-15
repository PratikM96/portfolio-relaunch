/**
 * The work `type` facet — one source of truth for its labels.
 *
 * The facet describes the ENGAGEMENT, not the discipline: was this a role held
 * inside the org (`in-house`), a role at an agency whose clients were other
 * companies (`agency`), or self-initiated concept work (`concept`)?
 *
 * It replaced a binary `client | concept` split, which was inaccurate: every
 * non-concept entry is a position Pratik held (full-time, internship, or
 * volunteer) — none were client engagements, and at RAA / Agency FiveEighty the
 * clients were the agency's, not his. Employment type (Internship, Volunteer)
 * is disclosed in the scoreboard `role` field, not here.
 *
 * `concept` is locked by the masters (positioning.md: concept work is never
 * framed as client or freelance) and still drives the proof rule — concepts
 * carry scope only, never performance results.
 */
export type WorkType = 'in-house' | 'agency' | 'concept';

/** Filter-button + row-facet label. */
export const TYPE_LABEL: Record<WorkType, string> = {
  'in-house': 'In-house',
  agency: 'Agency',
  concept: 'Concept',
};

/** Case-study rail scoreboard: concepts carry the self-initiated disclosure. */
export const TYPE_SCOREBOARD: Record<WorkType, string> = {
  'in-house': 'In-house',
  agency: 'Agency',
  concept: 'Concept · self-initiated',
};

/** Real work carries the signal accent; concept scope never does (CLAUDE.md). */
export const isConceptType = (t: WorkType) => t === 'concept';
