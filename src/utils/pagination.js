/**
 * pagination.js
 * Reusable, stateless pagination utility.
 * Module: B3.4
 *
 * Used by all service methods that return paginated lists.
 * Hooks and pages receive a consistent { data, meta } shape regardless of
 * which entity is being paginated.
 *
 * DEFAULT_PAGE_SIZE is imported from constants/validation to keep all
 * pagination defaults in one place.
 */

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@constants/validation';

// ── Types (JSDoc) ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} PaginationMeta
 * @property {number} total       - Total items in the un-paged dataset
 * @property {number} page        - Current page (1-indexed)
 * @property {number} pageSize    - Items per page
 * @property {number} totalPages  - Total number of pages
 * @property {number} from        - Index of first item on this page (1-indexed, display)
 * @property {number} to          - Index of last item on this page (1-indexed, display)
 * @property {boolean} hasNext    - True if a next page exists
 * @property {boolean} hasPrev    - True if a previous page exists
 */

// ── Core paginate function ────────────────────────────────────────────────────

/**
 * Slices an array to the requested page and returns the slice with rich meta.
 *
 * @template T
 * @param {T[]}    items             - The full un-paged array
 * @param {number} [page=1]          - Requested page number (1-indexed)
 * @param {number} [pageSize]        - Items per page (defaults to DEFAULT_PAGE_SIZE)
 * @returns {{ data: T[], meta: PaginationMeta }}
 *
 * @example
 *   const { data, meta } = paginate(students, 2, 10);
 *   // data = students[10..19], meta.totalPages = ceil(students.length / 10)
 */
export const paginate = (items, page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  if (!Array.isArray(items)) {
    return {
      data: [],
      meta: buildPaginationMeta(0, 1, pageSize),
    };
  }

  const safePageSize = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);
  const total        = items.length;
  const totalPages   = Math.ceil(total / safePageSize) || 1;
  const safePage     = Math.max(1, Math.min(page, totalPages));

  const startIdx  = (safePage - 1) * safePageSize;
  const endIdx    = Math.min(startIdx + safePageSize, total);
  const data      = items.slice(startIdx, endIdx);

  return {
    data,
    meta: {
      total,
      page:       safePage,
      pageSize:   safePageSize,
      totalPages,
      from:       total === 0 ? 0 : startIdx + 1,
      to:         endIdx,
      hasNext:    safePage < totalPages,
      hasPrev:    safePage > 1,
    },
  };
};

// ── Meta builder (without slicing) ───────────────────────────────────────────

/**
 * Builds pagination meta from totals — useful when pagination is done server-side
 * and you only have count information.
 *
 * @param {number} total
 * @param {number} [page=1]
 * @param {number} [pageSize]
 * @returns {PaginationMeta}
 */
export const buildPaginationMeta = (
  total,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
) => {
  const safePageSize = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);
  const totalPages   = Math.ceil(total / safePageSize) || 1;
  const safePage     = Math.max(1, Math.min(page, totalPages));
  const startIdx     = (safePage - 1) * safePageSize;
  const endIdx       = Math.min(startIdx + safePageSize, total);

  return {
    total,
    page:       safePage,
    pageSize:   safePageSize,
    totalPages,
    from:       total === 0 ? 0 : startIdx + 1,
    to:         endIdx,
    hasNext:    safePage < totalPages,
    hasPrev:    safePage > 1,
  };
};

// ── Page count helper ─────────────────────────────────────────────────────────

/**
 * Returns the number of pages for a given total and page size.
 * @param {number} total
 * @param {number} [pageSize]
 * @returns {number}
 */
export const getTotalPages = (total, pageSize = DEFAULT_PAGE_SIZE) =>
  Math.ceil(total / Math.max(1, pageSize)) || 1;

// ── Offset helper ─────────────────────────────────────────────────────────────

/**
 * Converts a 1-indexed page and page size to a 0-indexed start offset.
 * @param {number} page
 * @param {number} [pageSize]
 * @returns {number}
 */
export const pageToOffset = (page, pageSize = DEFAULT_PAGE_SIZE) =>
  (Math.max(1, page) - 1) * Math.max(1, pageSize);
