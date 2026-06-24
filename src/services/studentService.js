/**
 * studentService.js
 * Centralized data-access layer for all Student operations.
 *
 * Blueprint Sections: 4.2, 8.3, 10.3, 11.1 (services/), 13, 17.6
 * Module: B3.2 — updated in Module 5.7 (Advanced Actions)
 *
 * ARCHITECTURE RULES:
 *  - Pages and hooks NEVER import from @data directly — only studentService does.
 *  - All methods are async so the hook layer is API-migration-safe.
 *  - USE_MOCK flag controls data source; toggling requires zero hook/page changes.
 *  - All methods return the { success, data, meta, error } shape from serviceResponse.
 *  - Validation happens here before any write — hooks receive descriptive errors.
 *  - Batch relationship integrity is enforced at write time (no orphan students).
 *
 * MODULE 5.7 ADDITIONS:
 *  - transferStudentBatch(studentId, targetBatchId) — moves student to another batch
 *  - deactivateStudent(id) — explicit soft-deactivate alias (distinct from deleteStudent)
 *  - bulkUpdateStudents(ids, changes) — partial-update many students at once
 *  - bulkDeleteStudents(ids) — soft-delete many students at once
 *  - exportStudentsCSV(filters) — returns formatted CSV rows for export utility
 *
 * MOCK STORAGE STRATEGY:
 *  - Runtime working array seeded from mockStudents at module load.
 *  - Mutations (create / update / delete) operate on this in-memory array.
 *  - Page reload resets to seed data — intentional for development.
 *  - Batch existence is verified against mockBatches (also in-memory copy).
 *
 * FUTURE API MIGRATION:
 *  - Set VITE_USE_MOCK=false in .env.production.
 *  - Replace mock branch internals with axios calls matching Section 10.3.
 *  - Method signatures, return shapes, and error codes remain unchanged.
 */

import { mockStudents } from '@data/mockStudents';
import { mockBatches }  from '@data/mockBatches';
import {
  MIN_STUDENT_NAME_LENGTH,
  MAX_STUDENT_NAME_LENGTH,
  MIN_STUDENT_CODE_LENGTH,
  MAX_STUDENT_CODE_LENGTH,
  MAX_PHONE_LENGTH,
  EMAIL_REGEX,
  PHONE_REGEX,
  CODE_REGEX,
} from '@constants/validation';
import { ok, fail, tryCatch } from '@utils/serviceResponse';

// ── Environment flag ──────────────────────────────────────────────────────────

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ── In-memory working stores (mock mode) ──────────────────────────────────────
let _store = mockStudents.map((s) => ({ ...s }));
const _batchRef = mockBatches.map((b) => ({ ...b }));

// ── Student status enum (internal) ───────────────────────────────────────────
export const STUDENT_STATUS = Object.freeze({
  ACTIVE:   'active',
  INACTIVE: 'inactive',
});

// ── Error codes ───────────────────────────────────────────────────────────────
export const STUDENT_ERRORS = Object.freeze({
  NOT_FOUND:       'STUDENT_NOT_FOUND',
  INVALID_ID:      'STUDENT_INVALID_ID',
  INVALID_BATCH:   'STUDENT_INVALID_BATCH_ID',
  BATCH_NOT_FOUND: 'STUDENT_BATCH_NOT_FOUND',
  BATCH_INACTIVE:  'STUDENT_BATCH_INACTIVE',
  VALIDATION:      'STUDENT_VALIDATION_ERROR',
  DUPLICATE_CODE:  'STUDENT_DUPLICATE_CODE',
  DUPLICATE_EMAIL: 'STUDENT_DUPLICATE_EMAIL',
  UNEXPECTED:      'STUDENT_UNEXPECTED_ERROR',
  BULK_PARTIAL:    'STUDENT_BULK_PARTIAL_FAILURE',
});

// ── Validation helpers (internal) ─────────────────────────────────────────────

const _validateId = (value, errorCode, label) => {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return fail(errorCode, `A valid ${label} is required`);
  }
  return null;
};

const _validateStudentFields = (fields, isCreate) => {
  const {
    firstName,
    lastName,
    studentCode,
    batchId,
    email,
    phone,
    status,
  } = fields;

  if (isCreate) {
    if (!firstName || String(firstName).trim().length === 0)
      return fail(STUDENT_ERRORS.VALIDATION, 'First name is required');
    if (!lastName || String(lastName).trim().length === 0)
      return fail(STUDENT_ERRORS.VALIDATION, 'Last name is required');
    if (!studentCode || String(studentCode).trim().length === 0)
      return fail(STUDENT_ERRORS.VALIDATION, 'Student code is required');
    if (!batchId || String(batchId).trim().length === 0)
      return fail(STUDENT_ERRORS.VALIDATION, 'Batch ID is required');
  }

  if (firstName !== undefined) {
    const trimmed = String(firstName).trim();
    if (trimmed.length < MIN_STUDENT_NAME_LENGTH)
      return fail(STUDENT_ERRORS.VALIDATION, `First name must be at least ${MIN_STUDENT_NAME_LENGTH} characters`);
    if (trimmed.length > MAX_STUDENT_NAME_LENGTH)
      return fail(STUDENT_ERRORS.VALIDATION, `First name must not exceed ${MAX_STUDENT_NAME_LENGTH} characters`);
  }

  if (lastName !== undefined) {
    const trimmed = String(lastName).trim();
    if (trimmed.length < MIN_STUDENT_NAME_LENGTH)
      return fail(STUDENT_ERRORS.VALIDATION, `Last name must be at least ${MIN_STUDENT_NAME_LENGTH} characters`);
    if (trimmed.length > MAX_STUDENT_NAME_LENGTH)
      return fail(STUDENT_ERRORS.VALIDATION, `Last name must not exceed ${MAX_STUDENT_NAME_LENGTH} characters`);
  }

  if (studentCode !== undefined) {
    const trimmed = String(studentCode).trim();
    if (trimmed.length < MIN_STUDENT_CODE_LENGTH)
      return fail(STUDENT_ERRORS.VALIDATION, `Student code must be at least ${MIN_STUDENT_CODE_LENGTH} characters`);
    if (trimmed.length > MAX_STUDENT_CODE_LENGTH)
      return fail(STUDENT_ERRORS.VALIDATION, `Student code must not exceed ${MAX_STUDENT_CODE_LENGTH} characters`);
    if (!CODE_REGEX.test(trimmed))
      return fail(STUDENT_ERRORS.VALIDATION, 'Student code may only contain letters, digits, hyphens, and underscores');
  }

  if (email !== undefined && email !== null && String(email).trim().length > 0) {
    if (!EMAIL_REGEX.test(String(email).trim()))
      return fail(STUDENT_ERRORS.VALIDATION, 'Enter a valid email address');
  }

  if (phone !== undefined && phone !== null && String(phone).trim().length > 0) {
    const trimmedPhone = String(phone).trim();
    if (trimmedPhone.length > MAX_PHONE_LENGTH)
      return fail(STUDENT_ERRORS.VALIDATION, `Phone number must not exceed ${MAX_PHONE_LENGTH} characters`);
    if (!PHONE_REGEX.test(trimmedPhone))
      return fail(STUDENT_ERRORS.VALIDATION, 'Enter a valid phone number');
  }

  if (status !== undefined) {
    const allowed = Object.values(STUDENT_STATUS);
    if (!allowed.includes(status))
      return fail(STUDENT_ERRORS.VALIDATION, `Status must be one of: ${allowed.join(', ')}`);
  }

  return null;
};

// ── Unique-constraint helpers (internal) ──────────────────────────────────────

const _isCodeTaken = (code, excludeId) => {
  const normalized = code.trim().toUpperCase();
  return _store.some((s) => s.studentCode?.toUpperCase() === normalized && s.id !== excludeId);
};

const _isEmailTaken = (email, excludeId) => {
  const normalized = email.trim().toLowerCase();
  return _store.some((s) => s.email?.toLowerCase() === normalized && s.id !== excludeId);
};

// ── ID generator ──────────────────────────────────────────────────────────────

const _generateId = () => `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

// ── Mock CRUD internals ────────────────────────────────────────────────────────

const _mock = {
  getAll({ batchId, search, status, includeInactive = false } = {}) {
    let result = [..._store];

    if (!includeInactive) {
      result = result.filter((s) => s.status !== STUDENT_STATUS.INACTIVE);
    }
    if (batchId) result = result.filter((s) => s.batchId === batchId);
    if (status)  result = result.filter((s) => s.status === status);

    if (search && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.firstName?.toLowerCase().includes(q) ||
          s.lastName?.toLowerCase().includes(q) ||
          s.studentCode?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const dateDiff = (b.enrollmentDate || '').localeCompare(a.enrollmentDate || '');
      if (dateDiff !== 0) return dateDiff;
      return (a.studentCode || '').localeCompare(b.studentCode || '');
    });

    return result;
  },

  getById(id) {
    return _store.find((s) => s.id === id) || null;
  },

  insert(student) {
    _store.unshift(student);
  },

  update(id, changes) {
    const idx = _store.findIndex((s) => s.id === id);
    _store[idx] = { ..._store[idx], ...changes };
    return { ..._store[idx] };
  },

  remove(id) {
    _store = _store.filter((s) => s.id !== id);
  },

  batchExists(batchId) {
    return _batchRef.some((b) => b.id === batchId);
  },

  getBatch(batchId) {
    return _batchRef.find((b) => b.id === batchId) || null;
  },
};

// ── Public service methods ─────────────────────────────────────────────────────

export const getStudents = async (filters = {}) => {
  return tryCatch(() => {
    if (USE_MOCK) {
      const allCount = _store.filter(
        (s) => filters.includeInactive || s.status !== STUDENT_STATUS.INACTIVE
      ).length;
      const data = _mock.getAll(filters);
      return ok(data, { total: allCount, filtered: data.length });
    }
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

export const getStudentById = async (id) => {
  return tryCatch(() => {
    const idError = _validateId(id, STUDENT_ERRORS.INVALID_ID, 'student ID');
    if (idError) return idError;

    if (USE_MOCK) {
      const student = _mock.getById(id.trim());
      if (!student) return fail(STUDENT_ERRORS.NOT_FOUND, `Student with ID "${id}" not found`);
      return ok({ ...student });
    }
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

export const getStudentsByBatch = async (batchId, options = {}) => {
  return tryCatch(() => {
    const idError = _validateId(batchId, STUDENT_ERRORS.INVALID_BATCH, 'batch ID');
    if (idError) return idError;

    if (USE_MOCK) {
      if (!_mock.batchExists(batchId.trim()))
        return fail(STUDENT_ERRORS.BATCH_NOT_FOUND, `Batch with ID "${batchId}" not found`);

      const data = _mock.getAll({
        batchId: batchId.trim(),
        search: options.search,
        includeInactive: options.includeInactive ?? false,
      });
      return ok(data, { total: data.length, batchId: batchId.trim() });
    }
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

export const createStudent = async (data) => {
  return tryCatch(() => {
    const validationError = _validateStudentFields(data, true);
    if (validationError) return validationError;

    if (USE_MOCK) {
      if (!_mock.batchExists(data.batchId.trim()))
        return fail(STUDENT_ERRORS.BATCH_NOT_FOUND, `Batch with ID "${data.batchId}" not found`);

      if (_isCodeTaken(data.studentCode))
        return fail(STUDENT_ERRORS.DUPLICATE_CODE, `Student code "${data.studentCode.trim()}" is already in use`);

      if (data.email && data.email.trim().length > 0) {
        if (_isEmailTaken(data.email))
          return fail(STUDENT_ERRORS.DUPLICATE_EMAIL, `Email "${data.email.trim()}" is already registered`);
      }

      const now = new Date().toISOString();
      const newStudent = {
        id:                   _generateId(),
        studentCode:          data.studentCode.trim().toUpperCase(),
        firstName:            data.firstName.trim(),
        lastName:             data.lastName.trim(),
        email:                data.email?.trim() || '',
        phone:                data.phone?.trim() || '',
        batchId:              data.batchId.trim(),
        status:               STUDENT_STATUS.ACTIVE,
        enrollmentDate:       data.enrollmentDate || now.slice(0, 10),
        attendancePercentage: data.attendancePercentage ?? 0,
        createdAt:            now,
        updatedAt:            now,
      };

      _mock.insert(newStudent);
      return ok({ ...newStudent });
    }
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

export const updateStudent = async (id, changes) => {
  return tryCatch(() => {
    const idError = _validateId(id, STUDENT_ERRORS.INVALID_ID, 'student ID');
    if (idError) return idError;

    const { batchId: _ignored, ...safeChanges } = changes;
    const validationError = _validateStudentFields(safeChanges, false);
    if (validationError) return validationError;

    if (USE_MOCK) {
      const existing = _mock.getById(id.trim());
      if (!existing) return fail(STUDENT_ERRORS.NOT_FOUND, `Student with ID "${id}" not found`);

      if (safeChanges.studentCode !== undefined) {
        if (_isCodeTaken(safeChanges.studentCode, id))
          return fail(STUDENT_ERRORS.DUPLICATE_CODE, `Student code "${safeChanges.studentCode.trim()}" is already in use`);
        safeChanges.studentCode = safeChanges.studentCode.trim().toUpperCase();
      }

      if (safeChanges.email !== undefined && safeChanges.email.trim().length > 0) {
        if (_isEmailTaken(safeChanges.email, id))
          return fail(STUDENT_ERRORS.DUPLICATE_EMAIL, `Email "${safeChanges.email.trim()}" is already registered`);
        safeChanges.email = safeChanges.email.trim();
      }

      if (safeChanges.firstName !== undefined) safeChanges.firstName = safeChanges.firstName.trim();
      if (safeChanges.lastName  !== undefined) safeChanges.lastName  = safeChanges.lastName.trim();

      const updated = _mock.update(id.trim(), { ...safeChanges, updatedAt: new Date().toISOString() });
      return ok({ ...updated });
    }
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

export const deleteStudent = async (id) => {
  return tryCatch(() => {
    const idError = _validateId(id, STUDENT_ERRORS.INVALID_ID, 'student ID');
    if (idError) return idError;

    if (USE_MOCK) {
      const existing = _mock.getById(id.trim());
      if (!existing) return fail(STUDENT_ERRORS.NOT_FOUND, `Student with ID "${id}" not found`);
      if (existing.status === STUDENT_STATUS.INACTIVE) return ok({ id: id.trim() });

      _mock.update(id.trim(), { status: STUDENT_STATUS.INACTIVE, updatedAt: new Date().toISOString() });
      return ok({ id: id.trim() });
    }
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

export const reactivateStudent = async (id) => {
  return tryCatch(() => {
    const idError = _validateId(id, STUDENT_ERRORS.INVALID_ID, 'student ID');
    if (idError) return idError;

    if (USE_MOCK) {
      const existing = _mock.getById(id.trim());
      if (!existing) return fail(STUDENT_ERRORS.NOT_FOUND, `Student with ID "${id}" not found`);

      const updated = _mock.update(id.trim(), { status: STUDENT_STATUS.ACTIVE, updatedAt: new Date().toISOString() });
      return ok({ ...updated });
    }
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

export const getLowAttendanceStudents = async (threshold = 75, batchId) => {
  return tryCatch(() => {
    if (USE_MOCK) {
      const pool    = _mock.getAll({ batchId, includeInactive: false });
      const flagged = pool.filter(
        (s) => typeof s.attendancePercentage === 'number' && s.attendancePercentage < threshold
      );
      return ok(flagged, { total: flagged.length, threshold });
    }
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

export const getStudentIdsByBatch = async (batchId, activeOnly = true) => {
  return tryCatch(() => {
    const idError = _validateId(batchId, STUDENT_ERRORS.INVALID_BATCH, 'batch ID');
    if (idError) return idError;

    if (USE_MOCK) {
      if (!_mock.batchExists(batchId.trim()))
        return fail(STUDENT_ERRORS.BATCH_NOT_FOUND, `Batch with ID "${batchId}" not found`);

      const students = _mock.getAll({ batchId: batchId.trim(), includeInactive: !activeOnly });
      const ids = students.map((s) => s.id);
      return ok(ids, { total: ids.length });
    }
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

// ── MODULE 5.7 — Advanced Action Methods ──────────────────────────────────────

/**
 * Explicit deactivate (soft-delete) for a single student.
 * Semantically identical to deleteStudent() but named for clarity in the UI layer.
 * Blueprint Section 4.2: "Remove or deactivate a student from a batch".
 *
 * @param {string} id
 * @returns {Promise<{ success, data: { id }, meta, error }>}
 */
export const deactivateStudent = async (id) => {
  return tryCatch(() => {
    const idError = _validateId(id, STUDENT_ERRORS.INVALID_ID, 'student ID');
    if (idError) return idError;

    if (USE_MOCK) {
      const existing = _mock.getById(id.trim());
      if (!existing) return fail(STUDENT_ERRORS.NOT_FOUND, `Student with ID "${id}" not found`);
      if (existing.status === STUDENT_STATUS.INACTIVE) return ok({ id: id.trim() });

      _mock.update(id.trim(), { status: STUDENT_STATUS.INACTIVE, updatedAt: new Date().toISOString() });
      return ok({ id: id.trim() });
    }
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

/**
 * Transfers a student to a different batch.
 *
 * Validation:
 *  - targetBatchId must be a valid, active or upcoming batch.
 *  - Student must currently exist and be active.
 *
 * Attendance history is preserved with the original batchId.
 * After transfer, new attendance is recorded under targetBatchId.
 *
 * @param {string} studentId
 * @param {string} targetBatchId
 * @returns {Promise<{ success, data: updatedStudent, meta: { previousBatchId }, error }>}
 */
export const transferStudentBatch = async (studentId, targetBatchId) => {
  return tryCatch(() => {
    const idError = _validateId(studentId, STUDENT_ERRORS.INVALID_ID, 'student ID');
    if (idError) return idError;

    const batchIdError = _validateId(targetBatchId, STUDENT_ERRORS.INVALID_BATCH, 'target batch ID');
    if (batchIdError) return batchIdError;

    if (USE_MOCK) {
      const student = _mock.getById(studentId.trim());
      if (!student) return fail(STUDENT_ERRORS.NOT_FOUND, `Student with ID "${studentId}" not found`);

      if (student.status === STUDENT_STATUS.INACTIVE)
        return fail(STUDENT_ERRORS.VALIDATION, 'Cannot transfer an inactive student. Reactivate first.');

      const targetBatch = _mock.getBatch(targetBatchId.trim());
      if (!targetBatch)
        return fail(STUDENT_ERRORS.BATCH_NOT_FOUND, `Target batch with ID "${targetBatchId}" not found`);

      // Only allow transfer to active or upcoming batches.
      const allowed = ['active', 'upcoming', 'on_hold'];
      if (!allowed.includes(targetBatch.status))
        return fail(STUDENT_ERRORS.BATCH_INACTIVE, `Cannot transfer to a "${targetBatch.status}" batch`);

      if (student.batchId === targetBatchId.trim())
        return fail(STUDENT_ERRORS.VALIDATION, 'Student is already in the selected batch');

      const previousBatchId = student.batchId;
      const updated = _mock.update(studentId.trim(), {
        batchId:    targetBatchId.trim(),
        updatedAt:  new Date().toISOString(),
      });

      return ok({ ...updated }, { previousBatchId });
    }
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

/**
 * Bulk partial-update for an array of student IDs.
 * Only the supplied `changes` fields are applied.
 * Returns per-record success/error details.
 *
 * @param {string[]} ids
 * @param {object}   changes   — same shape as updateStudent's second argument
 * @returns {Promise<{
 *   success: boolean,
 *   data: { succeeded: string[], failed: Array<{ id, error }> },
 *   meta: { total, succeeded, failed },
 *   error: null | object
 * }>}
 */
export const bulkUpdateStudents = async (ids, changes) => {
  return tryCatch(async () => {
    if (!Array.isArray(ids) || ids.length === 0)
      return fail(STUDENT_ERRORS.VALIDATION, 'At least one student ID is required');

    const succeeded = [];
    const failed    = [];

    for (const id of ids) {
      const result = await updateStudent(id, changes);
      if (result.success) {
        succeeded.push(id);
      } else {
        failed.push({ id, error: result.error?.message || 'Unknown error' });
      }
    }

    const meta = { total: ids.length, succeeded: succeeded.length, failed: failed.length };

    // Partial failure returns success=true with details; full failure returns success=false.
    if (succeeded.length === 0) {
      return fail(STUDENT_ERRORS.BULK_PARTIAL, 'All bulk operations failed', meta);
    }

    return ok({ succeeded, failed }, meta);
  });
};

/**
 * Bulk soft-delete (deactivate) for an array of student IDs.
 * Attendance history is preserved for all students.
 *
 * @param {string[]} ids
 * @returns {Promise<{
 *   success: boolean,
 *   data: { succeeded: string[], failed: Array<{ id, error }> },
 *   meta: { total, succeeded, failed },
 *   error: null | object
 * }>}
 */
export const bulkDeleteStudents = async (ids) => {
  return tryCatch(async () => {
    if (!Array.isArray(ids) || ids.length === 0)
      return fail(STUDENT_ERRORS.VALIDATION, 'At least one student ID is required');

    const succeeded = [];
    const failed    = [];

    for (const id of ids) {
      const result = await deleteStudent(id);
      if (result.success) {
        succeeded.push(id);
      } else {
        failed.push({ id, error: result.error?.message || 'Unknown error' });
      }
    }

    const meta = { total: ids.length, succeeded: succeeded.length, failed: failed.length };

    if (succeeded.length === 0)
      return fail(STUDENT_ERRORS.BULK_PARTIAL, 'All bulk delete operations failed', meta);

    return ok({ succeeded, failed }, meta);
  });
};

/**
 * Returns student data formatted for CSV export.
 * Accepts the same filter options as getStudents.
 * The batch name is resolved via the internal batchRef.
 *
 * Consumers should pass this data to exportUtils.generateCSVString.
 *
 * @param {string[]}  [selectedIds]  — if provided, export only these students
 * @param {object}    [filters]      — same shape as getStudents filters
 * @returns {Promise<{ success, data: Array<object>, meta: { total }, error }>}
 */
export const exportStudentsCSV = async (selectedIds, filters = {}) => {
  return tryCatch(() => {
    if (USE_MOCK) {
      let pool;

      if (Array.isArray(selectedIds) && selectedIds.length > 0) {
        // Export only selected
        pool = selectedIds
          .map((id) => _mock.getById(id))
          .filter(Boolean);
      } else {
        // Export all (with optional filters)
        pool = _mock.getAll({ ...filters, includeInactive: filters.includeInactive ?? false });
      }

      const rows = pool.map((s) => {
        const batch = _mock.getBatch(s.batchId);
        return {
          studentCode:          s.studentCode,
          fullName:             `${s.firstName} ${s.lastName}`,
          email:                s.email || '',
          phone:                s.phone || '',
          batch:                batch?.batchName || s.batchId || '',
          status:               s.status,
          attendancePercentage: typeof s.attendancePercentage === 'number'
                                  ? s.attendancePercentage.toFixed(1)
                                  : '0.0',
          joinedDate:           s.enrollmentDate || '',
        };
      });

      return ok(rows, { total: rows.length });
    }
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

/**
 * Utility: resets the in-memory store to the original seed data.
 * For development use only.
 */
export const _resetStore = () => {
  _store = mockStudents.map((s) => ({ ...s }));
};
