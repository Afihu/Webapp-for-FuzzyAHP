/**
 * home.js
 * Step 1 — Landing / Home page.
 * Lets the user start a new decision or resume a saved one.
 */

import { getState, resetState, setState } from '../state.js';
import { STEPS, STORAGE_KEY } from '../utils/constants.js';

export class HomePage {
  constructor() {
    this._root = null;
    this._navigateTo = null;
  }

  setNavigator(navigateFn) {
    this._navigateTo = navigateFn;
  }

  mount(appEl) {
    this._root = appEl;
    const state = getState();
    const hasSaved = !!localStorage.getItem(STORAGE_KEY);
    const hasProgress = hasSaved && (state.criteria.length > 0 || state.candidates.length > 0);

    appEl.innerHTML = this._getHtml(hasProgress, state);
    this._attachListeners(hasProgress, state);
  }

  unmount() {
    this._root = null;
  }

  _getHtml(hasProgress, state) {
    const resumeSection = hasProgress ? `
      <div class="card mt-lg" style="max-width: 400px; margin: 16px auto 0;">
        <p class="text-muted text-sm" style="margin-bottom:8px;">
          You have a decision in progress with
          <strong>${state.criteria.length}</strong> criteria and
          <strong>${state.candidates.length}</strong> candidates.
        </p>
        <div style="display:flex; gap:8px; justify-content:center;">
          <button class="btn btn--secondary btn--sm" id="btn-new-decision">Start fresh</button>
          <button class="btn btn--primary btn--sm" id="btn-resume">Resume →</button>
        </div>
      </div>
    ` : '';

    return `
      <div class="home-page">
        <div class="home-page__hero">
          <span class="home-page__icon">🎯</span>
          <h1 class="home-page__title">Fuzzy AHP Hiring</h1>
          <p class="home-page__subtitle">
            Make fair, data-informed hiring decisions using the  
            Fuzzy Analytic Hierarchy Process.
          </p>
          <div class="home-page__actions">
            ${!hasProgress ? `<button class="btn btn--primary btn--lg" id="btn-start">Start New Decision</button>` : ''}
          </div>
          ${resumeSection}
          <p class="text-muted text-sm mt-lg">
            You'll add criteria, candidates, then compare them pairwise using linguistic terms.
          </p>
        </div>
      </div>
    `;
  }

  _attachListeners(hasProgress, state) {
    const btnStart = this._root.querySelector('#btn-start');
    const btnResume = this._root.querySelector('#btn-resume');
    const btnNew = this._root.querySelector('#btn-new-decision');

    btnStart?.addEventListener('click', () => {
      setState({ currentStep: STEPS.CRITERIA });
      this._navigateTo(STEPS.CRITERIA);
    });

    btnResume?.addEventListener('click', () => {
      const savedStep = state.currentStep !== STEPS.HOME ? state.currentStep : STEPS.CRITERIA;
      this._navigateTo(savedStep);
    });

    btnNew?.addEventListener('click', () => {
      if (confirm('Start a new decision? Your current progress will be lost.')) {
        resetState();
        setState({ currentStep: STEPS.CRITERIA });
        this._navigateTo(STEPS.CRITERIA);
      }
    });
  }
}
