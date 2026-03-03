/**
 * basePageClass.js
 * Abstract base class shared by all wizard page classes.
 *
 * Lifecycle:
 *   mount(appEl)  → renders HTML into appEl, attaches listeners, subscribes to state
 *   unmount()     → removes listeners and state subscription
 *
 * Subclasses must implement:
 *   getHtml(state)       → string   (the page's HTML)
 *   afterRender(state)   → void     (attach DOM event listeners after render)
 *   onNext(state)        → boolean  (validate + perform side effects; return true to allow navigation)
 *   getNextStep()        → string   (STEPS key to navigate to on success)
 *
 * Subclasses may optionally override:
 *   getPreviousStep()    → string   (STEPS key for Back; default: one step before current)
 */

import { getState, subscribe } from '../state.js';
import { showErrors, clearErrors } from './layout.js';
import { STEP_ORDER } from '../utils/constants.js';

export class BasePage {
  constructor() {
    this._root = null;
    this._unsubscribe = null;
    this._navigateTo = null; // injected by router
  }

  /**
   * Called by the router to inject the navigation function.
   * @param {Function} navigateFn - (stepKey: string) => void
   */
  setNavigator(navigateFn) {
    this._navigateTo = navigateFn;
  }

  /**
   * Mount the page into the given DOM element.
   * @param {HTMLElement} appEl
   */
  mount(appEl) {
    this._root = appEl;
    const state = getState();
    appEl.innerHTML = this.getHtml(state);
    this.afterRender(state);
    this._attachNavListeners();

    // Re-render on state change (keep inputs stable — only re-render static parts)
    this._unsubscribe = subscribe((newState) => this.onStateChange(newState));
  }

  /** Clean up when navigating away. */
  unmount() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
    this._root = null;
  }

  // ─────────────────────────────────────────────
  // To be implemented by subclasses
  // ─────────────────────────────────────────────

  /** @returns {string} The full page HTML */
  getHtml(_state) {
    throw new Error('getHtml() must be implemented by subclass');
  }

  /** Called after HTML is injected; attach event listeners here. */
  afterRender(_state) {}

  /**
   * Called when Next is clicked. Validate inputs and commit to state.
   * @returns {boolean} true if navigation should proceed
   */
  onNext(_state) {
    return true;
  }

  /** @returns {string} STEPS key for the next page */
  getNextStep() {
    throw new Error('getNextStep() must be implemented by subclass');
  }

  /** @returns {string} STEPS key for the previous page */
  getPreviousStep() {
    const state = getState();
    const idx = STEP_ORDER.indexOf(state.currentStep);
    return idx > 0 ? STEP_ORDER[idx - 1] : STEP_ORDER[0];
  }

  /** Called when state changes. Override for partial re-renders. */
  onStateChange(_state) {}

  // ─────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────

  _attachNavListeners() {
    if (!this._root) return;

    const btnNext = this._root.querySelector('#btn-next');
    const btnBack = this._root.querySelector('#btn-back');

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        clearErrors(this._root);
        const state = getState();
        const ok = this.onNext(state);
        if (ok && this._navigateTo) {
          this._navigateTo(this.getNextStep());
        }
      });
    }

    if (btnBack) {
      btnBack.addEventListener('click', () => {
        if (this._navigateTo) {
          this._navigateTo(this.getPreviousStep());
        }
      });
    }
  }

  /** Helper: Show errors in the error banner. */
  showErrors(errors) {
    if (this._root) showErrors(this._root, errors);
  }

  /** Helper: Clear the error banner. */
  clearErrors() {
    if (this._root) clearErrors(this._root);
  }
}
