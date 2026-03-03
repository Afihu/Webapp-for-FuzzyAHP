/**
 * matrix.js
 * Fuzzy matrix operations for the Fuzzy AHP algorithm.
 *
 * Fuzzy numbers are represented as arrays [l, m, u] (lower, middle, upper).
 */

/**
 * Add two fuzzy numbers.
 * [l1+l2, m1+m2, u1+u2]
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
export function fuzzyAdd(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

/**
 * Multiply two fuzzy numbers (approximation for positive TFNs).
 * [l1*l2, m1*m2, u1*u2]
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
export function fuzzyMultiply(a, b) {
  return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
}

/**
 * Divide fuzzy number a by fuzzy number b.
 * [l1/u2, m1/m2, u1/l2]
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
export function fuzzyDivide(a, b) {
  return [a[0] / b[2], a[1] / b[1], a[2] / b[0]];
}

/**
 * Calculate the reciprocal of a fuzzy number.
 * (1/u, 1/m, 1/l)
 * @param {number[]} a - [l, m, u]
 * @returns {number[]}
 */
export function fuzzyReciprocal(a) {
  return [1 / a[2], 1 / a[1], 1 / a[0]];
}

/**
 * Raise a fuzzy number to a fractional power (for geometric mean of TFNs).
 * [l^p, m^p, u^p]
 * @param {number[]} a
 * @param {number} p
 * @returns {number[]}
 */
export function fuzzyPow(a, p) {
  return [Math.pow(a[0], p), Math.pow(a[1], p), Math.pow(a[2], p)];
}

/**
 * Compute the geometric mean of a row of fuzzy numbers.
 * Used in Buckley's (1985) method: r_i = (prod of a_ij)^(1/n)
 * @param {number[][]} row - Array of fuzzy numbers
 * @returns {number[]}
 */
export function fuzzyGeometricMean(row) {
  const n = row.length;
  // Multiply all fuzzy numbers together
  const product = row.reduce((acc, val) => fuzzyMultiply(acc, val), [1, 1, 1]);
  // Take the nth root
  return fuzzyPow(product, 1 / n);
}

/**
 * Build the full n×n fuzzy comparison matrix from the stored upper-triangle comparisons.
 * Diagonal entries are (1,1,1). Lower triangle entries are reciprocals.
 *
 * @param {Array} items - Array of { id, name } (criteria or candidates)
 * @param {Object} comparisons - { 'id_a_id_b': { saaty, direction, fuzzy: [l,m,u] } }
 *   direction: 'a' means item a is preferred over item b by that fuzzy amount;
 *              'b' means item b is preferred.
 * @returns {number[][][]} n×n matrix of fuzzy numbers
 */
export function buildFuzzyMatrix(items, comparisons) {
  const n = items.length;
  const matrix = Array.from({ length: n }, () => Array(n).fill(null));

  // Fill diagonal
  for (let i = 0; i < n; i++) {
    matrix[i][i] = [1, 1, 1];
  }

  // Fill upper and lower triangles
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const key = `${items[i].id}_${items[j].id}`;
      const comp = comparisons[key];

      if (!comp) {
        // Default to equal if missing (shouldn't happen after validation)
        matrix[i][j] = [1, 1, 1];
        matrix[j][i] = [1, 1, 1];
        continue;
      }

      // direction 'a': item i preferred over item j
      // direction 'b': item j preferred over item i
      if (comp.direction === 'a') {
        matrix[i][j] = comp.fuzzy;
        matrix[j][i] = fuzzyReciprocal(comp.fuzzy);
      } else {
        matrix[j][i] = comp.fuzzy;
        matrix[i][j] = fuzzyReciprocal(comp.fuzzy);
      }
    }
  }

  return matrix;
}
