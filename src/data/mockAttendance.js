/**
 * mockAttendance.js
 * Mock data for AttendanceRecord entities.
 * Matches the AttendanceRecord schema defined in Blueprint Section 8.4.
 *
 * Unique constraint: (batchId + studentId + date) — no duplicates.
 * Status values align with src/constants/attendanceStatus.js
 *
 * Coverage:
 *   - b1 (Completed – React 2025):      8 session dates  × 7 students  = 56  records
 *   - b2 (Completed – Java 2025):       8 session dates  × 6 students  = 48  records
 *   - b3 (Completed – Python 2025):     6 session dates  × 7 students  = 42  records
 *   - b4 (Active   – React 2026):      10 session dates  × 9 students  = 90  records
 *   - b5 (Active   – DA 2026):          6 session dates  × 8 students  = 48  records
 *   - b6 (Active   – Cloud 2026):       5 session dates  × 7 students  = 35  records
 *   - b7 (On Hold  – UX 2026):          3 session dates  × 6 students  = 18  records
 * Total: ~337 records
 *
 * The `day()` helper generates one full session day's records for a batch,
 * matching the pattern established in Blueprint Section 17.5.
 *
 * markedBy: 'u2' (Training Manager) for all records — consistent with mock data.
 */

import { ATTENDANCE_STATUS } from '../constants/attendanceStatus';

const P = ATTENDANCE_STATUS.PRESENT;
const A = ATTENDANCE_STATUS.ABSENT;

/**
 * Generates one session day's attendance records.
 * @param {string} date     - YYYY-MM-DD
 * @param {string} batchId  - FK → Batch
 * @param {Array}  records  - [[studentId, status], ...]
 * @returns {AttendanceRecord[]}
 */
const day = (date, batchId, records) =>
  records.map(([studentId, status]) => ({
    id: `att-${batchId}-${date}-${studentId}`,
    studentId,
    batchId,
    date,
    status,
    markedBy: 'u2',
    remarks: '',
    createdAt: `${date}T09:30:00Z`,
  }));

export const mockAttendance = [
  // ─────────────────────────────────────────────────────────────────────────
  // BATCH b1 – React Development Bootcamp Jan 2025 (COMPLETED)
  // Students: s01–s07 | 8 session dates
  // ─────────────────────────────────────────────────────────────────────────
  ...day('2025-01-06', 'b1', [
    ['s01', P], ['s02', P], ['s03', P], ['s04', A], ['s05', P], ['s06', P], ['s07', P],
  ]),
  ...day('2025-01-08', 'b1', [
    ['s01', P], ['s02', P], ['s03', A], ['s04', P], ['s05', P], ['s06', A], ['s07', P],
  ]),
  ...day('2025-01-10', 'b1', [
    ['s01', P], ['s02', A], ['s03', P], ['s04', A], ['s05', P], ['s06', P], ['s07', P],
  ]),
  ...day('2025-01-13', 'b1', [
    ['s01', P], ['s02', P], ['s03', P], ['s04', A], ['s05', P], ['s06', A], ['s07', A],
  ]),
  ...day('2025-01-15', 'b1', [
    ['s01', P], ['s02', P], ['s03', A], ['s04', A], ['s05', P], ['s06', A], ['s07', P],
  ]),
  ...day('2025-01-17', 'b1', [
    ['s01', A], ['s02', P], ['s03', P], ['s04', P], ['s05', A], ['s06', A], ['s07', P],
  ]),
  ...day('2025-01-20', 'b1', [
    ['s01', P], ['s02', P], ['s03', P], ['s04', A], ['s05', P], ['s06', P], ['s07', P],
  ]),
  ...day('2025-01-22', 'b1', [
    ['s01', P], ['s02', P], ['s03', A], ['s04', A], ['s05', P], ['s06', A], ['s07', P],
  ]),

  // ─────────────────────────────────────────────────────────────────────────
  // BATCH b2 – Full Stack Java Feb 2025 (COMPLETED)
  // Students: s08–s13 | 8 session dates
  // ─────────────────────────────────────────────────────────────────────────
  ...day('2025-02-03', 'b2', [
    ['s08', P], ['s09', P], ['s10', A], ['s11', P], ['s12', A], ['s13', P],
  ]),
  ...day('2025-02-05', 'b2', [
    ['s08', P], ['s09', P], ['s10', P], ['s11', P], ['s12', P], ['s13', P],
  ]),
  ...day('2025-02-07', 'b2', [
    ['s08', P], ['s09', A], ['s10', P], ['s11', P], ['s12', A], ['s13', P],
  ]),
  ...day('2025-02-10', 'b2', [
    ['s08', P], ['s09', P], ['s10', A], ['s11', P], ['s12', P], ['s13', A],
  ]),
  ...day('2025-02-12', 'b2', [
    ['s08', A], ['s09', P], ['s10', A], ['s11', P], ['s12', A], ['s13', P],
  ]),
  ...day('2025-02-14', 'b2', [
    ['s08', P], ['s09', P], ['s10', P], ['s11', P], ['s12', P], ['s13', P],
  ]),
  ...day('2025-02-17', 'b2', [
    ['s08', P], ['s09', A], ['s10', A], ['s11', P], ['s12', A], ['s13', P],
  ]),
  ...day('2025-02-19', 'b2', [
    ['s08', P], ['s09', P], ['s10', A], ['s11', P], ['s12', P], ['s13', A],
  ]),

  // ─────────────────────────────────────────────────────────────────────────
  // BATCH b3 – Python Fundamentals Mar 2025 (COMPLETED)
  // Students: s14–s20 | 6 session dates
  // ─────────────────────────────────────────────────────────────────────────
  ...day('2025-03-03', 'b3', [
    ['s14', P], ['s15', P], ['s16', A], ['s17', P], ['s18', P], ['s19', A], ['s20', P],
  ]),
  ...day('2025-03-05', 'b3', [
    ['s14', P], ['s15', A], ['s16', A], ['s17', P], ['s18', P], ['s19', P], ['s20', A],
  ]),
  ...day('2025-03-07', 'b3', [
    ['s14', P], ['s15', P], ['s16', P], ['s17', P], ['s18', A], ['s19', A], ['s20', P],
  ]),
  ...day('2025-03-10', 'b3', [
    ['s14', A], ['s15', P], ['s16', A], ['s17', P], ['s18', P], ['s19', P], ['s20', P],
  ]),
  ...day('2025-03-12', 'b3', [
    ['s14', P], ['s15', P], ['s16', A], ['s17', P], ['s18', A], ['s19', A], ['s20', A],
  ]),
  ...day('2025-03-14', 'b3', [
    ['s14', P], ['s15', P], ['s16', A], ['s17', P], ['s18', P], ['s19', P], ['s20', P],
  ]),

  // ─────────────────────────────────────────────────────────────────────────
  // BATCH b4 – React Bootcamp Apr 2026 (ACTIVE)
  // Students: s21–s29 | 10 session dates
  // ─────────────────────────────────────────────────────────────────────────
  ...day('2026-04-07', 'b4', [
    ['s21', P], ['s22', P], ['s23', A], ['s24', P], ['s25', P], ['s26', P], ['s27', A], ['s28', P], ['s29', P],
  ]),
  ...day('2026-04-08', 'b4', [
    ['s21', P], ['s22', A], ['s23', P], ['s24', P], ['s25', A], ['s26', P], ['s27', A], ['s28', P], ['s29', P],
  ]),
  ...day('2026-04-09', 'b4', [
    ['s21', A], ['s22', P], ['s23', P], ['s24', P], ['s25', P], ['s26', A], ['s27', P], ['s28', A], ['s29', P],
  ]),
  ...day('2026-04-10', 'b4', [
    ['s21', P], ['s22', P], ['s23', P], ['s24', P], ['s25', P], ['s26', P], ['s27', A], ['s28', P], ['s29', P],
  ]),
  ...day('2026-04-11', 'b4', [
    ['s21', P], ['s22', A], ['s23', A], ['s24', P], ['s25', A], ['s26', P], ['s27', A], ['s28', P], ['s29', P],
  ]),
  ...day('2026-04-14', 'b4', [
    ['s21', P], ['s22', P], ['s23', P], ['s24', P], ['s25', A], ['s26', P], ['s27', P], ['s28', P], ['s29', P],
  ]),
  ...day('2026-04-15', 'b4', [
    ['s21', P], ['s22', P], ['s23', A], ['s24', P], ['s25', P], ['s26', A], ['s27', A], ['s28', A], ['s29', P],
  ]),
  ...day('2026-04-16', 'b4', [
    ['s21', P], ['s22', P], ['s23', P], ['s24', A], ['s25', A], ['s26', P], ['s27', A], ['s28', P], ['s29', P],
  ]),
  ...day('2026-04-17', 'b4', [
    ['s21', P], ['s22', P], ['s23', P], ['s24', P], ['s25', P], ['s26', P], ['s27', A], ['s28', P], ['s29', P],
  ]),
  ...day('2026-04-22', 'b4', [
    ['s21', P], ['s22', A], ['s23', A], ['s24', P], ['s25', A], ['s26', P], ['s27', A], ['s28', P], ['s29', P],
  ]),

  // ─────────────────────────────────────────────────────────────────────────
  // BATCH b5 – Data Analytics May 2026 (ACTIVE)
  // Students: s30–s37 | 6 session dates
  // ─────────────────────────────────────────────────────────────────────────
  ...day('2026-05-05', 'b5', [
    ['s30', P], ['s31', P], ['s32', P], ['s33', A], ['s34', P], ['s35', A], ['s36', P], ['s37', P],
  ]),
  ...day('2026-05-07', 'b5', [
    ['s30', P], ['s31', A], ['s32', P], ['s33', P], ['s34', P], ['s35', A], ['s36', P], ['s37', P],
  ]),
  ...day('2026-05-09', 'b5', [
    ['s30', A], ['s31', P], ['s32', P], ['s33', A], ['s34', P], ['s35', P], ['s36', P], ['s37', A],
  ]),
  ...day('2026-05-12', 'b5', [
    ['s30', P], ['s31', P], ['s32', P], ['s33', A], ['s34', A], ['s35', A], ['s36', P], ['s37', P],
  ]),
  ...day('2026-05-14', 'b5', [
    ['s30', P], ['s31', A], ['s32', P], ['s33', P], ['s34', P], ['s35', A], ['s36', P], ['s37', P],
  ]),
  ...day('2026-05-16', 'b5', [
    ['s30', P], ['s31', P], ['s32', P], ['s33', A], ['s34', P], ['s35', A], ['s36', A], ['s37', P],
  ]),

  // ─────────────────────────────────────────────────────────────────────────
  // BATCH b6 – Cloud Fundamentals May 2026 (ACTIVE)
  // Students: s38–s44 | 5 session dates
  // ─────────────────────────────────────────────────────────────────────────
  ...day('2026-05-12', 'b6', [
    ['s38', P], ['s39', P], ['s40', P], ['s41', P], ['s42', A], ['s43', P], ['s44', P],
  ]),
  ...day('2026-05-14', 'b6', [
    ['s38', P], ['s39', A], ['s40', P], ['s41', P], ['s42', P], ['s43', A], ['s44', P],
  ]),
  ...day('2026-05-16', 'b6', [
    ['s38', P], ['s39', P], ['s40', A], ['s41', P], ['s42', P], ['s43', P], ['s44', P],
  ]),
  ...day('2026-05-19', 'b6', [
    ['s38', A], ['s39', A], ['s40', P], ['s41', P], ['s42', A], ['s43', A], ['s44', P],
  ]),
  ...day('2026-05-21', 'b6', [
    ['s38', P], ['s39', P], ['s40', P], ['s41', P], ['s42', P], ['s43', P], ['s44', P],
  ]),

  // ─────────────────────────────────────────────────────────────────────────
  // BATCH b7 – UI/UX Design Apr 2026 (ON_HOLD)
  // Students: s45–s50 | 3 session dates before hold
  // ─────────────────────────────────────────────────────────────────────────
  ...day('2026-04-14', 'b7', [
    ['s45', P], ['s46', P], ['s47', A], ['s48', P], ['s49', P], ['s50', P],
  ]),
  ...day('2026-04-16', 'b7', [
    ['s45', P], ['s46', P], ['s47', P], ['s48', P], ['s49', A], ['s50', P],
  ]),
  ...day('2026-04-21', 'b7', [
    ['s45', A], ['s46', P], ['s47', A], ['s48', P], ['s49', P], ['s50', A],
  ]),
];
