/**
 * state.js
 * Centralised state management for the Fuzzy AHP Hiring Decision Tool.
 *
 * Provides:
 *  - A single state object (source of truth)
 *  - Subscribe / unsubscribe for reactive updates
 *  - Auto-persistence to localStorage on every change
 *  - Typed helpers for common mutations
 */

import { STORAGE_KEY, STEPS } from './utils/constants.js';

// ─────────────────────────────────────────────
// Initial state shape
// ─────────────────────────────────────────────
function createInitialState() {
  return {
    currentStep: STEPS.HOME,

    criteria: [],          // [{ id, name, description }]
    candidates: [],        // [{ id, name }]

    /**
     * Upper-triangle pairwise comparisons for criteria.
     * Key format: `${criterionA.id}_${criterionB.id}` (i < j by insertion order).
     * Value: { saaty: number, direction: 'a'|'b', fuzzy: [l, m, u] }
     *   direction 'a' → item A preferred over B
     *   direction 'b' → item B preferred over A
     */
    criteriaComparisons: {},

    /**
     * Per-criterion candidate comparisons.
     * { [criterionId]: { `${candidateA.id}_${candidateB.id}`: { saaty, direction, fuzzy } } }
     */
    candidateComparisons: {},

    /**
     * Computed results (populated after "Calculate").
     * { criteriaWeights: number[], candidateScores: Object, rankings: Array }
     */
    results: null,
  };
}

// ─────────────────────────────────────────────
// Internal state + subscriber registry
// ─────────────────────────────────────────────
let state = createInitialState();
const subscribers = new Set();

// ─────────────────────────────────────────────
// Core API
// ─────────────────────────────────────────────

/** Return a shallow copy of the current state (read-only access). */
export function getState() {
  return { ...state };
}

/**
 * Merge updates into state, notify subscribers, and persist.
 * @param {Partial<typeof state>} updates
 */
export function setState(updates) {
  state = { ...state, ...updates };
  _notifySubscribers();
  _saveState();
}

/**
 * Register a callback to be called whenever state changes.
 * Returns an unsubscribe function.
 * @param {Function} callback
 * @returns {Function} unsubscribe
 */
export function subscribe(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

/** Reload state from localStorage (call once on app start). */
export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      state = { ...createInitialState(), ...JSON.parse(saved) };
      _notifySubscribers();
    }
  } catch (e) {
    console.warn('Could not load saved state:', e);
  }
}

/** Wipe all state and localStorage, reset to initial values. */
export function resetState() {
  state = createInitialState();
  localStorage.removeItem(STORAGE_KEY);
  _notifySubscribers();
}

// ─────────────────────────────────────────────
// Typed mutation helpers
// ─────────────────────────────────────────────

/** Add a criterion. Returns the new id. */
export function addCriterion(name, description = '') {
  const id = `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  setState({ criteria: [...state.criteria, { id, name: name.trim(), description: description.trim() }] });
  return id;
}

/** Remove a criterion and its associated comparisons. */
export function removeCriterion(id) {
  const criteria = state.criteria.filter(c => c.id !== id);

  // Clean up comparisons that reference this criterion
  const criteriaComparisons = Object.fromEntries(
    Object.entries(state.criteriaComparisons).filter(
      ([key]) => !key.startsWith(id) && !key.includes(`_${id}`)
    )
  );

  const { [id]: _removed, ...candidateComparisons } = state.candidateComparisons;

  setState({ criteria, criteriaComparisons, candidateComparisons });
}

/** Add a candidate. Returns the new id. */
export function addCandidate(name) {
  const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  setState({ candidates: [...state.candidates, { id, name: name.trim() }] });
  return id;
}

/** Remove a candidate and its associated comparisons. */
export function removeCandidate(id) {
  const candidates = state.candidates.filter(c => c.id !== id);

  // Clean up candidate comparison entries across all criteria
  const candidateComparisons = Object.fromEntries(
    Object.entries(state.candidateComparisons).map(([critId, compMap]) => [
      critId,
      Object.fromEntries(
        Object.entries(compMap).filter(
          ([key]) => !key.startsWith(id) && !key.includes(`_${id}`)
        )
      ),
    ])
  );

  setState({ candidates, candidateComparisons });
}

/** Save a criteria pairwise comparison. */
export function setCriteriaComparison(idA, idB, saaty, direction, fuzzy) {
  const key = `${idA}_${idB}`;
  setState({
    criteriaComparisons: {
      ...state.criteriaComparisons,
      [key]: { saaty, direction, fuzzy },
    },
  });
}

/** Save a candidate pairwise comparison for a given criterion. */
export function setCandidateComparison(criterionId, idA, idB, saaty, direction, fuzzy) {
  const key = `${idA}_${idB}`;
  setState({
    candidateComparisons: {
      ...state.candidateComparisons,
      [criterionId]: {
        ...(state.candidateComparisons[criterionId] || {}),
        [key]: { saaty, direction, fuzzy },
      },
    },
  });
}

// ─────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────
function _notifySubscribers() {
  subscribers.forEach(cb => cb(state));
}

function _saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}