/**
 * attendanceSaveService.js
 * Save / Edit workflow service for Attendance management.
 *
 * Module 6.5 — Attendance Save & Edit Workflow
 * Blueprint Sections: 4.3, 9.1, 9.2, 9.3, 13
 *
 * RESPONSIBILITIES:
 *  - Validate attendance payload before any write.
 *  - Detect duplicate session (batchId + date already has records).
 *  - Save new attendance (insert mode).
 *  - Update existing attendance (edit / overwrite mode).
 *  - All methods return the standard { success, data, meta, error } shape.
 *
 * ARCHITECTURE RULES:
 *  - No JSX, no React. Pure service layer.
 *  - No UI state — hooks (useAttendanceSave) own loading/error/success state.
 *  - Delegates all store mutations to attendanceService.markAttendance.
 *  - attendanceService is the single source of truth for upsert and validation.
 *
 * VALIDATION RULES (Task 4):
 *  Rule 1 — Valid, non-empty batchId required.
 *  Rule 2 — Valid YYYY-MM-DD date required (no future dates).
 *  Rule 3 — At least one record required.
 *  Rule 4 — No pending (undefined / null) statuses in records.
 *  Rule 5 — Each remarks string ≤ REMARKS_MAX_LENGTH characters.
 *  Rule 6 — Composite uniqueness (batchId + studentId + date) enforced by
 *            markAttendance — this service detects duplication mode upfront.
 *
 * DUPLICATE DETECTION (Task 5):
 *  Before saving, getAttendanceByDate is called. If records exist for
 *  (batchId + date), the caller is informed so it can request confirmation
 *  before proceeding (overwrite mode).
 */

import {
  markAttendance,
  getAttendanceByDate,
} from '@services/attendanceService';
import { ok, fail, tryCatch } from '@utils/serviceResponse';
import { isValidDateString, getToday } from '@utils/dateUtils';
import { ATTENDANCE_STATUS_LIST } from '@constants/attendanceStatus';

// ── Constants ──────────────────────────────────────────────────────────────────

export const REMARKS_MAX_LENGTH = 250;

const VALID_STATUSES = new Set(ATTENDANCE_STATUS_LIST);

// ── Error codes ────────────────────────────────────────────────────────────────

export const SAVE_ERRORS = Object.freeze({
  INVALID_BATCH:      'SAVE_INVALID_BATCH',
  INVALID_DATE:       'SAVE_INVALID_DATE',
  FUTURE_DATE:        'SAVE_FUTURE_DATE',
  NO_RECORDS:         'SAVE_NO_RECORDS',
  PENDING_STATUSES:   'SAVE_PENDING_STATUSES',
  REMARKS_TOO_LONG:   'SAVE_REMARKS_TOO_LONG',
  INVALID_MARKER:     'SAVE_INVALID_MARKED_BY',
  SERVICE_ERROR:      'SAVE_SERVICE_ERROR',
  UNEXPECTED:         'SAVE_UNEXPECTED',
});

// ── Validation helpers ─────────────────────────────────────────────────────────

/**
 * Validates the complete attendance save payload.
 *
 * @param {{ batchId, date, records, markedBy }} params
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateAttendanceBeforeSave = ({ batchId, date, records, markedBy }) => {
  const errors = [];

  // Rule 1 — Valid batch ID
  if (!batchId || typeof batchId !== 'string' || batchId.trim().length === 0) {
    errors.push('A valid batch is required before saving attendance.');
  }

  // Rule 2 — Valid date string
  if (!date || typeof date !== 'string') {
    errors.push('A valid session date is required.');
  } else if (!isValidDateString(date)) {
    errors.push(`"${date}" is not a valid date. Use YYYY-MM-DD format.`);
  } else if (date > getToday()) {
    // Rule 2b — No future dates
    errors.push('Cannot save attendance for a future date.');
  }

  // Rule 3 — At least one record
  if (!Array.isArray(records) || records.length === 0) {
    errors.push('At least one attendance record is required.');
  } else {
    // Rule 4 — No pending / invalid statuses
    const pendingStudents = records.filter(
      (r) => !r?.status || !VALID_STATUSES.has(r.status)
    );
    if (pendingStudents.length > 0) {
      errors.push(
        `${pendingStudents.length} student(s) still have a pending status. Please mark all students before saving.`
      );
    }

    // Rule 5 — Notes length
    const longNotes = records.filter(
      (r) => r?.remarks && r.remarks.length > REMARKS_MAX_LENGTH
    );
    if (longNotes.length > 0) {
      errors.push(
        `Notes must not exceed ${REMARKS_MAX_LENGTH} characters. ${longNotes.length} student(s) have notes that are too long.`
      );
    }
  }

  // markedBy presence check
  if (!markedBy || typeof markedBy !== 'string' || markedBy.trim().length === 0) {
    errors.push('A valid user session is required to save attendance.');
  }

  return { valid: errors.length === 0, errors };
};

// ── Public service methods ─────────────────────────────────────────────────────

/**
 * Checks whether attendance already exists for the given batch + date.
 *
 * Returns { exists: boolean, count: number } so the caller can decide
 * whether to enter create mode or prompt for overwrite confirmation.
 *
 * Blueprint Section 9.2 — duplicate detection before write.
 *
 * @param {string} batchId
 * @param {string} date       YYYY-MM-DD
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: { exists: boolean, count: number, records: object[] } | null,
 *   meta: { batchId, date },
 *   error: { code, message } | null
 * }>}
 */
export const checkExistingAttendance = async (batchId, date) => {
  return tryCatch(async () => {
    if (!batchId || !date) {
      return fail(SAVE_ERRORS.INVALID_BATCH, 'batchId and date are required for duplicate check.');
    }

    const res = await getAttendanceByDate(batchId, date);

    if (!res.success) {
      // Surface the upstream error — batch not found, invalid date, etc.
      return fail(res.error?.code ?? SAVE_ERRORS.SERVICE_ERROR, res.error?.message ?? 'Failed to check existing attendance.');
    }

    const records = res.data ?? [];
    return ok(
      { exists: records.length > 0, count: records.length, records },
      { batchId, date }
    );
  });
};

/**
 * Saves attendance for a batch + date (create mode).
 *
 * Intended for sessions that have NO existing records.
 * Delegates to markAttendance which enforces composite-key uniqueness
 * and performs all FK validation atomically.
 *
 * @param {{
 *   batchId:   string,
 *   date:      string,
 *   records:   Array<{ studentId: string, status: string, remarks?: string }>,
 *   markedBy:  string,
 * }} params
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: { saved: object[], inserted: number, updated: number } | null,
 *   meta: { batchId, date, totalRecords, mode: 'create' },
 *   error: { code, message } | null
 * }>}
 */
export const saveAttendance = async ({ batchId, date, records, markedBy }) => {
  return tryCatch(async () => {
    // Client-side validation before any service call
    const { valid, errors } = validateAttendanceBeforeSave({ batchId, date, records, markedBy });
    if (!valid) {
      return fail(SAVE_ERRORS.SERVICE_ERROR, errors[0]);
    }

    const res = await markAttendance({ batchId, date, records, markedBy });

    if (!res.success) {
      return fail(res.error?.code ?? SAVE_ERRORS.SERVICE_ERROR, res.error?.message ?? 'Failed to save attendance.');
    }

    return ok(
      res.data,
      { ...res.meta, mode: 'create' }
    );
  });
};

/**
 * Updates existing attendance for a batch + date (edit / overwrite mode).
 *
 * Semantically identical to saveAttendance — markAttendance handles
 * upsert internally. This method exists to make intent explicit in
 * the hook and to allow future divergence (e.g. partial-update optimisation).
 *
 * @param {{
 *   batchId:   string,
 *   date:      string,
 *   records:   Array<{ studentId: string, status: string, remarks?: string }>,
 *   markedBy:  string,
 * }} params
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: { saved: object[], inserted: number, updated: number } | null,
 *   meta: { batchId, date, totalRecords, mode: 'edit' },
 *   error: { code, message } | null
 * }>}
 */
export const updateAttendanceSession = async ({ batchId, date, records, markedBy }) => {
  return tryCatch(async () => {
    const { valid, errors } = validateAttendanceBeforeSave({ batchId, date, records, markedBy });
    if (!valid) {
      return fail(SAVE_ERRORS.SERVICE_ERROR, errors[0]);
    }

    const res = await markAttendance({ batchId, date, records, markedBy });

    if (!res.success) {
      return fail(res.error?.code ?? SAVE_ERRORS.SERVICE_ERROR, res.error?.message ?? 'Failed to update attendance.');
    }

    return ok(
      res.data,
      { ...res.meta, mode: 'edit' }
    );
  });
};
