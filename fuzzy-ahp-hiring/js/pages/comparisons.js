/**
 * comparisons.js
 * Step 4 — Pairwise comparisons.
 *
 * Manages two sequential sub-steps within a single page:
 *   Sub-step 0        : Criteria vs. criteria comparisons
 *   Sub-steps 1 … n   : Candidate vs. candidate comparisons for each criterion
 *
 * Sub-step progress is persisted in state as `comparisonSubStep`.
 */

import { BasePage } from './basePageClass.js';
import { renderLayout } from './layout.js';
import {
  getState,
  setState,
  setCriteriaComparison,
  setCandidateComparison,
} from '../state.js';
import {
  validateCriteriaComparisons,
  validateCandidateComparisons,
} from '../utils/validation.js';
import { renderFuzzyInput, attachFuzzyInputListeners } from '../components/fuzzyInput.js';
import { STEPS, COMPARISON_OPTIONS, CANDIDATE_COMPARISON_OPTIONS } from '../utils/constants.js';

export class ComparisonsPage extends BasePage {
  constructor() {
    super();
    this._subStep = 0; // 0 = criteria, 1..n = candidate sub-steps
  }

  mount(appEl) {
    const state = getState();
    // Restore saved sub-step if available
    this._subStep = state.comparisonSubStep ?? 0;
    super.mount(appEl);
  }

  getHtml(state) {
    setState({ currentStep: STEPS.COMPARISONS, comparisonSubStep: this._subStep });
    const { criteria, candidates } = state;
    const n = criteria.length;
    const isLastSubStep = this._subStep === n; // past all criteria

    const nextLabel = isLastSubStep ? 'Calculate 🔢' : 'Next →';
    const title = this._subStep === 0
      ? 'Compare Criteria'
      : `Compare Candidates — ${criteria[this._subStep - 1]?.name ?? ''}`;

    return renderLayout({
      currentStep: STEPS.COMPARISONS,
      title,
      contentHtml: this._buildContent(state),
      showBack: true,
      showNext: true,
      nextLabel,
    });
  }

  _buildContent(state) {
    const { criteria, candidates, criteriaComparisons, candidateComparisons } = state;

    if (this._subStep === 0) {
      return this._buildCriteriaComparisons(criteria, criteriaComparisons);
    } else {
      const criterion = criteria[this._subStep - 1];
      const compMap = candidateComparisons[criterion.id] || {};
      return this._buildCandidateComparisons(criterion, candidates, compMap);
    }
  }

  _buildCriteriaComparisons(criteria, criteriaComparisons) {
    const n = criteria.length;
    const pairs = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        pairs.push([criteria[i], criteria[j]]);
      }
    }

    const total = pairs.length;
    const filled = pairs.filter(([a, b]) => criteriaComparisons?.[`${a.id}_${b.id}`]).length;

    return `
      <p class="section__desc">
        For each pair, choose which criterion is more important and by how much.
        <span class="counter-badge counter-badge--${filled === total ? 'success' : 'warning'}">
          ${filled} / ${total} answered
        </span>
      </p>
      <div id="comparisons-list">
        ${pairs.map(([a, b]) => {
          const key = `${a.id}_${b.id}`;
          const current = criteriaComparisons?.[key] ?? null;
          return `
            <div class="comparison-card">
              <p class="comparison-card__prompt">Which criterion is more important?</p>
              <p class="comparison-card__question">
                <em>${this._escHtml(a.name)}</em> vs <em>${this._escHtml(b.name)}</em>
              </p>
              <div class="comparison-card__input">
                ${renderFuzzyInput(`crit_${a.id}_${b.id}`, a.name, b.name, current)}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  _buildCandidateComparisons(criterion, candidates, compMap) {
    const m = candidates.length;
    const pairs = [];
    for (let i = 0; i < m; i++) {
      for (let j = i + 1; j < m; j++) {
        pairs.push([candidates[i], candidates[j]]);
      }
    }

    const total = pairs.length;
    const filled = pairs.filter(([a, b]) => compMap?.[`${a.id}_${b.id}`]).length;

    return `
      <p class="section__desc">
        For each pair, choose who performs better on <strong>${this._escHtml(criterion.name)}</strong>.
        <span class="counter-badge counter-badge--${filled === total ? 'success' : 'warning'}">
          ${filled} / ${total} answered
        </span>
      </p>
      <div id="comparisons-list">
        ${pairs.map(([a, b]) => {
          const key = `${a.id}_${b.id}`;
          const current = compMap?.[key] ?? null;
          return `
            <div class="comparison-card">
              <p class="comparison-card__prompt">
                For <strong>${this._escHtml(criterion.name)}</strong>, who is better?
              </p>
              <p class="comparison-card__question">
                <em>${this._escHtml(a.name)}</em> vs <em>${this._escHtml(b.name)}</em>
              </p>
              <div class="comparison-card__input">
                ${renderFuzzyInput(`cand_${criterion.id}_${a.id}_${b.id}`, a.name, b.name, current, CANDIDATE_COMPARISON_OPTIONS, 'Both are equal')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  afterRender(state) {
    this._attachFuzzyListeners(state);
  }

  _attachFuzzyListeners(state) {
    if (!this._root) return;
    const { criteria, candidates } = state;

    if (this._subStep === 0) {
      // Criteria comparisons
      const n = criteria.length;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const a = criteria[i];
          const b = criteria[j];
          const id = `crit_${a.id}_${b.id}`;
          attachFuzzyInputListeners(this._root, id, ({ saaty, direction, fuzzy }) => {
            setCriteriaComparison(a.id, b.id, saaty, direction, fuzzy);
          });
        }
      }
    } else {
      // Candidate comparisons for current criterion
      const criterion = criteria[this._subStep - 1];
      const m = candidates.length;
      for (let i = 0; i < m; i++) {
        for (let j = i + 1; j < m; j++) {
          const a = candidates[i];
          const b = candidates[j];
          const id = `cand_${criterion.id}_${a.id}_${b.id}`;
          attachFuzzyInputListeners(this._root, id, ({ saaty, direction, fuzzy }) => {
            setCandidateComparison(criterion.id, a.id, b.id, saaty, direction, fuzzy);
          }, CANDIDATE_COMPARISON_OPTIONS);
        }
      }
    }
  }

  onNext(state) {
    const { criteria, candidates, criteriaComparisons, candidateComparisons } = state;
    const n = criteria.length;

    if (this._subStep === 0) {
      // Validate criteria comparisons
      const { isValid, errors } = validateCriteriaComparisons(criteria, criteriaComparisons);
      if (!isValid) { this.showErrors(errors); return false; }
      this._advanceSubStep(1);
      return false; // We handle navigation manually
    } else {
      // Validate candidate comparisons for current criterion
      const criterion = criteria[this._subStep - 1];
      const compMap = { [criterion.id]: candidateComparisons[criterion.id] || {} };
      const { isValid, errors } = validateCandidateComparisons([criterion], candidates, compMap);
      if (!isValid) { this.showErrors(errors); return false; }

      if (this._subStep < n) {
        this._advanceSubStep(this._subStep + 1);
        return false; // Stay on page, next sub-step
      } else {
        // All done → go to results
        setState({ currentStep: STEPS.RESULTS, comparisonSubStep: 0 });
        this._navigateTo(STEPS.RESULTS);
        return false;
      }
    }
  }

  _advanceSubStep(next) {
    this._subStep = next;
    setState({ comparisonSubStep: next });
    const state = getState();
    if (this._root) {
      this._root.innerHTML = this.getHtml(state);
      this._attachNavListeners();
      this._attachFuzzyListeners(state);
      this.clearErrors();
    }
  }

  getPreviousStep() {
    if (this._subStep === 0) return STEPS.CANDIDATES;
    // Go back one sub-step
    this._advanceSubStep(this._subStep - 1);
    return null; // handled internally
  }

  getNextStep() { return STEPS.RESULTS; }

  // Override _attachNavListeners to also handle internal Back re-render
  _attachNavListeners() {
    if (!this._root) return;
    const btnNext = this._root.querySelector('#btn-next');
    const btnBack = this._root.querySelector('#btn-back');

    btnNext?.addEventListener('click', () => {
      this.clearErrors();
      const state = getState();
      this.onNext(state);
    });

    btnBack?.addEventListener('click', () => {
      this.clearErrors();
      if (this._subStep === 0) {
        this._navigateTo(STEPS.CANDIDATES);
      } else {
        this._advanceSubStep(this._subStep - 1);
      }
    });
  }

  _escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
