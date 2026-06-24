/**
 * reportsFilterService.js
 * Module 7.2 — Report Filters & Date Range
 *
 * Pure service layer for filter normalization, validation, and reset helpers.
 * No React, no JSX, no UI logic — pure async functions returning the standard
 * { success, data, meta, error } shape.
 *
 * Blueprint Sections: 4.4, 4.7, 6.7, 9.3
 *
 * Architecture rules:
 *  - All date comparisons use YYYY-MM-DD string ordering (safe lexicographic sort).
 *  - dateUtils functions are the ONLY source of date normalization.
 *  - No direct imports from React — this file must be API-migration-safe.
 *  - All methods are async so hooks can await without branching on mock/live.
 *
 * Methods:
 *  normalizeFilters(raw)         — coerces raw filter input to a clean shape
 *  validateDateRange(from, to)   — validates from <= to; returns error message or null
 *  resetReportFilters()          — returns the canonical default filter state
 *  getFilteredBatches(filters)   — returns batches matching the current filter state
 *  getFilteredStudents(filters)  — returns students matching batch + search filters
 */

import { mockBatches }  from '@data/mockBatches';
import { mockStudents } from '@data/mockStudents';
import { BATCH_STATUS } from '@constants/batchStatus';
import { ok, fail, tryCatch } from '@utils/serviceResponse';
import {
  isValidDateString,
  getToday,
  subtractDays,
  toLocalDateString,
} from '@utils/dateUtils';

// ── Error codes ───────────────────────────────────────────────────────────────

export const FILTER_ERRORS = Object.freeze({
  INVALID_DATE_FORMAT:  'FILTER_INVALID_DATE_FORMAT',
  DATE_RANGE_INVERTED:  'FILTER_DATE_RANGE_INVERTED',
  INVALID_BATCH_ID:     'FILTER_INVALID_BATCH_ID',
  INVALID_STUDENT_ID:   'FILTER_INVALID_STUDENT_ID',
  INVALID_REPORT_TYPE:  'FILTER_INVALID_REPORT_TYPE',
  UNEXPECTED:           'FILTER_UNEXPECTED_ERROR',
});

// ── Valid report type enum ────────────────────────────────────────────────────

export const REPORT_TYPES = Object.freeze({
  ATTENDANCE: 'attendance',
  BATCH:      'batch',
  STUDENT:    'student',
});

export const REPORT_TYPE_LIST = [
  REPORT_TYPES.ATTENDANCE,
  REPORT_TYPES.BATCH,
  REPORT_TYPES.STUDENT,
];

// ── Date preset keys ──────────────────────────────────────────────────────────

export const DATE_PRESETS = Object.freeze({
  TODAY:       'today',
  LAST_7_DAYS: 'last7days',
  LAST_30_DAYS:'last30days',
  CUSTOM:      'custom',
});

export const DATE_PRESET_LIST = [
  { value: DATE_PRESETS.TODAY,        label: 'Today' },
  { value: DATE_PRESETS.LAST_7_DAYS,  label: 'Last 7 Days' },
  { value: DATE_PRESETS.LAST_30_DAYS, label: 'Last 30 Days' },
  { value: DATE_PRESETS.CUSTOM,       label: 'Custom Range' },
];

// ── Default filter state ──────────────────────────────────────────────────────

/**
 * The canonical default filter shape.
 * Every field that appears in useReportFilters state must have a default here.
 *
 * dateRange.preset drives which preset button is highlighted.
 * dateRange.from / .to are the actual YYYY-MM-DD bounds (may be null for "all time").
 * batchId / studentId / reportType control the data selectors.
 */
export const DEFAULT_REPORT_FILTERS = Object.freeze({
  dateRange: {
    preset: DATE_PRESETS.LAST_30_DAYS,
    from:   null,   // resolved by normalizeFilters when preset !== 'custom'
    to:     null,
  },
  batchId:    'all',
  studentId:  'all',
  reportType: REPORT_TYPES.ATTENDANCE,
});

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Resolves a preset key to a { from, to } YYYY-MM-DD pair.
 * Returns { from: null, to: null } for 'custom' (caller supplies own range).
 *
 * @param {string} preset
 * @returns {{ from: string|null, to: string|null }}
 */
const _resolvePresetDates = (preset) => {
  const today = getToday();
  switch (preset) {
    case DATE_PRESETS.TODAY:
      return { from: today, to: today };
    case DATE_PRESETS.LAST_7_DAYS:
      return { from: toLocalDateString(subtractDays(today, 6)), to: today };
    case DATE_PRESETS.LAST_30_DAYS:
      return { from: toLocalDateString(subtractDays(today, 29)), to: today };
    case DATE_PRESETS.CUSTOM:
      return { from: null, to: null };
    default:
      return { from: toLocalDateString(subtractDays(today, 29)), to: today };
  }
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * normalizeFilters(raw)
 *
 * Accepts a raw filter object (possibly partial, possibly containing bad values)
 * and returns a clean, validated filter object safe for the hook to store.
 *
 * - Unknown report types fall back to 'attendance'.
 * - Unknown preset falls back to 'last30days'.
 * - If preset !== 'custom', from/to are resolved from the preset (overriding raw values).
 * - batchId / studentId fall back to 'all' if not a non-empty string.
 *
 * @param {object} raw
 * @returns {Promise<ServiceResponse<typeof DEFAULT_REPORT_FILTERS>>}
 */
export const normalizeFilters = async (raw = {}) =>
  tryCatch(async () => {
    const reportType = REPORT_TYPE_LIST.includes(raw.reportType)
      ? raw.reportType
      : DEFAULT_REPORT_FILTERS.reportType;

    const batchId   = typeof raw.batchId === 'string' && raw.batchId.trim()
      ? raw.batchId.trim()
      : 'all';

    const studentId = typeof raw.studentId === 'string' && raw.studentId.trim()
      ? raw.studentId.trim()
      : 'all';

    // Resolve dateRange
    const rawRange  = raw.dateRange ?? {};
    const preset    = DATE_PRESET_LIST.some((p) => p.value === rawRange.preset)
      ? rawRange.preset
      : DEFAULT_REPORT_FILTERS.dateRange.preset;

    let resolvedFrom = rawRange.from ?? null;
    let resolvedTo   = rawRange.to   ?? null;

    if (preset !== DATE_PRESETS.CUSTOM) {
      // Override from/to with the preset calculation
      const resolved = _resolvePresetDates(preset);
      resolvedFrom   = resolved.from;
      resolvedTo     = resolved.to;
    } else {
      // Custom — validate whatever the user supplied
      if (resolvedFrom && !isValidDateString(resolvedFrom)) resolvedFrom = null;
      if (resolvedTo   && !isValidDateString(resolvedTo))   resolvedTo   = null;
    }

    const normalized = {
      dateRange: {
        preset,
        from: resolvedFrom,
        to:   resolvedTo,
      },
      batchId,
      studentId,
      reportType,
    };

    return ok(normalized);
  });

/**
 * validateDateRange(from, to)
 *
 * Validates that:
 *  - Both dates (if present) are valid YYYY-MM-DD strings.
 *  - from <= to when both are present.
 *
 * Returns null if valid; returns a human-readable error message string if not.
 *
 * @param {string|null} from  YYYY-MM-DD or null
 * @param {string|null} to    YYYY-MM-DD or null
 * @returns {Promise<ServiceResponse<string|null>>}
 */
export const validateDateRange = async (from, to) =>
  tryCatch(async () => {
    if (from && !isValidDateString(from)) {
      return fail(
        FILTER_ERRORS.INVALID_DATE_FORMAT,
        'Start date is not a valid date (expected YYYY-MM-DD).'
      );
    }
    if (to && !isValidDateString(to)) {
      return fail(
        FILTER_ERRORS.INVALID_DATE_FORMAT,
        'End date is not a valid date (expected YYYY-MM-DD).'
      );
    }
    if (from && to && from > to) {
      return fail(
        FILTER_ERRORS.DATE_RANGE_INVERTED,
        'Start date must be on or before the end date.'
      );
    }
    return ok(null);   // null means "no error"
  });

/**
 * resetReportFilters()
 *
 * Returns a fresh copy of the default filter state with from/to resolved
 * from the default preset so the hook never needs to call _resolvePresetDates.
 *
 * @returns {Promise<ServiceResponse<typeof DEFAULT_REPORT_FILTERS>>}
 */
export const resetReportFilters = async () =>
  tryCatch(async () => {
    const { from, to } = _resolvePresetDates(DEFAULT_REPORT_FILTERS.dateRange.preset);
    const defaults = {
      ...DEFAULT_REPORT_FILTERS,
      dateRange: {
        preset: DEFAULT_REPORT_FILTERS.dateRange.preset,
        from,
        to,
      },
    };
    return ok(defaults);
  });

/**
 * getFilteredBatches(filters)
 *
 * Returns the batch list for the batch dropdown selector.
 * Includes 'all' + all active and completed batches (reporting-relevant).
 * Upcoming batches are excluded — they have no attendance records yet.
 *
 * @param {object} [filters]  — current filter state (future: filter by trainer, etc.)
 * @returns {Promise<ServiceResponse<Array>>}
 */
export const getFilteredBatches = async (filters = {}) =>
  tryCatch(async () => {
    const batches = mockBatches
      .filter((b) =>
        b.status === BATCH_STATUS.ACTIVE ||
        b.status === BATCH_STATUS.COMPLETED
      )
      .map((b) => ({
        id:     b.id,
        label:  b.batchName,
        status: b.status,
        code:   b.batchCode,
      }))
      .sort((a, b) => {
        // Active first, then completed
        if (a.status === BATCH_STATUS.ACTIVE && b.status !== BATCH_STATUS.ACTIVE) return -1;
        if (b.status === BATCH_STATUS.ACTIVE && a.status !== BATCH_STATUS.ACTIVE) return  1;
        return a.label.localeCompare(b.label);
      });

    return ok(batches, { total: batches.length });
  });

/**
 * getFilteredStudents(filters)
 *
 * Returns the student list for the student dropdown selector.
 * If filters.batchId is set (not 'all'), returns only students in that batch.
 * Students with status 'inactive' are excluded.
 *
 * @param {object} [filters]  — expects { batchId: string }
 * @returns {Promise<ServiceResponse<Array>>}
 */
export const getFilteredStudents = async (filters = {}) =>
  tryCatch(async () => {
    const { batchId } = filters;

    let students = mockStudents.filter((s) => s.status !== 'inactive');

    if (batchId && batchId !== 'all') {
      students = students.filter((s) => s.batchId === batchId);
    }

    const mapped = students.map((s) => ({
      id:    s.id,
      label: `${s.firstName} ${s.lastName}`.trim(),
      code:  s.studentCode,
      batchId: s.batchId,
    })).sort((a, b) => a.label.localeCompare(b.label));

    return ok(mapped, { total: mapped.length, batchId: batchId ?? 'all' });
  });
