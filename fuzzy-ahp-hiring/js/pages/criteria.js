/**
 * criteria.js
 * Step 2 — Add and manage evaluation criteria.
 */

import { BasePage } from './basePageClass.js';
import { renderLayout } from './layout.js';
import { getState, addCriterion, removeCriterion, setState } from '../state.js';
import { validateCriteria } from '../utils/validation.js';
import { STEPS, MIN_CRITERIA, MAX_CRITERIA } from '../utils/constants.js';

export class CriteriaPage extends BasePage {
  getHtml(state) {
    setState({ currentStep: STEPS.CRITERIA });
    return renderLayout({
      currentStep: STEPS.CRITERIA,
      title: 'Define Your Criteria',
      contentHtml: this._buildContent(state),
      showBack: false,
      nextLabel: 'Next →',
    });
  }

  _buildContent(state) {
    const { criteria } = state;
    const canAdd = criteria.length < MAX_CRITERIA;

    const listHtml = criteria.length === 0
      ? `<div class="item-list__empty">No criteria yet. Add at least ${MIN_CRITERIA}.</div>`
      : criteria.map((c, i) => `
          <div class="item-card">
            <span class="item-card__index">${i + 1}</span>
            <div class="item-card__name">${this._escHtml(c.name)}</div>
            ${c.description ? `<div class="item-card__desc">${this._escHtml(c.description)}</div>` : ''}
            <div class="item-card__actions">
              <button class="btn btn--ghost btn--sm" data-remove-criterion="${c.id}" title="Remove">✕</button>
            </div>
          </div>
        `).join('');

    return `
      <p class="section__desc">
        Add 2–6 criteria to evaluate candidates against
        (e.g., "Technical Skills", "Experience", "Culture Fit").
        <span class="counter-badge counter-badge--info">${criteria.length} / ${MAX_CRITERIA}</span>
      </p>
      <div class="item-list" id="criteria-list">
        ${listHtml}
      </div>

      ${canAdd ? `
        <div class="card">
          <div class="add-item-row">
            <div class="form-group">
              <label class="form-label" for="input-criterion-name">Criterion name <span>*</span></label>
              <input
                id="input-criterion-name"
                class="form-input"
                type="text"
                maxlength="60"
                placeholder="e.g. Technical Skills"
                autocomplete="off"
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="input-criterion-desc">Description (optional)</label>
              <input
                id="input-criterion-desc"
                class="form-input"
                type="text"
                maxlength="120"
                placeholder="Short description"
                autocomplete="off"
              />
            </div>
            <button class="btn btn--primary" id="btn-add-criterion" style="margin-top:22px">Add</button>
          </div>
        </div>
      ` : `<p class="text-muted text-sm">Maximum of ${MAX_CRITERIA} criteria reached.</p>`}
    `;
  }

  afterRender(state) {
    this._bindListeners();
  }

  onStateChange(state) {
    // Re-render only the criteria list area
    if (!this._root) return;
    const listEl = this._root.querySelector('#criteria-list');
    const content = this._root.querySelector('.page-content');
    if (content) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this._buildContent(state);
      const newList = tempDiv.querySelector('#criteria-list');
      if (listEl && newList) listEl.replaceWith(newList);
      // Re-attach listeners since DOM changed
      this._bindListeners();
    }
  }

  _bindListeners() {
    if (!this._root) return;

    const btnAdd = this._root.querySelector('#btn-add-criterion');
    const nameInput = this._root.querySelector('#input-criterion-name');
    const descInput = this._root.querySelector('#input-criterion-desc');

    btnAdd?.addEventListener('click', () => {
      const name = nameInput?.value.trim();
      if (!name) {
        nameInput?.focus();
        return;
      }
      addCriterion(name, descInput?.value.trim() || '');
      if (nameInput) nameInput.value = '';
      if (descInput) descInput.value = '';
      nameInput?.focus();
    });

    nameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnAdd?.click();
    });

    this._root.querySelectorAll('[data-remove-criterion]').forEach(btn => {
      btn.addEventListener('click', () => {
        removeCriterion(btn.dataset.removeCriterion);
      });
    });
  }

  onNext(state) {
    const { isValid, errors } = validateCriteria(state.criteria);
    if (!isValid) {
      this.showErrors(errors);
      return false;
    }
    setState({ currentStep: STEPS.CANDIDATES });
    return true;
  }

  getNextStep() { return STEPS.CANDIDATES; }

  _escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
