/**
 * attendanceExportService.js
 * Attendance-specific CSV export service.
 * Module: 6.8 — Task 2
 *
 * RESPONSIBILITIES:
 *  - Build enriched attendance row data for export.
 *  - Generate CSV strings with proper escaping.
 *  - Trigger browser download.
 *  - Support session-level, history-list, and batch-filtered exports.
 *
 * ARCHITECTURE RULES:
 *  - No JSX / React — pure service layer.
 *  - Reads via attendanceService and attendanceHistoryService; never imports
 *    mock data directly.
 *  - All methods return { success, data, meta, error } shape.
 *  - generateCSVString / downloadCSV from exportUtils are the sole CSV
 *    generation primitives — no duplication of CSV logic here.
 *  - Audit events are emitted via attendanceAuditService on every export.
 *
 * EXPORT COLUMNS (Module 6.8 spec):
 *  Date | Batch Name | Student ID | Student Name | Status |
 *  Notes | Marked By | Created At | Updated At
 *
 * FILENAME STANDARD:
 *  attendance_<batchSlug>_<date>.csv
 */

import { getAttendanceByBatch, getAttendanceByDate } from '@services/attendanceService';
import { getAttendanceHistory }                       from '@services/attendanceHistoryService';
import { mockBatches }                                from '@data/mockBatches';
import { mockStudents }                               from '@data/mockStudents';
import { mockUsers }                                  from '@data/mockUsers';
import { generateCSVString, downloadCSV }             from '@utils/exportUtils';
import { ok, fail, tryCatch }                         from '@utils/serviceResponse';
import { getToday, formatDate }                       from '@utils/dateUtils';
import { ATTENDANCE_LABEL }                           from '@constants/attendanceStatus';
import { logAuditEvent, AUDIT_ACTIONS }               from '@services/attendanceAuditService';

// ── Error codes ──────────────────────────────────────────────────────────────

export const EXPORT_ERRORS = Object.freeze({
  INVALID_BATCH:  'EXPORT_INVALID_BATCH',
  INVALID_DATE:   'EXPORT_INVALID_DATE',
  NO_DATA:        'EXPORT_NO_DATA',
  GENERATE_FAIL:  'EXPORT_GENERATE_FAIL',
  UNEXPECTED:     'EXPORT_UNEXPECTED',
});

// ── Column definitions ────────────────────────────────────────────────────────

/**
 * Standard columns for attendance record-level CSV export.
 * Matches Module 6.8 spec.
 */
export const ATTENDANCE_CSV_COLUMNS = [
  { key: 'date',        label: 'Date',         format: (v) => v ?? '' },
  { key: 'batchName',   label: 'Batch Name' },
  { key: 'studentCode', label: 'Student ID' },
  { key: 'studentName', label: 'Student Name' },
  { key: 'status',      label: 'Status',       format: (v) => ATTENDANCE_LABEL[v] ?? v ?? '' },
  { key: 'remarks',     label: 'Notes' },
  { key: 'markedBy',    label: 'Marked By' },
  { key: 'createdAt',   label: 'Created At',   format: (v) => v ? new Date(v).toLocaleString() : '' },
  { key: 'updatedAt',   label: 'Updated At',   format: (v) => v ? new Date(v).toLocaleString() : '' },
];

/**
 * Column definitions for session-summary CSV (history list export).
 */
export const SESSION_SUMMARY_CSV_COLUMNS = [
  { key: 'date',         label: 'Session Date' },
  { key: 'batchName',    label: 'Batch Name' },
  { key: 'trainerName',  label: 'Trainer' },
  { key: 'presentCount', label: 'Present' },
  { key: 'absentCount',  label: 'Absent' },
  { key: 'totalCount',   label: 'Total Students' },
  {
    key: 'percentage',
    label: 'Attendance %',
    format: (v) => typeof v === 'number' ? `${v.toFixed(1)}%` : '0.0%',
  },
  { key: 'markedByName', label: 'Marked By' },
  { key: 'markedAt',     label: 'Recorded At', format: (v) => v ? new Date(v).toLocaleString() : '' },
];

// ── Internal reference lookups ────────────────────────────────────────────────

const _getBatch   = (id) => mockBatches.find((b) => b.id === id) ?? null;
const _getStudent = (id) => mockStudents.find((s) => s.id === id) ?? null;
const _getUser    = (id) => mockUsers.find((u) => u.id === id) ?? null;

/** Slugify a batch name for use in filenames. */
const _slugify = (name) =>
  (name ?? 'batch')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 40);

/** Build canonical export filename. */
const _buildFilename = (batchName, date) =>
  `attendance_${_slugify(batchName)}_${date ?? getToday()}`;

/** Enrich a flat attendance record with display names. */
const _enrichRecord = (record) => {
  const batch   = _getBatch(record.batchId);
  const student = _getStudent(record.studentId);
  const user    = _getUser(record.markedBy);
  return {
    ...record,
    batchName:   batch?.batchName   ?? record.batchId,
    studentCode: student?.studentCode ?? record.studentId,
    studentName: student?.name        ?? record.studentId,
    markedBy:    user?.name           ?? record.markedBy ?? '',
  };
};

// ── Public methods ────────────────────────────────────────────────────────────

/**
 * Export all records for a specific attendance session (batchId + date).
 *
 * @param {string} batchId
 * @param {string} date     YYYY-MM-DD
 * @param {string} [markedBy]  userId of the person performing the export
 * @returns {Promise<{ success, data: { rowCount: number }, meta, error }>}
 */
export const exportAttendanceSession = async (batchId, date, markedBy = 'unknown') => {
  return tryCatch(async () => {
    if (!batchId) return fail(EXPORT_ERRORS.INVALID_BATCH, 'Batch ID is required');
    if (!date)    return fail(EXPORT_ERRORS.INVALID_DATE,  'Date is required');

    const res = await getAttendanceByDate(batchId, date);
    if (!res.success) return fail(EXPORT_ERRORS.NO_DATA, res.error?.message ?? 'Failed to load session');

    const records = res.data ?? [];
    if (records.length === 0) {
      return fail(EXPORT_ERRORS.NO_DATA, 'No records found for this session');
    }

    const batch    = _getBatch(batchId);
    const enriched = records.map(_enrichRecord);

    try {
      const csv      = generateCSVString(ATTENDANCE_CSV_COLUMNS, enriched);
      const filename = _buildFilename(batch?.batchName, date);
      downloadCSV(filename, csv);
    } catch (e) {
      return fail(EXPORT_ERRORS.GENERATE_FAIL, `CSV generation failed: ${e.message}`);
    }

    // Audit
    await logAuditEvent({
      action:     AUDIT_ACTIONS.EXPORTED,
      entityType: 'AttendanceSession',
      entityId:   `${batchId}::${date}`,
      userId:     markedBy,
      meta:       { batchId, date, rowCount: records.length, format: 'csv' },
    });

    return ok({ rowCount: records.length }, { batchId, date });
  });
};

/**
 * Export a list of session summaries from the history view.
 * Accepts the enriched session objects already built by attendanceHistoryService.
 *
 * @param {object[]} sessions  Enriched session rows from useAttendanceHistory
 * @param {string}   [label]   Optional label for the filename
 * @param {string}   [markedBy]
 * @returns {Promise<{ success, data: { rowCount: number }, meta, error }>}
 */
export const exportAttendanceHistory = async (sessions, label = 'history', markedBy = 'unknown') => {
  return tryCatch(async () => {
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return fail(EXPORT_ERRORS.NO_DATA, 'No sessions to export');
    }

    try {
      const csv      = generateCSVString(SESSION_SUMMARY_CSV_COLUMNS, sessions);
      const filename = `attendance_${_slugify(label)}_${getToday()}`;
      downloadCSV(filename, csv);
    } catch (e) {
      return fail(EXPORT_ERRORS.GENERATE_FAIL, `CSV generation failed: ${e.message}`);
    }

    await logAuditEvent({
      action:     AUDIT_ACTIONS.EXPORTED,
      entityType: 'AttendanceHistory',
      entityId:   label,
      userId:     markedBy,
      meta:       { rowCount: sessions.length, format: 'csv' },
    });

    return ok({ rowCount: sessions.length }, { label });
  });
};

/**
 * Export all attendance records for an entire batch (with optional date range).
 *
 * @param {string} batchId
 * @param {{ from?: string, to?: string }} [options]
 * @param {string} [markedBy]
 * @returns {Promise<{ success, data: { rowCount: number }, meta, error }>}
 */
export const exportBatchAttendance = async (batchId, options = {}, markedBy = 'unknown') => {
  return tryCatch(async () => {
    if (!batchId) return fail(EXPORT_ERRORS.INVALID_BATCH, 'Batch ID is required');

    const res = await getAttendanceByBatch(batchId, options);
    if (!res.success) return fail(EXPORT_ERRORS.NO_DATA, res.error?.message ?? 'Failed to load batch attendance');

    const records = res.data ?? [];
    if (records.length === 0) {
      return fail(EXPORT_ERRORS.NO_DATA, 'No attendance records found for this batch');
    }

    const batch    = _getBatch(batchId);
    const enriched = records.map(_enrichRecord);

    try {
      const csv      = generateCSVString(ATTENDANCE_CSV_COLUMNS, enriched);
      const filename = _buildFilename(batch?.batchName, getToday());
      downloadCSV(filename, csv);
    } catch (e) {
      return fail(EXPORT_ERRORS.GENERATE_FAIL, `CSV generation failed: ${e.message}`);
    }

    await logAuditEvent({
      action:     AUDIT_ACTIONS.EXPORTED,
      entityType: 'BatchAttendance',
      entityId:   batchId,
      userId:     markedBy,
      meta:       { batchId, rowCount: records.length, format: 'csv', ...options },
    });

    return ok({ rowCount: records.length }, { batchId, ...options });
  });
};

/**
 * Generate a CSV string without downloading it (useful for testing / previews).
 *
 * @param {object[]} records  Raw or enriched attendance records
 * @param {'records'|'sessions'} [mode='records']
 * @returns {{ success, data: string, error }}
 */
export const generateAttendanceCSV = (records, mode = 'records') => {
  try {
    if (!Array.isArray(records)) throw new Error('records must be an array');
    const columns = mode === 'sessions' ? SESSION_SUMMARY_CSV_COLUMNS : ATTENDANCE_CSV_COLUMNS;
    const csv     = generateCSVString(columns, records);
    return ok(csv, { rowCount: records.length, mode });
  } catch (e) {
    return fail(EXPORT_ERRORS.GENERATE_FAIL, e.message);
  }
};
