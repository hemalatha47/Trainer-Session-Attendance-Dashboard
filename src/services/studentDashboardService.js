/**
 * studentDashboardService.js
 * Centralized KPI metric calculations for Student Dashboard Cards.
 * Module 5.5 — Student Dashboard KPI System.
 *
 * Blueprint Sections: 4.2, 4.6, 4.7, 6.2, 6.5, 9.4, 9.5
 *
 * ARCHITECTURE RULES:
 *  - All formulas live here — no duplicate calculation logic in UI layers.
 *  - All methods are async (API-migration safe).
 *  - All methods return the { success, data, meta, error } shape.
 *  - Pages/hooks NEVER import mock data directly — only this service does.
 *  - Date handling: always YYYY-MM-DD in LOCAL time via dateUtils.getToday().
 *
 * KPI FORMULA DEFINITIONS (Task 2):
 *  Total Students    : count(all students, any status)
 *  Active Students   : count(students where status === 'active')
 *  Average Attendance: sum(attendancePercentage) / count(students with pct data)
 *  Low Attendance    : count(students where attendancePercentage < threshold)
 *  Absent Today      : count(attendance records where date === today && status === 'absent')
 *  High Performers   : count(students where attendancePercentage >= 90)
 *
 * ARCHITECTURAL DECISION (Task 14):
 *  Dashboard cards reflect the GLOBAL student dataset (all batches, all active students),
 *  NOT the current filter selection. This matches enterprise SaaS convention where KPI
 *  summary rows represent the full scope of the entity — filters narrow only the table.
 *  The hook (useStudentDashboard) accepts an optional `students` param for future
 *  override if per-filter KPIs are ever desired.
 */

import { getStudents }     from '@services/studentService';
import { DEFAULT_ATTENDANCE_THRESHOLD } from '@constants/validation';
import { getToday }        from '@utils/dateUtils';
import { ok, fail, tryCatch } from '@utils/serviceResponse';

// ── Constants ────────────────────────────────────────────────────────────────

/** Students with attendance >= this are counted as High Performers. */
const HIGH_PERFORMER_THRESHOLD = 90;

// ── Helpers (pure) ───────────────────────────────────────────────────────────

/**
 * Calculates average attendance percentage across a list of student objects.
 * Only students that have a numeric attendancePercentage are included in the average.
 *
 * @param {object[]} students
 * @returns {number} 0–100, integer
 */
const _calcAverageAttendance = (students) => {
  if (!Array.isArray(students) || students.length === 0) return 0;
  const valid = students.filter(
    (s) => typeof s.attendancePercentage === 'number' && !isNaN(s.attendancePercentage)
  );
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, s) => acc + s.attendancePercentage, 0);
  return Math.round(sum / valid.length);
};

/**
 * Counts students absent on the given local date.
 * Uses the attendance records already embedded in each student object
 * (attendancePercentage field) — we cannot get per-date absent count
 * from studentService alone. Instead this function reads attendance
 * records from the student service's today-aware context.
 *
 * For V1 mock data: mockAttendance is queried directly through
 * attendanceService.getTodayDashboardSummary to get the absentToday count.
 * We expose a dedicated helper so the service layer stays the single owner.
 *
 * @param {number} absentTodayFromAttendance — passed in from attendance service
 * @returns {number}
 */
const _resolveAbsentToday = (absentTodayFromAttendance) =>
  typeof absentTodayFromAttendance === 'number' ? absentTodayFromAttendance : 0;

// ── Main service function ─────────────────────────────────────────────────────

/**
 * getStudentDashboardMetrics()
 * Returns all KPI values for the Student Dashboard Cards section (Task 3).
 *
 * ARCHITECTURAL DECISION: Cards reflect the GLOBAL student dataset.
 * Filters applied to the student table do NOT narrow the KPI cards.
 *
 * @param {object}   [options]
 * @param {number}   [options.threshold=75]          — Low-attendance cutoff
 * @param {number}   [options.absentTodayCount]      — Pre-computed from attendanceService
 *                                                     (avoids circular service coupling)
 * @returns {Promise<{ success: boolean, data: StudentDashboardMetrics, error: object|null }>}
 *
 * @typedef {object} StudentDashboardMetrics
 * @property {number} totalStudents        — All students (any status)
 * @property {number} activeStudents       — Students with status === 'active'
 * @property {number} inactiveStudents     — Students with status !== 'active'
 * @property {number} avgAttendance        — Average attendance % (0–100, integer)
 * @property {number} lowAttendanceCount   — Students below threshold
 * @property {number} absentToday          — Students absent today (from attendance records)
 * @property {number} highPerformers       — Students with attendance >= 90%
 * @property {number} threshold            — The threshold used for lowAttendanceCount
 * @property {string} today                — Local date used for absentToday (YYYY-MM-DD)
 */
export const getStudentDashboardMetrics = async ({
  threshold = DEFAULT_ATTENDANCE_THRESHOLD,
  absentTodayCount,
} = {}) => {
  return tryCatch(async () => {
    // Load all students (active + inactive) for global KPIs
    const res = await getStudents({ includeInactive: true });
    if (!res.success) {
      return fail('STUDENT_DASHBOARD_LOAD_FAILED', res.error?.message ?? 'Failed to load students');
    }

    const allStudents     = res.data ?? [];
    const activeStudents  = allStudents.filter((s) => s.status === 'active');
    const inactiveStudents = allStudents.filter((s) => s.status !== 'active');

    const avgAttendance = _calcAverageAttendance(activeStudents);

    const lowAttendanceCount = activeStudents.filter(
      (s) =>
        typeof s.attendancePercentage === 'number' &&
        s.attendancePercentage < threshold
    ).length;

    const highPerformers = activeStudents.filter(
      (s) =>
        typeof s.attendancePercentage === 'number' &&
        s.attendancePercentage >= HIGH_PERFORMER_THRESHOLD
    ).length;

    const absentToday = _resolveAbsentToday(absentTodayCount);
    const today = getToday();

    return ok(
      {
        totalStudents:      allStudents.length,
        activeStudents:     activeStudents.length,
        inactiveStudents:   inactiveStudents.length,
        avgAttendance,
        lowAttendanceCount,
        absentToday,
        highPerformers,
        threshold,
        today,
      },
      {
        computedAt: new Date().toISOString(),
        threshold,
        highPerformerThreshold: HIGH_PERFORMER_THRESHOLD,
      }
    );
  });
};

/**
 * getAverageAttendance()
 * Standalone helper: average attendance % across all active students.
 *
 * @returns {Promise<{ success: boolean, data: number, error: object|null }>}
 */
export const getAverageAttendance = async () => {
  return tryCatch(async () => {
    const res = await getStudents({ includeInactive: false });
    if (!res.success) return fail('STUDENT_DASHBOARD_LOAD_FAILED', res.error?.message);
    return ok(_calcAverageAttendance(res.data ?? []));
  });
};

/**
 * getLowAttendanceCount()
 * Count of active students below the given threshold.
 *
 * @param {number} [threshold=75]
 * @returns {Promise<{ success: boolean, data: number, error: object|null }>}
 */
export const getLowAttendanceCount = async (threshold = DEFAULT_ATTENDANCE_THRESHOLD) => {
  return tryCatch(async () => {
    const res = await getStudents({ includeInactive: false });
    if (!res.success) return fail('STUDENT_DASHBOARD_LOAD_FAILED', res.error?.message);
    const count = (res.data ?? []).filter(
      (s) =>
        typeof s.attendancePercentage === 'number' &&
        s.attendancePercentage < threshold
    ).length;
    return ok(count, { threshold });
  });
};

/**
 * getHighPerformers()
 * Count of active students with attendance >= HIGH_PERFORMER_THRESHOLD (90%).
 *
 * @returns {Promise<{ success: boolean, data: number, error: object|null }>}
 */
export const getHighPerformers = async () => {
  return tryCatch(async () => {
    const res = await getStudents({ includeInactive: false });
    if (!res.success) return fail('STUDENT_DASHBOARD_LOAD_FAILED', res.error?.message);
    const count = (res.data ?? []).filter(
      (s) =>
        typeof s.attendancePercentage === 'number' &&
        s.attendancePercentage >= HIGH_PERFORMER_THRESHOLD
    ).length;
    return ok(count, { threshold: HIGH_PERFORMER_THRESHOLD });
  });
};
