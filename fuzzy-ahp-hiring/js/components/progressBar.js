/**
 * progressBar.js
 * Renders a stepped progress indicator for the wizard flow.
 */

import { STEPS, STEP_LABELS } from '../utils/constants.js';

// Ordered visible steps (HOME is not shown in the bar)
const VISIBLE_STEPS = [STEPS.CRITERIA, STEPS.CANDIDATES, STEPS.COMPARISONS, STEPS.RESULTS];

/**
 * Build the progress bar HTML string.
 * @param {string} currentStep - The active step key from STEPS
 * @returns {string} HTML markup
 */
export function renderProgressBar(currentStep) {
  const currentIndex = VISIBLE_STEPS.indexOf(currentStep);

  const stepsHtml = VISIBLE_STEPS.map((step, i) => {
    let modifier = '';
    let dotContent = i + 1;

    if (i < currentIndex) {
      modifier = 'progress-bar__step--done';
      dotContent = '✓';
    } else if (i === currentIndex) {
      modifier = 'progress-bar__step--active';
    }

    return `
      <div class="progress-bar__step ${modifier}">
        <div class="progress-bar__step-dot">${dotContent}</div>
        <span class="progress-bar__step-label">${STEP_LABELS[step]}</span>
      </div>
    `;
  }).join('');

  return `<div class="progress-bar__steps">${stepsHtml}</div>`;
}
