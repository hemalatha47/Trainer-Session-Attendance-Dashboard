/**
 * attendanceDeleteService.js
 * Delete and correction workflow service for Attendance management.
 * Module: 6.8 — Tasks 4 & 5
 *
 * RESPONSIBILITIES:
 *  - Delete a full attendance session (all records for a batchId + date).
 *  - Delete a single attendance record by ID (optional row-level delete).
 *  - Correct historical attendance (status / remarks overwrite with audit trail).
 *  - Emit audit events for every mutation via attendanceAuditService.
 *
 * ARCHITECTURE RULES:
 *  - No JSX / React — pure service layer.
 *  - All store mutations are delegated to attendanceService internals via the
 *    exported updateAttendance and a new deleteSession helper exposed here.
 *  - Returns standard { success, data, meta, error } envelope.
 *  - Delete is irreversible in V1 — no soft-delete. UI must show ConfirmDialog.
 *  - Correction is an overwrite (upsert) via markAttendance — never a new record.
 *
 * NOTE ON DELETION STRATEGY:
 *  The main attendanceService._store is not exported. This service accesses
 *  the attendance store through the public attendanceService API where possible,
 *  and imports a _deleteFromStore helper that is co-located in attendanceService
 *  (added in Module 6.8 patch). This keeps the store's ownership boundary intact.
 */

import {
  getAttendanceByDate,
  updateAttendance,
  markAttendance,
  ATTENDANCE_ERRORS,
  _deleteSession as deleteSessionFromStore,
  _deleteRecord  as deleteRecordFromStore,
} from '@services/attendanceService';
import { ok, fail, tryCatch }                     from '@utils/serviceResponse';
import { isValidDateString }                       from '@utils/dateUtils';
import { ATTENDANCE_STATUS_LIST }                  from '@constants/attendanceStatus';
import {
  logAuditEvent,
  AUDIT_ACTIONS,
  diffAttendanceRecord,
} from '@services/attendanceAuditService';

// ── Error codes ───────────────────────────────────────────────────────────────

export const DELETE_ERRORS = Object.freeze({
  INVALID_BATCH:    'DELETE_INVALID_BATCH',
  INVALID_DATE:     'DELETE_INVALID_DATE',
  INVALID_RECORD:   'DELETE_INVALID_RECORD_ID',
  NOT_FOUND:        'DELETE_SESSION_NOT_FOUND',
  NO_RECORDS:       'DELETE_NO_RECORDS',
  CORRECTION_FAIL:  'CORRECTION_FAIL',
  UNEXPECTED:       'DELETE_UNEXPECTED',
});

const VALID_STATUSES = new Set(ATTENDANCE_STATUS_LIST);

// ── Delete session ────────────────────────────────────────────────────────────

/**
 * Delete all attendance records for a given batch + date session.
 * This is an irreversible hard-delete in V1. The UI must present a
 * ConfirmDialog before calling this method.
 *
 * @param {string} batchId
 * @param {string} date      YYYY-MM-DD
 * @param {string} [userId]  User performing the delete (for audit)
 * @returns {Promise<{ success, data: { deletedCount: number }, meta, error }>}
 */
export const deleteAttendanceSession = async (batchId, date, userId = 'unknown') => {
  return tryCatch(async () => {
    if (!batchId || typeof batchId !== 'string' || !batchId.trim()) {
      return fail(DELETE_ERRORS.INVALID_BATCH, 'A valid batch ID is required');
    }
    if (!date || !isValidDateString(date)) {
      return fail(DELETE_ERRORS.INVALID_DATE, 'A valid date (YYYY-MM-DD) is required');
    }

    // Load existing records for audit snapshot
    const existing = await getAttendanceByDate(batchId, date);
    if (!existing.success) {
      return fail(DELETE_ERRORS.UNEXPECTED, existing.error?.message ?? 'Failed to load session');
    }

    const records = existing.data ?? [];
    if (records.length === 0) {
      return fail(DELETE_ERRORS.NO_RECORDS, `No attendance records found for batch "${batchId}" on ${date}`);
    }

    // Perform deletion via store helper
    const deletedCount = deleteSessionFromStore(batchId, date);

    // Emit audit event
    await logAuditEvent({
      action:     AUDIT_ACTIONS.DELETED,
      entityType: 'AttendanceSession',
      entityId:   `${batchId}::${date}`,
      userId,
      before:     { records },
      after:      null,
      meta:       { batchId, date, deletedCount },
    });

    return ok({ deletedCount }, { batchId, date });
  });
};

/**
 * Delete a single attendance record by its ID.
 *
 * @param {string} recordId
 * @param {string} [userId]
 * @returns {Promise<{ success, data: { deletedRecord: object }, meta, error }>}
 */
export const deleteAttendanceRecord = async (recordId, userId = 'unknown') => {
  return tryCatch(async () => {
    if (!recordId || typeof recordId !== 'string' || !recordId.trim()) {
      return fail(DELETE_ERRORS.INVALID_RECORD, 'A valid record ID is required');
    }

    const { deleted, record } = deleteRecordFromStore(recordId.trim());

    if (!deleted) {
      return fail(
        DELETE_ERRORS.NOT_FOUND,
        `Attendance record with ID "${recordId}" not found`
      );
    }

    await logAuditEvent({
      action:     AUDIT_ACTIONS.DELETED,
      entityType: 'AttendanceRecord',
      entityId:   recordId,
      userId,
      before:     record,
      after:      null,
      meta:       { recordId },
    });

    return ok({ deletedRecord: record }, { recordId });
  });
};

// ── Correction workflow ────────────────────────────────────────────────────────

/**
 * Apply corrections to a historical attendance session.
 * Accepts an array of { studentId, status, remarks } corrections and
 * overwrites matching records via markAttendance (upsert).
 *
 * @param {{
 *   batchId:     string,
 *   date:        string,
 *   corrections: Array<{ studentId: string, status: string, remarks?: string }>,
 *   userId:      string,
 * }} params
 *
 * @returns {Promise<{ success, data: { correctedCount: number, records: object[] }, meta, error }>}
 */
export const correctAttendanceSession = async ({ batchId, date, corrections, userId }) => {
  return tryCatch(async () => {
    if (!batchId || !batchId.trim()) {
      return fail(DELETE_ERRORS.INVALID_BATCH, 'A valid batch ID is required');
    }
    if (!date || !isValidDateString(date)) {
      return fail(DELETE_ERRORS.INVALID_DATE, 'A valid date (YYYY-MM-DD) is required');
    }
    if (!Array.isArray(corrections) || corrections.length === 0) {
      return fail(DELETE_ERRORS.CORRECTION_FAIL, 'At least one correction is required');
    }

    // Validate all correction statuses
    for (const c of corrections) {
      if (!c.studentId) {
        return fail(DELETE_ERRORS.CORRECTION_FAIL, 'Each correction must include a studentId');
      }
      if (!VALID_STATUSES.has(c.status)) {
        return fail(
          DELETE_ERRORS.CORRECTION_FAIL,
          `Invalid status "${c.status}" for student ${c.studentId}`
        );
      }
    }

    // Capture "before" snapshot for audit
    const existingRes = await getAttendanceByDate(batchId, date);
    const beforeRecords = existingRes.success ? (existingRes.data ?? []) : [];

    // Apply corrections via markAttendance (upsert)
    const saveRes = await markAttendance({
      batchId,
      date,
      records:  corrections.map((c) => ({
        studentId: c.studentId,
        status:    c.status,
        remarks:   c.remarks ?? '',
      })),
      markedBy: userId ?? 'unknown',
    });

    if (!saveRes.success) {
      return fail(
        DELETE_ERRORS.CORRECTION_FAIL,
        saveRes.error?.message ?? 'Correction save failed'
      );
    }

    const afterRecords = saveRes.data?.saved ?? [];

    // Build diff for each corrected record and emit audit events
    for (const after of afterRecords) {
      const before = beforeRecords.find((r) => r.studentId === after.studentId) ?? null;
      const { changed, changes } = diffAttendanceRecord(before, after);
      if (changed) {
        await logAuditEvent({
          action:     AUDIT_ACTIONS.CORRECTED,
          entityType: 'AttendanceRecord',
          entityId:   after.id,
          userId,
          before,
          after,
          meta:       { batchId, date, changes },
        });
      }
    }

    return ok(
      { correctedCount: afterRecords.length, records: afterRecords },
      { batchId, date }
    );
  });
};

/**
 * Apply a correction to a single attendance record by its ID.
 * Useful for inline editing directly from the session detail panel.
 *
 * @param {string} recordId
 * @param {{ status?: string, remarks?: string }} changes
 * @param {string} [userId]
 * @returns {Promise<{ success, data: { record: object }, meta, error }>}
 */
export const correctAttendanceRecord = async (recordId, changes, userId = 'unknown') => {
  return tryCatch(async () => {
    if (!recordId?.trim()) {
      return fail(DELETE_ERRORS.INVALID_RECORD, 'A valid record ID is required');
    }
    if (!changes || typeof changes !== 'object') {
      return fail(DELETE_ERRORS.CORRECTION_FAIL, 'Changes object is required');
    }
    if (changes.status !== undefined && !VALID_STATUSES.has(changes.status)) {
      return fail(DELETE_ERRORS.CORRECTION_FAIL, `Invalid status: "${changes.status}"`);
    }

    const res = await updateAttendance(recordId, { ...changes, markedBy: userId });
    if (!res.success) {
      return fail(DELETE_ERRORS.CORRECTION_FAIL, res.error?.message ?? 'Correction failed');
    }

    await logAuditEvent({
      action:     AUDIT_ACTIONS.CORRECTED,
      entityType: 'AttendanceRecord',
      entityId:   recordId,
      userId,
      before:     null, // single-record correction — full before not available without extra fetch
      after:      res.data,
      meta:       { recordId, changes },
    });

    return ok({ record: res.data }, { recordId });
  });
};
