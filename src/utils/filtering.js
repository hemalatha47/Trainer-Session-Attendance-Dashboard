/**
 * filtering.js
 * Reusable, stateless data filtering utility.
 * Module: B3.4
 *
 * Supports status, batch, date, numeric range, and custom predicate filtering.
 * All functions are composable — chain multiple filters using filterDataMulti.
 */

import { isValidDateString } from '@utils/dateUtils';

// ── Single-field filters ──────────────────────────────────────────────────────

/**
 * Filters an array by a single field's equality to a value.
 * Case-insensitive string comparison.
 *
 * @template T
 * @param {T[]}    items
 * @param {string} field
 * @param {any}    value   - Pass null/undefined/''/[] to return all items unfiltered
 * @returns {T[]}
 *
 * @example
 *   filterByField(batches, 'status', 'active')
 *   filterByField(students, 'batchId', 'b4')
 */
export const filterByField = (items, field, value) => {
  if (!Array.isArray(items)) return [];
  if (value === null || value === undefined || value === '') return [...items];

  const target = typeof value === 'string' ? value.toLowerCase() : value;

  return items.filter((item) => {
    const fieldVal = item?.[field];
    if (fieldVal === null || fieldVal === undefined) return false;
    const normalized = typeof fieldVal === 'string' ? fieldVal.toLowerCase() : fieldVal;
    return normalized === target;
  });
};

/**
 * Filters an array by a field matching any of the provided values.
 *
 * @template T
 * @param {T[]}    items
 * @param {string} field
 * @param {any[]}  values   - Empty array returns all items unfiltered
 * @returns {T[]}
 *
 * @example
 *   filterByValues(batches, 'status', ['active', 'upcoming'])
 */
export const filterByValues = (items, field, values) => {
  if (!Array.isArray(items)) return [];
  if (!Array.isArray(values) || values.length === 0) return [...items];

  const targets = values.map((v) =>
    typeof v === 'string' ? v.toLowerCase() : v
  );

  return items.filter((item) => {
    const fieldVal = item?.[field];
    if (fieldVal === null || fieldVal === undefined) return false;
    const normalized = typeof fieldVal === 'string' ? fieldVal.toLowerCase() : fieldVal;
    return targets.includes(normalized);
  });
};

// ── Date range filter ─────────────────────────────────────────────────────────

/**
 * Filters an array by a date field within an inclusive [from, to] range.
 * Both bounds are optional — omit from/to to leave that bound open.
 *
 * @template T
 * @param {T[]}    items
 * @param {string} dateField     - Object key holding the YYYY-MM-DD date
 * @param {string} [from]        - YYYY-MM-DD, inclusive lower bound
 * @param {string} [to]          - YYYY-MM-DD, inclusive upper bound
 * @returns {T[]}
 *
 * @example
 *   filterByDateRange(records, 'date', '2026-04-01', '2026-04-30')
 */
export const filterByDateRange = (items, dateField, from, to) => {
  if (!Array.isArray(items)) return [];

  const hasFrom = from && isValidDateString(from);
  const hasTo   = to   && isValidDateString(to);

  if (!hasFrom && !hasTo) return [...items];

  return items.filter((item) => {
    const d = item?.[dateField];
    if (!d || typeof d !== 'string') return false;
    if (hasFrom && d < from) return false;
    if (hasTo   && d > to)   return false;
    return true;
  });
};

// ── Numeric range filter ──────────────────────────────────────────────────────

/**
 * Filters an array by a numeric field within an inclusive [min, max] range.
 *
 * @template T
 * @param {T[]}    items
 * @param {string} field
 * @param {number} [min]    - Inclusive lower bound (omit for no lower bound)
 * @param {number} [max]    - Inclusive upper bound (omit for no upper bound)
 * @returns {T[]}
 *
 * @example
 *   filterByNumericRange(studentSummaries, 'percentage', 50, 74)  // 50–74% range
 */
export const filterByNumericRange = (items, field, min, max) => {
  if (!Array.isArray(items)) return [];

  const hasMin = typeof min === 'number' && !isNaN(min);
  const hasMax = typeof max === 'number' && !isNaN(max);

  if (!hasMin && !hasMax) return [...items];

  return items.filter((item) => {
    const v = Number(item?.[field]);
    if (isNaN(v)) return false;
    if (hasMin && v < min) return false;
    if (hasMax && v > max) return false;
    return true;
  });
};

// ── Boolean / active filter ───────────────────────────────────────────────────

/**
 * Filters an array to only items where a boolean field matches the target.
 *
 * @template T
 * @param {T[]}    items
 * @param {string} field
 * @param {boolean} value
 * @returns {T[]}
 *
 * @example
 *   filterByBoolean(students, 'isActive', true)
 */
export const filterByBoolean = (items, field, value) => {
  if (!Array.isArray(items)) return [];
  if (value === null || value === undefined) return [...items];
  return items.filter((item) => Boolean(item?.[field]) === Boolean(value));
};

// ── Custom predicate filter ───────────────────────────────────────────────────

/**
 * Filters an array using a custom predicate function.
 *
 * @template T
 * @param {T[]}                items
 * @param {(item: T) => boolean} predicate
 * @returns {T[]}
 */
export const filterByPredicate = (items, predicate) => {
  if (!Array.isArray(items)) return [];
  if (typeof predicate !== 'function') return [...items];
  return items.filter(predicate);
};

// ── Compose multiple filters ──────────────────────────────────────────────────

/**
 * Applies multiple filter functions in sequence.
 * Each filter must be a function that accepts (items) and returns filtered items.
 * Compose with arrow functions calling the individual filter helpers.
 *
 * @template T
 * @param {T[]}                  items
 * @param {((items: T[]) => T[])[]} filters   - Array of filter functions
 * @returns {T[]}
 *
 * @example
 *   const results = filterDataMulti(students, [
 *     (items) => filterByField(items, 'batchId', selectedBatch),
 *     (items) => filterByBoolean(items, 'isActive', true),
 *     (items) => filterByNumericRange(items, 'percentage', 0, 74),
 *   ]);
 */
export const filterDataMulti = (items, filters) => {
  if (!Array.isArray(items)) return [];
  if (!Array.isArray(filters) || filters.length === 0) return [...items];

  return filters.reduce(
    (current, filterFn) =>
      typeof filterFn === 'function' ? filterFn(current) : current,
    [...items]
  );
};

// ── Attendance-specific filters ───────────────────────────────────────────────

/**
 * Filters students by attendance percentage threshold category.
 * Used by Student List page filter bar (Section 4.7).
 *
 * @template T
 * @param {T[]}    items         - Student summary objects with a `percentage` field
 * @param {'all'|'above'|'below'|'warning'} category
 * @param {number} [threshold=75]
 * @returns {T[]}
 */
export const filterByAttendanceCategory = (items, category, threshold = 75) => {
  if (!Array.isArray(items) || !category || category === 'all') return [...items];

  return items.filter((item) => {
    const pct = Number(item?.percentage);
    if (isNaN(pct)) return false;

    switch (category) {
      case 'above':   return pct >= threshold;
      case 'below':   return pct < threshold;
      case 'warning': return pct >= 50 && pct < threshold;
      default:        return true;
    }
  });
};
