/**
 * sorting.js
 * Reusable, stateless data sorting utility.
 * Module: B3.4
 *
 * Supports string, number, and date field sorting with configurable direction.
 * Used by service methods and hooks for consistent sort behavior.
 */

// ── Sort order constants ──────────────────────────────────────────────────────

export const SORT_ORDER = Object.freeze({
  ASC:  'asc',
  DESC: 'desc',
});

// ── Type detection ────────────────────────────────────────────────────────────

/**
 * Infers the data type of a value for comparison purposes.
 * @param {any} value
 * @returns {'date' | 'number' | 'string' | 'unknown'}
 */
const inferType = (value) => {
  if (value === null || value === undefined) return 'unknown';
  if (typeof value === 'number') return 'number';
  if (value instanceof Date) return 'date';
  // YYYY-MM-DD or ISO datetime strings
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
  return 'string';
};

// ── Comparators ───────────────────────────────────────────────────────────────

/**
 * Compares two values intelligently based on inferred or specified type.
 * Null / undefined always sorts last regardless of order.
 *
 * @param {any} a
 * @param {any} b
 * @param {'string'|'number'|'date'|'auto'} [type='auto']
 * @returns {number}  negative=a before b, 0=equal, positive=b before a
 */
const compareValues = (a, b, type = 'auto') => {
  // Nulls always last
  const aNil = a === null || a === undefined || a === '';
  const bNil = b === null || b === undefined || b === '';
  if (aNil && bNil) return 0;
  if (aNil) return 1;
  if (bNil) return -1;

  const resolvedType = type === 'auto' ? inferType(a) : type;

  switch (resolvedType) {
    case 'number':
      return Number(a) - Number(b);

    case 'date':
      return String(a).localeCompare(String(b));

    case 'string':
    default:
      return String(a)
        .toLowerCase()
        .localeCompare(String(b).toLowerCase(), undefined, { numeric: true });
  }
};

// ── Primary sort function ─────────────────────────────────────────────────────

/**
 * Returns a sorted COPY of an array of objects.
 * Does not mutate the original array.
 *
 * @template T
 * @param {T[]}    items              - Array of objects to sort
 * @param {string} field              - Object key to sort by
 * @param {'asc'|'desc'} [order='asc']
 * @param {'string'|'number'|'date'|'auto'} [type='auto']
 * @returns {T[]}
 *
 * @example
 *   const sorted = sortData(students, 'name', 'asc');
 *   const byDate = sortData(attendance, 'date', 'desc', 'date');
 */
export const sortData = (items, field, order = SORT_ORDER.ASC, type = 'auto') => {
  if (!Array.isArray(items) || items.length === 0) return [];
  if (!field || typeof field !== 'string') return [...items];

  return [...items].sort((a, b) => {
    const result = compareValues(a?.[field], b?.[field], type);
    return order === SORT_ORDER.DESC ? -result : result;
  });
};

// ── Multi-field sort ──────────────────────────────────────────────────────────

/**
 * Sorts an array by multiple fields in priority order.
 *
 * @template T
 * @param {T[]} items
 * @param {Array<{
 *   field: string,
 *   order?: 'asc' | 'desc',
 *   type?: 'string' | 'number' | 'date' | 'auto',
 * }>} sortCriteria    - Priority-ordered sort criteria
 * @returns {T[]}
 *
 * @example
 *   const sorted = sortDataMulti(records, [
 *     { field: 'date',      order: 'desc', type: 'date' },
 *     { field: 'studentId', order: 'asc',  type: 'string' },
 *   ]);
 */
export const sortDataMulti = (items, sortCriteria) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  if (!Array.isArray(sortCriteria) || sortCriteria.length === 0) return [...items];

  return [...items].sort((a, b) => {
    for (const { field, order = SORT_ORDER.ASC, type = 'auto' } of sortCriteria) {
      const result = compareValues(a?.[field], b?.[field], type);
      if (result !== 0) return order === SORT_ORDER.DESC ? -result : result;
    }
    return 0;
  });
};

// ── Toggle sort order helper ──────────────────────────────────────────────────

/**
 * Returns the opposite sort order — useful for table column header toggling.
 * @param {'asc'|'desc'} currentOrder
 * @returns {'asc'|'desc'}
 */
export const toggleSortOrder = (currentOrder) =>
  currentOrder === SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC;
