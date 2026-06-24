/**
 * analyticsDashboardService.js
 * Module 8.1 — Analytics Dashboard Page.
 *
 * Responsibilities:
 *  - Aggregate KPI summary metrics for the analytics landing page.
 *  - Build a trend preview series (last 14 days, all active batches).
 *  - Prepare three overview panels: attendance, batch performance, student risk.
 *
 * Architecture rules:
 *  - Pure async service — no JSX, no React.
 *  - Delegates to attendanceAnalyticsService for heavy computation.
 *  - Returns the standard { success, data, meta, error } shape.
 *  - All date handling uses dateUtils.
 */

import {
  getAttendanceAnalytics,
  buildTrendData,
  buildBatchComparison,
  calculateRiskAlerts,
  classifyRisk,
  ANALYTICS_RISK,
} from '@services/attendanceAnalyticsService';
import { ok, fail, tryCatch } from '@utils/serviceResponse';
import { getToday, subtractDays } from '@utils/dateUtils';
import { DEFAULT_ATTENDANCE_THRESHOLD } from '@constants/validation';

// ── Error codes ───────────────────────────────────────────────────────────────

export const ANALYTICS_DASHBOARD_ERRORS = Object.freeze({
  LOAD_FAILED:  'ANALYTICS_DASHBOARD_LOAD_FAILED',
  NO_DATA:      'ANALYTICS_DASHBOARD_NO_DATA',
  UNEXPECTED:   'ANALYTICS_DASHBOARD_UNEXPECTED',
});

// ── Public methods ────────────────────────────────────────────────────────────

/**
 * getAnalyticsSummary()
 *
 * Returns the four headline KPI metrics for the analytics landing page.
 *
 * KPI schema:
 *  {
 *    avgAttendance:    number  — overall present % across all batches
 *    activeBatches:    number  — count of currently active batches
 *    atRiskStudents:   number  — students below threshold
 *    totalSessions:    number  — sum of distinct session dates
 *  }
 *
 * @param {number} [threshold]
 * @returns {Promise<ServiceResponse>}
 */
export const getAnalyticsSummary = async (threshold = DEFAULT_ATTENDANCE_THRESHOLD) =>
  tryCatch(async () => {
    const result = await getAttendanceAnalytics(threshold);
    if (!result.success) {
      return fail(ANALYTICS_DASHBOARD_ERRORS.LOAD_FAILED, result.error?.message ?? 'Failed to load analytics');
    }

    const {
      overallRate,
      activeBatchCount,
      atRiskCount,
      criticalCount,
      totalSessions,
      totalStudents,
      batchSummaries,
    } = result.data;

    // Compute week-over-week delta for avg attendance (approximate from batch data)
    // We compare the best half vs worst half of batches as a proxy trend
    const rates = batchSummaries.map((b) => b.averageRate);
    const avgRate = rates.length > 0
      ? rates.reduce((sum, r) => sum + r, 0) / rates.length
      : overallRate;

    return ok(
      {
        avgAttendance:  Math.round(overallRate * 10) / 10,
        activeBatches:  activeBatchCount,
        atRiskStudents: atRiskCount,
        criticalStudents: criticalCount,
        totalSessions,
        totalStudents,
        batchCount:     batchSummaries.length,
      },
      { computedAt: new Date().toISOString(), threshold }
    );
  });

/**
 * getTrendPreview()
 *
 * Returns the last 14 days of attendance trend data (all batches combined)
 * for the analytics landing page preview chart.
 *
 * @returns {Promise<ServiceResponse>}
 */
export const getTrendPreview = async () =>
  tryCatch(async () => {
    const today    = getToday();
    const from     = subtractDays(today, 13); // 14 days including today
    const result   = await buildTrendData(null, from, today);

    if (!result.success) {
      return fail(ANALYTICS_DASHBOARD_ERRORS.LOAD_FAILED, result.error?.message ?? 'Failed to build trend');
    }

    return ok(result.data ?? [], {
      from,
      to: today,
      points: result.data?.length ?? 0,
    });
  });

/**
 * getOverviewPanels()
 *
 * Returns three overview panel data objects for the analytics landing page.
 *
 * Panel 1 — Attendance Overview:
 *  { avgAttendance, absentRatio, weeklyDelta }
 *
 * Panel 2 — Batch Performance Overview:
 *  { bestBatch, worstBatch, avgBatchPerformance }
 *
 * Panel 3 — Student Risk Overview:
 *  { riskStudents, criticalStudents, improvementCount }
 *
 * @param {number} [threshold]
 * @returns {Promise<ServiceResponse>}
 */
export const getOverviewPanels = async (threshold = DEFAULT_ATTENDANCE_THRESHOLD) =>
  tryCatch(async () => {
    const [analyticsRes, comparisonRes, alertsRes] = await Promise.all([
      getAttendanceAnalytics(threshold),
      buildBatchComparison(),
      calculateRiskAlerts(threshold),
    ]);

    const allFailed = !analyticsRes.success && !comparisonRes.success && !alertsRes.success;
    if (allFailed) {
      return fail(ANALYTICS_DASHBOARD_ERRORS.LOAD_FAILED, 'All panel data sources failed');
    }

    // ── Panel 1: Attendance Overview ────────────────────────────────────────
    const analytics = analyticsRes.data ?? {};
    const panel1 = {
      avgAttendance: analytics.overallRate ?? 0,
      absentRatio:   analytics.absentRatio  ?? 0,
      weeklyDelta:   null, // Would require historical comparison; kept null for V1
      totalRecords:  (analytics.totalSessions ?? 0) * (analytics.totalStudents ?? 0),
    };

    // ── Panel 2: Batch Performance Overview ────────────────────────────────
    const batchComparison = comparisonRes.data ?? [];
    const sortedBatches   = [...batchComparison].sort((a, b) => b.averageRate - a.averageRate);
    const bestBatch       = sortedBatches[0]  ?? null;
    const worstBatch      = sortedBatches[sortedBatches.length - 1] ?? null;
    const avgBatchPerf    = sortedBatches.length > 0
      ? Math.round(
          sortedBatches.reduce((sum, b) => sum + b.averageRate, 0) / sortedBatches.length
        )
      : 0;

    const panel2 = {
      bestBatch:  bestBatch
        ? { name: bestBatch.batchName, rate: bestBatch.averageRate, risk: bestBatch.risk }
        : null,
      worstBatch: worstBatch && worstBatch.batchId !== bestBatch?.batchId
        ? { name: worstBatch.batchName, rate: worstBatch.averageRate, risk: worstBatch.risk }
        : null,
      avgBatchPerformance: avgBatchPerf,
      totalBatches:        sortedBatches.length,
    };

    // ── Panel 3: Student Risk Overview ─────────────────────────────────────
    const alerts    = alertsRes.data ?? [];
    const batchData = analyticsRes.data?.batchSummaries ?? [];

    // Count "improving" students: those with medium risk (75–84%) — they're
    // above threshold but need attention. In V1 we use medium-risk batchSummary
    // students as a proxy for "at risk of declining".
    let improvementCount = 0;
    for (const batch of batchData) {
      for (const stu of batch.studentSummaries ?? []) {
        if (classifyRisk(stu.percentage) === ANALYTICS_RISK.MEDIUM) {
          improvementCount++;
        }
      }
    }

    const panel3 = {
      riskStudents:     analytics.atRiskCount    ?? 0,
      criticalStudents: analytics.criticalCount  ?? 0,
      improvementCount, // medium risk — need attention but above threshold
      totalStudents:    analytics.totalStudents  ?? 0,
      alertCount:       alerts.length,
    };

    return ok(
      { panel1, panel2, panel3 },
      { computedAt: new Date().toISOString(), threshold }
    );
  });
