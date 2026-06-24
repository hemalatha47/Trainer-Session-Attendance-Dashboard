/**
 * analyticsInsightsService.js
 * Module 8.3 — Analytics Charts & Summary Views
 *
 * Responsibilities:
 *  - Trend calculations filtered by date range / batch
 *  - Batch comparison (sorted descending by rate)
 *  - Student risk grouping by 4 categories (Low / Medium / High / Critical)
 *  - Summary metric cards (avg, best, worst, at-risk)
 *
 * Architecture rules:
 *  - No JSX / React — pure async service.
 *  - Delegates raw aggregation to attendanceAnalyticsService (never duplicates formulas).
 *  - Delegates risk classification to attendanceAnalyticsService.classifyRisk (not riskUtils)
 *    because analytics module uses the 4-tier ANALYTICS_RISK scale (85/75/60 thresholds).
 *  - Returns the standard { success, data, meta, error } shape.
 *  - All date handling uses dateUtils.
 *
 * Risk thresholds (ANALYTICS_RISK spec, Section 6.7):
 *  Low      ≥ 85%
 *  Medium   75–84%
 *  High     60–74%
 *  Critical < 60%
 */

import {
  getAttendanceAnalytics,
  buildTrendData,
  buildBatchComparison,
  classifyRisk,
  ANALYTICS_RISK,
  ANALYTICS_RISK_META,
} from '@services/attendanceAnalyticsService';
import { ok, fail, tryCatch } from '@utils/serviceResponse';
import { getToday, subtractDays } from '@utils/dateUtils';
import { DEFAULT_ATTENDANCE_THRESHOLD } from '@constants/validation';

// ── Error codes ───────────────────────────────────────────────────────────────

export const INSIGHTS_ERRORS = Object.freeze({
  LOAD_FAILED: 'INSIGHTS_LOAD_FAILED',
  NO_DATA:     'INSIGHTS_NO_DATA',
  UNEXPECTED:  'INSIGHTS_UNEXPECTED',
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolve a canonical date range from optional filter parameters.
 * Defaults to the last 30 days when neither from nor to is supplied.
 *
 * @param {string|null} [from]  — YYYY-MM-DD
 * @param {string|null} [to]    — YYYY-MM-DD
 * @returns {{ from: string, to: string }}
 */
const _resolveRange = (from = null, to = null) => {
  const today = getToday();
  return {
    from: from ?? subtractDays(today, 29),
    to:   to   ?? today,
  };
};

// ── Public service methods ────────────────────────────────────────────────────

/**
 * getAttendanceTrendData()
 *
 * Builds a date-series suitable for the line chart.
 * Delegates computation to buildTrendData — no formula duplication.
 *
 * Data point schema:
 *  { date, displayDate, rate, presentCount, absentCount, total }
 *
 * Derived annotations added here:
 *  highPoint — boolean: true for the data point with the highest rate
 *  lowPoint  — boolean: true for the data point with the lowest rate
 *  trend     — 'up' | 'down' | 'flat' — direction vs previous point
 *
 * @param {object} [options]
 * @param {string|null} [options.batchId]
 * @param {string|null} [options.from]
 * @param {string|null} [options.to]
 * @returns {Promise<ServiceResponse>}
 */
export const getAttendanceTrendData = async ({ batchId = null, from = null, to = null } = {}) =>
  tryCatch(async () => {
    const range  = _resolveRange(from, to);
    const result = await buildTrendData(batchId, range.from, range.to);

    if (!result.success) {
      return fail(INSIGHTS_ERRORS.LOAD_FAILED, result.error?.message ?? 'Failed to build trend data');
    }

    const series = result.data ?? [];

    if (series.length === 0) {
      return ok([], { from: range.from, to: range.to, points: 0, batchId });
    }

    // Compute high/low markers
    const rates     = series.map((p) => p.rate);
    const maxRate   = Math.max(...rates);
    const minRate   = Math.min(...rates);
    const firstIdx  = rates.findIndex((r) => r === maxRate);
    const lastIdx   = [...rates].reverse().findIndex((r) => r === minRate);
    const minIdx    = rates.length - 1 - lastIdx;

    // Annotate
    const annotated = series.map((point, i) => {
      let trend = 'flat';
      if (i > 0) {
        const prev = series[i - 1].rate;
        if (point.rate > prev)      trend = 'up';
        else if (point.rate < prev) trend = 'down';
      }
      return {
        ...point,
        trend,
        highPoint: i === firstIdx && rates.filter((r) => r === maxRate).length === 1,
        lowPoint:  i === minIdx  && rates.filter((r) => r === minRate).length === 1,
      };
    });

    // Overall trend direction for the chart header badge
    const first = series[0].rate;
    const last  = series[series.length - 1].rate;
    const overallTrend = last > first ? 'up' : last < first ? 'down' : 'flat';
    const delta        = Math.round((last - first) * 10) / 10;

    return ok(annotated, {
      from:          range.from,
      to:            range.to,
      points:        annotated.length,
      batchId,
      highPoint:     maxRate,
      lowPoint:      minRate,
      overallTrend,
      delta,
    });
  });

/**
 * getBatchComparisonData()
 *
 * Builds batch comparison rows for the bar chart, sorted descending by rate.
 * Delegates base computation to buildBatchComparison — no formula duplication.
 *
 * Augments each row with:
 *  rank      — 1-indexed position in descending order
 *  isTop     — boolean: true for first
 *  isBottom  — boolean: true for last
 *
 * @param {object} [options]
 * @param {string|null} [options.batchId]   — filter to single batch (null = all)
 * @returns {Promise<ServiceResponse>}
 */
export const getBatchComparisonData = async ({ batchId = null } = {}) =>
  tryCatch(async () => {
    const result = await buildBatchComparison();

    if (!result.success) {
      return fail(INSIGHTS_ERRORS.LOAD_FAILED, result.error?.message ?? 'Failed to build batch comparison');
    }

    let data = result.data ?? [];

    // Filter to single batch if requested
    if (batchId) {
      data = data.filter((d) => d.batchId === batchId);
    }

    if (data.length === 0) {
      return ok([], { batchCount: 0, filtered: !!batchId });
    }

    // Annotate rank markers
    const annotated = data.map((batch, i) => ({
      ...batch,
      rank:     i + 1,
      isTop:    i === 0,
      isBottom: i === data.length - 1,
    }));

    return ok(annotated, {
      batchCount: annotated.length,
      filtered:   !!batchId,
      topBatch:   annotated[0]?.batchName ?? null,
      bottomBatch: annotated[annotated.length - 1]?.batchName ?? null,
    });
  });

/**
 * getStudentRiskSummary()
 *
 * Groups all tracked students into 4 risk buckets based on ANALYTICS_RISK thresholds.
 * Uses classifyRisk() from attendanceAnalyticsService — no formula duplication.
 *
 * Returns:
 *  {
 *    groups: [
 *      { risk, label, count, percentage, students: [...], color, bgClass }
 *    ],    — ordered Critical → High → Medium → Low
 *    totals: { low, medium, high, critical, total }
 *    alerts:  string[]  — top alert messages for high/critical students
 *  }
 *
 * @param {object} [options]
 * @param {number} [options.threshold]   — override default threshold
 * @param {string|null} [options.batchId]   — filter to single batch
 * @returns {Promise<ServiceResponse>}
 */
export const getStudentRiskSummary = async ({
  threshold = DEFAULT_ATTENDANCE_THRESHOLD,
  batchId   = null,
} = {}) =>
  tryCatch(async () => {
    const result = await getAttendanceAnalytics(threshold);

    if (!result.success) {
      return fail(INSIGHTS_ERRORS.LOAD_FAILED, result.error?.message ?? 'Failed to load analytics');
    }

    const { batchSummaries } = result.data;

    // Collect all student summaries (optionally filtered by batch)
    const allStudents = [];
    for (const batch of batchSummaries) {
      if (batchId && batch.batchId !== batchId) continue;
      for (const stu of batch.studentSummaries ?? []) {
        allStudents.push({
          studentId:   stu.studentId,
          studentName: stu.studentName,
          studentCode: stu.studentCode,
          batchId:     batch.batchId,
          batchName:   batch.batchName,
          percentage:  stu.percentage,
          present:     stu.presentCount,
          absent:      stu.absentCount,
          totalSessions: stu.totalSessions,
          risk:        classifyRisk(stu.percentage),
        });
      }
    }

    const total = allStudents.length;

    // Group by risk level — Critical → High → Medium → Low display order
    const ORDER = [
      ANALYTICS_RISK.CRITICAL,
      ANALYTICS_RISK.HIGH,
      ANALYTICS_RISK.MEDIUM,
      ANALYTICS_RISK.LOW,
    ];

    const groups = ORDER.map((risk) => {
      const meta     = ANALYTICS_RISK_META[risk];
      const students = allStudents.filter((s) => s.risk === risk);
      return {
        risk,
        label:      meta.label,
        count:      students.count ?? students.length,
        students:   students.sort((a, b) => a.percentage - b.percentage),
        percentage: total > 0 ? Math.round((students.length / total) * 100) : 0,
        color:      meta.color,
        bgClass:    meta.bgClass,
      };
    });

    const totals = {
      [ANALYTICS_RISK.LOW]:      groups.find((g) => g.risk === ANALYTICS_RISK.LOW)?.students.length      ?? 0,
      [ANALYTICS_RISK.MEDIUM]:   groups.find((g) => g.risk === ANALYTICS_RISK.MEDIUM)?.students.length   ?? 0,
      [ANALYTICS_RISK.HIGH]:     groups.find((g) => g.risk === ANALYTICS_RISK.HIGH)?.students.length     ?? 0,
      [ANALYTICS_RISK.CRITICAL]: groups.find((g) => g.risk === ANALYTICS_RISK.CRITICAL)?.students.length ?? 0,
      total,
    };

    // Top 3 alert messages for the most at-risk students
    const alerts = allStudents
      .filter((s) => s.risk === ANALYTICS_RISK.CRITICAL || s.risk === ANALYTICS_RISK.HIGH)
      .slice(0, 3)
      .map((s) => `${s.studentName} — ${s.percentage}% (${s.batchName})`);

    return ok({ groups, totals, alerts }, {
      total,
      filtered: !!batchId,
      batchId,
      threshold,
    });
  });

/**
 * getAnalyticsSummaryCards()
 *
 * Returns the four headline summary cards for Module 8.3.
 *
 * Cards:
 *  1. Average Attendance   — overall % across all batches
 *  2. Best Performing Batch — batch with highest avg rate
 *  3. Worst Performing Batch — batch with lowest avg rate
 *  4. At-Risk Students      — count below threshold
 *
 * @param {object} [options]
 * @param {number} [options.threshold]
 * @param {string|null} [options.batchId]
 * @returns {Promise<ServiceResponse>}
 */
export const getAnalyticsSummaryCards = async ({
  threshold = DEFAULT_ATTENDANCE_THRESHOLD,
  batchId   = null,
} = {}) =>
  tryCatch(async () => {
    const [analyticsRes, comparisonRes] = await Promise.all([
      getAttendanceAnalytics(threshold),
      buildBatchComparison(),
    ]);

    if (!analyticsRes.success && !comparisonRes.success) {
      return fail(INSIGHTS_ERRORS.LOAD_FAILED, 'All analytics sources failed');
    }

    const analytics    = analyticsRes.data ?? {};
    let batchList      = comparisonRes.data ?? [];

    if (batchId) {
      batchList = batchList.filter((b) => b.batchId === batchId);
    }

    const sorted    = [...batchList].sort((a, b) => b.averageRate - a.averageRate);
    const best      = sorted[0]  ?? null;
    const worst     = sorted.length > 1 ? sorted[sorted.length - 1] : null;

    // Average across filtered set (or overall when no batch filter)
    const avgRate = batchId && sorted.length > 0
      ? Math.round(sorted.reduce((s, b) => s + b.averageRate, 0) / sorted.length * 10) / 10
      : analytics.overallRate ?? 0;

    return ok(
      {
        avgAttendance: {
          value:        avgRate,
          label:        'Average Attendance',
          description:  batchId ? 'For selected batch' : 'Across all batches',
          risk:         classifyRisk(avgRate),
        },
        bestBatch: best
          ? {
              name:  best.batchName,
              rate:  best.averageRate,
              risk:  best.risk,
              sessions: best.totalSessions,
            }
          : null,
        worstBatch: worst
          ? {
              name:  worst.batchName,
              rate:  worst.averageRate,
              risk:  worst.risk,
              sessions: worst.totalSessions,
            }
          : null,
        atRiskStudents: {
          count:       analytics.atRiskCount    ?? 0,
          critical:    analytics.criticalCount  ?? 0,
          threshold,
        },
      },
      {
        threshold,
        batchId,
        batchCount: batchList.length,
        computedAt: new Date().toISOString(),
      }
    );
  });
