/**
 * fuzzyAHP.js
 * Core Fuzzy AHP algorithm — Buckley (1985) method.
 *
 * Steps:
 *  1. Build fuzzy pairwise comparison matrices.
 *  2. Compute fuzzy geometric mean of each row (r_i).
 *  3. Sum all r_i to get the fuzzy sum vector.
 *  4. Compute normalised fuzzy weights: w_i = r_i ⊗ (sum)^{-1}.
 *  5. Defuzzify normalised weights to get crisp priority vector.
 *  6. Compute final candidate scores by aggregating weights × candidate scores.
 */

import { buildFuzzyMatrix, fuzzyGeometricMean, fuzzyAdd, fuzzyMultiply, fuzzyReciprocal } from './matrix.js';
import { defuzzifyAndNormalize } from './defuzzification.js';

/**
 * Compute fuzzy weights for a set of items given their pairwise comparisons.
 *
 * @param {Array} items - [{ id, name }]
 * @param {Object} comparisons - upper-triangle comparison map
 * @returns {{ fuzzyWeights: number[][], crispWeights: number[] }}
 */
export function computeWeights(items, comparisons) {
  const matrix = buildFuzzyMatrix(items, comparisons);
  const n = items.length;

  // Step 1: geometric mean of each row
  const geometricMeans = matrix.map(row => fuzzyGeometricMean(row));

  // Step 2: sum of all geometric means
  const sumVector = geometricMeans.reduce(
    (acc, gm) => fuzzyAdd(acc, gm),
    [0, 0, 0]
  );

  // Step 3: inverse of the sum
  const inverseSumVector = fuzzyReciprocal(sumVector);

  // Step 4: normalised fuzzy weights
  const fuzzyWeights = geometricMeans.map(gm =>
    fuzzyMultiply(gm, inverseSumVector)
  );

  // Step 5: defuzzify + normalise
  const crispWeights = defuzzifyAndNormalize(fuzzyWeights);

  return { fuzzyWeights, crispWeights };
}

/**
 * Run the full Fuzzy AHP calculation.
 *
 * @param {Array} criteria - [{ id, name }]
 * @param {Array} candidates - [{ id, name }]
 * @param {Object} criteriaComparisons - upper-triangle map for criteria
 * @param {Object} candidateComparisons - { criterionId: upper-triangle map for candidates }
 * @returns {{
 *   criteriaWeights: number[],           // crisp criteria weights (sum to 1)
 *   candidateScores: Object,             // { candidateId: { criterionId: crispScore } }
 *   rankings: Array                      // [{ candidate, score }] sorted desc
 * }}
 */
export function runFuzzyAHP(criteria, candidates, criteriaComparisons, candidateComparisons) {
  // 1. Criteria weights
  const { crispWeights: criteriaWeights } = computeWeights(criteria, criteriaComparisons);

  // 2. Candidate scores per criterion
  const candidateScores = {};
  candidates.forEach(c => { candidateScores[c.id] = {}; });

  criteria.forEach((criterion, ci) => {
    const compMap = candidateComparisons[criterion.id] || {};
    const { crispWeights: scores } = computeWeights(candidates, compMap);

    candidates.forEach((candidate, pi) => {
      candidateScores[candidate.id][criterion.id] = scores[pi];
    });
  });

  // 3. Final aggregated score for each candidate
  const finalScores = candidates.map(candidate => {
    const score = criteria.reduce((total, criterion, ci) => {
      return total + criteriaWeights[ci] * (candidateScores[candidate.id][criterion.id] || 0);
    }, 0);
    return { candidate, score };
  });

  // 4. Sort descending
  const rankings = finalScores.sort((a, b) => b.score - a.score);

  return { criteriaWeights, candidateScores, rankings };
}
