/**
 * reportsDashboardService.js
 * Centralized data aggregation for the Reports Dashboard landing page.
 * Module 7.1 — Reports Dashboard Page
 *
 * Blueprint Sections: 4.5, 4.6, 6.7, 9.4, 9.5, 10.6
 *
 * Architecture rules:
 *  - No JSX / React — pure async service.
 *  - Delegates to attendanceService, studentService, batchService.
 *  - Returns the standard { success, data, meta, error } shape via ok/fail/tryCatch.
 *  - All date math goes through dateUtils.
 *
 * Methods:
 *  getReportsDashboardSummary() — 4 KPI totals for the summary card row
 *  getReportTypeCards()         — metadata for the report type selector cards
 *  getOverviewPanels()          — lightweight data for the 3 overview panels
 */

import { mockBatches }    from '@data/mockBatches';
import { mockStudents }   from '@data/mockStudents';
import { mockAttendance } from '@data/mockAttendance';
import { BATCH_STATUS }   from '@constants/batchStatus';
import { ATTENDANCE_STATUS } from '@constants/attendanceStatus';
import { ok, fail, tryCatch } from '@utils/serviceResponse';
import { DEFAULT_ATTENDANCE_THRESHOLD } from '@constants/validation';
import {
  calculateAttendancePercentage,
  calculatePresentCount,
} from '@utils/calcUtils';
import { getDistinctAttendanceDates } from '@utils/dateUtils';

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Returns all non-inactive students. */
const _activeStudents = () => mockStudents.filter((s) => s.status !== 'inactive');

/** Returns all active + completed batches (relevant for reporting). */
const _reportingBatches = () =>
  mockBatches.filter(
    (b) => b.status === BATCH_STATUS.ACTIVE || b.status === BATCH_STATUS.COMPLETED
  );

/**
 * Per-student attendance percentage across all their batch records.
 * Uses the blueprint formula: present ÷ distinct session dates × 100.
 */
const _studentPercentage = (studentId, batchId) => {
  const records      = mockAttendance.filter(
    (r) => r.batchId === batchId && r.studentId === studentId
  );
  const distinctDates = getDistinctAttendanceDates(
    mockAttendance.filter((r) => r.batchId === batchId)
  );
  const totalSessions = distinctDates.length;
  const presentCount  = records.filter(
    (r) => r.status === ATTENDANCE_STATUS.PRESENT
  ).length;
  return calculateAttendancePercentage(presentCount, totalSessions);
};

// ── Error codes ───────────────────────────────────────────────────────────────

export const REPORTS_DASHBOARD_ERRORS = Object.freeze({
  LOAD_FAILED:  'REPORTS_DASHBOARD_LOAD_FAILED',
  UNEXPECTED:   'REPORTS_DASHBOARD_UNEXPECTED',
});

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * getReportsDashboardSummary()
 *
 * Aggregated KPI totals shown in the summary card row.
 *
 * Returns:
 *  - totalSessions      : number of distinct session dates across all reporting batches
 *  - totalBatches       : number of reporting batches (active + completed)
 *  - averageAttendance  : overall present % across all records (0–100, rounded)
 *  - atRiskStudents     : students below threshold in active batches
 *
 * @param {number} [threshold=DEFAULT_ATTENDANCE_THRESHOLD]
 * @returns {Promise<ServiceResponse>}
 */
export const getReportsDashboardSummary = async (threshold = DEFAULT_ATTENDANCE_THRESHOLD) =>
  tryCatch(async () => {
    const batches  = _reportingBatches();
    const students = _activeStudents();

    // Total distinct session dates (across all reporting batches)
    let totalSessions = 0;
    for (const batch of batches) {
      const batchRecords = mockAttendance.filter((r) => r.batchId === batch.id);
      totalSessions += getDistinctAttendanceDates(batchRecords).length;
    }

    // Overall attendance: present ÷ total records
    const totalRecords  = mockAttendance.length;
    const presentCount  = mockAttendance.filter(
      (r) => r.status === ATTENDANCE_STATUS.PRESENT
    ).length;
    const averageAttendance =
      totalRecords === 0 ? 0 : Math.round((presentCount / totalRecords) * 100);

    // At-risk students: in active batches, below threshold
    const activeBatches = batches.filter((b) => b.status === BATCH_STATUS.ACTIVE);
    let atRiskCount = 0;
    for (const batch of activeBatches) {
      const batchStudents = students.filter((s) => s.batchId === batch.id);
      for (const student of batchStudents) {
        const pct = _studentPercentage(student.id, batch.id);
        if (pct < threshold) atRiskCount++;
      }
    }

    return ok(
      {
        totalSessions,
        totalBatches:       batches.length,
        averageAttendance,
        atRiskStudents:     atRiskCount,
      },
      { threshold, computedAt: new Date().toISOString() }
    );
  });

/**
 * getReportTypeCards()
 *
 * Metadata for the three report type selector cards.
 * Each card includes a preview count so the UI can show "X records available".
 *
 * Returns array of:
 *  { id, title, description, icon, count, countLabel, route }
 *
 * @returns {Promise<ServiceResponse>}
 */
export const getReportTypeCards = async () =>
  tryCatch(async () => {
    const reportingBatches = _reportingBatches();
    const activeBatches    = reportingBatches.filter(
      (b) => b.status === BATCH_STATUS.ACTIVE
    );

    const cards = [
      {
        id:          'attendance',
        title:       'Attendance Reports',
        description: 'View date-range attendance records per batch with per-student breakdown.',
        iconName:    'ClipboardList',
        count:       reportingBatches.length,
        countLabel:  'batches available',
        color:       'accent',
      },
      {
        id:          'batch',
        title:       'Batch Reports',
        description: 'Summary of session counts, average attendance, and student performance per batch.',
        iconName:    'Layers',
        count:       activeBatches.length,
        countLabel:  'active batches',
        color:       'success',
      },
      {
        id:          'student',
        title:       'Student Reports',
        description: 'Individual student attendance history, percentage, and risk classification.',
        iconName:    'Users',
        count:       _activeStudents().length,
        countLabel:  'active students',
        color:       'warning',
      },
    ];

    return ok(cards, { total: cards.length });
  });

/**
 * getOverviewPanels()
 *
 * Lightweight data for the three overview panels (Attendance, Batch, Student).
 * Panels are informational summaries — NOT deep report tables.
 *
 * Returns:
 *  - attendancePanel  : { averageAttendance, absentRatio, recentSessionDate }
 *  - batchPanel       : { activeBatches, completedBatches, lowPerformingBatches }
 *  - studentPanel     : { totalStudents, atRiskStudents, excellentStudents }
 *
 * @param {number} [threshold=DEFAULT_ATTENDANCE_THRESHOLD]
 * @returns {Promise<ServiceResponse>}
 */
export const getOverviewPanels = async (threshold = DEFAULT_ATTENDANCE_THRESHOLD) =>
  tryCatch(async () => {
    const allBatches    = mockBatches;
    const activeBatches = allBatches.filter((b) => b.status === BATCH_STATUS.ACTIVE);
    const students      = _activeStudents();

    // ── Attendance Panel ──────────────────────────────────────────────────────
    const totalRecs    = mockAttendance.length;
    const presentRecs  = mockAttendance.filter(
      (r) => r.status === ATTENDANCE_STATUS.PRESENT
    ).length;
    const absentRecs   = totalRecs - presentRecs;
    const averageAttendance = totalRecs === 0
      ? 0
      : Math.round((presentRecs / totalRecs) * 100);
    const absentRatio       = totalRecs === 0
      ? 0
      : Math.round((absentRecs  / totalRecs) * 100);

    // Most recent session date across all records
    const allDates = mockAttendance.map((r) => r.date).sort();
    const recentSessionDate = allDates.length > 0 ? allDates[allDates.length - 1] : null;

    // ── Batch Panel ───────────────────────────────────────────────────────────
    const completedBatches = allBatches.filter(
      (b) => b.status === BATCH_STATUS.COMPLETED
    ).length;

    // Low performing: active batches whose average attendance is below threshold
    let lowPerformingBatches = 0;
    for (const batch of activeBatches) {
      const batchStudents = students.filter((s) => s.batchId === batch.id);
      if (batchStudents.length === 0) continue;
      let sumPct = 0;
      for (const s of batchStudents) {
        sumPct += _studentPercentage(s.id, batch.id);
      }
      const avgPct = sumPct / batchStudents.length;
      if (avgPct < threshold) lowPerformingBatches++;
    }

    // ── Student Panel ─────────────────────────────────────────────────────────
    let atRiskCount     = 0;
    let excellentCount  = 0;
    for (const batch of activeBatches) {
      const batchStudents = students.filter((s) => s.batchId === batch.id);
      for (const s of batchStudents) {
        const pct = _studentPercentage(s.id, batch.id);
        if (pct < threshold) atRiskCount++;
        if (pct >= 90)       excellentCount++;
      }
    }

    return ok(
      {
        attendancePanel: {
          averageAttendance,
          absentRatio,
          recentSessionDate,
        },
        batchPanel: {
          activeBatches:       activeBatches.length,
          completedBatches,
          lowPerformingBatches,
        },
        studentPanel: {
          totalStudents:   students.length,
          atRiskStudents:  atRiskCount,
          excellentStudents: excellentCount,
        },
      },
      { threshold, computedAt: new Date().toISOString() }
    );
  });
