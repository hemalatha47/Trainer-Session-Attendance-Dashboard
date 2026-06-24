/**
 * analyticsFilterService.js
 * Module 8.2 — Analytics Filters & Time Range
 *
 * Pure service layer for analytics filter normalization, validation, and reset.
 * No React, no JSX — pure async functions returning the standard
 * { success, data, meta, error } shape.
 *
 * Architecture rules:
 *  - All date comparisons use YYYY-MM-DD string ordering (safe lexicographic).
 *  - dateUtils functions are the ONLY source of date normalization.
 *  - No direct React imports — API-migration-safe.
 *  - All methods are async so hooks can await without branching.
 *
 * Methods:
 *  getDefaultAnalyticsFilters()    — returns the canonical default filter state
 *  normalizeAnalyticsFilters(raw)  — coerces raw filter input to a clean shape
 *  validateAnalyticsFilters(f)     — validates the full filter object; returns errors
 *  resetAnalyticsFilters()         — alias for getDefaultAnalyticsFilters()
 *  getFilteredBatches(filters)     — returns batches valid for analytics
 *  getFilteredStudents(filters)    — returns students scoped to selected batch
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
  getStartOfMonth,
  getEndOfMonth,
} from '@utils/dateUtils';

// ── Error codes ───────────────────────────────────────────────────────────────

export const ANALYTICS_FILTER_ERRORS = Object.freeze({
  INVALID_DATE_FORMAT:  'ANALYTICS_FILTER_INVALID_DATE_FORMAT',
  DATE_RANGE_INVERTED:  'ANALYTICS_FILTER_DATE_RANGE_INVERTED',
  DATE_RANGE_REQUIRED:  'ANALYTICS_FILTER_DATE_RANGE_REQUIRED',
  FUTURE_DATE:          'ANALYTICS_FILTER_FUTURE_DATE',
  INVALID_BATCH_ID:     'ANALYTICS_FILTER_INVALID_BATCH_ID',
  INVALID_STUDENT_ID:   'ANALYTICS_FILTER_INVALID_STUDENT_ID',
  INVALID_METRIC:       'ANALYTICS_FILTER_INVALID_METRIC',
  UNEXPECTED:           'ANALYTICS_FILTER_UNEXPECTED',
});

// ── Date presets ──────────────────────────────────────────────────────────────

export const ANALYTICS_DATE_PRESETS = Object.freeze({
  TODAY:        'today',
  LAST_7_DAYS:  'last7days',
  LAST_30_DAYS: 'last30days',
  THIS_MONTH:   'thisMonth',
  CUSTOM:       'custom',
});

export const ANALYTICS_DATE_PRESET_LIST = [
  { value: ANALYTICS_DATE_PRESETS.TODAY,        label: 'Today' },
  { value: ANALYTICS_DATE_PRESETS.LAST_7_DAYS,  label: 'Last 7 Days' },
  { value: ANALYTICS_DATE_PRESETS.LAST_30_DAYS, label: 'Last 30 Days' },
  { value: ANALYTICS_DATE_PRESETS.THIS_MONTH,   label: 'This Month' },
  { value: ANALYTICS_DATE_PRESETS.CUSTOM,       label: 'Custom Range' },
];

// ── Metric options ────────────────────────────────────────────────────────────

export const ANALYTICS_METRICS = Object.freeze({
  ATTENDANCE_PCT:     'attendance_pct',
  PRESENT_COUNT:      'present_count',
  ABSENT_COUNT:       'absent_count',
  RISK_SCORE:         'risk_score',
  PERFORMANCE_TREND:  'performance_trend',
});

export const ANALYTICS_METRIC_LIST = [
  { value: ANALYTICS_METRICS.ATTENDANCE_PCT,    label: 'Attendance %' },
  { value: ANALYTICS_METRICS.PRESENT_COUNT,     label: 'Present Count' },
  { value: ANALYTICS_METRICS.ABSENT_COUNT,      label: 'Absent Count' },
  { value: ANALYTICS_METRICS.RISK_SCORE,        label: 'Risk Score' },
  { value: ANALYTICS_METRICS.PERFORMANCE_TREND, label: 'Performance Trend' },
];

const VALID_METRICS = new Set(Object.values(ANALYTICS_METRICS));
const VALID_PRESETS = new Set(Object.values(ANALYTICS_DATE_PRESETS));

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Resolves a preset key to a { from, to } YYYY-MM-DD pair.
 * Returns { from: null, to: null } for 'custom' — caller supplies own range.
 *
 * @param {string} preset
 * @returns {{ from: string|null, to: string|null }}
 */
export const resolvePresetDates = (preset) => {
  const today = getToday();
  switch (preset) {
    case ANALYTICS_DATE_PRESETS.TODAY:
      return { from: today, to: today };
    case ANALYTICS_DATE_PRESETS.LAST_7_DAYS:
      return { from: toLocalDateString(subtractDays(today, 6)), to: today };
    case ANALYTICS_DATE_PRESETS.LAST_30_DAYS:
      return { from: toLocalDateString(subtractDays(today, 29)), to: today };
    case ANALYTICS_DATE_PRESETS.THIS_MONTH:
      return { from: getStartOfMonth(today), to: getEndOfMonth(today) };
    case ANALYTICS_DATE_PRESETS.CUSTOM:
      return { from: null, to: null };
    default:
      return { from: toLocalDateString(subtractDays(today, 29)), to: today };
  }
};

// ── Default filter state ──────────────────────────────────────────────────────

/**
 * The canonical default analytics filter shape.
 * Every field must have a default here for useAnalyticsFilters state init.
 */
export const DEFAULT_ANALYTICS_FILTERS = Object.freeze({
  dateRange: {
    preset: ANALYTICS_DATE_PRESETS.LAST_30_DAYS,
    from:   null, // resolved by normalizeAnalyticsFilters
    to:     null,
  },
  batchId:   'all',
  studentId: 'all',
  metric:    ANALYTICS_METRICS.ATTENDANCE_PCT,
});

// ── Public methods ────────────────────────────────────────────────────────────

/**
 * getDefaultAnalyticsFilters()
 *
 * Returns the canonical default filter state with resolved date range.
 *
 * @returns {Promise<ServiceResponse>}
 */
export const getDefaultAnalyticsFilters = async () =>
  tryCatch(async () => {
    const { from, to } = resolvePresetDates(DEFAULT_ANALYTICS_FILTERS.dateRange.preset);
    return ok({
      ...DEFAULT_ANALYTICS_FILTERS,
      dateRange: {
        preset: DEFAULT_ANALYTICS_FILTERS.dateRange.preset,
        from,
        to,
      },
    });
  });

/**
 * normalizeAnalyticsFilters(raw)
 *
 * Coerces a raw filter object into the canonical shape.
 * - Resolves preset → from/to if preset is not 'custom'
 * - Ensures batchId and studentId are strings ('all' fallback)
 * - Ensures metric is a valid enum value (falls back to ATTENDANCE_PCT)
 *
 * @param {object} raw
 * @returns {Promise<ServiceResponse>}
 */
export const normalizeAnalyticsFilters = async (raw = {}) =>
  tryCatch(async () => {
    const preset = VALID_PRESETS.has(raw?.dateRange?.preset)
      ? raw.dateRange.preset
      : DEFAULT_ANALYTICS_FILTERS.dateRange.preset;

    let from = raw?.dateRange?.from ?? null;
    let to   = raw?.dateRange?.to   ?? null;

    // For non-custom presets, always recompute from/to from the preset
    if (preset !== ANALYTICS_DATE_PRESETS.CUSTOM) {
      const resolved = resolvePresetDates(preset);
      from = resolved.from;
      to   = resolved.to;
    }

    const batchId   = raw?.batchId   ?? 'all';
    const studentId = raw?.studentId ?? 'all';
    const metric    = VALID_METRICS.has(raw?.metric)
      ? raw.metric
      : ANALYTICS_METRICS.ATTENDANCE_PCT;

    return ok({
      dateRange: { preset, from, to },
      batchId,
      studentId,
      metric,
    });
  });

/**
 * validateAnalyticsFilters(filters)
 *
 * Validates the full analytics filter object.
 * Returns an errors object with per-field messages (empty string = no error).
 *
 * Validation rules:
 *  - For custom preset: both from and to must be valid YYYY-MM-DD strings
 *  - from must be <= to (no inverted ranges)
 *  - from and to must not be in the future (analytics can only show past data)
 *  - batchId must be 'all' or a valid batch id
 *  - studentId must be 'all' or a valid student id (scoped to batchId)
 *  - metric must be a valid enum value
 *
 * @param {object} filters
 * @returns {Promise<ServiceResponse>} data = { isValid: boolean, errors: object }
 */
export const validateAnalyticsFilters = async (filters = {}) =>
  tryCatch(async () => {
    const errors = {
      dateFrom:   '',
      dateTo:     '',
      dateRange:  '',
      batchId:    '',
      studentId:  '',
      metric:     '',
    };

    const { dateRange, batchId, studentId, metric } = filters;
    const today = getToday();

    // ── Date range validation ──────────────────────────────────────────────
    if (dateRange?.preset === ANALYTICS_DATE_PRESETS.CUSTOM) {
      if (!dateRange.from) {
        errors.dateFrom = 'Start date is required for custom range.';
      } else if (!isValidDateString(dateRange.from)) {
        errors.dateFrom = 'Start date must be a valid date (YYYY-MM-DD).';
      } else if (dateRange.from > today) {
        errors.dateFrom = 'Start date cannot be in the future.';
      }

      if (!dateRange.to) {
        errors.dateTo = 'End date is required for custom range.';
      } else if (!isValidDateString(dateRange.to)) {
        errors.dateTo = 'End date must be a valid date (YYYY-MM-DD).';
      } else if (dateRange.to > today) {
        errors.dateTo = 'End date cannot be in the future.';
      }

      if (!errors.dateFrom && !errors.dateTo && dateRange.from && dateRange.to) {
        if (dateRange.from > dateRange.to) {
          errors.dateRange = 'Start date must be on or before end date.';
        }
      }
    }

    // ── Batch validation ───────────────────────────────────────────────────
    if (batchId && batchId !== 'all') {
      const exists = mockBatches.some((b) => b.id === batchId);
      if (!exists) {
        errors.batchId = 'Selected batch is no longer available.';
      }
    }

    // ── Student validation ─────────────────────────────────────────────────
    if (studentId && studentId !== 'all') {
      const student = mockStudents.find((s) => s.id === studentId);
      if (!student) {
        errors.studentId = 'Selected student is no longer available.';
      } else if (batchId && batchId !== 'all' && student.batchId !== batchId) {
        errors.studentId = 'Selected student does not belong to the selected batch.';
      }
    }

    // ── Metric validation ──────────────────────────────────────────────────
    if (!VALID_METRICS.has(metric)) {
      errors.metric = 'Invalid metric selected.';
    }

    const isValid = Object.values(errors).every((v) => v === '');
    return ok({ isValid, errors });
  });

/**
 * resetAnalyticsFilters()
 *
 * Returns the default filter state (with resolved preset dates).
 * Alias for getDefaultAnalyticsFilters().
 *
 * @returns {Promise<ServiceResponse>}
 */
export const resetAnalyticsFilters = getDefaultAnalyticsFilters;

/**
 * getFilteredBatches(filters)
 *
 * Returns batch options appropriate for analytics selectors.
 * Includes all batches (active + completed) since analytics is retrospective.
 * Excludes upcoming batches with no attendance data.
 *
 * @param {object} [filters]
 * @returns {Promise<ServiceResponse>} data = [{ value, label }]
 */
export const getFilteredBatches = async (filters = {}) =>
  tryCatch(async () => {
    // Analytics includes active and completed batches (upcoming have no data)
    const validStatuses = new Set([BATCH_STATUS.ACTIVE, BATCH_STATUS.COMPLETED]);
    const batches = mockBatches
      .filter((b) => validStatuses.has(b.status))
      .map((b) => ({ value: b.id, label: b.name, status: b.status }));

    return ok(batches, { total: batches.length });
  });

/**
 * getFilteredStudents(filters)
 *
 * Returns student options scoped to the currently selected batch.
 * If batchId is 'all', returns all active students across all batches.
 *
 * @param {object} [filters]
 * @param {string} [filters.batchId]
 * @returns {Promise<ServiceResponse>} data = [{ value, label }]
 */
export const getFilteredStudents = async (filters = {}) =>
  tryCatch(async () => {
    const { batchId } = filters;

    const students = mockStudents
      .filter((s) => {
        if (!s.isActive) return false;
        if (batchId && batchId !== 'all') return s.batchId === batchId;
        return true;
      })
      .map((s) => ({ value: s.id, label: s.name, batchId: s.batchId }));

    return ok(students, { total: students.length });
  });
