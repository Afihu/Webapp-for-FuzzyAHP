/**
 * defuzzification.js
 * Methods to convert fuzzy numbers (TFNs) into crisp values.
 */

/**
 * Centroid (Center of Area) defuzzification for a Triangular Fuzzy Number (l, m, u).
 * Formula: (l + m + u) / 3
 *
 * @param {number[]} tfn - [l, m, u]
 * @returns {number}
 */
export function centroid([l, m, u]) {
  return (l + m + u) / 3;
}

/**
 * Mean of Maximum (MOM) defuzzification.
 * For a TFN this is simply the middle value m.
 *
 * @param {number[]} tfn - [l, m, u]
 * @returns {number}
 */
export function meanOfMaximum([, m]) {
  return m;
}

/**
 * Defuzzify an array of fuzzy weights and normalise so they sum to 1.
 *
 * @param {number[][]} fuzzyWeights - Array of [l, m, u] fuzzy weights
 * @param {Function} [method=centroid] - Defuzzification method
 * @returns {number[]} Normalised crisp weights
 */
export function defuzzifyAndNormalize(fuzzyWeights, method = centroid) {
  const crisp = fuzzyWeights.map(method);
  const total = crisp.reduce((sum, w) => sum + w, 0);
  if (total === 0) return crisp.map(() => 0);
  return crisp.map(w => w / total);
}
