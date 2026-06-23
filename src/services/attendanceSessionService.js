/**
 * attendanceSessionService.js
 * Session setup validation layer for the Mark Attendance workflow.
 * Module: 6.2
 *
 * Responsibilities:
 *  - Retrieve batches eligible for attendance marking (active + upcoming with override).
 *  - Validate a session configuration (batchId + date) before the sheet loads.
 *  - Detect existing sessions (returns mode: 'create' | 'edit').
 *  - Derive trainer context for the selected batch.
 *
 * Architecture rules:
 *  - No JSX or React hooks here — pure async service.
 *  - Calls batchService and attendanceService; never imports mock data directly.
 *  - Returns the standard { success, data, meta, error } shape via serviceResponse.
 *  - All date handling delegates to dateUtils (local-time safe).
 */

import {
  getBatches,
  getBatchById,
  getBatchesByStatuses,
} from '@services/batchService';
import { getAttendanceByDate } from '@services/attendanceService';
import { mockUsers }           from '@data/mockUsers';
import { BATCH_STATUS }        from '@constants/batchStatus';
import { ok, fail, tryCatch }  from '@utils/serviceResponse';
import {
  getToday,
  isValidDateString,
  isFutureDate,
  isTodayOrPast,
} from '@utils/dateUtils';

// ── Error codes ───────────────────────────────────────────────────────────────

export const SESSION_ERRORS = Object.freeze({
  NO_BATCHES:        'SESSION_NO_BATCHES',
  BATCH_NOT_FOUND:   'SESSION_BATCH_NOT_FOUND',
  BATCH_ARCHIVED:    'SESSION_BATCH_ARCHIVED',
  DATE_REQUIRED:     'SESSION_DATE_REQUIRED',
  DATE_INVALID:      'SESSION_DATE_INVALID',
  DATE_BEFORE_BATCH: 'SESSION_DATE_BEFORE_BATCH',
  DATE_AFTER_BATCH:  'SESSION_DATE_AFTER_BATCH',
  DATE_FUTURE:       'SESSION_DATE_FUTURE',
  VALIDATION:        'SESSION_VALIDATION',
  UNEXPECTED:        'SESSION_UNEXPECTED',
});

// ── Statuses eligible for attendance marking ──────────────────────────────────

const MARKABLE_STATUSES = [BATCH_STATUS.ACTIVE, BATCH_STATUS.UPCOMING];
const BLOCKED_STATUSES  = [BATCH_STATUS.CANCELLED, BATCH_STATUS.COMPLETED];

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC SERVICE METHODS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all batches available for attendance marking.
 * Active batches are always included.
 * Upcoming batches are included so managers can pre-configure sessions.
 * Completed, cancelled, and on-hold batches are excluded.
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: Array<{
 *     id, batchCode, batchName, trainerId, trainerName,
 *     startDate, endDate, status, currentStudentCount
 *   }> | null,
 *   meta: { total: number, activeBatches: number, upcomingBatches: number },
 *   error: { code, message } | null
 * }>}
 */
export const getAvailableBatches = async () => {
  return tryCatch(async () => {
    const res = await getBatchesByStatuses(MARKABLE_STATUSES);

    if (!res.success) {
      return fail(SESSION_ERRORS.NO_BATCHES, res.error?.message ?? 'Failed to load batches');
    }

    const batches = (res.data ?? []).map((b) => ({
      id:                  b.id,
      batchCode:           b.batchCode,
      batchName:           b.batchName,
      trainerId:           b.trainerId,
      trainerName:         b.trainerName,
      startDate:           b.startDate,
      endDate:             b.endDate,
      status:              b.status,
      currentStudentCount: b.currentStudentCount ?? 0,
    }));

    const activeBatches   = batches.filter((b) => b.status === BATCH_STATUS.ACTIVE).length;
    const upcomingBatches = batches.filter((b) => b.status === BATCH_STATUS.UPCOMING).length;

    return ok(batches, { total: batches.length, activeBatches, upcomingBatches });
  });
};

/**
 * Validates a session configuration and checks for existing records.
 *
 * Validation rules (in order):
 *  1. Blocked status check (archived / cancelled / completed → reject).
 *  2. Date format validation (must be YYYY-MM-DD).
 *  3. Date not before batch start date.
 *  4. Date not after batch end date.
 *  5. Future date check (blocked by default; set allowFuture=true to permit).
 *  6. Existing session detection → session.mode = 'create' | 'edit'.
 *
 * @param {string}  batchId
 * @param {string}  date         - YYYY-MM-DD local date
 * @param {boolean} [allowFuture=false]
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     batchId:     string,
 *     date:        string,
 *     mode:        'create' | 'edit',
 *     existingCount: number,
 *   } | null,
 *   meta: { validated: boolean },
 *   error: { code, message } | null
 * }>}
 */
export const validateSession = async (batchId, date, allowFuture = false) => {
  return tryCatch(async () => {
    // ── 1. Batch lookup ───────────────────────────────────────────────────────
    if (!batchId || typeof batchId !== 'string') {
      return fail(SESSION_ERRORS.BATCH_NOT_FOUND, 'A batch must be selected');
    }

    const batchRes = await getBatchById(batchId);
    if (!batchRes.success || !batchRes.data) {
      return fail(SESSION_ERRORS.BATCH_NOT_FOUND, 'Selected batch not found');
    }

    const batch = batchRes.data;

    // ── 2. Blocked status check ───────────────────────────────────────────────
    if (BLOCKED_STATUSES.includes(batch.status)) {
      return fail(
        SESSION_ERRORS.BATCH_ARCHIVED,
        `"${batch.batchName}" is ${batch.status} and cannot accept attendance records`
      );
    }

    // ── 3. Date validation ────────────────────────────────────────────────────
    if (!date || typeof date !== 'string') {
      return fail(SESSION_ERRORS.DATE_REQUIRED, 'A session date must be selected');
    }
    if (!isValidDateString(date)) {
      return fail(SESSION_ERRORS.DATE_INVALID, 'Invalid date. Use YYYY-MM-DD format');
    }

    // ── 4. Date not before batch start ────────────────────────────────────────
    if (date < batch.startDate) {
      return fail(
        SESSION_ERRORS.DATE_BEFORE_BATCH,
        `Date cannot be before the batch start date (${batch.startDate})`
      );
    }

    // ── 5. Date not after batch end ───────────────────────────────────────────
    if (date > batch.endDate) {
      return fail(
        SESSION_ERRORS.DATE_AFTER_BATCH,
        `Date cannot be after the batch end date (${batch.endDate})`
      );
    }

    // ── 6. Future date check ──────────────────────────────────────────────────
    if (!allowFuture && date > getToday()) {
      return fail(
        SESSION_ERRORS.DATE_FUTURE,
        'Attendance cannot be marked for a future date'
      );
    }

    // ── 7. Existing session detection ─────────────────────────────────────────
    const existingRes = await getAttendanceByDate(batchId, date);
    const existingCount = (existingRes.success && Array.isArray(existingRes.data))
      ? existingRes.data.length
      : 0;
    const mode = existingCount > 0 ? 'edit' : 'create';

    return ok(
      { batchId, date, mode, existingCount },
      { validated: true }
    );
  });
};

/**
 * Checks whether attendance already exists for a batch + date.
 * Lightweight version of validateSession — no batch-level validation.
 *
 * @param {string} batchId
 * @param {string} date   YYYY-MM-DD
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: { isMarked: boolean, count: number, mode: 'create' | 'edit' } | null,
 *   meta: {},
 *   error: { code, message } | null
 * }>}
 */
export const checkExistingSession = async (batchId, date) => {
  return tryCatch(async () => {
    if (!batchId || !date) {
      return ok({ isMarked: false, count: 0, mode: 'create' });
    }

    const res = await getAttendanceByDate(batchId, date);

    if (!res.success) {
      return ok({ isMarked: false, count: 0, mode: 'create' });
    }

    const count    = Array.isArray(res.data) ? res.data.length : 0;
    const isMarked = count > 0;

    return ok({ isMarked, count, mode: isMarked ? 'edit' : 'create' });
  });
};

/**
 * Resolves trainer context for a batch.
 *
 * Priority:
 *  1. Batch's assigned trainer (from batch.trainerId → mockUsers lookup).
 *  2. Provided fallback user (logged-in user).
 *  3. Generic "Unknown Trainer" fallback.
 *
 * @param {object} batch         - Full batch object from batchService.
 * @param {object} [currentUser] - Logged-in user from AuthContext.
 *
 * @returns {{
 *   trainerId:   string,
 *   trainerName: string,
 *   role:        string,
 *   isOwner:     boolean,
 * }}
 */
export const getTrainerInfo = (batch, currentUser = null) => {
  if (!batch) {
    return {
      trainerId:   currentUser?.id   ?? 'unknown',
      trainerName: currentUser?.name ?? 'Unknown Trainer',
      role:        currentUser?.role ?? 'trainer',
      isOwner:     false,
    };
  }

  // Try to resolve from mockUsers reference store
  const trainerUser = mockUsers.find((u) => u.id === batch.trainerId);

  const resolvedName =
    trainerUser?.name ??
    batch.trainerName ??
    currentUser?.name ??
    'Unknown Trainer';

  const resolvedId   = batch.trainerId ?? currentUser?.id ?? 'unknown';
  const resolvedRole = trainerUser?.role ?? currentUser?.role ?? 'trainer';

  // Owner = current user IS the batch trainer
  const isOwner = !!(currentUser && currentUser.id === batch.trainerId);

  return {
    trainerId:   resolvedId,
    trainerName: resolvedName,
    role:        resolvedRole,
    isOwner,
  };
};
