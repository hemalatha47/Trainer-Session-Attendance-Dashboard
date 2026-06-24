/**
 * reportsTableService.js
 * Module 7.3 — Report Tables & Summary Views
 *
 * Aggregates report datasets for AttendanceReportTable, BatchReportTable,
 * and StudentReportTable. No JSX / React — pure async service.
 *
 * Blueprint Sections: 4.5, 4.6, 6.7, 9.4, 9.5
 *
 * Methods:
 *   getAttendanceReport(filters)     — date-by-date records per batch
 *   getBatchReport(filters)          — per-batch aggregated metrics
 *   getStudentReport(filters)        — per-student attendance summary
 *   getReportSummaryCards(filters)   — 4 KPI cards for the summary row
 */

import { mockBatches }    from '@data/mockBatches';
import { mockStudents }   from '@data/mockStudents';
import { mockAttendance } from '@data/mockAttendance';
import { mockUsers }      from '@data/mockUsers';
import { BATCH_STATUS }   from '@constants/batchStatus';
import { ATTENDANCE_STATUS } from '@constants/attendanceStatus';
import { ok, tryCatch }   from '@utils/serviceResponse';
import { DEFAULT_ATTENDANCE_THRESHOLD } from '@constants/validation';
import {
  calculateAttendancePercentage,
  calculatePresentCount,
  calculateAbsentCount,
} from '@utils/calcUtils';
import { getStudentRiskLevel } from '@utils/riskUtils';

// ── Internal helpers ──────────────────────────────────────────────────────────

/** All active + completed batches relevant for reporting. */
const _reportingBatches = () =>
  mockBatches.filter(
    (b) => b.status === BATCH_STATUS.ACTIVE || b.status === BATCH_STATUS.COMPLETED
  );

/** Active (non-inactive) students. */
const _activeStudents = () => mockStudents.filter((s) => s.status !== 'inactive');

/** Returns the trainer name for a trainerId. */
const _trainerName = (trainerId) => {
  const user = mockUsers.find((u) => u.id === trainerId);
  return user ? user.name : 'Unknown';
};

/** Distinct sorted session dates for a batch. */
const _batchDates = (batchId) => {
  const dates = mockAttendance
    .filter((r) => r.batchId === batchId)
    .map((r) => r.date);
  return [...new Set(dates)].sort();
};

/** Filter records by date range. */
const _inRange = (date, from, to) => {
  if (!from && !to) return true;
  if (from && date < from) return false;
  if (to   && date > to)   return false;
  return true;
};

/**
 * Attendance status label based on session-level present rate.
 *   ≥ 90 → Excellent
 *   80–89 → Good
 *   70–79 → Warning
 *   < 70  → Critical
 */
export const getSessionStatusLabel = (pct) => {
  if (pct >= 90) return { label: 'Excellent', variant: 'success'  };
  if (pct >= 80) return { label: 'Good',      variant: 'primary'  };
  if (pct >= 70) return { label: 'Warning',   variant: 'warning'  };
  return              { label: 'Critical',   variant: 'danger'   };
};

// ── Error codes ───────────────────────────────────────────────────────────────

export const REPORTS_TABLE_ERRORS = Object.freeze({
  LOAD_FAILED: 'REPORTS_TABLE_LOAD_FAILED',
  UNEXPECTED:  'REPORTS_TABLE_UNEXPECTED',
});

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * getAttendanceReport(filters)
 *
 * Returns one row per (batch × date) combination within the filter window.
 * Each row has:
 *   batchId, batchName, trainerName, date,
 *   presentCount, absentCount, totalStudents,
 *   attendancePct, statusLabel, statusVariant
 *
 * @param {{ dateRange?: {from,to}, batchId?: string }} [filters={}]
 * @param {number} [threshold]
 * @returns {Promise<ServiceResponse>}
 */
export const getAttendanceReport = async (
  filters = {},
  threshold = DEFAULT_ATTENDANCE_THRESHOLD
) =>
  tryCatch(async () => {
    const { dateRange = {}, batchId = 'all' } = filters;
    const { from, to } = dateRange;

    const batches = _reportingBatches().filter(
      (b) => batchId === 'all' || b.id === batchId
    );

    const rows = [];

    for (const batch of batches) {
      const allBatchRecords = mockAttendance.filter((r) => r.batchId === batch.id);
      const dates           = _batchDates(batch.id).filter((d) => _inRange(d, from, to));
      const batchStudents   = _activeStudents().filter((s) => s.batchId === batch.id);
      const totalStudents   = batchStudents.length;
      const trainerName     = batch.trainerName || _trainerName(batch.trainerId);

      for (const date of dates) {
        const dayRecords   = allBatchRecords.filter((r) => r.date === date);
        const presentCount = dayRecords.filter(
          (r) => r.status === ATTENDANCE_STATUS.PRESENT
        ).length;
        const absentCount  = totalStudents - presentCount;
        const attendancePct = totalStudents === 0
          ? 0
          : Math.round((presentCount / totalStudents) * 100);
        const { label: statusLabel, variant: statusVariant } =
          getSessionStatusLabel(attendancePct);

        rows.push({
          id:            `${batch.id}-${date}`,
          batchId:       batch.id,
          batchName:     batch.batchName,
          trainerName,
          date,
          presentCount,
          absentCount,
          totalStudents,
          attendancePct,
          statusLabel,
          statusVariant,
        });
      }
    }

    // Sort by date descending (most recent first)
    rows.sort((a, b) => b.date.localeCompare(a.date));

    return ok(rows, { total: rows.length, threshold });
  });

/**
 * getBatchReport(filters)
 *
 * Returns one row per batch with aggregated metrics.
 * Each row has:
 *   batchId, batchName, trainerName, batchCode,
 *   totalStudents, totalSessions, avgAttendance,
 *   lowAttendanceCount, riskLevel, riskLabel, riskVariant,
 *   status, statusVariant
 *
 * @param {{ dateRange?: {from,to}, batchId?: string }} [filters={}]
 * @param {number} [threshold]
 * @returns {Promise<ServiceResponse>}
 */
export const getBatchReport = async (
  filters = {},
  threshold = DEFAULT_ATTENDANCE_THRESHOLD
) =>
  tryCatch(async () => {
    const { batchId = 'all' } = filters;

    const batches = _reportingBatches().filter(
      (b) => batchId === 'all' || b.id === batchId
    );

    const rows = [];

    for (const batch of batches) {
      const batchStudents = _activeStudents().filter((s) => s.batchId === batch.id);
      const totalStudents = batchStudents.length;
      const dates         = _batchDates(batch.id);
      const totalSessions = dates.length;
      const trainerName   = batch.trainerName || _trainerName(batch.trainerId);

      // Per-student percentages
      let sumPct           = 0;
      let lowAttendanceCount = 0;

      for (const student of batchStudents) {
        const studentRecords = mockAttendance.filter(
          (r) => r.batchId === batch.id && r.studentId === student.id
        );
        const presentCount = calculatePresentCount(studentRecords);
        const pct          = calculateAttendancePercentage(presentCount, totalSessions);
        sumPct += pct;
        if (pct < threshold) lowAttendanceCount++;
      }

      const avgAttendance = totalStudents === 0
        ? 0
        : Math.round(sumPct / totalStudents);

      const { label: riskLabel, colorToken: riskVariant } =
        getStudentRiskLevel(avgAttendance);

      // Batch status badge
      const batchStatusVariant =
        batch.status === BATCH_STATUS.ACTIVE     ? 'active'    :
        batch.status === BATCH_STATUS.COMPLETED  ? 'completed' :
        batch.status === BATCH_STATUS.UPCOMING   ? 'upcoming'  : 'neutral';

      rows.push({
        id:               batch.id,
        batchId:          batch.id,
        batchName:        batch.batchName,
        batchCode:        batch.batchCode,
        trainerName,
        totalStudents,
        totalSessions,
        avgAttendance,
        lowAttendanceCount,
        riskLabel,
        riskVariant,
        status:           batch.status,
        statusVariant:    batchStatusVariant,
      });
    }

    // Sort active first, then by avg attendance descending
    rows.sort((a, b) => {
      if (a.status === BATCH_STATUS.ACTIVE && b.status !== BATCH_STATUS.ACTIVE) return -1;
      if (b.status === BATCH_STATUS.ACTIVE && a.status !== BATCH_STATUS.ACTIVE) return  1;
      return b.avgAttendance - a.avgAttendance;
    });

    return ok(rows, { total: rows.length, threshold });
  });

/**
 * getStudentReport(filters)
 *
 * Returns one row per student with attendance summary.
 * Each row has:
 *   studentId, studentCode, studentName, batchId, batchName,
 *   totalSessions, presentCount, absentCount,
 *   attendancePct, riskLevel, riskLabel, riskVariant
 *
 * @param {{ dateRange?: {from,to}, batchId?: string, studentId?: string }} [filters={}]
 * @param {number} [threshold]
 * @returns {Promise<ServiceResponse>}
 */
export const getStudentReport = async (
  filters = {},
  threshold = DEFAULT_ATTENDANCE_THRESHOLD
) =>
  tryCatch(async () => {
    const { batchId = 'all', studentId = 'all' } = filters;

    let students = _activeStudents();
    if (batchId !== 'all')   students = students.filter((s) => s.batchId === batchId);
    if (studentId !== 'all') students = students.filter((s) => s.id === studentId);

    const rows = [];

    for (const student of students) {
      const batch        = mockBatches.find((b) => b.id === student.batchId);
      const batchName    = batch?.batchName ?? 'Unknown Batch';
      const dates        = _batchDates(student.batchId);
      const totalSessions = dates.length;

      const studentRecords = mockAttendance.filter(
        (r) => r.batchId === student.batchId && r.studentId === student.id
      );
      const presentCount   = calculatePresentCount(studentRecords);
      const absentCount    = calculateAbsentCount(studentRecords);
      const attendancePct  = calculateAttendancePercentage(presentCount, totalSessions);
      const risk           = getStudentRiskLevel(attendancePct);

      rows.push({
        id:             student.id,
        studentId:      student.id,
        studentCode:    student.studentCode,
        studentName:    `${student.firstName} ${student.lastName}`.trim(),
        batchId:        student.batchId,
        batchName,
        totalSessions,
        presentCount,
        absentCount,
        attendancePct,
        riskLevel:      risk.level,
        riskLabel:      risk.label,
        riskVariant:    risk.colorToken,
      });
    }

    // Sort by attendance ascending (worst first — most actionable)
    rows.sort((a, b) => a.attendancePct - b.attendancePct);

    return ok(rows, { total: rows.length, threshold });
  });

/**
 * getReportSummaryCards(filters)
 *
 * Returns 4 KPI values for the summary card row at the top of the tables view.
 *   totalSessions, avgAttendance, lowAttendanceBatches, atRiskStudents
 *
 * @param {{ dateRange?: {from,to}, batchId?: string }} [filters={}]
 * @param {number} [threshold]
 * @returns {Promise<ServiceResponse>}
 */
export const getReportSummaryCards = async (
  filters = {},
  threshold = DEFAULT_ATTENDANCE_THRESHOLD
) =>
  tryCatch(async () => {
    const { batchId = 'all' } = filters;

    const batches  = _reportingBatches().filter(
      (b) => batchId === 'all' || b.id === batchId
    );
    const students = _activeStudents().filter(
      (s) => batchId === 'all' || s.batchId === batchId
    );

    // Total sessions across selected batches
    let totalSessions = 0;
    for (const batch of batches) {
      totalSessions += _batchDates(batch.id).length;
    }

    // Overall avg attendance
    const relevantRecords = mockAttendance.filter(
      (r) => batchId === 'all' || r.batchId === batchId
    );
    const totalRecords  = relevantRecords.length;
    const presentCount  = relevantRecords.filter(
      (r) => r.status === ATTENDANCE_STATUS.PRESENT
    ).length;
    const avgAttendance = totalRecords === 0
      ? 0
      : Math.round((presentCount / totalRecords) * 100);

    // Low attendance batches
    let lowAttendanceBatches = 0;
    for (const batch of batches) {
      const batchStudents = students.filter((s) => s.batchId === batch.id);
      if (batchStudents.length === 0) continue;
      const dates         = _batchDates(batch.id);
      let sumPct = 0;
      for (const s of batchStudents) {
        const recs      = mockAttendance.filter(
          (r) => r.batchId === batch.id && r.studentId === s.id
        );
        const pct = calculateAttendancePercentage(
          calculatePresentCount(recs),
          dates.length
        );
        sumPct += pct;
      }
      const avgBatch = sumPct / batchStudents.length;
      if (avgBatch < threshold) lowAttendanceBatches++;
    }

    // At-risk students
    let atRiskStudents = 0;
    for (const student of students) {
      const dates  = _batchDates(student.batchId);
      const recs   = mockAttendance.filter(
        (r) => r.batchId === student.batchId && r.studentId === student.id
      );
      const pct    = calculateAttendancePercentage(
        calculatePresentCount(recs),
        dates.length
      );
      if (pct < threshold) atRiskStudents++;
    }

    return ok(
      { totalSessions, avgAttendance, lowAttendanceBatches, atRiskStudents },
      { threshold, total: batches.length }
    );
  });
