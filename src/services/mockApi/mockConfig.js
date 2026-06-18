/**
 * mockConfig.js
 * Central configuration for the Mock API Layer.
 *
 * Module: B3.5 — Mock API Layer
 * Blueprint Sections: 11.1 (services/), 15.2, 17.6
 *
 * RESPONSIBILITIES:
 *  - Controls mock mode via environment variable.
 *  - Configures delay range for simulated API latency.
 *  - Controls optional random failure simulation (dev-only, off by default).
 *  - Provides a single import point for all mock API settings.
 *
 * FUTURE BACKEND MIGRATION:
 *  - Set VITE_USE_MOCK=false → all mock branches are bypassed.
 *  - No config changes required in services; only the USE_MOCK branch bodies change.
 */

// ── Core mode flag ─────────────────────────────────────────────────────────────
// Source: .env.development  VITE_USE_MOCK=true
//         .env.production   VITE_USE_MOCK=false

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ── Delay configuration ────────────────────────────────────────────────────────
// Simulates realistic network round-trip times in development.
// All values are in milliseconds.

export const DELAY_PRESETS = Object.freeze({
  FAST:    { min: 50,   max: 150  },   // Near-instant (e.g. cached read)
  NORMAL:  { min: 300,  max: 800  },   // Typical REST API response
  SLOW:    { min: 1200, max: 2500 },   // Slow network / heavy query
  NONE:    { min: 0,    max: 0    },   // Synchronous — no delay (unit tests)
});

// Default delay preset used by mockGet / mockPost / mockPut / mockDelete
// when no explicit delay is specified.
export const DEFAULT_DELAY_PRESET = DELAY_PRESETS.NORMAL;

// ── Random failure simulation ──────────────────────────────────────────────────
// Intentionally OFF by default.  Enable during chaos/resilience testing only.
// Values represent failure probability as a decimal (0.0–1.0).

export const FAILURE_RATES = Object.freeze({
  NONE:    0.00,   // 0%  — disabled (default)
  LOW:     0.05,   // 5%
  MEDIUM:  0.10,   // 10%
  HIGH:    0.20,   // 20%
});

// Active failure rate.  Change only for targeted resilience testing.
export const ACTIVE_FAILURE_RATE = FAILURE_RATES.NONE;

// ── Timeout threshold ──────────────────────────────────────────────────────────
// Maximum simulated wait before a TIMEOUT error is returned.
// Only relevant when DELAY_PRESET includes delays above this threshold.
// In mock mode this is purely documentary — real timeout cancellation
// is handled by the future axios layer.

export const MOCK_TIMEOUT_MS = 5000;

// ── Environment guard ──────────────────────────────────────────────────────────
// Random failure simulation is development-only.
// If the production build somehow has a non-zero failure rate, clamp it to 0.

export const getEffectiveFailureRate = () => {
  if (import.meta.env.PROD) return FAILURE_RATES.NONE;
  return ACTIVE_FAILURE_RATE;
};

// ── Config summary (for debugging) ────────────────────────────────────────────

export const getMockConfigSummary = () => ({
  useMock:       USE_MOCK,
  delayPreset:   DEFAULT_DELAY_PRESET,
  failureRate:   getEffectiveFailureRate(),
  timeoutMs:     MOCK_TIMEOUT_MS,
  environment:   import.meta.env.MODE,
});
