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
 * framed as client or freelance) and always carries a non-affiliation
 * `disclosure`. It does NOT gate the proof rule: a concept follows the same
 * case-study rules as real work. Design-only concepts carry scope because they
 * have no outcomes; a shipped concept (Portfolio System) may carry real measured
 * results and the accent, same as any entry. See CLAUDE.md §3.
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

/** True for self-initiated concept work. Used for the disclosure + page title,
 *  NOT to gate the accent — measured results earn it regardless of type. */
export const isConceptType = (t: WorkType) => t === 'concept';

/** One item in the case-study rail's section-index nav (also drives scroll-spy). */
export type RailSection = { ix: string; label: string; href: string };

/**
 * One line of the case-study rail scoreboard. `accent` marks a value for the
 * signal colour. The rail Type line now accents for every entry (concepts
 * included) — the accent is not gated on engagement type. See CLAUDE.md §3.
 */
export type ScoreLine = { k: string; v: string; accent?: boolean };
