/**
 * serviceResponse.js
 * Standardized response factory for all service modules.
 *
 * Blueprint Section B3.1 Task 9 — every service method returns one of these
 * two shapes so hooks and pages never need to handle raw thrown errors or
 * inconsistent data shapes.
 *
 * SUCCESS shape:
 *   { success: true,  data: <any>,  meta: {}, error: null }
 *
 * ERROR shape:
 *   { success: false, data: null,   meta: {}, error: { code, message } }
 *
 * Usage:
 *   import { ok, fail } from '@utils/serviceResponse';
 *
 *   return ok(batchArray, { total: batchArray.length });
 *   return fail('BATCH_NOT_FOUND', 'Batch not found');
 */

/**
 * Build a success response.
 *
 * @template T
 * @param {T}      data   - The primary payload (array, object, boolean, etc.)
 * @param {object} [meta] - Optional metadata (total count, page info, etc.)
 * @returns {{ success: true, data: T, meta: object, error: null }}
 */
export const ok = (data, meta = {}) => ({
  success: true,
  data,
  meta,
  error: null,
});

/**
 * Build an error response.
 *
 * @param {string} code    - Machine-readable error code (e.g. 'BATCH_NOT_FOUND')
 * @param {string} message - Human-readable message surfaced to the UI via Toast
 * @param {object} [meta]  - Optional metadata carried alongside the error
 * @returns {{ success: false, data: null, meta: object, error: { code, message } }}
 */
export const fail = (code, message, meta = {}) => ({
  success: false,
  data: null,
  meta,
  error: { code, message },
});

/**
 * Wraps an async function in a try/catch and converts unhandled exceptions
 * into a standardized fail() response instead of propagating the throw.
 *
 * Use this inside service methods that call external APIs so that the hook
 * layer always receives a consistent shape.
 *
 * @param {() => Promise<any>} fn
 * @returns {Promise<{ success: boolean, data: any, meta: object, error: any }>}
 */
export const tryCatch = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    const message = err?.message || 'An unexpected error occurred';
    return fail('UNEXPECTED_ERROR', message);
  }
};
