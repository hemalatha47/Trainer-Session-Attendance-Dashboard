/**
 * attendanceCalculations.js
 * Single source of truth for all attendance calculation logic.
 * Module: B3.4
 *
 * Blueprint Sections: 9.4, 9.5
 *
 * NOTE: These functions are pure wrappers/re-exports that unify the calculation
 * helpers from calcUtils.js with attendance-domain-specific aggregations.
 *
 * All pages, hooks, and services MUST import calculation functions from here
 * (or calcUtils.js) — never inline formula logic in components.
 *
 * FORMULA (Section 9.4):
 *   Attendance % = (Present Records) ÷ (Total Distinct Session Dates) × 100
 *
 * "Total Distinct Session Dates" = unique dates for which ANY attendance record
 * exists for the batch — NOT the count of calendar days in the batch date range.
 */

import {
  calculateAttendancePercentage,
  calculatePresentCount,
  calculateAbsentCount,
  calculateStudentAttendanceSummary,
  calculateBatchStatistics,
  calculateBatchAverage,
  getAttendanceStatusColor,
  calculateAttendanceRate,
  countLowAttendanceStudents,
} from '@utils/calcUtils';

import { getDistinctAttendanceDates } from '@utils/dateUtils';
import { ATTENDANCE_STATUS, isPresentStatus } from '@constants/attendanceStatus';
import { DEFAULT_ATTENDANCE_THRESHOLD } from '@constants/validation';

// ── Re-export core utils so callers import from one place ─────────────────────

export {
  calculateAttendancePercentage,
  calculatePresentCount,
  calculateAbsentCount,
  calculateStudentAttendanceSummary,
  calculateBatchStatistics,
  calculateBatchAverage,
  getAttendanceStatusColor,
  calculateAttendanceRate,
  countLowAttendanceStudents,
};

// ── Attendance summary for a single student in a batch ────────────────────────

/**
 * Computes a full per-student summary from raw attendance record arrays.
 * This is the canonical entry point used by reportService and hooks.
 *
 * @param {string}   studentId
 * @param {object[]} batchRecords     - All records for the batch (all students)
 * @param {number}   [threshold]
 * @returns {{
 *   studentId:     string,
 *   totalSessions: number,
 *   presentCount:  number,
 *   absentCount:   number,
 *   percentage:    number,
 *   statusColor:   'success' | 'warning' | 'danger',
 * }}
 */
export const computeStudentSummary = (
  studentId,
  batchRecords,
  threshold = DEFAULT_ATTENDANCE_THRESHOLD
) => {
  const distinctDates = getDistinctAttendanceDates(batchRecords);
  return calculateStudentAttendanceSummary(
    studentId,
    batchRecords,
    distinctDates,
    threshold
  );
};

// ── Attendance summary for multiple students at once ─────────────────────────

/**
 * Computes per-student summaries for all students in a batch.
 * Used by Reports page table (Section 6.7) and Batch Details Summary tab.
 *
 * @param {string[]} studentIds      - All active student IDs in the batch
 * @param {object[]} batchRecords    - All attendance records for the batch
 * @param {number}   [threshold]
 * @returns {Array<{
 *   studentId:     string,
 *   totalSessions: number,
 *   presentCount:  number,
 *   absentCount:   number,
 *   percentage:    number,
 *   statusColor:   'success' | 'warning' | 'danger',
 * }>}
 */
export const computeAllStudentSummaries = (
  studentIds,
  batchRecords,
  threshold = DEFAULT_ATTENDANCE_THRESHOLD
) => {
  if (!Array.isArray(studentIds) || !Array.isArray(batchRecords)) return [];
  const distinctDates = getDistinctAttendanceDates(batchRecords);
  return studentIds.map((id) =>
    calculateStudentAttendanceSummary(id, batchRecords, distinctDates, threshold)
  );
};

// ── Status count breakdown for a set of records ──────────────────────────────

/**
 * Returns a count breakdown of each attendance status in a record set.
 * Used by Pie chart (Section 6.8) and summary cards.
 *
 * @param {object[]} records  - Attendance records with `.status` field
 * @returns {{
 *   present:  number,
 *   absent:   number,
 *   late:     number,
 *   leave:    number,
 *   halfDay:  number,
 *   excused:  number,
 *   total:    number,
 * }}
 */
export const computeStatusBreakdown = (records) => {
  const counts = {
    [ATTENDANCE_STATUS.PRESENT]:  0,
    [ATTENDANCE_STATUS.ABSENT]:   0,
    [ATTENDANCE_STATUS.LATE]:     0,
    [ATTENDANCE_STATUS.LEAVE]:    0,
    [ATTENDANCE_STATUS.HALF_DAY]: 0,
    [ATTENDANCE_STATUS.EXCUSED]:  0,
  };

  if (!Array.isArray(records)) {
    return { ...counts, total: 0 };
  }

  for (const r of records) {
    if (r?.status && counts[r.status] !== undefined) {
      counts[r.status]++;
    }
  }

  return {
    present:  counts[ATTENDANCE_STATUS.PRESENT],
    absent:   counts[ATTENDANCE_STATUS.ABSENT],
    late:     counts[ATTENDANCE_STATUS.LATE],
    leave:    counts[ATTENDANCE_STATUS.LEAVE],
    halfDay:  counts[ATTENDANCE_STATUS.HALF_DAY],
    excused:  counts[ATTENDANCE_STATUS.EXCUSED],
    total:    records.length,
  };
};

// ── Daily rate for trend chart ────────────────────────────────────────────────

/**
 * Aggregates records by date into a day-by-day rate series.
 * Powers the line chart (Section 6.8).
 *
 * @param {object[]} records   - Attendance records (filtered to a batch/range)
 * @returns {Array<{
 *   date:         string,
 *   presentCount: number,
 *   absentCount:  number,
 *   total:        number,
 *   rate:         number,   - 0–100
 * }>}
 */
export const computeDailyRateSeries = (records) => {
  if (!Array.isArray(records) || records.length === 0) return [];

  const byDate = {};
  for (const r of records) {
    if (!r?.date) continue;
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(r);
  }

  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayRecs]) => {
      const presentCount = calculatePresentCount(dayRecs);
      const absentCount  = calculateAbsentCount(dayRecs);
      const total        = dayRecs.length;
      const rate         = calculateAttendancePercentage(presentCount, total);
      return { date, presentCount, absentCount, total, rate };
    });
};

// ── Leaderboard builder ───────────────────────────────────────────────────────

/**
 * Builds a student leaderboard sorted by attendance percentage descending.
 * Used by Analytics leaderboard (Section 6.8).
 *
 * @param {string[]} studentIds
 * @param {object[]} batchRecords
 * @param {number}   [limit=10]
 * @param {number}   [threshold]
 * @returns {Array<{
 *   rank:         number,
 *   studentId:    string,
 *   totalSessions:number,
 *   presentCount: number,
 *   percentage:   number,
 *   statusColor:  'success' | 'warning' | 'danger',
 * }>}
 */
export const computeLeaderboard = (
  studentIds,
  batchRecords,
  limit = 10,
  threshold = DEFAULT_ATTENDANCE_THRESHOLD
) => {
  const summaries = computeAllStudentSummaries(studentIds, batchRecords, threshold);
  return summaries
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, limit)
    .map((s, idx) => ({ rank: idx + 1, ...s }));
};

// ── Low attendance students ───────────────────────────────────────────────────

/**
 * Returns students whose attendance is below the threshold.
 * Used by Dashboard alert count and filtered student list (Section 4.7).
 *
 * @param {string[]} studentIds
 * @param {object[]} batchRecords
 * @param {number}   [threshold]
 * @returns {Array}
 */
export const computeLowAttendanceStudents = (
  studentIds,
  batchRecords,
  threshold = DEFAULT_ATTENDANCE_THRESHOLD
) => {
  const summaries = computeAllStudentSummaries(studentIds, batchRecords, threshold);
  return summaries.filter((s) => s.percentage < threshold);
};

// ── Aggregate summary for the full batch ─────────────────────────────────────

/**
 * Convenience wrapper: computes batch-level statistics from raw data.
 *
 * @param {object[]} attendanceRecords
 * @param {string[]} studentIds
 * @param {number}   [threshold]
 * @returns {{
 *   totalSessions:      number,
 *   totalStudents:      number,
 *   averageAttendance:  number,
 *   lowAttendanceCount: number,
 *   studentSummaries:   Array,
 * }}
 */
export const computeBatchSummary = (
  attendanceRecords,
  studentIds,
  threshold = DEFAULT_ATTENDANCE_THRESHOLD
) => calculateBatchStatistics(attendanceRecords, studentIds, threshold);
