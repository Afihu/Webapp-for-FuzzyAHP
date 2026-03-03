/**
 * router.js
 * Client-side hash-based router for the multi-page wizard.
 *
 * Maps URL hashes to page classes and handles:
 *  - Initial load
 *  - Hash change (browser back/forward)
 *  - Programmatic navigation via navigateTo()
 */

import { STEPS } from './utils/constants.js';
import { setState } from './state.js';

import { HomePage }        from './pages/home.js';
import { CriteriaPage }    from './pages/criteria.js';
import { CandidatesPage }  from './pages/candidates.js';
import { ComparisonsPage } from './pages/comparisons.js';
import { ResultsPage }     from './pages/results.js';

/** Map each step key to its page class constructor. */
const PAGE_MAP = {
  [STEPS.HOME]:        HomePage,
  [STEPS.CRITERIA]:    CriteriaPage,
  [STEPS.CANDIDATES]:  CandidatesPage,
  [STEPS.COMPARISONS]: ComparisonsPage,
  [STEPS.RESULTS]:     ResultsPage,
};

export class Router {
  /**
   * @param {HTMLElement} appEl - The root #app element
   */
  constructor(appEl) {
    this._appEl = appEl;
    this._currentPage = null;
    this._handleHashChange = this._handleHashChange.bind(this);
  }

  /** Start the router: resolve initial route and listen for hash changes. */
  start() {
    window.addEventListener('hashchange', this._handleHashChange);
    this._resolveRoute();
  }

  /** Stop the router and unmount current page. */
  stop() {
    window.removeEventListener('hashchange', this._handleHashChange);
    this._unmountCurrent();
  }

  /**
   * Navigate programmatically to a step.
   * @param {string} step - STEPS key
   */
  navigateTo(step) {
    if (!step) return;
    window.location.hash = step;
  }

  // ─────────────────────────────────────────────
  // Private
  // ─────────────────────────────────────────────

  _handleHashChange() {
    this._resolveRoute();
  }

  _resolveRoute() {
    const hash = window.location.hash.replace('#', '') || STEPS.HOME;
    const step = Object.values(STEPS).includes(hash) ? hash : STEPS.HOME;
    this._mountPage(step);
  }

  _mountPage(step) {
    this._unmountCurrent();

    const PageClass = PAGE_MAP[step];
    if (!PageClass) {
      console.warn(`No page registered for step: ${step}`);
      return;
    }

    const page = new PageClass();
    page.setNavigator((targetStep) => this.navigateTo(targetStep));
    page.mount(this._appEl);
    this._currentPage = page;

    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  _unmountCurrent() {
    if (this._currentPage) {
      this._currentPage.unmount();
      this._currentPage = null;
    }
  }
}
