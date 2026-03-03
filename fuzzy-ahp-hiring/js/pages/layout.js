/**
 * layout.js
 * Shared HTML structure for all wizard pages.
 * Provides a header (with progress bar), scrollable content area, and a sticky footer
 * with Back / Next navigation buttons.
 */

import { renderProgressBar } from '../components/progressBar.js';
import { STEPS } from '../utils/constants.js';

/**
 * Build the full page scaffold HTML.
 *
 * @param {object} options
 * @param {string}  options.currentStep   - Active STEPS key
 * @param {string}  options.title         - Page heading shown in content area
 * @param {string}  options.contentHtml   - Inner HTML for the main content section
 * @param {boolean} [options.showBack=true]    - Show Back button in footer
 * @param {boolean} [options.showNext=true]    - Show Next / Calculate button in footer
 * @param {string}  [options.nextLabel='Next'] - Label on the primary action button
 * @returns {string} Full page HTML
 */
export function renderLayout({
  currentStep,
  title,
  contentHtml,
  showBack = true,
  showNext = true,
  nextLabel = 'Next →',
}) {
  const isLastStep = currentStep === STEPS.RESULTS;

  const footerButtons = `
    ${showBack ? `<button class="btn btn--secondary" id="btn-back">← Back</button>` : '<span></span>'}
    ${showNext ? `<button class="btn btn--primary" id="btn-next">${nextLabel}</button>` : ''}
  `;

  return `
    <div class="page">
      <header class="page-header">
        <div class="page-header__inner">
          <span class="page-header__brand">Fuzzy AHP Hiring</span>
          ${renderProgressBar(currentStep)}
        </div>
      </header>

      <main class="page-content">
        <div class="section">
          <h2 class="section__title">${title}</h2>
        </div>

        <div id="error-banner" class="error-banner" role="alert">
          <span class="error-banner__icon">⚠️</span>
          <div>
            <strong>Please fix the following:</strong>
            <ul class="error-banner__list" id="error-list"></ul>
          </div>
        </div>

        ${contentHtml}
      </main>

      ${(!isLastStep || showBack) ? `
        <footer class="page-footer">
          <div class="page-footer__inner">
            ${footerButtons}
          </div>
        </footer>
      ` : ''}
    </div>
  `;
}

/**
 * Show validation errors in the error banner.
 * @param {HTMLElement} root - The page root element
 * @param {string[]} errors
 */
export function showErrors(root, errors) {
  const banner = root.querySelector('#error-banner');
  const list = root.querySelector('#error-list');
  if (!banner || !list) return;

  list.innerHTML = errors.map(e => `<li>${e}</li>`).join('');
  banner.classList.add('error-banner--visible');
  banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Hide the error banner.
 * @param {HTMLElement} root
 */
export function clearErrors(root) {
  const banner = root.querySelector('#error-banner');
  if (banner) banner.classList.remove('error-banner--visible');
}
