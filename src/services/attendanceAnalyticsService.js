/**
 * attendanceAnalyticsService.js
 * Analytics service layer for Module 6.7 — Attendance Analytics & Alerts.
 *
 * Responsibilities:
 *  - Aggregate attendance analytics across all batches and students.
 *  - Build trend chart datasets (line chart).
 *  - Build batch comparison datasets (bar chart).
 *  - Compute KPI metrics (overall rate, absent ratio, risk counts).
 *  - Generate risk alerts sorted by severity.
 *
 * Architecture rules:
 *  - No JSX / React — pure async service.
 *  - Reads exclusively through attendanceService (never imports mock data directly).
 *  - Returns the standard { success, data, meta, error } shape.
 *  - All date handling delegates to dateUtils.
 *
 * Risk levels (Module 6.7 spec):
 *  Critical  < 60%
 *  High      60–74%
 *  Medium    75–84%
 *  Low       ≥ 85%
 */

import {
  getAttendanceByBatch,
  getBatchComparisonData,
  getAttendanceTrend,
} from '@services/attendanceService';
import { mockBatches }  from '@data/mockBatches';
import { mockStudents } from '@data/mockStudents';
import { ok, fail, tryCatch } from '@utils/serviceResponse';
import {
  getDistinctAttendanceDates,
  formatDate,
  getToday,
  subtractDays,
} from '@utils/dateUtils';
import {
  calculateAttendancePercentage,
  calculatePresentCount,
  calculateAbsentCount,
  calculateStudentAttendanceSummary,
} from '@utils/calcUtils';
import { BATCH_STATUS } from '@constants/batchStatus';
import { DEFAULT_ATTENDANCE_THRESHOLD } from '@constants/validation';
import { COLORS } from '@constants/colors';

// ── Error codes ───────────────────────────────────────────────────────────────

export const ANALYTICS_ERRORS = Object.freeze({
  LOAD_FAILED:  'ANALYTICS_LOAD_FAILED',
  NO_DATA:      'ANALYTICS_NO_DATA',
  UNEXPECTED:   'ANALYTICS_UNEXPECTED',
});

// ── Risk level definitions (Module 6.7 spec) ─────────────────────────────────

export const ANALYTICS_RISK = Object.freeze({
  LOW:      'low',
  MEDIUM:   'medium',
  HIGH:     'high',
  CRITICAL: 'critical',
});

export const ANALYTICS_RISK_META = Object.freeze({
  [ANALYTICS_RISK.LOW]: {
    label:    'Good Standing',
    minPct:   85,
    maxPct:   100,
    severity: 1,
    color:    COLORS?.success?.DEFAULT ?? '#22C55E',
    bgClass:  'bg-success-50 text-success-700 border-success-200',
  },
  [ANALYTICS_RISK.MEDIUM]: {
    label:    'Needs Attention',
    minPct:   75,
    maxPct:   84,
    severity: 2,
    color:    COLORS?.accent?.DEFAULT ?? '#2563EB',
    bgClass:  'bg-accent-50 text-accent-700 border-accent-200',
  },
  [ANALYTICS_RISK.HIGH]: {
    label:    'At Risk',
    minPct:   60,
    maxPct:   74,
    severity: 3,
    color:    COLORS?.warning?.DEFAULT ?? '#F59E0B',
    bgClass:  'bg-warning-50 text-warning-700 border-warning-200',
  },
  [ANALYTICS_RISK.CRITICAL]: {
    label:    'Critical',
    minPct:   0,
    maxPct:   59,
    severity: 4,
    color:    COLORS?.danger?.DEFAULT ?? '#EF4444',
    bgClass:  'bg-danger-50 text-danger-700 border-danger-200',
  },
});

/**
 * Classifies a percentage into a risk level.
 * @param {number} pct
 * @returns {string} ANALYTICS_RISK key
 */
export const classifyRisk = (pct) => {
  if (pct >= 85) return ANALYTICS_RISK.LOW;
  if (pct >= 75) return ANALYTICS_RISK.MEDIUM;
  if (pct >= 60) return ANALYTICS_RISK.HIGH;
  return ANALYTICS_RISK.CRITICAL;
};

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Returns the active and completed batches that have attendance data.
 */
const _getRelevantBatches = () =>
  mockBatches.filter(
    (b) =>
      b.status === BATCH_STATUS.ACTIVE ||
      b.status === BATCH_STATUS.COMPLETED ||
      b.status === BATCH_STATUS.ON_HOLD
  );

/**
 * Gets students for a batch.
 */
const _getBatchStudents = (batchId) =>
  mockStudents.filter((s) => s.batchId === batchId && s.status !== 'inactive');

// ── Public service methods ────────────────────────────────────────────────────

/**
 * getAttendanceAnalytics()
 *
 * Master KPI aggregation across all batches.
 *
 * Returns:
 *  - overallRate          : weighted present % across all records
 *  - absentRatio          : absent % across all records
 *  - totalStudents        : all tracked students
 *  - totalSessions        : sum of distinct session dates across batches
 *  - atRiskCount          : students below threshold
 *  - criticalCount        : students < 60%
 *  - activeBatchCount     : number of currently active batches
 *  - batchSummaries       : per-batch KPI breakdown
 *
 * @param {number} [threshold]
 * @returns {Promise<ServiceResponse>}
 */
export const getAttendanceAnalytics = async (threshold = DEFAULT_ATTENDANCE_THRESHOLD) =>
  tryCatch(async () => {
    const batches = _getRelevantBatches();
    if (batches.length === 0) {
      return ok(
        {
          overallRate:       0,
          absentRatio:       0,
          totalStudents:     0,
          totalSessions:     0,
          atRiskCount:       0,
          criticalCount:     0,
          activeBatchCount:  0,
          batchSummaries:    [],
        },
        { batchCount: 0 }
      );
    }

    let totalPresent   = 0;
    let totalAbsent    = 0;
    let totalStudents  = 0;
    let totalSessions  = 0;
    let atRiskCount    = 0;
    let criticalCount  = 0;
    let activeBatchCount = 0;
    const batchSummaries = [];

    for (const batch of batches) {
      const result = await getAttendanceByBatch(batch.id);
      if (!result.success) continue;

      const records  = result.data ?? [];
      const students = _getBatchStudents(batch.id);
      const distinctDates = getDistinctAttendanceDates(records);

      if (batch.status === BATCH_STATUS.ACTIVE) activeBatchCount++;

      const presentInBatch = calculatePresentCount(records);
      const absentInBatch  = calculateAbsentCount(records);
      totalPresent  += presentInBatch;
      totalAbsent   += absentInBatch;
      totalStudents += students.length;
      totalSessions += distinctDates.length;

      // Per-student risk
      let batchAtRisk   = 0;
      let batchCritical = 0;
      const studentSummaries = students.map((stu) => {
        const summary = calculateStudentAttendanceSummary(
          stu.id, records, distinctDates, threshold
        );
        const risk = classifyRisk(summary.percentage);
        if (summary.percentage < threshold)       batchAtRisk++;
        if (summary.percentage < 60)              batchCritical++;
        return {
          studentId:   stu.id,
          studentName: `${stu.firstName} ${stu.lastName}`,
          studentCode: stu.studentCode,
          batchId:     batch.id,
          ...summary,
          risk,
        };
      });

      atRiskCount  += batchAtRisk;
      criticalCount += batchCritical;

      const totalRecords = records.length;
      const batchRate    = calculateAttendancePercentage(presentInBatch, totalRecords);

      batchSummaries.push({
        batchId:        batch.id,
        batchName:      batch.batchName,
        status:         batch.status,
        totalSessions:  distinctDates.length,
        totalStudents:  students.length,
        presentCount:   presentInBatch,
        absentCount:    absentInBatch,
        averageRate:    batchRate,
        atRiskCount:    batchAtRisk,
        criticalCount:  batchCritical,
        risk:           classifyRisk(batchRate),
        studentSummaries,
      });
    }

    const totalRecords = totalPresent + totalAbsent;
    const overallRate  = calculateAttendancePercentage(totalPresent, totalRecords);
    const absentRatio  = calculateAttendancePercentage(totalAbsent,  totalRecords);

    return ok(
      {
        overallRate,
        absentRatio,
        totalStudents,
        totalSessions,
        atRiskCount,
        criticalCount,
        activeBatchCount,
        batchSummaries,
      },
      { batchCount: batches.length, computedAt: new Date().toISOString() }
    );
  });

/**
 * buildTrendData()
 *
 * Builds a daily attendance rate series for the line chart.
 * Uses the most recent 30 days of data for the selected batch,
 * or all active batches combined if batchId is null.
 *
 * @param {string|null} batchId  — null = aggregate across active batches
 * @param {string}      [from]   — YYYY-MM-DD
 * @param {string}      [to]     — YYYY-MM-DD
 * @returns {Promise<ServiceResponse>}
 */
export const buildTrendData = async (batchId = null, from = null, to = null) =>
  tryCatch(async () => {
    const today    = getToday();
    const fromDate = from ?? subtractDays(today, 29);
    const toDate   = to   ?? today;

    const targetBatches = batchId
      ? mockBatches.filter((b) => b.id === batchId)
      : _getRelevantBatches();

    if (targetBatches.length === 0) {
      return ok([], { from: fromDate, to: toDate, points: 0 });
    }

    // Aggregate records across selected batches by date
    const byDate = {};

    for (const batch of targetBatches) {
      const result = await getAttendanceTrend(batch.id, fromDate, toDate);
      if (!result.success) continue;
      for (const point of result.data ?? []) {
        if (!byDate[point.date]) {
          byDate[point.date] = { present: 0, absent: 0 };
        }
        byDate[point.date].present += point.presentCount;
        byDate[point.date].absent  += point.absentCount;
      }
    }

    const series = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { present, absent }]) => {
        const total = present + absent;
        const rate  = calculateAttendancePercentage(present, total);
        return {
          date,
          displayDate:  formatDate(date),
          presentCount: present,
          absentCount:  absent,
          total,
          rate,
        };
      });

    return ok(series, { from: fromDate, to: toDate, points: series.length });
  });

/**
 * buildBatchComparison()
 *
 * Returns per-batch average attendance for the bar chart.
 * Includes only batches that have at least one attendance record.
 *
 * @returns {Promise<ServiceResponse>}
 */
export const buildBatchComparison = async () =>
  tryCatch(async () => {
    const batches   = _getRelevantBatches();
    const batchIds  = batches.map((b) => b.id);
    const result    = await getBatchComparisonData(batchIds);

    if (!result.success) return fail(ANALYTICS_ERRORS.LOAD_FAILED, result.error?.message);

    const data = result.data
      .filter((d) => d.totalSessions > 0)
      .map((d) => {
        const batch = batches.find((b) => b.id === d.batchId);
        return {
          batchId:       d.batchId,
          batchName:     batch?.batchName ?? d.batchId,
          shortName:     batch?.batchCode ?? d.batchId,
          status:        batch?.status ?? '',
          averageRate:   d.averageRate,
          totalSessions: d.totalSessions,
          risk:          classifyRisk(d.averageRate),
        };
      })
      .sort((a, b) => b.averageRate - a.averageRate);

    return ok(data, { batchCount: data.length });
  });

/**
 * calculateRiskAlerts()
 *
 * Generates a sorted alert list from all student attendance summaries.
 * Highest severity (Critical) first.
 *
 * Alert schema:
 *  {
 *    id:          string,
 *    type:        'low_attendance' | 'critical_attendance',
 *    severity:    'critical' | 'high' | 'medium',
 *    studentId:   string,
 *    studentName: string,
 *    studentCode: string,
 *    batchId:     string,
 *    batchName:   string,
 *    percentage:  number,
 *    risk:        string,
 *    message:     string,
 *    detectedAt:  string,
 *  }
 *
 * @param {number} [threshold]
 * @returns {Promise<ServiceResponse>}
 */
export const calculateRiskAlerts = async (threshold = DEFAULT_ATTENDANCE_THRESHOLD) =>
  tryCatch(async () => {
    const analyticsResult = await getAttendanceAnalytics(threshold);
    if (!analyticsResult.success) {
      return fail(ANALYTICS_ERRORS.LOAD_FAILED, analyticsResult.error?.message);
    }

    const { batchSummaries } = analyticsResult.data;
    const alerts = [];
    const now    = new Date().toISOString();

    for (const batch of batchSummaries) {
      for (const stu of batch.studentSummaries) {
        if (stu.percentage >= threshold) continue;

        const risk     = classifyRisk(stu.percentage);
        const isCrit   = risk === ANALYTICS_RISK.CRITICAL;
        const isHigh   = risk === ANALYTICS_RISK.HIGH;

        if (!isCrit && !isHigh && stu.percentage >= 60) continue; // medium = skip

        alerts.push({
          id:          `alert-${stu.studentId}-${batch.batchId}`,
          type:        isCrit ? 'critical_attendance' : 'low_attendance',
          severity:    risk,
          studentId:   stu.studentId,
          studentName: stu.studentName,
          studentCode: stu.studentCode,
          batchId:     batch.batchId,
          batchName:   batch.batchName,
          percentage:  stu.percentage,
          risk,
          message: isCrit
            ? `${stu.studentName} has critically low attendance at ${stu.percentage}% (threshold: ${threshold}%)`
            : `${stu.studentName} attendance is at ${stu.percentage}% — below the ${threshold}% threshold`,
          detectedAt: now,
        });
      }
    }

    // Sort: critical first, then high; within same risk, lowest % first
    alerts.sort((a, b) => {
      const sevA = ANALYTICS_RISK_META[a.severity]?.severity ?? 99;
      const sevB = ANALYTICS_RISK_META[b.severity]?.severity ?? 99;
      if (sevB !== sevA) return sevB - sevA;
      return a.percentage - b.percentage;
    });

    return ok(alerts, { total: alerts.length, critical: alerts.filter(a => a.severity === 'critical').length });
  });
