/**
 * candidates.js
 * Step 3 — Add and manage candidates.
 */

import { BasePage } from './basePageClass.js';
import { renderLayout } from './layout.js';
import { getState, addCandidate, removeCandidate, setState } from '../state.js';
import { validateCandidates } from '../utils/validation.js';
import { STEPS, MIN_CANDIDATES, MAX_CANDIDATES } from '../utils/constants.js';

export class CandidatesPage extends BasePage {
  getHtml(state) {
    setState({ currentStep: STEPS.CANDIDATES });
    return renderLayout({
      currentStep: STEPS.CANDIDATES,
      title: 'Add Candidates',
      contentHtml: this._buildContent(state),
      showBack: true,
      nextLabel: 'Next →',
    });
  }

  _buildContent(state) {
    const { candidates } = state;
    const canAdd = candidates.length < MAX_CANDIDATES;

    const listHtml = candidates.length === 0
      ? `<div class="item-list__empty">No candidates yet. Add at least ${MIN_CANDIDATES}.</div>`
      : candidates.map((c, i) => `
          <div class="item-card">
            <span class="item-card__index">${i + 1}</span>
            <div class="item-card__name">${this._escHtml(c.name)}</div>
            <div class="item-card__actions">
              <button class="btn btn--ghost btn--sm" data-remove-candidate="${c.id}" title="Remove">✕</button>
            </div>
          </div>
        `).join('');

    return `
      <p class="section__desc">
        Add 2–5 candidates to evaluate
        (e.g., "Alice", "Bob", "Charlie").
        <span class="counter-badge counter-badge--info">${candidates.length} / ${MAX_CANDIDATES}</span>
      </p>
      <div class="item-list" id="candidates-list">
        ${listHtml}
      </div>

      ${canAdd ? `
        <div class="card">
          <div class="add-item-row">
            <div class="form-group">
              <label class="form-label" for="input-candidate-name">Candidate name <span>*</span></label>
              <input
                id="input-candidate-name"
                class="form-input"
                type="text"
                maxlength="60"
                placeholder="e.g. Alice"
                autocomplete="off"
              />
            </div>
            <button class="btn btn--primary" id="btn-add-candidate" style="margin-top:22px">Add</button>
          </div>
        </div>
      ` : `<p class="text-muted text-sm">Maximum of ${MAX_CANDIDATES} candidates reached.</p>`}
    `;
  }

  afterRender(state) {
    this._bindListeners();
  }

  onStateChange(state) {
    if (!this._root) return;
    const listEl = this._root.querySelector('#candidates-list');
    if (!listEl) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this._buildContent(state);
    const newList = tempDiv.querySelector('#candidates-list');
    if (newList) listEl.replaceWith(newList);
    this._bindListeners();
  }

  _bindListeners() {
    if (!this._root) return;

    const btnAdd = this._root.querySelector('#btn-add-candidate');
    const nameInput = this._root.querySelector('#input-candidate-name');

    btnAdd?.addEventListener('click', () => {
      const name = nameInput?.value.trim();
      if (!name) { nameInput?.focus(); return; }
      addCandidate(name);
      if (nameInput) nameInput.value = '';
      nameInput?.focus();
    });

    nameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnAdd?.click();
    });

    this._root.querySelectorAll('[data-remove-candidate]').forEach(btn => {
      btn.addEventListener('click', () => {
        removeCandidate(btn.dataset.removeCandidate);
      });
    });
  }

  onNext(state) {
    const { isValid, errors } = validateCandidates(state.candidates);
    if (!isValid) {
      this.showErrors(errors);
      return false;
    }
    setState({ currentStep: STEPS.COMPARISONS });
    return true;
  }

  getNextStep() { return STEPS.COMPARISONS; }
  getPreviousStep() { return STEPS.CRITERIA; }

  _escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
