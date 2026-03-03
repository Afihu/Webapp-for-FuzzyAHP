/**
 * charts.js
 * Canvas-based chart rendering for the results page.
 * No external dependencies — uses the native Canvas 2D API.
 */

import { CHART_COLORS } from '../utils/constants.js';

/**
 * Draw a pie chart on a <canvas> element showing criteria weights.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Array<{ name: string, weight: number }>} data
 */
export function drawPieChart(canvas, data) {
  const dpr = window.devicePixelRatio || 1;
  const cssSize = 240;

  // Set the canvas buffer size to match device pixels for crisp rendering
  canvas.width = cssSize * dpr;
  canvas.height = cssSize * dpr;
  canvas.style.width = cssSize + 'px';
  canvas.style.height = cssSize + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const cx = cssSize / 2;
  const cy = cssSize / 2;
  const radius = cx - 10;

  ctx.clearRect(0, 0, cssSize, cssSize);

  const total = data.reduce((s, d) => s + d.weight, 0);
  if (total === 0) return;

  let startAngle = -Math.PI / 2;

  data.forEach((slice, i) => {
    const sliceAngle = (slice.weight / total) * 2 * Math.PI;
    const color = CHART_COLORS[i % CHART_COLORS.length];

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Percentage label inside slice (only if slice is big enough)
    if (sliceAngle > 0.3) {
      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.65;
      const lx = cx + labelRadius * Math.cos(midAngle);
      const ly = cy + labelRadius * Math.sin(midAngle);
      const pct = ((slice.weight / total) * 100).toFixed(1) + '%';

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pct, lx, ly);
    }

    startAngle += sliceAngle;
  });
}

/**
 * Build a legend HTML string for a pie chart.
 * @param {Array<{ name: string, weight: number }>} data
 * @returns {string}
 */
export function buildPieLegend(data) {
  return `
    <div class="chart-legend">
      ${data.map((item, i) => `
        <div class="chart-legend__item">
          <span class="chart-legend__swatch" style="background-color: ${CHART_COLORS[i % CHART_COLORS.length]}"></span>
          <span>${item.name} — ${(item.weight * 100).toFixed(1)}%</span>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Draw a horizontal bar chart for candidate scores per criterion.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Array<{ name: string, score: number }>} data
 */
export function drawBarChart(canvas, data) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  const barHeight = 30;
  const gap = 14;
  const labelWidth = 120;
  const padding = { top: 10, right: 20, bottom: 10, left: labelWidth };
  const maxBarWidth = W - padding.left - padding.right;

  const maxScore = Math.max(...data.map(d => d.score), 0.001);

  data.forEach((item, i) => {
    const y = padding.top + i * (barHeight + gap);
    const barWidth = (item.score / maxScore) * maxBarWidth;
    const color = CHART_COLORS[i % CHART_COLORS.length];

    // Bar
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(padding.left, y, Math.max(barWidth, 4), barHeight, 4);
    ctx.fill();

    // Label (left)
    ctx.fillStyle = '#1e293b';
    ctx.font = '13px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const truncated = item.name.length > 14 ? item.name.slice(0, 13) + '…' : item.name;
    ctx.fillText(truncated, padding.left - 8, y + barHeight / 2);

    // Score (right of bar)
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'left';
    ctx.fillText((item.score * 100).toFixed(1) + '%', padding.left + barWidth + 6, y + barHeight / 2);
  });
}

/**
 * Calculate the canvas height needed for a bar chart with N items.
 * @param {number} n
 * @returns {number}
 */
export function barChartHeight(n) {
  return n * (30 + 14) + 20;
}
