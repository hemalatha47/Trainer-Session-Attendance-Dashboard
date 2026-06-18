/**
 * index.js
 * Barrel export for the Mock API Layer (Module B3.5).
 *
 * Import from this file to access the full mock API surface:
 *
 *   import {
 *     mockGet, mockPost, mockPut, mockDelete,
 *     mockSuccess, mockError, mockErrors, MOCK_ERROR_CODES,
 *     simulateDelay, DELAY_PRESETS,
 *     USE_MOCK, DELAY_PRESETS as DELAY, getMockConfigSummary,
 *   } from '@services/mockApi';
 */

// Client methods
export { mockGet, mockPost, mockPut, mockDelete, apiRequest } from './mockApiClient';

// Response factories and error codes
export {
  mockSuccess,
  mockError,
  mockErrors,
  MOCK_ERROR_CODES,
  maybeFailure,
} from './mockResponses';

// Delay utilities
export {
  simulateDelay,
  noDelay,
  fastDelay,
  normalDelay,
  slowDelay,
  customDelay,
  withLoadingStates,
  DELAY_PRESETS,
} from './mockDelay';

// Configuration
export {
  USE_MOCK,
  DELAY_PRESETS as DELAY_PRESETS_CONFIG,
  DEFAULT_DELAY_PRESET,
  FAILURE_RATES,
  ACTIVE_FAILURE_RATE,
  MOCK_TIMEOUT_MS,
  getEffectiveFailureRate,
  getMockConfigSummary,
} from './mockConfig';
