/**
 * mockDelay.js
 * Simulates realistic API network latency for the Mock API Layer.
 *
 * Module: B3.5 — Mock API Layer
 * Blueprint Section 17.6 — mock service switch pattern
 *
 * RESPONSIBILITIES:
 *  - Provides configurable delay simulation (fast / normal / slow / none / custom).
 *  - Supports loading-state simulation (pending → resolved).
 *  - Pure utility — no business logic, no React dependencies.
 *
 * USAGE:
 *   import { simulateDelay, DELAY_PRESETS } from './mockDelay';
 *
 *   await simulateDelay();                         // default NORMAL delay
 *   await simulateDelay(DELAY_PRESETS.FAST);       // 50–150 ms
 *   await simulateDelay(DELAY_PRESETS.SLOW);       // 1200–2500 ms
 *   await simulateDelay({ min: 200, max: 400 });   // custom range
 *   await simulateDelay(DELAY_PRESETS.NONE);       // synchronous (tests)
 */

import { DEFAULT_DELAY_PRESET, DELAY_PRESETS as CONFIG_PRESETS } from './mockConfig';

// Re-export presets so callers can import from a single location.
export { DELAY_PRESETS } from './mockConfig';

// ── Random integer in range ───────────────────────────────────────────────────

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ── Core delay function ───────────────────────────────────────────────────────

/**
 * Returns a Promise that resolves after a randomized delay within the
 * given preset range.  Passing DELAY_PRESETS.NONE (or { min:0, max:0 })
 * resolves immediately — useful for unit tests.
 *
 * @param {{ min: number, max: number }} [preset]  - Delay range in ms.
 *   Defaults to DEFAULT_DELAY_PRESET (NORMAL: 300–800 ms).
 * @returns {Promise<void>}
 */
export const simulateDelay = (preset = DEFAULT_DELAY_PRESET) => {
  const { min, max } = preset;
  if (!min && !max) return Promise.resolve();
  const ms = randomBetween(Math.max(0, min), Math.max(0, max));
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// ── Named convenience wrappers ────────────────────────────────────────────────

/** Resolves immediately — no artificial delay. */
export const noDelay = () => simulateDelay(CONFIG_PRESETS.NONE);

/** Fast response simulation: 50–150 ms. */
export const fastDelay = () => simulateDelay(CONFIG_PRESETS.FAST);

/** Normal response simulation: 300–800 ms (default). */
export const normalDelay = () => simulateDelay(CONFIG_PRESETS.NORMAL);

/** Slow response simulation: 1200–2500 ms. */
export const slowDelay = () => simulateDelay(CONFIG_PRESETS.SLOW);

/**
 * Custom delay with explicit min/max.
 * @param {number} min  Minimum ms
 * @param {number} max  Maximum ms
 * @returns {Promise<void>}
 */
export const customDelay = (min, max) => simulateDelay({ min, max });

// ── Loading state helper ──────────────────────────────────────────────────────

/**
 * Simulates an async loading lifecycle by invoking callbacks at each stage.
 * Useful for testing loading spinners and skeleton states in UI.
 *
 * Stages:
 *   1. onPending()  — called immediately (request started)
 *   2. [delay]      — waits for the configured delay
 *   3. onLoading()  — called mid-delay halfway point (optional)
 *   4. fn()         — executes the actual mock operation
 *   5. onSuccess() or onError() — depending on fn's outcome
 *
 * @param {object} params
 * @param {Function}             params.fn          - The mock operation to execute.
 * @param {Function}             [params.onPending]  - Called at start.
 * @param {Function}             [params.onSuccess]  - Called on success with result.
 * @param {Function}             [params.onError]    - Called on error with error.
 * @param {{ min, max }}         [params.delay]      - Delay preset.
 * @returns {Promise<any>}
 */
export const withLoadingStates = async ({
  fn,
  onPending = () => {},
  onSuccess = () => {},
  onError   = () => {},
  delay     = DEFAULT_DELAY_PRESET,
}) => {
  onPending();
  try {
    await simulateDelay(delay);
    const result = await fn();
    onSuccess(result);
    return result;
  } catch (err) {
    onError(err);
    throw err;
  }
};
