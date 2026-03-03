/**
 * fuzzyInput.js
 * Reusable pairwise comparison input component.
 *
 * Renders two parts:
 *   1. A dropdown to pick which item is preferred (left / equal / right).
 *   2. A dropdown to pick the intensity (linguistic scale).
 *
 * Returns the data needed to call setCriteriaComparison / setCandidateComparison.
 */

import { COMPARISON_OPTIONS } from '../utils/constants.js';

/**
 * Build the HTML for a single pairwise comparison question.
 *
 * @param {string} id - Unique HTML id prefix for this comparison
 * @param {string} labelA - Name of item A
 * @param {string} labelB - Name of item B
 * @param {{ saaty: number, direction: string } | null} currentValue - Pre-filled value
 * @param {Array} [options=COMPARISON_OPTIONS] - Intensity dropdown options
 * @param {string} [equalLabel='They are equal'] - Label for the equal/neutral direction option
 * @returns {string} HTML markup
 */
export function renderFuzzyInput(id, labelA, labelB, currentValue = null, options = COMPARISON_OPTIONS, equalLabel = 'They are equal') {
  const directionOptions = [
    { value: 'a', label: labelA },
    { value: 'equal', label: equalLabel },
    { value: 'b', label: labelB },
  ];

  const intensityOptions = options
    .filter(o => o.value !== 1) // saaty=1 "equal" is handled by direction dropdown
    .map(opt => `
      <option value="${opt.value}" ${currentValue?.saaty === opt.value ? 'selected' : ''}>
        ${opt.label}
      </option>
    `).join('');

  const isEqual = !currentValue || currentValue.direction === 'equal';

  return `
    <div class="fuzzy-input" data-fuzzy-id="${id}">
      <div class="fuzzy-input__direction">
        <label class="form-label fuzzy-input__direction-label" for="${id}_direction">Preferred:</label>
        <div class="fuzzy-input__select-wrap">
          <select id="${id}_direction" class="form-select fuzzy-direction-select" data-fuzzy-id="${id}">
            ${directionOptions.map(opt => `
              <option value="${opt.value}" ${
                (currentValue?.direction === opt.value ||
                (!currentValue && opt.value === 'equal')) ? 'selected' : ''
              }>
                ${opt.label}
              </option>
            `).join('')}
          </select>
        </div>
      </div>
      <div class="fuzzy-input__direction" id="${id}_intensity_row" style="${isEqual ? 'display:none' : ''}">
        <label class="form-label fuzzy-input__direction-label" for="${id}_intensity">By how much:</label>
        <div class="fuzzy-input__select-wrap">
          <select id="${id}_intensity" class="form-select fuzzy-intensity-select" data-fuzzy-id="${id}">
            ${intensityOptions}
          </select>
        </div>
      </div>
    </div>
  `;
}

/**
 * Attach change listeners to a fuzzy input within a given container.
 * When the user changes direction or intensity, calls onChange with the current value.
 *
 * @param {HTMLElement} container
 * @param {string} id - fuzzy-id prefix
 * @param {Function} onChange - ({ saaty, direction, fuzzy }) => void
 * @param {Array} [options=COMPARISON_OPTIONS] - Same options array used to render this input
 */
export function attachFuzzyInputListeners(container, id, onChange, options = COMPARISON_OPTIONS) {
  const directionEl = container.querySelector(`#${id}_direction`);
  const intensityEl = container.querySelector(`#${id}_intensity`);
  const intensityRow = container.querySelector(`#${id}_intensity_row`);

  if (!directionEl) return;

  function emitChange() {
    const direction = directionEl.value;

    if (direction === 'equal') {
      intensityRow.style.display = 'none';
      onChange({ saaty: 1, direction: 'equal', fuzzy: [1, 1, 1] });
      return;
    }

    intensityRow.style.display = '';
    const saaty = parseInt(intensityEl.value, 10);
    const option = options.find(o => o.value === saaty);
    const fuzzy = option ? option.fuzzy : [1, 1, 1];
    onChange({ saaty, direction, fuzzy });
  }

  directionEl.addEventListener('change', emitChange);
  intensityEl.addEventListener('change', emitChange);
}
