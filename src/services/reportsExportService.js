/**
 * reportsExportService.js
 * Module 7.4 — Export & Final Polish
 *
 * CSV export service for the Reports module.
 * Supports all three report types: attendance, batch, student.
 *
 * RESPONSIBILITIES:
 *  - Generate CSV strings from report data arrays.
 *  - Trigger browser downloads.
 *  - Handle filename generation (report_<type>_<date>.csv).
 *  - Return standardized { success, data, meta, error } shapes.
 *
 * ARCHITECTURE:
 *  - No JSX / React — pure service layer.
 *  - Delegates CSV primitives to @utils/exportUtils (no duplication).
 *  - Delegates data fetching to reportsTableService.
 *  - All exported methods are async and return the ok/fail shape.
 *
 * Blueprint Sections: 4.8, 6.7, 15.2
 */

import {
  getAttendanceReport,
  getBatchReport,
  getStudentReport,
} from '@services/reportsTableService';
import {
  generateCSVString,
  downloadCSV,
} from '@utils/exportUtils';
import { ok, fail, tryCatch } from '@utils/serviceResponse';
import { getToday }           from '@utils/dateUtils';

// ── Error codes ───────────────────────────────────────────────────────────────

export const REPORTS_EXPORT_ERRORS = Object.freeze({
  NO_DATA:        'REPORTS_EXPORT_NO_DATA',
  GENERATE_FAIL:  'REPORTS_EXPORT_GENERATE_FAIL',
  DOWNLOAD_FAIL:  'REPORTS_EXPORT_DOWNLOAD_FAIL',
  UNEXPECTED:     'REPORTS_EXPORT_UNEXPECTED',
});

// ── Filename builder ──────────────────────────────────────────────────────────

/**
 * Builds a standardised filename: report_<type>_<YYYY-MM-DD>.csv
 * Special chars stripped; spaces replaced by hyphens; lowercased.
 *
 * @param {'attendance'|'batch'|'student'} type
 * @returns {string}  e.g. "report_attendance_2026-06-24"
 */
export const buildExportFilename = (type = 'report') => {
  const safeType = String(type)
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
  return `report_${safeType}_${getToday()}`;
};

// ── Column definitions ────────────────────────────────────────────────────────

/**
 * Attendance report CSV columns.
 * Matches row shape returned by getAttendanceReport().
 */
export const ATTENDANCE_EXPORT_COLUMNS = [
  { key: 'date',          label: 'Date' },
  { key: 'batchName',     label: 'Batch Name' },
  { key: 'trainerName',   label: 'Trainer' },
  { key: 'totalStudents', label: 'Total Students' },
  { key: 'presentCount',  label: 'Present' },
  { key: 'absentCount',   label: 'Absent' },
  {
    key: 'attendanceRate',
    label: 'Attendance Rate (%)',
    format: (v) => (typeof v === 'number' ? v.toFixed(1) : '0.0'),
  },
  {
    key: 'statusLabel',
    label: 'Status',
    format: (v) => v ?? '',
  },
];

/**
 * Batch report CSV columns.
 * Matches row shape returned by getBatchReport().
 */
export const BATCH_EXPORT_COLUMNS = [
  { key: 'batchName',    label: 'Batch Name' },
  { key: 'batchCode',    label: 'Batch Code' },
  { key: 'trainerName',  label: 'Trainer' },
  { key: 'totalStudents', label: 'Total Students' },
  { key: 'totalSessions', label: 'Total Sessions' },
  {
    key: 'avgAttendance',
    label: 'Avg Attendance (%)',
    format: (v) => (typeof v === 'number' ? v.toFixed(1) : '0.0'),
  },
  {
    key: 'statusLabel',
    label: 'Status',
    format: (v) => v ?? '',
  },
];

/**
 * Student report CSV columns.
 * Matches row shape returned by getStudentReport().
 */
export const STUDENT_EXPORT_COLUMNS = [
  { key: 'studentName',   label: 'Student Name' },
  { key: 'studentCode',   label: 'Student ID' },
  { key: 'batchName',     label: 'Batch' },
  { key: 'totalSessions', label: 'Total Sessions' },
  { key: 'presentCount',  label: 'Present' },
  { key: 'absentCount',   label: 'Absent' },
  {
    key: 'percentage',
    label: 'Attendance (%)',
    format: (v) => (typeof v === 'number' ? v.toFixed(1) : '0.0'),
  },
  {
    key: 'statusLabel',
    label: 'Status',
    format: (v) => v ?? '',
  },
];

// ── Core generator ────────────────────────────────────────────────────────────

/**
 * generateCSV
 *
 * Generates and downloads a CSV file from a pre-built rows array.
 * Used internally by the three typed export methods.
 *
 * @param {{ columns: Array, rows: Array, filename: string }} params
 * @returns {{ success: boolean, data: { filename: string } | null, meta: {}, error: any }}
 */
export const generateCSV = ({ columns, rows, filename }) =>
  tryCatch(async () => {
    if (!rows || rows.length === 0) {
      return fail(
        REPORTS_EXPORT_ERRORS.NO_DATA,
        'No data available to export. Apply filters or mark attendance first.'
      );
    }

    const csvContent = generateCSVString(columns, rows);
    downloadCSV(filename, csvContent);

    return ok(
      { filename: `${filename}.csv` },
      { rowCount: rows.length }
    );
  });

// ── Typed export methods ──────────────────────────────────────────────────────

/**
 * exportAttendanceReport
 *
 * Fetches fresh attendance report data and exports as CSV.
 *
 * @param {object} filters  — same filters object used by useReportsData
 * @param {number} [threshold]
 * @returns {Promise<ServiceResponse>}
 */
export const exportAttendanceReport = async (filters = {}, threshold) =>
  tryCatch(async () => {
    const res = await getAttendanceReport(filters, threshold);
    if (!res.success) {
      return fail(
        REPORTS_EXPORT_ERRORS.GENERATE_FAIL,
        res.error?.message ?? 'Failed to fetch attendance data for export.'
      );
    }

    const rows = res.data ?? [];
    if (rows.length === 0) {
      return fail(
        REPORTS_EXPORT_ERRORS.NO_DATA,
        'No attendance records match the current filters.'
      );
    }

    const filename = buildExportFilename('attendance');
    const csvContent = generateCSVString(ATTENDANCE_EXPORT_COLUMNS, rows);
    downloadCSV(filename, csvContent);

    return ok(
      { filename: `${filename}.csv` },
      { rowCount: rows.length, type: 'attendance' }
    );
  });

/**
 * exportBatchReport
 *
 * Fetches fresh batch report data and exports as CSV.
 *
 * @param {object} filters
 * @param {number} [threshold]
 * @returns {Promise<ServiceResponse>}
 */
export const exportBatchReport = async (filters = {}, threshold) =>
  tryCatch(async () => {
    const res = await getBatchReport(filters, threshold);
    if (!res.success) {
      return fail(
        REPORTS_EXPORT_ERRORS.GENERATE_FAIL,
        res.error?.message ?? 'Failed to fetch batch data for export.'
      );
    }

    const rows = res.data ?? [];
    if (rows.length === 0) {
      return fail(
        REPORTS_EXPORT_ERRORS.NO_DATA,
        'No batch records match the current filters.'
      );
    }

    const filename = buildExportFilename('batch');
    const csvContent = generateCSVString(BATCH_EXPORT_COLUMNS, rows);
    downloadCSV(filename, csvContent);

    return ok(
      { filename: `${filename}.csv` },
      { rowCount: rows.length, type: 'batch' }
    );
  });

/**
 * exportStudentReport
 *
 * Fetches fresh student report data and exports as CSV.
 *
 * @param {object} filters
 * @param {number} [threshold]
 * @returns {Promise<ServiceResponse>}
 */
export const exportStudentReport = async (filters = {}, threshold) =>
  tryCatch(async () => {
    const res = await getStudentReport(filters, threshold);
    if (!res.success) {
      return fail(
        REPORTS_EXPORT_ERRORS.GENERATE_FAIL,
        res.error?.message ?? 'Failed to fetch student data for export.'
      );
    }

    const rows = res.data ?? [];
    if (rows.length === 0) {
      return fail(
        REPORTS_EXPORT_ERRORS.NO_DATA,
        'No student records match the current filters.'
      );
    }

    const filename = buildExportFilename('student');
    const csvContent = generateCSVString(STUDENT_EXPORT_COLUMNS, rows);
    downloadCSV(filename, csvContent);

    return ok(
      { filename: `${filename}.csv` },
      { rowCount: rows.length, type: 'student' }
    );
  });
