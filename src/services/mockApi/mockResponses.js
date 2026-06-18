/**
 * mockResponses.js
 * Standardized success and error response factories for the Mock API Layer.
 *
 * Module: B3.5 — Mock API Layer
 * Blueprint Sections: 11.1 (services/), 15.2 Code Quality
 *
 * RESPONSIBILITIES:
 *  - Provides mockSuccess() and mockError() builders that wrap the existing
 *    ok() / fail() shapes from serviceResponse.js with HTTP-like metadata.
 *  - Defines all error codes used across the mock layer.
 *  - Provides a random failure simulation utility for resilience testing.
 *
 * DESIGN PRINCIPLE:
 *  These factories add an http-like layer (status, headers, timing) on top of
 *  the existing { success, data, meta, error } shape — so hooks and pages that
 *  already consume serviceResponse shapes need zero changes.
 *
 * RESPONSE SHAPE:
 *  {
 *    success:  boolean,
 *    data:     any | null,
 *    meta:     object,
 *    error:    { code, message, details? } | null,
 *    _mock: {                    ← debug metadata, stripped in production
 *      status:  number,          ← HTTP-like status code
 *      latency: number,          ← ms taken
 *      method:  string,          ← GET | POST | PUT | DELETE
 *      path:    string,          ← simulated API path
 *    }
 *  }
 */

import { ok, fail } from '@utils/serviceResponse';
import { getEffectiveFailureRate } from './mockConfig';

// ── Mock API error code registry ──────────────────────────────────────────────

export const MOCK_ERROR_CODES = Object.freeze({
  // Client errors (4xx equivalent)
  VALIDATION_ERROR:   'VALIDATION_ERROR',
  NOT_FOUND:          'NOT_FOUND',
  DUPLICATE_RECORD:   'DUPLICATE_RECORD',
  UNAUTHORIZED:       'UNAUTHORIZED',
  FORBIDDEN:          'FORBIDDEN',

  // Server errors (5xx equivalent)
  INTERNAL_ERROR:     'INTERNAL_ERROR',
  NETWORK_ERROR:      'NETWORK_ERROR',
  TIMEOUT:            'TIMEOUT',
});

// HTTP-like status code map for each error code
const ERROR_STATUS_MAP = {
  [MOCK_ERROR_CODES.VALIDATION_ERROR]:  422,
  [MOCK_ERROR_CODES.NOT_FOUND]:         404,
  [MOCK_ERROR_CODES.DUPLICATE_RECORD]:  409,
  [MOCK_ERROR_CODES.UNAUTHORIZED]:      401,
  [MOCK_ERROR_CODES.FORBIDDEN]:         403,
  [MOCK_ERROR_CODES.INTERNAL_ERROR]:    500,
  [MOCK_ERROR_CODES.NETWORK_ERROR]:     503,
  [MOCK_ERROR_CODES.TIMEOUT]:           408,
};

// ── Mock debug metadata builder ───────────────────────────────────────────────

/**
 * Builds the _mock debug metadata block.
 * Stripped automatically in production (see mockApiClient.js).
 *
 * @param {object} params
 * @param {number} params.status   - HTTP-like status code
 * @param {number} params.latency  - Elapsed ms
 * @param {string} params.method   - GET | POST | PUT | DELETE
 * @param {string} params.path     - Simulated endpoint path
 * @returns {object}
 */
const _buildMockMeta = ({ status, latency, method, path }) => ({
  status,
  latency,
  method,
  path,
  timestamp: new Date().toISOString(),
});

// ── Success response factory ───────────────────────────────────────────────────

/**
 * Builds a mock success response that extends the standard ok() shape
 * with HTTP-like metadata.
 *
 * @param {any}    data          - Response payload
 * @param {object} [meta]        - Domain-level metadata (counts, pages, etc.)
 * @param {object} [mockMeta]    - Mock debug metadata ({ latency, method, path })
 * @returns {{ success: true, data, meta, error: null, _mock: object }}
 *
 * @example
 *   return mockSuccess(batches, { total: batches.length }, { latency: 320, method: 'GET', path: '/api/batches' });
 */
export const mockSuccess = (data, meta = {}, mockMeta = {}) => {
  const base = ok(data, meta);
  if (import.meta.env.PROD) return base;

  return {
    ...base,
    _mock: _buildMockMeta({
      status:  200,
      latency: mockMeta.latency ?? 0,
      method:  mockMeta.method  ?? 'GET',
      path:    mockMeta.path    ?? '/api/unknown',
    }),
  };
};

// ── Error response factory ────────────────────────────────────────────────────

/**
 * Builds a mock error response that extends the standard fail() shape
 * with HTTP-like metadata and optional details.
 *
 * @param {string} code      - One of MOCK_ERROR_CODES
 * @param {string} message   - Human-readable message surfaced to the UI
 * @param {object} [options]
 * @param {object} [options.meta]     - Domain-level metadata
 * @param {any}    [options.details]  - Extended error details (field errors, etc.)
 * @param {object} [options.mockMeta] - Mock debug metadata
 * @returns {{ success: false, data: null, meta, error: { code, message, details? }, _mock? }}
 *
 * @example
 *   return mockError(MOCK_ERROR_CODES.NOT_FOUND, 'Batch not found', {
 *     mockMeta: { latency: 450, method: 'GET', path: '/api/batches/b99' }
 *   });
 */
export const mockError = (code, message, options = {}) => {
  const { meta = {}, details, mockMeta = {} } = options;
  const base = fail(code, message, meta);

  const enrichedError = details !== undefined
    ? { ...base.error, details }
    : base.error;

  const response = { ...base, error: enrichedError };

  if (import.meta.env.PROD) return response;

  const status = ERROR_STATUS_MAP[code] ?? 500;
  return {
    ...response,
    _mock: _buildMockMeta({
      status,
      latency: mockMeta.latency ?? 0,
      method:  mockMeta.method  ?? 'GET',
      path:    mockMeta.path    ?? '/api/unknown',
    }),
  };
};

// ── Random failure simulation ─────────────────────────────────────────────────

/**
 * Randomly decides whether to simulate a failure based on the configured
 * failure rate. Returns null if no failure; returns a mockError response
 * if the random roll triggers a failure.
 *
 * Only active in development and only when ACTIVE_FAILURE_RATE > 0.
 * Always returns null in production.
 *
 * @param {object} [mockMeta]  - Passed through to mockError for debug metadata.
 * @returns {{ success: false, ... } | null}
 *
 * @example
 *   const failure = maybeFailure(mockMeta);
 *   if (failure) return failure;
 */
export const maybeFailure = (mockMeta = {}) => {
  const rate = getEffectiveFailureRate();
  if (rate <= 0) return null;
  if (Math.random() < rate) {
    return mockError(
      MOCK_ERROR_CODES.INTERNAL_ERROR,
      'Simulated random failure (dev mode — check ACTIVE_FAILURE_RATE in mockConfig.js)',
      { mockMeta }
    );
  }
  return null;
};

// ── Named error convenience builders ─────────────────────────────────────────

/**
 * Pre-built error constructors for the most common failure scenarios.
 * Pass mockMeta for debug metadata; pass details for field-level errors.
 */

export const mockErrors = {
  validationError: (message, details, mockMeta) =>
    mockError(MOCK_ERROR_CODES.VALIDATION_ERROR, message, { details, mockMeta }),

  notFound: (resource, id, mockMeta) =>
    mockError(
      MOCK_ERROR_CODES.NOT_FOUND,
      id ? `${resource} with ID "${id}" not found` : `${resource} not found`,
      { mockMeta }
    ),

  duplicateRecord: (message, mockMeta) =>
    mockError(MOCK_ERROR_CODES.DUPLICATE_RECORD, message, { mockMeta }),

  unauthorized: (mockMeta) =>
    mockError(MOCK_ERROR_CODES.UNAUTHORIZED, 'Authentication required', { mockMeta }),

  forbidden: (action, mockMeta) =>
    mockError(MOCK_ERROR_CODES.FORBIDDEN, `You do not have permission to ${action}`, { mockMeta }),

  internalError: (message = 'An unexpected server error occurred', mockMeta) =>
    mockError(MOCK_ERROR_CODES.INTERNAL_ERROR, message, { mockMeta }),

  networkError: (mockMeta) =>
    mockError(MOCK_ERROR_CODES.NETWORK_ERROR, 'Network unavailable. Check your connection.', { mockMeta }),

  timeout: (mockMeta) =>
    mockError(MOCK_ERROR_CODES.TIMEOUT, 'Request timed out. Please try again.', { mockMeta }),
};
