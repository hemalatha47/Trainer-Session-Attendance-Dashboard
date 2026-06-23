/**
 * calcUtils.js
 * Pure, stateless calculation helpers for attendance, batch, and dashboard metrics.
 * Blueprint Section 9.4, 9.5 — attendance percentage formula is authoritative here.
 *
 * RULES:
 *  - All functions are pure (no side effects, no imports from React or services).
 *  - All functions handle empty/null/undefined inputs defensively.
 *  - Percentage values are always returned as numbers (0–100), never strings.
 *  - Division-by-zero always returns 0, never NaN or Infinity.
 */

import { ATTENDANCE_STATUS } from '../constants/attendanceStatus';
import { DEFAULT_ATTENDANCE_THRESHOLD } from '../constants/validation';

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Safe division that returns 0 instead of NaN/Infinity.
 * @param {number} numerator
 * @param {number} denominator
 * @returns {number}
 */
const safeDivide = (numerator, denominator) =>
  denominator === 0 ? 0 : numerator / denominator;

/**
 * Rounds a number to the given number of decimal places.
 * @param {number} value
 * @param {number} [decimals=1]
 * @returns {number}
 */
const round = (value, decimals = 1) =>
  Math.round(value * 10 ** decimals) / 10 ** decimals;

// ── Attendance percentage ─────────────────────────────────────────────────────

/**
 * Calculates attendance percentage using the blueprint formula (Section 9.4):
 *   % = (present records) ÷ (total distinct session dates) × 100
 *
 * @param {number} presentCount     Number of sessions the student was present
 * @param {number} totalSessions    Total distinct dates attendance was taken for the batch
 * @returns {number}                Percentage (0–100), rounded to 1 decimal place
 */
export const calculateAttendancePercentage = (presentCount, totalSessions) => {
  if (typeof presentCount !== 'number' || typeof totalSessions !== 'number') return 0;
  if (totalSessions <= 0 || presentCount < 0) return 0;
  const clamped = Math.min(presentCount, totalSessions);
  return round(safeDivide(clamped, totalSessions) * 100);
};

/**
 * Counts how many records from an array have status === 'present'.
 * @param {Array<{status: string}>} records
 * @returns {number}
 */
export const calculatePresentCount = (records) => {
  if (!Array.isArray(records)) return 0;
  return records.filter((r) => r?.status === ATTENDANCE_STATUS.PRESENT).length;
};

/**
 * Counts how many records from an array have status === 'absent'.
 * @param {Array<{status: string}>} records
 * @returns {number}
 */
export const calculateAbsentCount = (records) => {
  if (!Array.isArray(records)) return 0;
  return records.filter((r) => r?.status === ATTENDANCE_STATUS.ABSENT).length;
};

// ── Threshold / color classification ─────────────────────────────────────────

/**
 * Returns a color classification string based on attendance percentage.
 * Used by Reports, Student List, and Dashboard to color-code rows and badges.
 *
 * Blueprint Section 6.7:
 *  - green  (≥ threshold)
 *  - yellow (50 – threshold-1)
 *  - red    (< 50)
 *
 * @param {number} percentage
 * @param {number} [threshold]  — defaults to DEFAULT_ATTENDANCE_THRESHOLD (75)
 * @returns {'success'|'warning'|'danger'}
 */
export const getAttendanceStatusColor = (percentage, threshold = DEFAULT_ATTENDANCE_THRESHOLD) => {
  if (typeof percentage !== 'number' || isNaN(percentage)) return 'danger';
  if (percentage >= threshold) return 'success';
  if (percentage >= 50) return 'warning';
  return 'danger';
};

// ── Dashboard calculations ────────────────────────────────────────────────────

/**
 * Calculates the overall attendance rate for a set of attendance records
 * (typically "today's" records for the dashboard summary card).
 *
 * @param {Array<{status: string}>} records   All attendance records for the day
 * @returns {number}                          Present rate 0–100, 1 decimal place
 */
export const calculateAttendanceRate = (records) => {
  if (!Array.isArray(records) || records.length === 0) return 0;
  const present = calculatePresentCount(records);
  return calculateAttendancePercentage(present, records.length);
};

/**
 * Calculates how many students are below the given attendance threshold.
 *
 * @param {Array<{percentage: number}>} studentSummaries
 *   Array of objects with a `percentage` field (0–100)
 * @param {number} [threshold]
 * @returns {number}
 */
export const countLowAttendanceStudents = (studentSummaries, threshold = DEFAULT_ATTENDANCE_THRESHOLD) => {
  if (!Array.isArray(studentSummaries)) return 0;
  return studentSummaries.filter(
    (s) => typeof s?.percentage === 'number' && s.percentage < threshold
  ).length;
};

/**
 * Calculates batch completion rate based on status counts.
 *
 * @param {number} completedCount
 * @param {number} totalCount
 * @returns {number}  0–100
 */
export const calculateBatchCompletionRate = (completedCount, totalCount) =>
  round(safeDivide(completedCount, totalCount) * 100);

// ── Student calculations ──────────────────────────────────────────────────────

/**
 * Calculates a full attendance summary for a single student.
 *
 * Blueprint Section 9.4 formula: present ÷ distinct batch session dates × 100
 *
 * @param {string}                     studentId
 * @param {Array<{studentId: string, status: string}>} allBatchRecords
 *   All attendance records for the batch (not just this student).
 * @param {string[]}                   distinctBatchDates
 *   Array of distinct YYYY-MM-DD strings representing sessions held.
 * @returns {{
 *   studentId: string,
 *   totalSessions: number,
 *   presentCount: number,
 *   absentCount: number,
 *   percentage: number,
 *   statusColor: 'success'|'warning'|'danger',
 * }}
 */
export const calculateStudentAttendanceSummary = (
  studentId,
  allBatchRecords,
  distinctBatchDates,
  threshold = DEFAULT_ATTENDANCE_THRESHOLD
) => {
  if (!studentId || !Array.isArray(allBatchRecords) || !Array.isArray(distinctBatchDates)) {
    return {
      studentId,
      totalSessions: 0,
      presentCount: 0,
      absentCount: 0,
      percentage: 0,
      statusColor: 'danger',
    };
  }

  const studentRecords = allBatchRecords.filter((r) => r?.studentId === studentId);
  const totalSessions  = distinctBatchDates.length;
  const presentCount   = calculatePresentCount(studentRecords);
  const absentCount    = calculateAbsentCount(studentRecords);
  const percentage     = calculateAttendancePercentage(presentCount, totalSessions);
  const statusColor    = getAttendanceStatusColor(percentage, threshold);

  return {
    studentId,
    totalSessions,
    presentCount,
    absentCount,
    percentage,
    statusColor,
  };
};

// ── Batch calculations ────────────────────────────────────────────────────────

/**
 * Calculates aggregate statistics for an entire batch.
 *
 * @param {Array<{studentId: string, status: string, date: string}>} attendanceRecords
 *   All attendance records for the batch.
 * @param {string[]} studentIds
 *   IDs of all active students in the batch.
 * @param {number} [threshold]
 * @returns {{
 *   totalSessions: number,
 *   totalStudents: number,
 *   averageAttendance: number,
 *   lowAttendanceCount: number,
 *   studentSummaries: Array,
 * }}
 */
export const calculateBatchStatistics = (
  attendanceRecords,
  studentIds,
  threshold = DEFAULT_ATTENDANCE_THRESHOLD
) => {
  if (!Array.isArray(attendanceRecords) || !Array.isArray(studentIds)) {
    return {
      totalSessions:      0,
      totalStudents:      0,
      averageAttendance:  0,
      lowAttendanceCount: 0,
      studentSummaries:   [],
    };
  }

  // Distinct session dates for this batch
  const distinctDates = [
    ...new Set(attendanceRecords.map((r) => r?.date).filter(Boolean)),
  ].sort();

  const studentSummaries = studentIds.map((id) =>
    calculateStudentAttendanceSummary(id, attendanceRecords, distinctDates, threshold)
  );

  const totalStudents     = studentIds.length;
  const sumPercentages    = studentSummaries.reduce((acc, s) => acc + s.percentage, 0);
  const averageAttendance = round(safeDivide(sumPercentages, totalStudents));
  const lowAttendanceCount = countLowAttendanceStudents(studentSummaries, threshold);

  return {
    totalSessions:      distinctDates.length,
    totalStudents,
    averageAttendance,
    lowAttendanceCount,
    studentSummaries,
  };
};

/**
 * Calculates the batch average attendance from an array of per-student percentages.
 * Convenience wrapper when summaries are already computed.
 *
 * @param {number[]} percentages
 * @returns {number}
 */
export const calculateBatchAverage = (percentages) => {
  if (!Array.isArray(percentages) || percentages.length === 0) return 0;
  const valid = percentages.filter((p) => typeof p === 'number' && !isNaN(p));
  return round(safeDivide(valid.reduce((a, b) => a + b, 0), valid.length));
};
