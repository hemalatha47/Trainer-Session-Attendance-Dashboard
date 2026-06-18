/**
 * mockApiClient.js
 * Centralized Mock API Client for the Mock API Layer.
 *
 * Module: B3.5 — Mock API Layer
 * Blueprint Sections: 11.1 (services/), 15.2, 17.6
 *
 * ARCHITECTURE ROLE:
 *  Services currently call mock data directly:
 *    Services → Mock Data
 *
 *  This module inserts a thin, future-compatible transport layer:
 *    Services → Mock API Client → Mock Data
 *
 *  When the real backend is ready:
 *    Services → Real API Client (axios) → Backend
 *
 * DESIGN PRINCIPLES:
 *  1. No business logic — this is a transport layer only.
 *  2. All methods are async; they accept a handler function that
 *     contains the actual mock data operation.
 *  3. Every call applies: delay simulation → failure check → execute handler.
 *  4. Returns the standard { success, data, meta, error } shape from
 *     serviceResponse.js, optionally with _mock debug metadata.
 *  5. Future backend migration = swap the handler with an axios call;
 *     method signatures and return shapes are unchanged.
 *
 * METHOD MAP (mirrors HTTP verbs):
 *  mockGet()    → reads   → maps to GET
 *  mockPost()   → creates → maps to POST
 *  mockPut()    → updates → maps to PUT / PATCH
 *  mockDelete() → removes → maps to DELETE
 *
 * USAGE:
 *   import { mockGet, mockPost } from '@services/mockApi/mockApiClient';
 *
 *   // In a service:
 *   export const getBatches = async (options) => {
 *     return mockGet('/api/batches', () => {
 *       const records = _store.filter(...);
 *       return mockSuccess(records, { total: records.length });
 *     });
 *   };
 */

import { simulateDelay } from './mockDelay';
import { maybeFailure, mockErrors } from './mockResponses';
import { DEFAULT_DELAY_PRESET, USE_MOCK } from './mockConfig';
import { tryCatch } from '@utils/serviceResponse';

// ── Internal request executor ─────────────────────────────────────────────────

/**
 * Core execution wrapper used by all mockGet/Post/Put/Delete methods.
 *
 * Steps:
 *  1. Simulate network delay (configurable preset or custom ms).
 *  2. Check random failure simulation (dev only, off by default).
 *  3. Execute the handler function.
 *  4. Attach timing metadata to the response (_mock.latency).
 *
 * @param {string}   method        - HTTP verb label (GET | POST | PUT | DELETE)
 * @param {string}   path          - Simulated API endpoint path (for debug logging)
 * @param {Function} handler       - () => Promise<{ success, data, meta, error }>
 * @param {object}   [options]
 * @param {{ min, max }} [options.delay]  - Override delay preset
 * @returns {Promise<{ success, data, meta, error, _mock? }>}
 */
const _execute = async (method, path, handler, options = {}) => {
  const { delay = DEFAULT_DELAY_PRESET } = options;
  const startMs = performance.now();

  return tryCatch(async () => {
    // Step 1: Simulate network latency
    await simulateDelay(delay);

    // Step 2: Optional random failure (dev only, ACTIVE_FAILURE_RATE > 0)
    const failure = maybeFailure({ method, path, latency: Math.round(performance.now() - startMs) });
    if (failure) return failure;

    // Step 3: Execute the mock handler
    const result = await handler();

    // Step 4: Attach timing to _mock metadata (dev only)
    const latency = Math.round(performance.now() - startMs);
    if (result && !import.meta.env.PROD) {
      result._mock = {
        ...(result._mock || {}),
        latency,
        method,
        path,
        timestamp: new Date().toISOString(),
      };
    }

    return result;
  });
};

// ── Public API Methods ─────────────────────────────────────────────────────────

/**
 * Simulates a GET request — read operations.
 *
 * @param {string}   path      - Simulated endpoint path (e.g. '/api/batches')
 * @param {Function} handler   - () => serviceResponse
 * @param {object}   [options] - { delay: { min, max } }
 * @returns {Promise<serviceResponse>}
 *
 * @example
 *   return mockGet('/api/batches', () => {
 *     const data = _store.filter((b) => b.status === 'active');
 *     return mockSuccess(data, { total: data.length });
 *   });
 */
export const mockGet = (path, handler, options = {}) =>
  _execute('GET', path, handler, options);

/**
 * Simulates a POST request — create operations.
 *
 * @param {string}   path      - Simulated endpoint path (e.g. '/api/batches')
 * @param {Function} handler   - () => serviceResponse
 * @param {object}   [options] - { delay: { min, max } }
 * @returns {Promise<serviceResponse>}
 *
 * @example
 *   return mockPost('/api/batches', () => {
 *     _store.push(newBatch);
 *     return mockSuccess(newBatch, {}, { method: 'POST', path: '/api/batches' });
 *   });
 */
export const mockPost = (path, handler, options = {}) =>
  _execute('POST', path, handler, options);

/**
 * Simulates a PUT request — full or partial update operations.
 *
 * @param {string}   path      - Simulated endpoint path (e.g. '/api/batches/b1')
 * @param {Function} handler   - () => serviceResponse
 * @param {object}   [options] - { delay: { min, max } }
 * @returns {Promise<serviceResponse>}
 *
 * @example
 *   return mockPut(`/api/batches/${id}`, () => {
 *     const updated = _updateInStore(id, changes);
 *     return mockSuccess(updated);
 *   });
 */
export const mockPut = (path, handler, options = {}) =>
  _execute('PUT', path, handler, options);

/**
 * Simulates a DELETE request — remove / deactivate operations.
 *
 * @param {string}   path      - Simulated endpoint path (e.g. '/api/batches/b1')
 * @param {Function} handler   - () => serviceResponse
 * @param {object}   [options] - { delay: { min, max } }
 * @returns {Promise<serviceResponse>}
 *
 * @example
 *   return mockDelete(`/api/batches/${id}`, () => {
 *     _softDelete(id);
 *     return mockSuccess({ id, archived: true });
 *   });
 */
export const mockDelete = (path, handler, options = {}) =>
  _execute('DELETE', path, handler, options);

// ── Future API client placeholder ─────────────────────────────────────────────

/**
 * apiRequest()
 * Future-ready stub that will replace mockGet/Post/Put/Delete when
 * USE_MOCK is false and a real backend is available.
 *
 * V1: This is intentionally a non-operational placeholder.
 * V2: Replace with axios-based implementation matching Section 10 endpoints.
 *
 * @param {string} method
 * @param {string} path
 * @param {any}    [body]
 * @param {object} [options]
 */
export const apiRequest = async (method, path, body, options = {}) => {
  if (USE_MOCK) {
    throw new Error(
      `apiRequest() called in mock mode. Use mockGet/mockPost/mockPut/mockDelete instead.\nPath: ${method} ${path}`
    );
  }
  // V2 implementation:
  // const response = await axios({ method, url: path, data: body, ...options });
  // return response.data;
  throw new Error('Live API not implemented. Set VITE_USE_MOCK=true or implement the live API client.');
};
