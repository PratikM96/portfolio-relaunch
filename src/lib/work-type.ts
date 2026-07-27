/**
 * The work `type` facet — one source of truth for its labels. It describes the ENGAGEMENT, not the discipline: a role held inside the org (`in-house`), a role at an agency (`agency`), or self-initiated work (`concept`). Never "client" — no entry was a client engagement. See CLAUDE.md §3.
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
  concept: 'Concept / self-initiated',
};

/** One item in the case-study rail's section-index nav (also drives scroll-spy). */
export type RailSection = { ix: string; label: string; href: string };

/** One line of the case-study rail scoreboard; `accent` marks the signal color. */
export type ScoreLine = { k: string; v: string; accent?: boolean };
