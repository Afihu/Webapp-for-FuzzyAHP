/**
 * results.js
 * Step 5 — Results page.
 * Runs the Fuzzy AHP calculation and displays:
 *   1. Candidate rankings with score bars
 *   2. Criteria weights pie chart
 *   3. Candidate-per-criterion score table
 */

import { BasePage } from './basePageClass.js';
import { renderLayout } from './layout.js';
import { getState, setState } from '../state.js';
import { runFuzzyAHP } from '../math/fuzzyAHP.js';
import { drawPieChart, buildPieLegend, drawBarChart, barChartHeight } from '../components/charts.js';
import { STEPS } from '../utils/constants.js';

const MEDAL = ['🥇', '🥈', '🥉'];
const RANK_CLASS = ['first', 'second', 'third'];

export class ResultsPage extends BasePage {
  constructor() {
    super();
    this._results = null;
  }

  mount(appEl) {
    this._root = appEl;  // must be set before afterRender queries the DOM
    const state = getState();
    // Run (or re-use cached) calculation
    this._results = this._calculate(state);
    setState({ currentStep: STEPS.RESULTS, results: this._results });
    appEl.innerHTML = this.getHtml(state);
    this.afterRender(state);
    // No state subscription needed; results are static until recalculation
  }

  unmount() {
    this._results = null;
    super.unmount();
  }

  getHtml(state) {
    const { criteria, candidates } = state;
    const results = this._results;

    if (!results) {
      return `<div class="page"><main class="page-content"><p class="text-muted">No results yet. Please complete all comparisons first.</p></main></div>`;
    }

    const { criteriaWeights, candidateScores, rankings } = results;

    const rankingHtml = this._buildRanking(rankings);
    const tableHtml = this._buildScoreTable(criteria, candidates, criteriaWeights, candidateScores);

    const contentHtml = `
      <section class="section">
        <h3 class="section__title">🏆 Candidate Ranking</h3>
        <p class="section__desc">Overall score based on weighted criteria comparisons.</p>
        <div class="results-ranking">${rankingHtml}</div>
      </section>

      <hr class="divider" />

      <section class="section">
        <h3 class="section__title">📊 Criteria Weights</h3>
        <p class="section__desc">How important each criterion is relative to the others.</p>
        <div class="chart-container">
          <canvas id="pie-chart" width="240" height="240"></canvas>
        </div>
        <div id="pie-legend"></div>
      </section>

      <hr class="divider" />

      <section class="section">
        <h3 class="section__title">📋 Scores by Criterion</h3>
        <p class="section__desc">Each candidate's normalised score for each criterion.</p>
        ${tableHtml}
      </section>

      <hr class="divider" />

      <section class="section" style="text-align:center">
        <button class="btn btn--secondary" id="btn-back">← Edit Comparisons</button>
        <button class="btn btn--danger btn--sm" id="btn-reset" style="margin-left:8px">Start Over</button>
      </section>
    `;

    return renderLayout({
      currentStep: STEPS.RESULTS,
      title: 'Results',
      contentHtml,
      showBack: false,
      showNext: false,
    });
  }

  afterRender(state) {
    if (!this._results) return;
    const { criteria } = state;
    const { criteriaWeights, rankings } = this._results;

    // Draw pie chart
    const pieCanvas = this._root?.querySelector('#pie-chart');
    if (pieCanvas) {
      const pieData = criteria.map((c, i) => ({ name: c.name, weight: criteriaWeights[i] }));
      drawPieChart(pieCanvas, pieData);
      const legendEl = this._root.querySelector('#pie-legend');
      if (legendEl) legendEl.innerHTML = buildPieLegend(pieData);
    }

    // Back button
    this._root?.querySelector('#btn-back')?.addEventListener('click', () => {
      this._navigateTo(STEPS.COMPARISONS);
    });

    // Reset button
    this._root?.querySelector('#btn-reset')?.addEventListener('click', () => {
      if (confirm('Start over? All your data will be cleared.')) {
        import('../state.js').then(({ resetState }) => {
          resetState();
          this._navigateTo(STEPS.HOME);
        });
      }
    });
  }

  _calculate(state) {
    const { criteria, candidates, criteriaComparisons, candidateComparisons } = state;
    if (!criteria.length || !candidates.length) return null;

    try {
      return runFuzzyAHP(criteria, candidates, criteriaComparisons, candidateComparisons);
    } catch (e) {
      console.error('Fuzzy AHP calculation error:', e);
      return null;
    }
  }

  _buildRanking(rankings) {
    return rankings.map(({ candidate, score }, i) => {
      const pct = (score * 100).toFixed(1);
      const barWidth = (score / rankings[0].score * 100).toFixed(1);
      const rankClass = RANK_CLASS[i] || '';
      const medal = MEDAL[i] || `#${i + 1}`;
      return `
        <div class="ranking-item ranking-item--${rankClass}">
          <span class="ranking-item__rank">${medal}</span>
          <div class="ranking-item__info">
            <div class="ranking-item__name">${this._escHtml(candidate.name)}</div>
            <div class="ranking-item__score">Score: ${pct}%</div>
          </div>
          <div class="ranking-item__bar-wrap">
            <div class="ranking-item__bar" style="width: ${barWidth}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  _buildScoreTable(criteria, candidates, criteriaWeights, candidateScores) {
    const headerCols = criteria.map((c, i) =>
      `<th>${this._escHtml(c.name)}<br><small class="text-muted">${(criteriaWeights[i] * 100).toFixed(1)}%</small></th>`
    ).join('');

    const bodyRows = candidates.map(candidate => {
      const cells = criteria.map(c => {
        const score = candidateScores[candidate.id]?.[c.id] ?? 0;
        return `<td>${(score * 100).toFixed(1)}%</td>`;
      }).join('');
      return `<tr><td>${this._escHtml(candidate.name)}</td>${cells}</tr>`;
    }).join('');

    return `
      <div class="score-table-wrap">
        <table class="score-table">
          <thead>
            <tr>
              <th>Candidate</th>
              ${headerCols}
            </tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
    `;
  }

  // Results page handles its own nav; BasePage nav override not needed
  _attachNavListeners() {}

  _escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
