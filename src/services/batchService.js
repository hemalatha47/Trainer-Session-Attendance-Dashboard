/**
 * batchService.js
 * Centralized data-access layer for all Batch operations.
 *
 * Blueprint Sections: 4.1, 8.2, 10.2, 11.1 (services/), 13, 17.6
 * Module: B3.1
 *
 * ARCHITECTURE RULES:
 *  - Pages and hooks NEVER import from @data directly — only batchService does.
 *  - All methods are async so the hook layer is API-migration-safe.
 *  - USE_MOCK flag controls data source; toggling it requires zero hook/page changes.
 *  - All methods return the { success, data, meta, error } shape from serviceResponse.
 *  - Validation happens here before any write — hooks receive descriptive errors.
 *
 * MOCK STORAGE STRATEGY:
 *  - The runtime working array is seeded from mockBatches at module load.
 *  - Mutations (create / update / delete) operate on this in-memory array, which
 *    persists for the browser session (page reload resets to seed data — intentional
 *    for development).
 *  - localStorage persistence is intentionally NOT used here because the blueprint's
 *    mock/live switch (Section 17.6) only requires in-memory mock compatibility;
 *    persistence belongs to a future backend.
 *
 * FUTURE API MIGRATION:
 *  - Set VITE_USE_MOCK=false in .env.production.
 *  - Replace the mock branch internals with axios calls matching Section 10.2.
 *  - Method signatures, return shapes, and error codes remain unchanged.
 */

import { mockBatches }     from '@data/mockBatches';
import { BATCH_STATUS }    from '@constants/batchStatus';
import {
  MIN_BATCH_NAME_LENGTH,
  MAX_BATCH_NAME_LENGTH,
  MIN_BATCH_CODE_LENGTH,
  MAX_BATCH_CODE_LENGTH,
  MAX_BATCH_DESCRIPTION_LENGTH,
} from '@constants/validation';
import { ok, fail, tryCatch } from '@utils/serviceResponse';

// ── Environment flag ──────────────────────────────────────────────────────────

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ── In-memory working store (mock mode) ───────────────────────────────────────
// Seeded from mockBatches; mutations are reflected immediately within the session.

let _store = mockBatches.map((b) => ({ ...b }));

// ── Error codes ───────────────────────────────────────────────────────────────

export const BATCH_ERRORS = Object.freeze({
  NOT_FOUND:        'BATCH_NOT_FOUND',
  INVALID_ID:       'BATCH_INVALID_ID',
  VALIDATION:       'BATCH_VALIDATION_ERROR',
  DUPLICATE_CODE:   'BATCH_DUPLICATE_CODE',
  UNEXPECTED:       'BATCH_UNEXPECTED_ERROR',
});

// ── Validation helpers (internal) ─────────────────────────────────────────────

/**
 * Validates the fields supplied to createBatch / updateBatch.
 * Returns null if valid; returns a fail() response if not.
 *
 * @param {object} fields     - Partial or full batch data.
 * @param {boolean} isCreate  - true = all required fields must be present.
 * @returns {null | ReturnType<typeof fail>}
 */
const _validateBatchFields = (fields, isCreate) => {
  const {
    batchName,
    batchCode,
    startDate,
    endDate,
    description = '',
  } = fields;

  // ── Required fields (create only) ─────────────────────────────────────────
  if (isCreate) {
    if (!batchName || String(batchName).trim().length === 0) {
      return fail(BATCH_ERRORS.VALIDATION, 'Batch name is required');
    }
    if (!batchCode || String(batchCode).trim().length === 0) {
      return fail(BATCH_ERRORS.VALIDATION, 'Batch code is required');
    }
    if (!startDate) {
      return fail(BATCH_ERRORS.VALIDATION, 'Start date is required');
    }
    if (!endDate) {
      return fail(BATCH_ERRORS.VALIDATION, 'End date is required');
    }
  }

  // ── batchName length ──────────────────────────────────────────────────────
  if (batchName !== undefined) {
    const trimmed = String(batchName).trim();
    if (trimmed.length < MIN_BATCH_NAME_LENGTH) {
      return fail(
        BATCH_ERRORS.VALIDATION,
        `Batch name must be at least ${MIN_BATCH_NAME_LENGTH} characters`
      );
    }
    if (trimmed.length > MAX_BATCH_NAME_LENGTH) {
      return fail(
        BATCH_ERRORS.VALIDATION,
        `Batch name must not exceed ${MAX_BATCH_NAME_LENGTH} characters`
      );
    }
  }

  // ── batchCode length ──────────────────────────────────────────────────────
  if (batchCode !== undefined) {
    const trimmed = String(batchCode).trim();
    if (trimmed.length < MIN_BATCH_CODE_LENGTH) {
      return fail(
        BATCH_ERRORS.VALIDATION,
        `Batch code must be at least ${MIN_BATCH_CODE_LENGTH} characters`
      );
    }
    if (trimmed.length > MAX_BATCH_CODE_LENGTH) {
      return fail(
        BATCH_ERRORS.VALIDATION,
        `Batch code must not exceed ${MAX_BATCH_CODE_LENGTH} characters`
      );
    }
  }

  // ── description length ────────────────────────────────────────────────────
  if (description && String(description).length > MAX_BATCH_DESCRIPTION_LENGTH) {
    return fail(
      BATCH_ERRORS.VALIDATION,
      `Description must not exceed ${MAX_BATCH_DESCRIPTION_LENGTH} characters`
    );
  }

  // ── Date range cross-field validation ─────────────────────────────────────
  if (startDate && endDate) {
    if (endDate < startDate) {
      return fail(
        BATCH_ERRORS.VALIDATION,
        'End date must be on or after start date'
      );
    }
  }

  return null; // valid
};

/**
 * Derives an appropriate BATCH_STATUS for a batch based on its date range.
 * Used when status is not explicitly provided on create.
 *
 * @param {string} startDate  YYYY-MM-DD
 * @param {string} endDate    YYYY-MM-DD
 * @returns {string}
 */
const _deriveStatus = (startDate, endDate) => {
  const today = new Date().toISOString().slice(0, 10); // UTC is fine for comparison here
  if (endDate < today) return BATCH_STATUS.COMPLETED;
  if (startDate > today) return BATCH_STATUS.UPCOMING;
  return BATCH_STATUS.ACTIVE;
};

/**
 * Generates a unique batch ID.
 * Uses a timestamp + random suffix to avoid collisions even if called rapidly.
 * @returns {string}  e.g. "b_1718620800000_x4f2"
 */
const _generateId = () =>
  `b_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

// ── Mock CRUD internals ────────────────────────────────────────────────────────

const _mock = {
  /**
   * Returns a filtered, sorted copy of the store.
   * @param {{ status?: string, search?: string }} filters
   * @returns {Array}
   */
  getAll({ status, search } = {}) {
    let result = [..._store];

    if (status) {
      result = result.filter((b) => b.status === status);
    }

    if (search && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.batchName?.toLowerCase().includes(q) ||
          b.batchCode?.toLowerCase().includes(q)
      );
    }

    // Default sort: newest createdAt first
    result.sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    );

    return result;
  },

  /**
   * Finds a single batch by ID.
   * @param {string} id
   * @returns {object|null}
   */
  getById(id) {
    return _store.find((b) => b.id === id) || null;
  },

  /**
   * Inserts a new batch object into the store.
   * @param {object} batch
   */
  insert(batch) {
    _store.unshift(batch);
  },

  /**
   * Updates an existing batch by ID (shallow merge).
   * @param {string} id
   * @param {object} changes
   * @returns {object} updated batch
   */
  update(id, changes) {
    const idx = _store.findIndex((b) => b.id === id);
    _store[idx] = { ..._store[idx], ...changes };
    return { ..._store[idx] };
  },

  /**
   * Removes a batch from the store by ID.
   * @param {string} id
   */
  remove(id) {
    _store = _store.filter((b) => b.id !== id);
  },

  /**
   * Checks whether a batchCode is already in use (case-insensitive).
   * @param {string} code
   * @param {string} [excludeId]  - ID to exclude (used during updates).
   * @returns {boolean}
   */
  isCodeTaken(code, excludeId) {
    const normalized = code.trim().toLowerCase();
    return _store.some(
      (b) =>
        b.batchCode?.toLowerCase() === normalized &&
        b.id !== excludeId
    );
  },
};

// ── Public service methods ─────────────────────────────────────────────────────

/**
 * Returns all batches, with optional status and search filters.
 *
 * @param {{ status?: string, search?: string }} [filters]
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: Array | null,
 *   meta: { total: number, filtered: number },
 *   error: { code, message } | null
 * }>}
 *
 * @example
 *   const res = await getBatches({ status: BATCH_STATUS.ACTIVE });
 *   if (res.success) setBatches(res.data);
 */
export const getBatches = async (filters = {}) => {
  return tryCatch(() => {
    if (USE_MOCK) {
      const allCount  = _store.length;
      const data      = _mock.getAll(filters);
      return ok(data, { total: allCount, filtered: data.length });
    }

    // Future: return axiosClient.get('/api/batches', { params: filters });
    return fail(BATCH_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

/**
 * Returns a single batch by its ID.
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
 *   const res = await getBatchById('b4');
 *   if (res.success) setBatch(res.data);
 */
export const getBatchById = async (id) => {
  return tryCatch(() => {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return fail(BATCH_ERRORS.INVALID_ID, 'A valid batch ID is required');
    }

    if (USE_MOCK) {
      const batch = _mock.getById(id.trim());
      if (!batch) {
        return fail(BATCH_ERRORS.NOT_FOUND, `Batch with ID "${id}" not found`);
      }
      return ok({ ...batch });
    }

    // Future: return axiosClient.get(`/api/batches/${id}`);
    return fail(BATCH_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

/**
 * Creates a new batch.
 *
 * Required fields: batchName, batchCode, startDate, endDate
 * Optional fields: description, trainerId, trainerName, maxStudents, status
 *
 * @param {{
 *   batchName: string,
 *   batchCode: string,
 *   startDate: string,
 *   endDate: string,
 *   description?: string,
 *   trainerId?: string,
 *   trainerName?: string,
 *   maxStudents?: number,
 *   status?: string,
 * }} data
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: object | null,
 *   meta: {},
 *   error: { code, message } | null
 * }>}
 */
export const createBatch = async (data) => {
  return tryCatch(() => {
    // ── Validate fields ──────────────────────────────────────────────────────
    const validationError = _validateBatchFields(data, true);
    if (validationError) return validationError;

    if (USE_MOCK) {
      // ── Check batchCode uniqueness ─────────────────────────────────────────
      if (_mock.isCodeTaken(data.batchCode)) {
        return fail(
          BATCH_ERRORS.DUPLICATE_CODE,
          `Batch code "${data.batchCode.trim()}" is already in use`
        );
      }

      const now = new Date().toISOString();
      const newBatch = {
        id:                   _generateId(),
        batchCode:            data.batchCode.trim().toUpperCase(),
        batchName:            data.batchName.trim(),
        trainerId:            data.trainerId  || null,
        trainerName:          data.trainerName || null,
        startDate:            data.startDate,
        endDate:              data.endDate,
        status:               data.status || _deriveStatus(data.startDate, data.endDate),
        maxStudents:          data.maxStudents  ?? 30,
        currentStudentCount:  0,
        description:          data.description?.trim() || '',
        createdAt:            now,
        updatedAt:            now,
      };

      _mock.insert(newBatch);
      return ok({ ...newBatch });
    }

    // Future: return axiosClient.post('/api/batches', data);
    return fail(BATCH_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

/**
 * Updates an existing batch by ID (partial update — only supplied fields change).
 *
 * @param {string} id
 * @param {{
 *   batchName?: string,
 *   batchCode?: string,
 *   startDate?: string,
 *   endDate?: string,
 *   description?: string,
 *   trainerId?: string,
 *   trainerName?: string,
 *   maxStudents?: number,
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
export const updateBatch = async (id, changes) => {
  return tryCatch(() => {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return fail(BATCH_ERRORS.INVALID_ID, 'A valid batch ID is required');
    }

    // ── Validate only the supplied fields ────────────────────────────────────
    const validationError = _validateBatchFields(changes, false);
    if (validationError) return validationError;

    if (USE_MOCK) {
      const existing = _mock.getById(id.trim());
      if (!existing) {
        return fail(BATCH_ERRORS.NOT_FOUND, `Batch with ID "${id}" not found`);
      }

      // ── batchCode uniqueness check (exclude self) ────────────────────────
      if (changes.batchCode !== undefined) {
        if (_mock.isCodeTaken(changes.batchCode, id)) {
          return fail(
            BATCH_ERRORS.DUPLICATE_CODE,
            `Batch code "${changes.batchCode.trim()}" is already in use`
          );
        }
        changes = {
          ...changes,
          batchCode: changes.batchCode.trim().toUpperCase(),
        };
      }

      if (changes.batchName !== undefined) {
        changes = { ...changes, batchName: changes.batchName.trim() };
      }

      const updated = _mock.update(id.trim(), {
        ...changes,
        updatedAt: new Date().toISOString(),
      });

      return ok({ ...updated });
    }

    // Future: return axiosClient.put(`/api/batches/${id}`, changes);
    return fail(BATCH_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

/**
 * Deletes (hard-removes) a batch from the store.
 *
 * Blueprint Section 4.1 notes that "deactivate or archive" is the preferred
 * production pattern. For V1, hard-delete is supported here. The caller
 * (hook / page) is responsible for ensuring no orphaned students/attendance
 * records remain — cascade logic lives in the relevant hooks.
 *
 * Future V2: replace with a soft-delete (status → 'cancelled') if needed.
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
export const deleteBatch = async (id) => {
  return tryCatch(() => {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return fail(BATCH_ERRORS.INVALID_ID, 'A valid batch ID is required');
    }

    if (USE_MOCK) {
      const existing = _mock.getById(id.trim());
      if (!existing) {
        return fail(BATCH_ERRORS.NOT_FOUND, `Batch with ID "${id}" not found`);
      }

      _mock.remove(id.trim());
      return ok({ id: id.trim() });
    }

    // Future: return axiosClient.delete(`/api/batches/${id}`);
    return fail(BATCH_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

/**
 * Returns only batches with BATCH_STATUS.ACTIVE.
 * Convenience wrapper used by the Mark Attendance batch selector and the
 * Dashboard overview chart.
 *
 * No hardcoded status strings — uses the BATCH_STATUS constant.
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: Array | null,
 *   meta: { total: number },
 *   error: { code, message } | null
 * }>}
 */
export const getActiveBatches = async () => {
  return tryCatch(() => {
    if (USE_MOCK) {
      const data = _mock.getAll({ status: BATCH_STATUS.ACTIVE });
      return ok(data, { total: data.length });
    }

    // Future: return axiosClient.get('/api/batches', { params: { status: BATCH_STATUS.ACTIVE } });
    return fail(BATCH_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

/**
 * Returns batches matching any of the supplied statuses.
 * Used by the Dashboard summary to retrieve active + upcoming counts in one call.
 *
 * @param {string[]} statuses  - Array of BATCH_STATUS values.
 *
 * @returns {Promise<{
 *   success: boolean,
 *   data: Array | null,
 *   meta: { total: number },
 *   error: { code, message } | null
 * }>}
 */
export const getBatchesByStatuses = async (statuses = []) => {
  return tryCatch(() => {
    if (!Array.isArray(statuses) || statuses.length === 0) {
      return fail(BATCH_ERRORS.VALIDATION, 'At least one status is required');
    }

    if (USE_MOCK) {
      const data = _store.filter((b) => statuses.includes(b.status));
      return ok([...data], { total: data.length });
    }

    // Future: return axiosClient.get('/api/batches', { params: { status: statuses.join(',') } });
    return fail(BATCH_ERRORS.UNEXPECTED, 'Live API not implemented');
  });
};

/**
 * Utility: resets the in-memory store back to the original seed data.
 * Useful in development when you want a clean slate without reloading.
 * Should NEVER be called from production code paths.
 */
export const _resetStore = () => {
  _store = mockBatches.map((b) => ({ ...b }));
};
