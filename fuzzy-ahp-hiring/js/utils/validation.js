/**
 * validation.js
 * Validation functions for each step of the Fuzzy AHP workflow.
 * Each function returns { isValid: boolean, errors: string[] }.
 */

import { MIN_CRITERIA, MAX_CRITERIA, MIN_CANDIDATES, MAX_CANDIDATES } from './constants.js';

/**
 * Validate the criteria list.
 * @param {Array} criteria - Array of criterion objects { id, name, description? }
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateCriteria(criteria) {
  const errors = [];

  if (!criteria || criteria.length < MIN_CRITERIA) {
    errors.push(`Add at least ${MIN_CRITERIA} criteria to continue.`);
  } else if (criteria.length > MAX_CRITERIA) {
    errors.push(`You can have at most ${MAX_CRITERIA} criteria.`);
  }

  const names = criteria.map(c => c.name?.trim().toLowerCase()).filter(Boolean);
  const uniqueNames = new Set(names);
  if (uniqueNames.size !== names.length) {
    errors.push('Each criterion must have a unique name.');
  }

  criteria.forEach((c, i) => {
    if (!c.name?.trim()) {
      errors.push(`Criterion #${i + 1} must have a name.`);
    }
  });

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate the candidates list.
 * @param {Array} candidates - Array of candidate objects { id, name }
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateCandidates(candidates) {
  const errors = [];

  if (!candidates || candidates.length < MIN_CANDIDATES) {
    errors.push(`Add at least ${MIN_CANDIDATES} candidates to continue.`);
  } else if (candidates.length > MAX_CANDIDATES) {
    errors.push(`You can have at most ${MAX_CANDIDATES} candidates.`);
  }

  const names = candidates.map(c => c.name?.trim().toLowerCase()).filter(Boolean);
  const uniqueNames = new Set(names);
  if (uniqueNames.size !== names.length) {
    errors.push('Each candidate must have a unique name.');
  }

  candidates.forEach((c, i) => {
    if (!c.name?.trim()) {
      errors.push(`Candidate #${i + 1} must have a name.`);
    }
  });

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate that all criteria pairwise comparisons have been filled in.
 * @param {Array} criteria
 * @param {Object} criteriaComparisons - { 'id1_id2': { value, direction, fuzzy } }
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateCriteriaComparisons(criteria, criteriaComparisons) {
  const errors = [];
  const n = criteria.length;
  let missing = 0;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const key = `${criteria[i].id}_${criteria[j].id}`;
      if (!criteriaComparisons?.[key]) {
        missing++;
      }
    }
  }

  if (missing > 0) {
    errors.push(`${missing} criteria comparison${missing > 1 ? 's are' : ' is'} still missing.`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate that all candidate pairwise comparisons (per criterion) have been filled in.
 * @param {Array} criteria
 * @param {Array} candidates
 * @param {Object} candidateComparisons - { criterionId: { 'id1_id2': { value, direction, fuzzy } } }
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateCandidateComparisons(criteria, candidates, candidateComparisons) {
  const errors = [];
  const m = candidates.length;

  criteria.forEach(criterion => {
    const compMap = candidateComparisons?.[criterion.id] || {};
    let missing = 0;

    for (let i = 0; i < m; i++) {
      for (let j = i + 1; j < m; j++) {
        const key = `${candidates[i].id}_${candidates[j].id}`;
        if (!compMap[key]) {
          missing++;
        }
      }
    }

    if (missing > 0) {
      errors.push(`"${criterion.name}": ${missing} candidate comparison${missing > 1 ? 's are' : ' is'} missing.`);
    }
  });

  return { isValid: errors.length === 0, errors };
}
