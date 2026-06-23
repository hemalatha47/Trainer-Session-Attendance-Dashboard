/**
 * riskUtils.js
 * Centralized risk classification for student attendance percentages.
 * Module 5.4 — Student Filters
 *
 * Rules:
 *   90–100 → Excellent (green)
 *   75–89  → Good      (blue)
 *   60–74  → Warning   (yellow)
 *   0–59   → Critical  (red)
 *
 * Used by:
 *   - filterStudentsByRisk (filtering.js extension)
 *   - StudentFilterBar (chip labels)
 *   - Future dashboards / analytics
 */

// ── Risk level definitions ────────────────────────────────────────────────────

export const RISK_LEVELS = Object.freeze({
  EXCELLENT: 'excellent',
  GOOD:      'good',
  WARNING:   'warning',
  CRITICAL:  'critical',
});

/**
 * Full risk level metadata map.
 * Each entry:
 *   label       — display text
 *   colorToken  — Tailwind color class prefix key used in UI
 *   severity    — numeric severity (1=best, 4=worst) for sorting
 *   min         — inclusive lower bound
 *   max         — inclusive upper bound (100 for excellent/good/warning top)
 */
export const RISK_LEVEL_META = Object.freeze({
  [RISK_LEVELS.EXCELLENT]: {
    label:      'Excellent',
    colorToken: 'success',
    severity:   1,
    min:        90,
    max:        100,
  },
  [RISK_LEVELS.GOOD]: {
    label:      'Good',
    colorToken: 'accent',
    severity:   2,
    min:        75,
    max:        89,
  },
  [RISK_LEVELS.WARNING]: {
    label:      'Warning',
    colorToken: 'warning',
    severity:   3,
    min:        60,
    max:        74,
  },
  [RISK_LEVELS.CRITICAL]: {
    label:      'Critical',
    colorToken: 'danger',
    severity:   4,
    min:        0,
    max:        59,
  },
});

// ── Core classifier ───────────────────────────────────────────────────────────

/**
 * Classifies a student's attendance percentage into a risk level.
 *
 * @param {number|null|undefined} attendancePercentage
 * @returns {{
 *   level:      string,   — RISK_LEVELS key
 *   label:      string,   — human-readable label
 *   colorToken: string,   — Tailwind variant key (used in Badge/StatusBadge)
 *   severity:   number,   — 1 (best) to 4 (worst)
 * }}
 *
 * @example
 *   const { label, colorToken } = getStudentRiskLevel(82);
 *   // → { level: 'good', label: 'Good', colorToken: 'accent', severity: 2 }
 */
export const getStudentRiskLevel = (attendancePercentage) => {
  const pct = typeof attendancePercentage === 'number' ? attendancePercentage : -1;

  let level;
  if      (pct >= 90) level = RISK_LEVELS.EXCELLENT;
  else if (pct >= 75) level = RISK_LEVELS.GOOD;
  else if (pct >= 60) level = RISK_LEVELS.WARNING;
  else                level = RISK_LEVELS.CRITICAL;

  const meta = RISK_LEVEL_META[level];

  return {
    level,
    label:      meta.label,
    colorToken: meta.colorToken,
    severity:   meta.severity,
  };
};

/**
 * Returns only the risk level key for a given percentage.
 * Lightweight version for filter comparisons.
 *
 * @param {number|null|undefined} attendancePercentage
 * @returns {string}  RISK_LEVELS key
 */
export const getRiskLevelKey = (attendancePercentage) =>
  getStudentRiskLevel(attendancePercentage).level;
