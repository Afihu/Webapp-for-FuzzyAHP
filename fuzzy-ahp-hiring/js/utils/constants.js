/**
 * constants.js
 * Application-wide constants for the Fuzzy AHP Hiring Decision Tool.
 */

// Minimum and maximum number of criteria and candidates
export const MIN_CRITERIA = 2;
export const MAX_CRITERIA = 6;
export const MIN_CANDIDATES = 2;
export const MAX_CANDIDATES = 5;

// Step identifiers used by the router
export const STEPS = {
  HOME: 'home',
  CRITERIA: 'criteria',
  CANDIDATES: 'candidates',
  COMPARISONS: 'comparisons',
  RESULTS: 'results',
};

// Ordered step list used for progress bar and navigation
export const STEP_ORDER = [
  STEPS.HOME,
  STEPS.CRITERIA,
  STEPS.CANDIDATES,
  STEPS.COMPARISONS,
  STEPS.RESULTS,
];

// Labels shown in the progress bar (only steps 2-5)
export const STEP_LABELS = {
  [STEPS.CRITERIA]: 'Criteria',
  [STEPS.CANDIDATES]: 'Candidates',
  [STEPS.COMPARISONS]: 'Compare',
  [STEPS.RESULTS]: 'Results',
};

/**
 * Linguistic terms for pairwise comparisons.
 * Each entry maps a label to its Fuzzy Triangular Scale (l, m, u) from Buckley (1985).
 *
 * Reciprocals are computed automatically as (1/u, 1/m, 1/l).
 */
export const LINGUISTIC_SCALE = [
  { saaty: 1, label: 'Equally important',    fuzzy: [1, 1, 1] },
  { saaty: 2, label: '—',                   fuzzy: [1, 2, 3] },
  { saaty: 3, label: 'Slightly more important',     fuzzy: [2, 3, 4] },
  { saaty: 4, label: '—',                   fuzzy: [3, 4, 5] },
  { saaty: 5, label: 'Fairly more important',     fuzzy: [4, 5, 6] },
  { saaty: 6, label: '—',                   fuzzy: [5, 6, 7] },
  { saaty: 7, label: 'Significantly more important',   fuzzy: [6, 7, 8] },
  { saaty: 8, label: '—',                   fuzzy: [7, 8, 9] },
  { saaty: 9, label: 'Absolutely more important', fuzzy: [9, 9, 9] },
];

/**
 * Dropdown options for criteria comparisons — named terms only (Saaty 1, 3, 5, 7, 9).
 * Intermediate values (2, 4, 6, 8) are omitted to keep the UI clean.
 */
export const COMPARISON_OPTIONS = LINGUISTIC_SCALE
  .filter(({ label }) => label !== '—')
  .map(({ saaty, label, fuzzy }) => ({ value: saaty, label: `${label} (${saaty})`, fuzzy }));

/**
 * Dropdown options for candidate comparisons.
 * Uses performance-oriented language instead of importance language.
 * Saaty 1 = "Equally good" (handled by the equal direction toggle).
 */
export const CANDIDATE_COMPARISON_OPTIONS = [
  { value: 3, label: 'A bit better',      fuzzy: [2, 3, 4] },
  { value: 5, label: 'Fairly better',     fuzzy: [4, 5, 6] },
  { value: 7, label: 'Strongly better',   fuzzy: [6, 7, 8] },
  { value: 9, label: 'Absolutely better', fuzzy: [9, 9, 9] },
];

// Palette used for charts (criteria weights pie, candidate scores bar)
export const CHART_COLORS = [
  '#2563eb', '#16a34a', '#d97706', '#dc2626',
  '#7c3aed', '#0891b2', '#db2777', '#059669',
];

// localStorage key for persisted state
export const STORAGE_KEY = 'fuzzyAHP_state';
