/**
 * studentService.js
 * Centralized data-access layer for all Student operations.
 *
 * Blueprint Sections: 4.2, 8.3, 10.3, 11.1 (services/), 13, 17.6
<<<<<<< HEAD
 * Module: B3.2 — updated in Module 5.7 (Advanced Actions)
=======
 * Module: B3.2
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
 *
 * ARCHITECTURE RULES:
 *  - Pages and hooks NEVER import from @data directly — only studentService does.
 *  - All methods are async so the hook layer is API-migration-safe.
 *  - USE_MOCK flag controls data source; toggling requires zero hook/page changes.
 *  - All methods return the { success, data, meta, error } shape from serviceResponse.
 *  - Validation happens here before any write — hooks receive descriptive errors.
 *  - Batch relationship integrity is enforced at write time (no orphan students).
 *
<<<<<<< HEAD
 * MODULE 5.7 ADDITIONS:
 *  - transferStudentBatch(studentId, targetBatchId) — moves student to another batch
 *  - deactivateStudent(id) — explicit soft-deactivate alias (distinct from deleteStudent)
 *  - bulkUpdateStudents(ids, changes) — partial-update many students at once
 *  - bulkDeleteStudents(ids) — soft-delete many students at once
 *  - exportStudentsCSV(filters) — returns formatted CSV rows for export utility
 *
=======
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
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
<<<<<<< HEAD
=======
 *
 * STUDENT STATUS VALUES:
 *  'active'   — enrolled and appearing on attendance sheets
 *  'inactive' — soft-deleted; excluded from new sheets but records preserved
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
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
<<<<<<< HEAD
let _store = mockStudents.map((s) => ({ ...s }));
const _batchRef = mockBatches.map((b) => ({ ...b }));

// ── Student status enum (internal) ───────────────────────────────────────────
=======
// Students store — all mutations target this array.
let _store = mockStudents.map((s) => ({ ...s }));

// Batches reference store — read-only; used for batch-existence validation.
// Stays in sync with batchService's own store only after a future shared-store
// refactor; for V1, cross-service consistency is maintained by the mock seed data.
const _batchRef = mockBatches.map((b) => ({ ...b }));

// ── Student status enum (internal) ───────────────────────────────────────────
// Blueprint Section 8.3 — isActive is a boolean in schema; we surface it as
// a 'status' string in the API layer for UI compatibility and future extension.

>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
export const STUDENT_STATUS = Object.freeze({
  ACTIVE:   'active',
  INACTIVE: 'inactive',
});

// ── Error codes ───────────────────────────────────────────────────────────────
<<<<<<< HEAD
=======

>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
export const STUDENT_ERRORS = Object.freeze({
  NOT_FOUND:       'STUDENT_NOT_FOUND',
  INVALID_ID:      'STUDENT_INVALID_ID',
  INVALID_BATCH:   'STUDENT_INVALID_BATCH_ID',
  BATCH_NOT_FOUND: 'STUDENT_BATCH_NOT_FOUND',
<<<<<<< HEAD
  BATCH_INACTIVE:  'STUDENT_BATCH_INACTIVE',
=======
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
  VALIDATION:      'STUDENT_VALIDATION_ERROR',
  DUPLICATE_CODE:  'STUDENT_DUPLICATE_CODE',
  DUPLICATE_EMAIL: 'STUDENT_DUPLICATE_EMAIL',
  UNEXPECTED:      'STUDENT_UNEXPECTED_ERROR',
<<<<<<< HEAD
  BULK_PARTIAL:    'STUDENT_BULK_PARTIAL_FAILURE',
=======
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
});

// ── Validation helpers (internal) ─────────────────────────────────────────────

<<<<<<< HEAD
=======
/**
 * Validates a non-empty string ID parameter.
 * Returns a fail() response if invalid; null if valid.
 *
 * @param {any}    value      - The ID value to check.
 * @param {string} errorCode  - Error code from STUDENT_ERRORS.
 * @param {string} label      - Human-readable field name for the message.
 * @returns {null | ReturnType<typeof fail>}
 */
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
const _validateId = (value, errorCode, label) => {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return fail(errorCode, `A valid ${label} is required`);
  }
  return null;
};

<<<<<<< HEAD
=======
/**
 * Validates fields supplied to createStudent / updateStudent.
 * Returns null if valid; returns a fail() response on the first broken rule.
 *
 * @param {object}  fields    - Partial or full student data.
 * @param {boolean} isCreate  - true = all required fields must be present.
 * @returns {null | ReturnType<typeof fail>}
 */
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
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

<<<<<<< HEAD
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
=======
  // ── Required fields on create ──────────────────────────────────────────────
  if (isCreate) {
    if (!firstName || String(firstName).trim().length === 0) {
      return fail(STUDENT_ERRORS.VALIDATION, 'First name is required');
    }
    if (!lastName || String(lastName).trim().length === 0) {
      return fail(STUDENT_ERRORS.VALIDATION, 'Last name is required');
    }
    if (!studentCode || String(studentCode).trim().length === 0) {
      return fail(STUDENT_ERRORS.VALIDATION, 'Student code is required');
    }
    if (!batchId || String(batchId).trim().length === 0) {
      return fail(STUDENT_ERRORS.VALIDATION, 'Batch ID is required');
    }
  }

  // ── firstName length ───────────────────────────────────────────────────────
  if (firstName !== undefined) {
    const trimmed = String(firstName).trim();
    if (trimmed.length < MIN_STUDENT_NAME_LENGTH) {
      return fail(
        STUDENT_ERRORS.VALIDATION,
        `First name must be at least ${MIN_STUDENT_NAME_LENGTH} characters`
      );
    }
    if (trimmed.length > MAX_STUDENT_NAME_LENGTH) {
      return fail(
        STUDENT_ERRORS.VALIDATION,
        `First name must not exceed ${MAX_STUDENT_NAME_LENGTH} characters`
      );
    }
  }

  // ── lastName length ────────────────────────────────────────────────────────
  if (lastName !== undefined) {
    const trimmed = String(lastName).trim();
    if (trimmed.length < MIN_STUDENT_NAME_LENGTH) {
      return fail(
        STUDENT_ERRORS.VALIDATION,
        `Last name must be at least ${MIN_STUDENT_NAME_LENGTH} characters`
      );
    }
    if (trimmed.length > MAX_STUDENT_NAME_LENGTH) {
      return fail(
        STUDENT_ERRORS.VALIDATION,
        `Last name must not exceed ${MAX_STUDENT_NAME_LENGTH} characters`
      );
    }
  }

  // ── studentCode format and length ─────────────────────────────────────────
  if (studentCode !== undefined) {
    const trimmed = String(studentCode).trim();
    if (trimmed.length < MIN_STUDENT_CODE_LENGTH) {
      return fail(
        STUDENT_ERRORS.VALIDATION,
        `Student code must be at least ${MIN_STUDENT_CODE_LENGTH} characters`
      );
    }
    if (trimmed.length > MAX_STUDENT_CODE_LENGTH) {
      return fail(
        STUDENT_ERRORS.VALIDATION,
        `Student code must not exceed ${MAX_STUDENT_CODE_LENGTH} characters`
      );
    }
    if (!CODE_REGEX.test(trimmed)) {
      return fail(
        STUDENT_ERRORS.VALIDATION,
        'Student code may only contain letters, digits, hyphens, and underscores'
      );
    }
  }

  // ── email format (optional field) ─────────────────────────────────────────
  if (email !== undefined && email !== null && String(email).trim().length > 0) {
    if (!EMAIL_REGEX.test(String(email).trim())) {
      return fail(STUDENT_ERRORS.VALIDATION, 'Enter a valid email address');
    }
  }

  // ── phone format and length (optional field) ──────────────────────────────
  if (phone !== undefined && phone !== null && String(phone).trim().length > 0) {
    const trimmedPhone = String(phone).trim();
    if (trimmedPhone.length > MAX_PHONE_LENGTH) {
      return fail(
        STUDENT_ERRORS.VALIDATION,
        `Phone number must not exceed ${MAX_PHONE_LENGTH} characters`
      );
    }
    if (!PHONE_REGEX.test(trimmedPhone)) {
      return fail(STUDENT_ERRORS.VALIDATION, 'Enter a valid phone number');
    }
  }

  // ── status enum ───────────────────────────────────────────────────────────
  if (status !== undefined) {
    const allowed = Object.values(STUDENT_STATUS);
    if (!allowed.includes(status)) {
      return fail(
        STUDENT_ERRORS.VALIDATION,
        `Status must be one of: ${allowed.join(', ')}`
      );
    }
  }

  return null; // valid
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
};

// ── Unique-constraint helpers (internal) ──────────────────────────────────────

<<<<<<< HEAD
const _isCodeTaken = (code, excludeId) => {
  const normalized = code.trim().toUpperCase();
  return _store.some((s) => s.studentCode?.toUpperCase() === normalized && s.id !== excludeId);
};

const _isEmailTaken = (email, excludeId) => {
  const normalized = email.trim().toLowerCase();
  return _store.some((s) => s.email?.toLowerCase() === normalized && s.id !== excludeId);
=======
/**
 * Returns true if a studentCode is already taken (case-insensitive, global).
 * Blueprint Section 8.3 / ER Review: studentCode is globally unique.
 *
 * @param {string} code
 * @param {string} [excludeId]
 * @returns {boolean}
 */
const _isCodeTaken = (code, excludeId) => {
  const normalized = code.trim().toUpperCase();
  return _store.some(
    (s) => s.studentCode?.toUpperCase() === normalized && s.id !== excludeId
  );
};

/**
 * Returns true if an email is already registered (case-insensitive).
 * Prevents duplicate accounts for the same student.
 *
 * @param {string} email
 * @param {string} [excludeId]
 * @returns {boolean}
 */
const _isEmailTaken = (email, excludeId) => {
  const normalized = email.trim().toLowerCase();
  return _store.some(
    (s) =>
      s.email?.toLowerCase() === normalized &&
      s.id !== excludeId
  );
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
};

// ── ID generator ──────────────────────────────────────────────────────────────

<<<<<<< HEAD
const _generateId = () => `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
=======
/**
 * Generates a unique student ID.
 * @returns {string}  e.g. "s_1718620800000_x4f2"
 */
const _generateId = () =>
  `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726

// ── Mock CRUD internals ────────────────────────────────────────────────────────

const _mock = {
<<<<<<< HEAD
  getAll({ batchId, search, status, includeInactive = false } = {}) {
    let result = [..._store];

    if (!includeInactive) {
      result = result.filter((s) => s.status !== STUDENT_STATUS.INACTIVE);
    }
    if (batchId) result = result.filter((s) => s.batchId === batchId);
    if (status)  result = result.filter((s) => s.status === status);
=======
  /**
   * Returns a filtered, sorted copy of the store.
   *
   * @param {{
   *   batchId?: string,
   *   search?: string,
   *   status?: string,
   *   includeInactive?: boolean,
   * }} filters
   * @returns {Array}
   */
  getAll({ batchId, search, status, includeInactive = false } = {}) {
    let result = [..._store];

    // Default: exclude inactive students unless caller opts in.
    if (!includeInactive) {
      result = result.filter((s) => s.status !== STUDENT_STATUS.INACTIVE);
    }

    if (batchId) {
      result = result.filter((s) => s.batchId === batchId);
    }

    if (status) {
      result = result.filter((s) => s.status === status);
    }
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726

    if (search && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.firstName?.toLowerCase().includes(q) ||
          s.lastName?.toLowerCase().includes(q) ||
          s.studentCode?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
<<<<<<< HEAD
=======
          // full name search
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(q)
      );
    }

<<<<<<< HEAD
=======
    // Default sort: newest enrollmentDate first, then by studentCode.
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
    result.sort((a, b) => {
      const dateDiff = (b.enrollmentDate || '').localeCompare(a.enrollmentDate || '');
      if (dateDiff !== 0) return dateDiff;
      return (a.studentCode || '').localeCompare(b.studentCode || '');
    });

    return result;
  },

<<<<<<< HEAD
=======
  /**
   * Finds a single student by ID (any status).
   * @param {string} id
   * @returns {object|null}
   */
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
  getById(id) {
    return _store.find((s) => s.id === id) || null;
  },

<<<<<<< HEAD
=======
  /**
   * Inserts a new student into the store.
   * @param {object} student
   */
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
  insert(student) {
    _store.unshift(student);
  },

<<<<<<< HEAD
=======
  /**
   * Shallow-merges changes into the matching student record.
   * @param {string} id
   * @param {object} changes
   * @returns {object} updated student
   */
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
  update(id, changes) {
    const idx = _store.findIndex((s) => s.id === id);
    _store[idx] = { ..._store[idx], ...changes };
    return { ..._store[idx] };
  },

<<<<<<< HEAD
=======
  /**
   * Hard-removes a student by ID.
   * @param {string} id
   */
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
  remove(id) {
    _store = _store.filter((s) => s.id !== id);
  },

<<<<<<< HEAD
  batchExists(batchId) {
    return _batchRef.some((b) => b.id === batchId);
  },

  getBatch(batchId) {
    return _batchRef.find((b) => b.id === batchId) || null;
  },
=======
  /**
   * Checks whether a batch exists in the reference store.
   * @param {string} batchId
   * @returns {boolean}
   */
  batchExists(batchId) {
    return _batchRef.some((b) => b.id === batchId);
  },
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
};

// ── Public service methods ─────────────────────────────────────────────────────

<<<<<<< HEAD
=======
/**
 * Returns all students, with optional filtering by batchId, search term,
 * and status. Inactive students are excluded by default.
 *
 * @param {{
 *   batchId?: string,
 *   search?: string,
 *   status?: string,
 *   includeInactive?: boolean,
 * }} [filters]
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: Array | null,
 *   meta: { total: number, filtered: number },
 *   error: { code, message } | null
 * }>}
 *
 * @example
 *   const res = await getStudents({ batchId: 'b4' });
 *   if (res.success) setStudents(res.data);
 */
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
export const getStudents = async (filters = {}) => {
  return tryCatch(() => {
    if (USE_MOCK) {
      const allCount = _store.filter(
        (s) => filters.includeInactive || s.status !== STUDENT_STATUS.INACTIVE
      ).length;
      const data = _mock.getAll(filters);
      return ok(data, { total: allCount, filtered: data.length });
    }
<<<<<<< HEAD
=======

    // Future: return axiosClient.get('/api/students', { params: filters });
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

<<<<<<< HEAD
=======
/**
 * Returns a single student by their ID.
 *
 * @param {string} id
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: object | null,
 *   meta: {},
 *   error: { code, message } | null
 * }>}
 *
 * @example
 *   const res = await getStudentById('s21');
 *   if (res.success) setStudent(res.data);
 */
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
export const getStudentById = async (id) => {
  return tryCatch(() => {
    const idError = _validateId(id, STUDENT_ERRORS.INVALID_ID, 'student ID');
    if (idError) return idError;

    if (USE_MOCK) {
      const student = _mock.getById(id.trim());
<<<<<<< HEAD
      if (!student) return fail(STUDENT_ERRORS.NOT_FOUND, `Student with ID "${id}" not found`);
      return ok({ ...student });
    }
=======
      if (!student) {
        return fail(
          STUDENT_ERRORS.NOT_FOUND,
          `Student with ID "${id}" not found`
        );
      }
      return ok({ ...student });
    }

    // Future: return axiosClient.get(`/api/students/${id}`);
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

<<<<<<< HEAD
=======
/**
 * Returns all active students belonging to a specific batch.
 * This is the primary query for the Attendance Sheet and Batch Details page.
 *
 * @param {string} batchId
 * @param {{ search?: string, includeInactive?: boolean }} [options]
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: Array | null,
 *   meta: { total: number, batchId: string },
 *   error: { code, message } | null
 * }>}
 *
 * @example
 *   const res = await getStudentsByBatch('b4');
 *   if (res.success) setStudents(res.data);
 */
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
export const getStudentsByBatch = async (batchId, options = {}) => {
  return tryCatch(() => {
    const idError = _validateId(batchId, STUDENT_ERRORS.INVALID_BATCH, 'batch ID');
    if (idError) return idError;

    if (USE_MOCK) {
<<<<<<< HEAD
      if (!_mock.batchExists(batchId.trim()))
        return fail(STUDENT_ERRORS.BATCH_NOT_FOUND, `Batch with ID "${batchId}" not found`);
=======
      // Verify the batch exists before filtering students.
      if (!_mock.batchExists(batchId.trim())) {
        return fail(
          STUDENT_ERRORS.BATCH_NOT_FOUND,
          `Batch with ID "${batchId}" not found`
        );
      }
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726

      const data = _mock.getAll({
        batchId: batchId.trim(),
        search: options.search,
        includeInactive: options.includeInactive ?? false,
      });
<<<<<<< HEAD
      return ok(data, { total: data.length, batchId: batchId.trim() });
    }
=======

      return ok(data, { total: data.length, batchId: batchId.trim() });
    }

    // Future: return axiosClient.get(`/api/batches/${batchId}/students`);
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

<<<<<<< HEAD
export const createStudent = async (data) => {
  return tryCatch(() => {
=======
/**
 * Creates a new student and enrolls them in the specified batch.
 *
 * Required: firstName, lastName, studentCode, batchId
 * Optional: email, phone, enrollmentDate, attendancePercentage
 *
 * @param {{
 *   firstName: string,
 *   lastName: string,
 *   studentCode: string,
 *   batchId: string,
 *   email?: string,
 *   phone?: string,
 *   enrollmentDate?: string,
 *   attendancePercentage?: number,
 * }} data
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: object | null,
 *   meta: {},
 *   error: { code, message } | null
 * }>}
 */
export const createStudent = async (data) => {
  return tryCatch(() => {
    // ── Field validation ─────────────────────────────────────────────────────
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
    const validationError = _validateStudentFields(data, true);
    if (validationError) return validationError;

    if (USE_MOCK) {
<<<<<<< HEAD
      if (!_mock.batchExists(data.batchId.trim()))
        return fail(STUDENT_ERRORS.BATCH_NOT_FOUND, `Batch with ID "${data.batchId}" not found`);

      if (_isCodeTaken(data.studentCode))
        return fail(STUDENT_ERRORS.DUPLICATE_CODE, `Student code "${data.studentCode.trim()}" is already in use`);

      if (data.email && data.email.trim().length > 0) {
        if (_isEmailTaken(data.email))
          return fail(STUDENT_ERRORS.DUPLICATE_EMAIL, `Email "${data.email.trim()}" is already registered`);
=======
      // ── Batch existence check ────────────────────────────────────────────
      if (!_mock.batchExists(data.batchId.trim())) {
        return fail(
          STUDENT_ERRORS.BATCH_NOT_FOUND,
          `Batch with ID "${data.batchId}" not found`
        );
      }

      // ── studentCode uniqueness (globally unique, per Blueprint 8.3) ──────
      if (_isCodeTaken(data.studentCode)) {
        return fail(
          STUDENT_ERRORS.DUPLICATE_CODE,
          `Student code "${data.studentCode.trim()}" is already in use`
        );
      }

      // ── email uniqueness (if provided) ───────────────────────────────────
      if (data.email && data.email.trim().length > 0) {
        if (_isEmailTaken(data.email)) {
          return fail(
            STUDENT_ERRORS.DUPLICATE_EMAIL,
            `Email "${data.email.trim()}" is already registered`
          );
        }
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
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
<<<<<<< HEAD
=======

    // Future: return axiosClient.post(`/api/batches/${data.batchId}/students`, data);
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

<<<<<<< HEAD
=======
/**
 * Updates an existing student by ID (partial update — only supplied fields change).
 *
 * Note: batchId cannot be changed via this method (moving a student between
 * batches is a separate future operation). If batchId is supplied it is ignored.
 *
 * @param {string} id
 * @param {{
 *   firstName?: string,
 *   lastName?: string,
 *   studentCode?: string,
 *   email?: string,
 *   phone?: string,
 *   enrollmentDate?: string,
 *   attendancePercentage?: number,
 *   status?: string,
 * }} changes
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: object | null,
 *   meta: {},
 *   error: { code, message } | null
 * }>}
 */
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
export const updateStudent = async (id, changes) => {
  return tryCatch(() => {
    const idError = _validateId(id, STUDENT_ERRORS.INVALID_ID, 'student ID');
    if (idError) return idError;

<<<<<<< HEAD
    const { batchId: _ignored, ...safeChanges } = changes;
=======
    // Prevent batchId reassignment through this method.
    const { batchId: _ignored, ...safeChanges } = changes;

>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
    const validationError = _validateStudentFields(safeChanges, false);
    if (validationError) return validationError;

    if (USE_MOCK) {
      const existing = _mock.getById(id.trim());
<<<<<<< HEAD
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
=======
      if (!existing) {
        return fail(
          STUDENT_ERRORS.NOT_FOUND,
          `Student with ID "${id}" not found`
        );
      }

      // ── studentCode uniqueness on change (exclude self) ──────────────────
      if (safeChanges.studentCode !== undefined) {
        if (_isCodeTaken(safeChanges.studentCode, id)) {
          return fail(
            STUDENT_ERRORS.DUPLICATE_CODE,
            `Student code "${safeChanges.studentCode.trim()}" is already in use`
          );
        }
        safeChanges.studentCode = safeChanges.studentCode.trim().toUpperCase();
      }

      // ── email uniqueness on change (exclude self) ────────────────────────
      if (safeChanges.email !== undefined && safeChanges.email.trim().length > 0) {
        if (_isEmailTaken(safeChanges.email, id)) {
          return fail(
            STUDENT_ERRORS.DUPLICATE_EMAIL,
            `Email "${safeChanges.email.trim()}" is already registered`
          );
        }
        safeChanges.email = safeChanges.email.trim();
      }

      if (safeChanges.firstName !== undefined) {
        safeChanges.firstName = safeChanges.firstName.trim();
      }
      if (safeChanges.lastName !== undefined) {
        safeChanges.lastName = safeChanges.lastName.trim();
      }

      const updated = _mock.update(id.trim(), {
        ...safeChanges,
        updatedAt: new Date().toISOString(),
      });

      return ok({ ...updated });
    }

    // Future: return axiosClient.put(`/api/students/${id}`, safeChanges);
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

<<<<<<< HEAD
=======
/**
 * Soft-deletes a student by setting status to 'inactive'.
 *
 * Blueprint Section 4.2 / ER Review: "Remove or deactivate" — isActive=false
 * preserves all historical AttendanceRecords for accurate reporting.
 * Hard deletion is available via _hardDeleteStudent for admin tooling only.
 *
 * @param {string} id
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: { id: string } | null,
 *   meta: {},
 *   error: { code, message } | null
 * }>}
 */
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
export const deleteStudent = async (id) => {
  return tryCatch(() => {
    const idError = _validateId(id, STUDENT_ERRORS.INVALID_ID, 'student ID');
    if (idError) return idError;

    if (USE_MOCK) {
      const existing = _mock.getById(id.trim());
<<<<<<< HEAD
      if (!existing) return fail(STUDENT_ERRORS.NOT_FOUND, `Student with ID "${id}" not found`);
      if (existing.status === STUDENT_STATUS.INACTIVE) return ok({ id: id.trim() });

      _mock.update(id.trim(), { status: STUDENT_STATUS.INACTIVE, updatedAt: new Date().toISOString() });
      return ok({ id: id.trim() });
    }
=======
      if (!existing) {
        return fail(
          STUDENT_ERRORS.NOT_FOUND,
          `Student with ID "${id}" not found`
        );
      }

      // Already inactive — idempotent call succeeds silently.
      if (existing.status === STUDENT_STATUS.INACTIVE) {
        return ok({ id: id.trim() });
      }

      _mock.update(id.trim(), {
        status:    STUDENT_STATUS.INACTIVE,
        updatedAt: new Date().toISOString(),
      });

      return ok({ id: id.trim() });
    }

    // Future: axiosClient.delete(`/api/students/${id}`) — backend handles soft-delete.
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

<<<<<<< HEAD
=======
/**
 * Reactivates a previously inactive student.
 * Inverse of deleteStudent() — allows re-enrollment without recreating the record.
 *
 * @param {string} id
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: object | null,
 *   meta: {},
 *   error: { code, message } | null
 * }>}
 */
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
export const reactivateStudent = async (id) => {
  return tryCatch(() => {
    const idError = _validateId(id, STUDENT_ERRORS.INVALID_ID, 'student ID');
    if (idError) return idError;

    if (USE_MOCK) {
      const existing = _mock.getById(id.trim());
<<<<<<< HEAD
      if (!existing) return fail(STUDENT_ERRORS.NOT_FOUND, `Student with ID "${id}" not found`);

      const updated = _mock.update(id.trim(), { status: STUDENT_STATUS.ACTIVE, updatedAt: new Date().toISOString() });
      return ok({ ...updated });
    }
=======
      if (!existing) {
        return fail(
          STUDENT_ERRORS.NOT_FOUND,
          `Student with ID "${id}" not found`
        );
      }

      const updated = _mock.update(id.trim(), {
        status:    STUDENT_STATUS.ACTIVE,
        updatedAt: new Date().toISOString(),
      });

      return ok({ ...updated });
    }

    // Future: axiosClient.patch(`/api/students/${id}/reactivate`);
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

<<<<<<< HEAD
export const getLowAttendanceStudents = async (threshold = 75, batchId) => {
  return tryCatch(() => {
    if (USE_MOCK) {
      const pool    = _mock.getAll({ batchId, includeInactive: false });
      const flagged = pool.filter(
        (s) => typeof s.attendancePercentage === 'number' && s.attendancePercentage < threshold
      );
      return ok(flagged, { total: flagged.length, threshold });
    }
=======
/**
 * Returns students whose attendance percentage is below the given threshold.
 * Used by the Dashboard "Low Attendance Alerts" card (Blueprint Section 6.2).
 *
 * @param {number} [threshold=75]  - Percentage below which a student is flagged.
 * @param {string} [batchId]       - Optional: limit to a specific batch.
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: Array | null,
 *   meta: { total: number, threshold: number },
 *   error: { code, message } | null
 * }>}
 */
export const getLowAttendanceStudents = async (threshold = 75, batchId) => {
  return tryCatch(() => {
    if (USE_MOCK) {
      let pool = _mock.getAll({ batchId, includeInactive: false });
      const flagged = pool.filter(
        (s) =>
          typeof s.attendancePercentage === 'number' &&
          s.attendancePercentage < threshold
      );
      return ok(flagged, { total: flagged.length, threshold });
    }

    // Future: axiosClient.get('/api/students', { params: { maxAttendance: threshold, batchId } });
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

<<<<<<< HEAD
=======
/**
 * Returns an array of student IDs for a batch (lightweight query).
 * Used by attendanceService to build the attendance sheet without
 * pulling full student objects.
 *
 * @param {string} batchId
 * @param {boolean} [activeOnly=true]
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: string[] | null,
 *   meta: { total: number },
 *   error: { code, message } | null
 * }>}
 */
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
export const getStudentIdsByBatch = async (batchId, activeOnly = true) => {
  return tryCatch(() => {
    const idError = _validateId(batchId, STUDENT_ERRORS.INVALID_BATCH, 'batch ID');
    if (idError) return idError;

    if (USE_MOCK) {
<<<<<<< HEAD
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
=======
      if (!_mock.batchExists(batchId.trim())) {
        return fail(
          STUDENT_ERRORS.BATCH_NOT_FOUND,
          `Batch with ID "${batchId}" not found`
        );
      }

      const students = _mock.getAll({
        batchId: batchId.trim(),
        includeInactive: !activeOnly,
      });
      const ids = students.map((s) => s.id);
      return ok(ids, { total: ids.length });
    }

    // Future: axiosClient.get(`/api/batches/${batchId}/students?fields=id`);
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
    return fail(STUDENT_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

/**
 * Utility: resets the in-memory store to the original seed data.
<<<<<<< HEAD
 * For development use only.
=======
 * For development use only — never call from production code paths.
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
 */
export const _resetStore = () => {
  _store = mockStudents.map((s) => ({ ...s }));
};
