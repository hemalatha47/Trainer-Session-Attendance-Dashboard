/**
 * studentAttendanceService.js
 * Centralized attendance analytics service for a single student.
 * Module 5.6 — Student Attendance Integration.
 *
 * Blueprint Sections: 4.6, 9.4, 9.5
 *
 * ARCHITECTURE RULES:
 *  - All analytics logic lives here — zero calculation in UI layers.
 *  - All methods are async (API-migration safe).
 *  - All methods return the { success, data, meta, error } shape.
 *  - Depends on attendanceService for raw records — no direct data imports.
 *
 * EXPORTED METHODS:
 *  getStudentAttendanceAnalytics(studentId, batchId)  — full analytics bundle
 *
 * INTERNAL HELPERS:
 *  _calcStreaks         — current/longest present & absent streaks
 *  _calcAlerts          — consecutive absence, low %, sudden drop alerts
 *  _calcWeeklyTrend    — last-7-session rate vs overall average
 */

import {
  getStudentAttendance,
  calculateAttendancePercentageForStudent,
} from '@services/attendanceService';
import {
  calculateAttendancePercentage,
  calculatePresentCount,
  calculateAbsentCount,
} from '@utils/attendanceCalculations';
import { getStudentRiskLevel } from '@utils/riskUtils';
import { ok, fail, tryCatch } from '@utils/serviceResponse';
import { ATTENDANCE_STATUS } from '@constants/attendanceStatus';
import { DEFAULT_ATTENDANCE_THRESHOLD } from '@constants/validation';

// ── Internal helpers (pure) ───────────────────────────────────────────────────

/**
 * Calculates current and longest streak data from a date-sorted record array.
 * Records must be sorted oldest → newest (ascending date).
 *
 * @param {object[]} records  - sorted ascending
 * @returns {{
 *   currentPresentStreak: number,
 *   currentAbsentStreak:  number,
 *   longestPresentStreak: number,
 *   longestAbsentStreak:  number,
 * }}
 */
const _calcStreaks = (records) => {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      currentPresentStreak: 0,
      currentAbsentStreak:  0,
      longestPresentStreak: 0,
      longestAbsentStreak:  0,
    };
  }

  let longestPresent = 0;
  let longestAbsent  = 0;
  let runPresent     = 0;
  let runAbsent      = 0;

  for (const rec of records) {
    if (rec.status === ATTENDANCE_STATUS.PRESENT) {
      runPresent++;
      runAbsent = 0;
      if (runPresent > longestPresent) longestPresent = runPresent;
    } else {
      runAbsent++;
      runPresent = 0;
      if (runAbsent > longestAbsent) longestAbsent = runAbsent;
    }
  }

  // Current streaks: walk backwards from the last record
  let currentPresent = 0;
  let currentAbsent  = 0;
  const reversed = [...records].reverse();

  const lastStatus = reversed[0]?.status;
  if (lastStatus === ATTENDANCE_STATUS.PRESENT) {
    for (const rec of reversed) {
      if (rec.status !== ATTENDANCE_STATUS.PRESENT) break;
      currentPresent++;
    }
  } else {
    for (const rec of reversed) {
      if (rec.status !== ATTENDANCE_STATUS.ABSENT) break;
      currentAbsent++;
    }
  }

  return {
    currentPresentStreak: currentPresent,
    currentAbsentStreak:  currentAbsent,
    longestPresentStreak: longestPresent,
    longestAbsentStreak:  longestAbsent,
  };
};

/**
 * Computes day-by-day trend series from records (ascending).
 *
 * @param {object[]} records - ascending
 * @returns {Array<{ date: string, status: string, sessionIndex: number }>}
 */
const _buildTimelineSeries = (records) =>
  records.map((r, idx) => ({
    date:         r.date,
    status:       r.status,
    sessionIndex: idx + 1,
    remarks:      r.remarks ?? '',
    markedBy:     r.markedBy ?? '',
  }));

/**
 * Computes weekly running average for the Recharts chart.
 * Returns one data point per session date.
 *
 * @param {object[]} records - ascending
 * @returns {Array<{ date: string, rate: number, sessionIndex: number }>}
 */
const _buildChartSeries = (records) => {
  let presentSoFar = 0;
  return records.map((r, idx) => {
    if (r.status === ATTENDANCE_STATUS.PRESENT) presentSoFar++;
    const total = idx + 1;
    const rate  = Math.round((presentSoFar / total) * 100);
    return {
      date:         r.date,
      rate,
      present:      r.status === ATTENDANCE_STATUS.PRESENT ? 1 : 0,
      absent:       r.status !== ATTENDANCE_STATUS.PRESENT ? 1 : 0,
      sessionIndex: total,
    };
  });
};

/**
 * Builds alert list based on attendance patterns.
 *
 * Alert triggers:
 *   1. Consecutive absences ≥ 3 (CRITICAL)
 *   2. Overall attendance < 60%  (CRITICAL)
 *   3. Sudden drop: last-7 rate < (overall - 10pp) (WARNING)
 *
 * @param {object[]} records   - ascending
 * @param {number}   overall   - overall attendance %
 * @param {number}   threshold - low-attendance threshold
 * @returns {Array<{ type, severity, message }>}
 */
const _calcAlerts = (records, overall, threshold) => {
  const alerts = [];

  if (!Array.isArray(records) || records.length === 0) return alerts;

  // 1. Consecutive absence streak
  let consecutive = 0;
  for (const rec of [...records].reverse()) {
    if (rec.status === ATTENDANCE_STATUS.ABSENT) consecutive++;
    else break;
  }
  if (consecutive >= 3) {
    alerts.push({
      type:     'consecutive_absence',
      severity: 'critical',
      message:  `${consecutive} consecutive absences recorded. Immediate follow-up recommended.`,
    });
  }

  // 2. Low attendance
  if (overall < 60) {
    alerts.push({
      type:     'low_attendance',
      severity: 'critical',
      message:  `Attendance is critically low at ${Math.round(overall)}%. Student is at high risk.`,
    });
  } else if (overall < threshold) {
    alerts.push({
      type:     'below_threshold',
      severity: 'warning',
      message:  `Attendance (${Math.round(overall)}%) is below the required threshold of ${threshold}%.`,
    });
  }

  // 3. Sudden drop: compare last 7 sessions vs overall
  if (records.length >= 10) {
    const last7   = records.slice(-7);
    const last7Pct = calculateAttendancePercentage(
      calculatePresentCount(last7),
      last7.length
    );
    if (last7Pct < overall - 10) {
      alerts.push({
        type:     'sudden_drop',
        severity: 'warning',
        message:  `Recent attendance (${Math.round(last7Pct)}% over last 7 sessions) is significantly below overall average (${Math.round(overall)}%).`,
      });
    }
  }

  return alerts;
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * getStudentAttendanceAnalytics()
 * Returns the complete attendance intelligence bundle for a student.
 *
 * @param {string} studentId
 * @param {string} batchId
 * @param {number} [threshold=75]
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     records:           object[],   — sorted ascending (oldest first)
 *     timeline:          object[],   — for AttendanceTimeline (newest first)
 *     chartSeries:       object[],   — running % for line chart
 *     percentage:        number,
 *     totalSessions:     number,
 *     presentCount:      number,
 *     absentCount:       number,
 *     statusColor:       string,
 *     risk:              { level, label, colorToken, severity },
 *     streaks:           { currentPresentStreak, currentAbsentStreak, longestPresentStreak, longestAbsentStreak },
 *     alerts:            Array<{ type, severity, message }>,
 *     recentRate:        number,     — last-7-session rate
 *   } | null,
 *   error: { code, message } | null
 * }>}
 */
export const getStudentAttendanceAnalytics = async (
  studentId,
  batchId,
  threshold = DEFAULT_ATTENDANCE_THRESHOLD
) => {
  return tryCatch(async () => {
    if (!studentId || typeof studentId !== 'string') {
      return fail('INVALID_STUDENT_ID', 'A valid student ID is required');
    }
    if (!batchId || typeof batchId !== 'string') {
      return fail('INVALID_BATCH_ID', 'A valid batch ID is required');
    }

    // ── Fetch raw records + percentage in parallel ──────────────────────────
    const [recordsRes, summaryRes] = await Promise.all([
      getStudentAttendance(studentId, { batchId, order: 'asc' }),
      calculateAttendancePercentageForStudent(studentId, batchId, threshold),
    ]);

    if (!recordsRes.success) {
      return fail(
        recordsRes.error?.code ?? 'RECORDS_LOAD_FAILED',
        recordsRes.error?.message ?? 'Failed to load attendance records'
      );
    }

    const records = recordsRes.data ?? [];

    // ── Summary stats ───────────────────────────────────────────────────────
    let percentage    = 0;
    let totalSessions = 0;
    let presentCount  = 0;
    let absentCount   = 0;
    let statusColor   = 'default';

    if (summaryRes.success && summaryRes.data) {
      ({ percentage, totalSessions, presentCount, absentCount, statusColor } = summaryRes.data);
    } else {
      // Fallback: derive from raw records
      totalSessions = records.length;
      presentCount  = calculatePresentCount(records);
      absentCount   = calculateAbsentCount(records);
      percentage    = calculateAttendancePercentage(presentCount, totalSessions);
      statusColor   = percentage >= 75 ? 'success' : percentage >= 60 ? 'warning' : 'danger';
    }

    // ── Derived analytics ───────────────────────────────────────────────────
    const risk       = getStudentRiskLevel(percentage);
    const streaks    = _calcStreaks(records);          // ascending records
    const alerts     = _calcAlerts(records, percentage, threshold);

    // Timeline: newest first for display
    const timeline    = _buildTimelineSeries([...records].reverse());
    const chartSeries = _buildChartSeries(records);   // ascending for chart

    // Recent rate (last 7 sessions)
    const last7      = records.slice(-7);
    const recentRate = last7.length > 0
      ? calculateAttendancePercentage(calculatePresentCount(last7), last7.length)
      : percentage;

    return ok(
      {
        records,
        timeline,
        chartSeries,
        percentage,
        totalSessions,
        presentCount,
        absentCount,
        statusColor,
        risk,
        streaks,
        alerts,
        recentRate,
      },
      {
        studentId,
        batchId,
        threshold,
        computedAt: new Date().toISOString(),
      }
    );
  });
};
