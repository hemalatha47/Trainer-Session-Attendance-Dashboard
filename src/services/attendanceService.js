/**
 * attendanceService.js
 * Centralized data-access layer for all Attendance operations.
 *
 * Blueprint Sections: 4.3, 8.4, 9.1–9.5, 10.4, 11.1 (services/), 13, 17.5, 17.6
 * Module: B3.3
 *
 * ARCHITECTURE RULES:
 *  - Pages and hooks NEVER import from @data directly — only attendanceService does.
 *  - All methods are async so the hook layer is API-migration-safe.
 *  - USE_MOCK flag controls data source; toggling requires zero hook/page changes.
 *  - All methods return the { success, data, meta, error } shape from serviceResponse.
 *  - Validation happens here before any write — hooks receive descriptive errors.
 *  - The composite unique key (batchId + studentId + date) is enforced on every write.
 *
 * CRITICAL ATTENDANCE RULES (Blueprint Section 9, 13):
 *  1. Attendance is ALWAYS batch-scoped — never global.
 *  2. Each date's records are stored independently (no implicit session linking).
 *  3. Duplicate prevention: (batchId + studentId + date) must be unique.
 *     If a record already exists → UPDATE it (upsert), never INSERT a duplicate.
 *  4. Date handling: always YYYY-MM-DD in LOCAL time. Never rely on toISOString().
 *  5. markAttendance is atomic at the batch+date level: all records or none.
 *
 * MOCK STORAGE STRATEGY:
 *  - Runtime working array seeded from mockAttendance at module load.
 *  - Mutations operate on this in-memory array (session-scoped, resets on reload).
 *  - Batch and Student reference stores validate FK integrity at write time.
 *
 * FUTURE API MIGRATION:
 *  - Set VITE_USE_MOCK=false in .env.production.
 *  - Replace mock branch internals with axios calls matching Section 10.4.
 *  - Method signatures, return shapes, and error codes remain unchanged.
 *
 * SUPPORTED STATUSES (Blueprint Section 14 / attendanceStatus.js):
 *  V1 active: present, absent
 *  Future:    late, leave, halfDay, excused
 */

import { mockAttendance } from '@data/mockAttendance';
import { mockBatches }    from '@data/mockBatches';
import { mockStudents }   from '@data/mockStudents';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LIST,
} from '@constants/attendanceStatus';
import { ok, fail, tryCatch } from '@utils/serviceResponse';
import {
  isValidDateString,
  normalizeAttendanceDate,
  getDistinctAttendanceDates,
  filterByDateRange,
  compareAttendanceDates,
  getToday,
} from '@utils/dateUtils';
import {
  calculateStudentAttendanceSummary,
  calculateBatchStatistics,
  calculateAttendancePercentage,
  calculatePresentCount,
  calculateAbsentCount,
} from '@utils/calcUtils';

// ── Environment flag ──────────────────────────────────────────────────────────

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ── In-memory working stores (mock mode) ──────────────────────────────────────
// Seeded from mock data; mutations persist for the browser session only.

let _store        = mockAttendance.map((r) => ({ ...r }));
const _batchRef   = mockBatches.map((b) => ({ ...b }));
const _studentRef = mockStudents.map((s) => ({ ...s }));

// ── Error codes ───────────────────────────────────────────────────────────────

export const ATTENDANCE_ERRORS = Object.freeze({
  NOT_FOUND:           'ATTENDANCE_NOT_FOUND',
  INVALID_ID:          'ATTENDANCE_INVALID_ID',
  INVALID_DATE:        'ATTENDANCE_INVALID_DATE',
  INVALID_STATUS:      'ATTENDANCE_INVALID_STATUS',
  INVALID_BATCH:       'ATTENDANCE_INVALID_BATCH_ID',
  INVALID_STUDENT:     'ATTENDANCE_INVALID_STUDENT_ID',
  BATCH_NOT_FOUND:     'ATTENDANCE_BATCH_NOT_FOUND',
  STUDENT_NOT_FOUND:   'ATTENDANCE_STUDENT_NOT_FOUND',
  STUDENT_WRONG_BATCH: 'ATTENDANCE_STUDENT_WRONG_BATCH',
  VALIDATION:          'ATTENDANCE_VALIDATION_ERROR',
  FUTURE_DATE:         'ATTENDANCE_FUTURE_DATE',
  UNEXPECTED:          'ATTENDANCE_UNEXPECTED_ERROR',
});

// ── Valid status set (all currently defined statuses) ─────────────────────────

const VALID_STATUSES = new Set(ATTENDANCE_STATUS_LIST);

// ── ID generator ──────────────────────────────────────────────────────────────

/**
 * Generates the canonical deterministic ID for an attendance record.
 * Matches the pattern established in mockAttendance.js (Section 17.5).
 * @param {string} batchId
 * @param {string} date       YYYY-MM-DD
 * @param {string} studentId
 * @returns {string}
 */
const _buildRecordId = (batchId, date, studentId) =>
  `att-${batchId}-${date}-${studentId}`;

// ── Internal validation helpers ───────────────────────────────────────────────

/**
 * Validates a non-empty string ID parameter.
 * @param {any}    value
 * @param {string} errorCode
 * @param {string} label
 * @returns {null | ReturnType<typeof fail>}
 */
const _validateId = (value, errorCode, label) => {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return fail(errorCode, `A valid ${label} is required`);
  }
  return null;
};

/**
 * Validates an attendance date string.
 * Must be a valid YYYY-MM-DD string. Future dates are rejected for mark operations.
 * @param {string}  date
 * @param {boolean} [allowFuture=false]
 * @returns {null | ReturnType<typeof fail>}
 */
const _validateDate = (date, allowFuture = false) => {
  if (!date || typeof date !== 'string') {
    return fail(ATTENDANCE_ERRORS.INVALID_DATE, 'A valid date is required');
  }
  if (!isValidDateString(date)) {
    return fail(
      ATTENDANCE_ERRORS.INVALID_DATE,
      `"${date}" is not a valid date. Use YYYY-MM-DD format`
    );
  }
  if (!allowFuture && date > getToday()) {
    return fail(
      ATTENDANCE_ERRORS.FUTURE_DATE,
      'Cannot mark attendance for a future date'
    );
  }
  return null;
};

/**
 * Validates an attendance status value.
 * @param {string} status
 * @returns {null | ReturnType<typeof fail>}
 */
const _validateStatus = (status) => {
  if (!status || !VALID_STATUSES.has(status)) {
    return fail(
      ATTENDANCE_ERRORS.INVALID_STATUS,
      `"${status}" is not a valid attendance status. Valid values: ${ATTENDANCE_STATUS_LIST.join(', ')}`
    );
  }
  return null;
};

// ── Mock store internals ───────────────────────────────────────────────────────

const _mock = {
  /**
   * Finds an existing record by composite key.
   * @param {string} batchId
   * @param {string} studentId
   * @param {string} date
   * @returns {object|null}
   */
  findByCompositeKey(batchId, studentId, date) {
    return (
      _store.find(
        (r) => r.batchId === batchId && r.studentId === studentId && r.date === date
      ) || null
    );
  },

  /**
   * Finds a single record by its ID.
   * @param {string} id
   * @returns {object|null}
   */
  findById(id) {
    return _store.find((r) => r.id === id) || null;
  },

  /**
   * Returns all records matching a batchId + date.
   * @param {string} batchId
   * @param {string} date
   * @returns {object[]}
   */
  getByBatchAndDate(batchId, date) {
    return _store.filter((r) => r.batchId === batchId && r.date === date);
  },

  /**
   * Returns all records for a batch (optionally filtered by date range).
   * @param {string}  batchId
   * @param {string}  [from]  YYYY-MM-DD
   * @param {string}  [to]    YYYY-MM-DD
   * @returns {object[]}
   */
  getByBatch(batchId, from, to) {
    let records = _store.filter((r) => r.batchId === batchId);
    if (from && to) {
      records = filterByDateRange(records, from, to);
    } else if (from) {
      records = records.filter((r) => r.date >= from);
    } else if (to) {
      records = records.filter((r) => r.date <= to);
    }
    return records;
  },

  /**
   * Returns all records for a student (optionally filtered by batchId / date range).
   * @param {string}  studentId
   * @param {string}  [batchId]
   * @param {string}  [from]
   * @param {string}  [to]
   * @returns {object[]}
   */
  getByStudent(studentId, batchId, from, to) {
    let records = _store.filter((r) => r.studentId === studentId);
    if (batchId) {
      records = records.filter((r) => r.batchId === batchId);
    }
    if (from && to) {
      records = filterByDateRange(records, from, to);
    } else if (from) {
      records = records.filter((r) => r.date >= from);
    } else if (to) {
      records = records.filter((r) => r.date <= to);
    }
    return records.sort((a, b) => compareAttendanceDates(a.date, b.date));
  },

  /**
   * Upserts a single record: updates if composite key exists, inserts if not.
   * @param {object} record  - Normalized record object.
   * @returns {{ record: object, isUpdate: boolean }}
   */
  upsert(record) {
    const existing = this.findByCompositeKey(
      record.batchId,
      record.studentId,
      record.date
    );
    if (existing) {
      const idx = _store.indexOf(existing);
      _store[idx] = {
        ...existing,
        status:    record.status,
        markedBy:  record.markedBy,
        remarks:   record.remarks ?? existing.remarks ?? '',
        updatedAt: record.updatedAt,
      };
      return { record: { ..._store[idx] }, isUpdate: true };
    }
    _store.push({ ...record });
    return { record: { ...record }, isUpdate: false };
  },

  /**
   * Updates a single record by ID (partial merge).
   * @param {string} id
   * @param {object} changes
   * @returns {object} updated record
   */
  updateById(id, changes) {
    const idx = _store.findIndex((r) => r.id === id);
    _store[idx] = { ..._store[idx], ...changes };
    return { ..._store[idx] };
  },

  /**
   * Verifies a batch ID exists in the reference store.
   * @param {string} batchId
   * @returns {boolean}
   */
  batchExists(batchId) {
    return _batchRef.some((b) => b.id === batchId);
  },

  /**
   * Verifies a student exists and belongs to the specified batch.
   * @param {string} studentId
   * @param {string} batchId
   * @returns {{ exists: boolean, wrongBatch: boolean }}
   */
  studentInBatch(studentId, batchId) {
    const student = _studentRef.find((s) => s.id === studentId);
    if (!student) return { exists: false, wrongBatch: false };
    return { exists: true, wrongBatch: student.batchId !== batchId };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC SERVICE METHODS
// ─────────────────────────────────────────────────────────────────────────────

// ── Mark Attendance ───────────────────────────────────────────────────────────

/**
 * Marks (or updates) attendance for all students in a batch on a specific date.
 *
 * This is the primary write operation. It implements the blueprint's upsert
 * requirement (Section 9.2): for each {studentId, status} pair, check if a
 * record with (batchId + studentId + date) already exists. If yes → update;
 * if no → insert. The operation is effectively atomic at the batch+date level.
 *
 * Blueprint Sections: 4.3, 9.1, 9.2, 9.3, 13
 *
 * @param {{
 *   batchId:   string,
 *   date:      string,       - YYYY-MM-DD (local time, not UTC)
 *   records:   Array<{ studentId: string, status: string, remarks?: string }>,
 *   markedBy:  string,       - userId of the person submitting
 * }} params
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     saved:    object[],    - All upserted records
 *     updated:  number,      - Count of records that were updates
 *     inserted: number,      - Count of records that were new inserts
 *   } | null,
 *   meta: { batchId, date, totalRecords },
 *   error: { code, message } | null
 * }>}
 *
 * @example
 *   const res = await markAttendance({
 *     batchId: 'b4',
 *     date: '2026-06-17',
 *     records: [
 *       { studentId: 's21', status: 'present' },
 *       { studentId: 's22', status: 'absent' },
 *     ],
 *     markedBy: 'u2',
 *   });
 *   if (res.success) showToast('Attendance saved', 'success');
 */
export const markAttendance = async ({ batchId, date, records, markedBy }) => {
  return tryCatch(() => {
    // ── Parameter validation ──────────────────────────────────────────────────
    const batchIdErr = _validateId(batchId, ATTENDANCE_ERRORS.INVALID_BATCH, 'batch ID');
    if (batchIdErr) return batchIdErr;

    const dateErr = _validateDate(date, false);
    if (dateErr) return dateErr;

    const markedByErr = _validateId(markedBy, ATTENDANCE_ERRORS.VALIDATION, 'markedBy user ID');
    if (markedByErr) return markedByErr;

    if (!Array.isArray(records) || records.length === 0) {
      return fail(
        ATTENDANCE_ERRORS.VALIDATION,
        'At least one attendance record is required'
      );
    }

    const normalizedDate = normalizeAttendanceDate(date);

    if (USE_MOCK) {
      // ── Batch existence check ───────────────────────────────────────────────
      if (!_mock.batchExists(batchId)) {
        return fail(
          ATTENDANCE_ERRORS.BATCH_NOT_FOUND,
          `Batch with ID "${batchId}" not found`
        );
      }

      // ── Pre-validate ALL records before writing any (atomicity) ────────────
      for (const rec of records) {
        const studentIdErr = _validateId(
          rec?.studentId,
          ATTENDANCE_ERRORS.INVALID_STUDENT,
          'student ID'
        );
        if (studentIdErr) return studentIdErr;

        const statusErr = _validateStatus(rec.status);
        if (statusErr) return statusErr;

        const { exists, wrongBatch } = _mock.studentInBatch(rec.studentId, batchId);
        if (!exists) {
          return fail(
            ATTENDANCE_ERRORS.STUDENT_NOT_FOUND,
            `Student with ID "${rec.studentId}" not found`
          );
        }
        if (wrongBatch) {
          return fail(
            ATTENDANCE_ERRORS.STUDENT_WRONG_BATCH,
            `Student "${rec.studentId}" does not belong to batch "${batchId}"`
          );
        }
      }

      // ── Upsert all records ──────────────────────────────────────────────────
      const now      = new Date().toISOString();
      const saved    = [];
      let   updated  = 0;
      let   inserted = 0;

      for (const rec of records) {
        const normalized = {
          id:         _buildRecordId(batchId, normalizedDate, rec.studentId),
          batchId,
          studentId:  rec.studentId,
          date:       normalizedDate,
          status:     rec.status,
          markedBy,
          remarks:    rec.remarks?.trim() || '',
          createdAt:  now,
          updatedAt:  now,
        };

        const { record, isUpdate } = _mock.upsert(normalized);
        saved.push(record);
        if (isUpdate) updated++;
        else          inserted++;
      }

      return ok(
        { saved, updated, inserted },
        { batchId, date: normalizedDate, totalRecords: saved.length }
      );
    }

    // Future: POST /api/attendance  (body: { batchId, date, records, markedBy })
    return fail(ATTENDANCE_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

// ── Update single attendance record ───────────────────────────────────────────

/**
 * Updates a single attendance record by its ID.
 * Supports partial updates: only `status` and `remarks` can be changed.
 *
 * Blueprint Section 4.3 — editing already-submitted records with permission.
 *
 * @param {string} recordId
 * @param {{
 *   status?:   string,
 *   remarks?:  string,
 *   markedBy:  string,
 * }} changes
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: object | null,
 *   meta: {},
 *   error: { code, message } | null
 * }>}
 */
export const updateAttendance = async (recordId, changes) => {
  return tryCatch(() => {
    const idErr = _validateId(recordId, ATTENDANCE_ERRORS.INVALID_ID, 'attendance record ID');
    if (idErr) return idErr;

    if (!changes || typeof changes !== 'object') {
      return fail(ATTENDANCE_ERRORS.VALIDATION, 'Update changes object is required');
    }

    // Validate status if supplied
    if (changes.status !== undefined) {
      const statusErr = _validateStatus(changes.status);
      if (statusErr) return statusErr;
    }

    if (USE_MOCK) {
      const existing = _mock.findById(recordId.trim());
      if (!existing) {
        return fail(
          ATTENDANCE_ERRORS.NOT_FOUND,
          `Attendance record with ID "${recordId}" not found`
        );
      }

      const updated = _mock.updateById(recordId.trim(), {
        ...(changes.status  !== undefined && { status: changes.status }),
        ...(changes.remarks !== undefined && { remarks: changes.remarks.trim() }),
        ...(changes.markedBy !== undefined && { markedBy: changes.markedBy }),
        updatedAt: new Date().toISOString(),
      });

      return ok({ ...updated });
    }

    // Future: PUT /api/attendance/:recordId  (body: changes)
    return fail(ATTENDANCE_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

// ── Get attendance by batch + date ────────────────────────────────────────────

/**
 * Fetches all attendance records for a specific batch on a specific date.
 *
 * Primary use cases:
 *  - Mark Attendance page: detect "already marked" and populate edit mode (Section 9.1)
 *  - Batch Details → Attendance Records tab: single-day view
 *
 * Blueprint Sections: 4.4, 9.1, 10.4
 *
 * @param {string} batchId
 * @param {string} date     YYYY-MM-DD
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: object[] | null,
 *   meta: { batchId, date, count, isMarked: boolean },
 *   error: { code, message } | null
 * }>}
 */
export const getAttendanceByDate = async (batchId, date) => {
  return tryCatch(() => {
    const batchIdErr = _validateId(batchId, ATTENDANCE_ERRORS.INVALID_BATCH, 'batch ID');
    if (batchIdErr) return batchIdErr;

    const dateErr = _validateDate(date, true); // allow future dates for read
    if (dateErr) return dateErr;

    const normalizedDate = normalizeAttendanceDate(date);

    if (USE_MOCK) {
      if (!_mock.batchExists(batchId)) {
        return fail(
          ATTENDANCE_ERRORS.BATCH_NOT_FOUND,
          `Batch with ID "${batchId}" not found`
        );
      }

      const records = _mock.getByBatchAndDate(batchId, normalizedDate);
      const sorted  = [...records].sort((a, b) =>
        a.studentId.localeCompare(b.studentId)
      );

      return ok(sorted, {
        batchId,
        date:     normalizedDate,
        count:    sorted.length,
        isMarked: sorted.length > 0,
      });
    }

    // Future: GET /api/attendance?batchId=&date=
    return fail(ATTENDANCE_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

// ── Get attendance by batch (with optional date range) ───────────────────────

/**
 * Fetches all attendance records for a batch, optionally within a date range.
 *
 * Primary use cases:
 *  - Batch Details → Attendance Records tab: full history
 *  - Reports page: date-range report generation (Section 6.7)
 *  - Analytics: trend data for line chart (Section 6.8)
 *
 * Blueprint Sections: 4.5, 6.4, 6.7, 6.8, 10.4
 *
 * @param {string}  batchId
 * @param {{
 *   from?:    string,  - YYYY-MM-DD (inclusive)
 *   to?:      string,  - YYYY-MM-DD (inclusive)
 *   sortBy?:  'date' | 'studentId',
 *   order?:   'asc' | 'desc',
 *   page?:    number,
 *   pageSize?: number,
 * }} [options]
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: object[] | null,
 *   meta: {
 *     batchId, total, filtered,
 *     distinctDates: string[],
 *     totalSessions: number,
 *     page, pageSize, totalPages,
 *   },
 *   error: { code, message } | null
 * }>}
 */
export const getAttendanceByBatch = async (batchId, options = {}) => {
  return tryCatch(() => {
    const batchIdErr = _validateId(batchId, ATTENDANCE_ERRORS.INVALID_BATCH, 'batch ID');
    if (batchIdErr) return batchIdErr;

    const {
      from,
      to,
      sortBy    = 'date',
      order     = 'asc',
      page      = 1,
      pageSize  = 0, // 0 = no pagination (return all)
    } = options;

    // Validate date range if provided
    if (from && !isValidDateString(from)) {
      return fail(ATTENDANCE_ERRORS.INVALID_DATE, `Invalid "from" date: "${from}"`);
    }
    if (to && !isValidDateString(to)) {
      return fail(ATTENDANCE_ERRORS.INVALID_DATE, `Invalid "to" date: "${to}"`);
    }
    if (from && to && from > to) {
      return fail(ATTENDANCE_ERRORS.INVALID_DATE, '"from" date must be on or before "to" date');
    }

    if (USE_MOCK) {
      if (!_mock.batchExists(batchId)) {
        return fail(
          ATTENDANCE_ERRORS.BATCH_NOT_FOUND,
          `Batch with ID "${batchId}" not found`
        );
      }

      let records = _mock.getByBatch(batchId, from, to);

      // Sort
      records.sort((a, b) => {
        const primary   = sortBy === 'date'
          ? compareAttendanceDates(a.date, b.date)
          : a.studentId.localeCompare(b.studentId);
        const secondary = compareAttendanceDates(a.date, b.date); // tie-break by date
        const result    = primary !== 0 ? primary : secondary;
        return order === 'desc' ? -result : result;
      });

      const total         = records.length;
      const distinctDates = getDistinctAttendanceDates(records);

      // Paginate (only if pageSize > 0)
      let paged       = records;
      let totalPages  = 1;
      let safePage    = 1;

      if (pageSize > 0) {
        totalPages = Math.ceil(total / pageSize);
        safePage   = Math.max(1, Math.min(page, totalPages));
        const startIdx = (safePage - 1) * pageSize;
        paged = records.slice(startIdx, startIdx + pageSize);
      }

      return ok(paged, {
        batchId,
        total,
        filtered:      paged.length,
        distinctDates,
        totalSessions: distinctDates.length,
        page:          safePage,
        pageSize:      pageSize || total,
        totalPages,
      });
    }

    // Future: GET /api/attendance?batchId=&from=&to=&page=&pageSize=
    return fail(ATTENDANCE_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

// ── Get attendance by student ─────────────────────────────────────────────────

/**
 * Fetches all attendance records for a specific student.
 *
 * Primary use cases:
 *  - Student detail view: attendance history (Section 6.5)
 *  - Reports: per-student breakdown (Section 6.7)
 *  - Analytics: leaderboard (Section 6.8)
 *
 * Blueprint Sections: 4.2, 6.5, 9.5, 10.4
 *
 * @param {string}  studentId
 * @param {{
 *   batchId?:  string,  - Narrow to a specific batch
 *   from?:     string,  - YYYY-MM-DD
 *   to?:       string,  - YYYY-MM-DD
 *   sortBy?:   'date' | 'status',
 *   order?:    'asc' | 'desc',
 * }} [options]
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: object[] | null,
 *   meta: {
 *     studentId, total,
 *     distinctDates: string[],
 *     totalSessions: number,
 *   },
 *   error: { code, message } | null
 * }>}
 */
export const getStudentAttendance = async (studentId, options = {}) => {
  return tryCatch(() => {
    const studentIdErr = _validateId(
      studentId,
      ATTENDANCE_ERRORS.INVALID_STUDENT,
      'student ID'
    );
    if (studentIdErr) return studentIdErr;

    const {
      batchId,
      from,
      to,
      sortBy = 'date',
      order  = 'asc',
    } = options;

    if (from && !isValidDateString(from)) {
      return fail(ATTENDANCE_ERRORS.INVALID_DATE, `Invalid "from" date: "${from}"`);
    }
    if (to && !isValidDateString(to)) {
      return fail(ATTENDANCE_ERRORS.INVALID_DATE, `Invalid "to" date: "${to}"`);
    }

    if (USE_MOCK) {
      // Verify student exists
      const studentExists = _studentRef.some((s) => s.id === studentId);
      if (!studentExists) {
        return fail(
          ATTENDANCE_ERRORS.STUDENT_NOT_FOUND,
          `Student with ID "${studentId}" not found`
        );
      }

      let records = _mock.getByStudent(studentId, batchId, from, to);

      // Sort
      records.sort((a, b) => {
        let result;
        if (sortBy === 'status') {
          result = a.status.localeCompare(b.status);
          if (result === 0) result = compareAttendanceDates(a.date, b.date);
        } else {
          result = compareAttendanceDates(a.date, b.date);
        }
        return order === 'desc' ? -result : result;
      });

      const distinctDates = getDistinctAttendanceDates(records);

      return ok(records, {
        studentId,
        total:         records.length,
        distinctDates,
        totalSessions: distinctDates.length,
      });
    }

    // Future: GET /api/attendance/student/:studentId?batchId=&from=&to=
    return fail(ATTENDANCE_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

// ── Calculate attendance percentage for a student ────────────────────────────

/**
 * Calculates attendance percentage for a student within a batch.
 *
 * Formula (Blueprint Section 9.4):
 *   % = present records ÷ total distinct batch session dates × 100
 *
 * NOTE: "total distinct batch session dates" = unique dates for which ANY
 * attendance was recorded in the batch (not calendar days).
 *
 * Blueprint Sections: 4.6, 9.4, 9.5
 *
 * @param {string} studentId
 * @param {string} batchId
 * @param {number} [threshold=75]  - Low-attendance threshold for statusColor
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     studentId:     string,
 *     batchId:       string,
 *     totalSessions: number,
 *     presentCount:  number,
 *     absentCount:   number,
 *     percentage:    number,
 *     statusColor:   'success' | 'warning' | 'danger',
 *   } | null,
 *   meta: {},
 *   error: { code, message } | null
 * }>}
 */
export const calculateAttendancePercentageForStudent = async (
  studentId,
  batchId,
  threshold = 75
) => {
  return tryCatch(() => {
    const studentIdErr = _validateId(
      studentId,
      ATTENDANCE_ERRORS.INVALID_STUDENT,
      'student ID'
    );
    if (studentIdErr) return studentIdErr;

    const batchIdErr = _validateId(batchId, ATTENDANCE_ERRORS.INVALID_BATCH, 'batch ID');
    if (batchIdErr) return batchIdErr;

    if (USE_MOCK) {
      const batchRecords = _mock.getByBatch(batchId);
      const distinctDates = getDistinctAttendanceDates(batchRecords);

      const summary = calculateStudentAttendanceSummary(
        studentId,
        batchRecords,
        distinctDates,
        threshold
      );

      return ok({ ...summary, batchId });
    }

    // Future: GET /api/reports/student/:studentId?batchId=
    return fail(ATTENDANCE_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

// ── Get batch attendance summary ───────────────────────────────────────────────

/**
 * Returns a complete attendance summary for an entire batch.
 *
 * Blueprint Sections: 4.5, 4.6, 9.5, 10.6
 *
 * @param {string}   batchId
 * @param {string[]} studentIds   - IDs of active students in the batch
 * @param {number}   [threshold=75]
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     totalSessions:      number,
 *     totalStudents:      number,
 *     averageAttendance:  number,
 *     lowAttendanceCount: number,
 *     studentSummaries:   Array,
 *   } | null,
 *   meta: { batchId },
 *   error: { code, message } | null
 * }>}
 */
export const getBatchAttendanceSummary = async (batchId, studentIds, threshold = 75) => {
  return tryCatch(() => {
    const batchIdErr = _validateId(batchId, ATTENDANCE_ERRORS.INVALID_BATCH, 'batch ID');
    if (batchIdErr) return batchIdErr;

    if (!Array.isArray(studentIds)) {
      return fail(ATTENDANCE_ERRORS.VALIDATION, 'studentIds must be an array');
    }

    if (USE_MOCK) {
      if (!_mock.batchExists(batchId)) {
        return fail(
          ATTENDANCE_ERRORS.BATCH_NOT_FOUND,
          `Batch with ID "${batchId}" not found`
        );
      }

      const allRecords = _mock.getByBatch(batchId);
      const stats      = calculateBatchStatistics(allRecords, studentIds, threshold);

      return ok(stats, { batchId });
    }

    // Future: GET /api/reports/batch/:batchId
    return fail(ATTENDANCE_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

// ── Get session dates for a batch ─────────────────────────────────────────────

/**
 * Returns the distinct session dates for a batch in ascending order.
 * Used by Mark Attendance page to detect "already marked" dates and
 * by reports to drive the date-range table.
 *
 * Blueprint Section 9.3 — sessions are identified by distinct date values.
 *
 * @param {string} batchId
 * @param {{ from?: string, to?: string }} [options]
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: string[] | null,   - Sorted YYYY-MM-DD strings
 *   meta: { batchId, count },
 *   error: { code, message } | null
 * }>}
 */
export const getSessionDates = async (batchId, options = {}) => {
  return tryCatch(() => {
    const batchIdErr = _validateId(batchId, ATTENDANCE_ERRORS.INVALID_BATCH, 'batch ID');
    if (batchIdErr) return batchIdErr;

    const { from, to } = options;

    if (USE_MOCK) {
      const records = _mock.getByBatch(batchId, from, to);
      const dates   = getDistinctAttendanceDates(records);

      return ok(dates, { batchId, count: dates.length });
    }

    // Future: GET /api/attendance?batchId=&from=&to= then extract distinct dates
    return fail(ATTENDANCE_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

// ── Dashboard summary data ────────────────────────────────────────────────────

/**
 * Returns today's attendance summary across all batches for the Dashboard.
 *
 * Blueprint Section 6.2, 10.5
 *
 * @param {string[]} activeBatchIds  - IDs of currently active batches
 * @param {number}   [threshold=75]
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: {
 *     todayRate:         number,    - Overall present rate today (0–100)
 *     totalMarkedToday:  number,    - Students whose attendance was recorded today
 *     presentToday:      number,    - Present count today
 *     absentToday:       number,    - Absent count today
 *     batchSummaries:    Array,     - Per-batch today stats
 *   } | null,
 *   meta: { date: string },
 *   error: { code, message } | null
 * }>}
 */
export const getTodayDashboardSummary = async (activeBatchIds, threshold = 75) => {
  return tryCatch(() => {
    if (!Array.isArray(activeBatchIds)) {
      return fail(ATTENDANCE_ERRORS.VALIDATION, 'activeBatchIds must be an array');
    }

    const today = getToday();

    if (USE_MOCK) {
      const todayRecords = _store.filter(
        (r) => r.date === today && activeBatchIds.includes(r.batchId)
      );

      const presentToday    = calculatePresentCount(todayRecords);
      const absentToday     = calculateAbsentCount(todayRecords);
      const totalMarked     = todayRecords.length;
      const todayRate       = calculateAttendancePercentage(presentToday, totalMarked);

      const batchSummaries = activeBatchIds.map((batchId) => {
        const batchRecs = todayRecords.filter((r) => r.batchId === batchId);
        return {
          batchId,
          count:    batchRecs.length,
          present:  calculatePresentCount(batchRecs),
          absent:   calculateAbsentCount(batchRecs),
          rate:     calculateAttendancePercentage(
            calculatePresentCount(batchRecs),
            batchRecs.length
          ),
          isMarked: batchRecs.length > 0,
        };
      });

      return ok(
        { todayRate, totalMarkedToday: totalMarked, presentToday, absentToday, batchSummaries },
        { date: today }
      );
    }

    // Future: GET /api/dashboard/summary
    return fail(ATTENDANCE_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

// ── Recent activity feed ──────────────────────────────────────────────────────

/**
 * Returns the most recent attendance submission events for the Dashboard feed.
 *
 * Blueprint Section 6.2, 10.5
 *
 * @param {number} [limit=5]  - Number of recent events to return
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: Array<{ batchId, date, studentCount, markedBy, markedAt }> | null,
 *   meta: { count: number },
 *   error: { code, message } | null
 * }>}
 */
export const getRecentActivity = async (limit = 5) => {
  return tryCatch(() => {
    if (typeof limit !== 'number' || limit < 1) {
      return fail(ATTENDANCE_ERRORS.VALIDATION, 'limit must be a positive number');
    }

    if (USE_MOCK) {
      // Group records by (batchId + date) to get per-session submissions
      const sessionMap = {};
      for (const r of _store) {
        const key = `${r.batchId}::${r.date}`;
        if (!sessionMap[key]) {
          sessionMap[key] = {
            batchId:      r.batchId,
            date:         r.date,
            studentCount: 0,
            markedBy:     r.markedBy,
            markedAt:     r.createdAt || r.updatedAt || r.date,
          };
        }
        sessionMap[key].studentCount++;
        // Keep the latest markedAt for the session
        const recAt = r.updatedAt || r.createdAt || '';
        if (recAt > sessionMap[key].markedAt) {
          sessionMap[key].markedAt = recAt;
        }
      }

      const sessions = Object.values(sessionMap)
        .sort((a, b) => b.markedAt.localeCompare(a.markedAt))
        .slice(0, limit);

      return ok(sessions, { count: sessions.length });
    }

    // Future: GET /api/dashboard/recent?limit=
    return fail(ATTENDANCE_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

// ── Analytics: trend data ─────────────────────────────────────────────────────

/**
 * Returns daily attendance rate trend data for a batch over a date range.
 * Powers the line chart on the Analytics page (Section 6.8).
 *
 * Blueprint Sections: 6.8, 10.6
 *
 * @param {string} batchId
 * @param {string} from    YYYY-MM-DD
 * @param {string} to      YYYY-MM-DD
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: Array<{ date: string, presentCount: number, absentCount: number, rate: number }> | null,
 *   meta: { batchId, from, to, totalPoints: number },
 *   error: { code, message } | null
 * }>}
 */
export const getAttendanceTrend = async (batchId, from, to) => {
  return tryCatch(() => {
    const batchIdErr = _validateId(batchId, ATTENDANCE_ERRORS.INVALID_BATCH, 'batch ID');
    if (batchIdErr) return batchIdErr;

    if (!isValidDateString(from)) {
      return fail(ATTENDANCE_ERRORS.INVALID_DATE, `Invalid "from" date: "${from}"`);
    }
    if (!isValidDateString(to)) {
      return fail(ATTENDANCE_ERRORS.INVALID_DATE, `Invalid "to" date: "${to}"`);
    }
    if (from > to) {
      return fail(ATTENDANCE_ERRORS.INVALID_DATE, '"from" must be on or before "to"');
    }

    if (USE_MOCK) {
      const records       = _mock.getByBatch(batchId, from, to);
      const distinctDates = getDistinctAttendanceDates(records);

      const trend = distinctDates.map((date) => {
        const dayRecs      = records.filter((r) => r.date === date);
        const presentCount = calculatePresentCount(dayRecs);
        const absentCount  = calculateAbsentCount(dayRecs);
        const rate         = calculateAttendancePercentage(presentCount, dayRecs.length);
        return { date, presentCount, absentCount, rate };
      });

      return ok(trend, { batchId, from, to, totalPoints: trend.length });
    }

    // Future: GET /api/analytics/trend?batchId=&from=&to=
    return fail(ATTENDANCE_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

// ── Analytics: batch comparison ───────────────────────────────────────────────

/**
 * Returns average attendance for multiple batches — powers the bar chart.
 *
 * Blueprint Section 6.8, 10.6
 *
 * @param {string[]} batchIds
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: Array<{ batchId: string, averageRate: number, totalSessions: number }> | null,
 *   meta: { count: number },
 *   error: { code, message } | null
 * }>}
 */
export const getBatchComparisonData = async (batchIds) => {
  return tryCatch(() => {
    if (!Array.isArray(batchIds) || batchIds.length === 0) {
      return fail(ATTENDANCE_ERRORS.VALIDATION, 'At least one batch ID is required');
    }

    if (USE_MOCK) {
      const result = batchIds.map((batchId) => {
        const records       = _mock.getByBatch(batchId);
        const distinctDates = getDistinctAttendanceDates(records);

        if (records.length === 0) {
          return { batchId, averageRate: 0, totalSessions: 0 };
        }

        // Average daily rate across all session dates
        const dailyRates = distinctDates.map((date) => {
          const dayRecs = records.filter((r) => r.date === date);
          return calculateAttendancePercentage(
            calculatePresentCount(dayRecs),
            dayRecs.length
          );
        });

        const averageRate = dailyRates.length
          ? Math.round((dailyRates.reduce((a, b) => a + b, 0) / dailyRates.length) * 10) / 10
          : 0;

        return { batchId, averageRate, totalSessions: distinctDates.length };
      });

      return ok(result, { count: result.length });
    }

    // Future: GET /api/analytics/comparison?batchIds=
    return fail(ATTENDANCE_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

// ── Delete helpers (Module 6.8) ───────────────────────────────────────────────

/**
 * Deletes all attendance records for a given batch + date session.
 * Called by attendanceDeleteService — not intended for direct page use.
 * Returns the count of deleted records.
 *
 * @param {string} batchId
 * @param {string} date    YYYY-MM-DD
 * @returns {number} deletedCount
 */
export const _deleteSession = (batchId, date) => {
  const before = _store.length;
  _store = _store.filter((r) => !(r.batchId === batchId && r.date === date));
  return before - _store.length;
};

/**
 * Deletes a single attendance record by its ID.
 * Called by attendanceDeleteService.
 *
 * @param {string} id
 * @returns {{ deleted: boolean, record: object | null }}
 */
export const _deleteRecord = (id) => {
  const idx = _store.findIndex((r) => r.id === id);
  if (idx === -1) return { deleted: false, record: null };
  const [record] = _store.splice(idx, 1);
  return { deleted: true, record };
};

// ── Development utility ───────────────────────────────────────────────────────

/**
 * Resets the in-memory store to the original mock seed data.
 * Development only — never call from production code paths.
 */
export const _resetStore = () => {
  _store = mockAttendance.map((r) => ({ ...r }));
};
