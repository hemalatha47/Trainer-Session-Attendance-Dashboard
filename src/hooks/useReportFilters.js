/**
 * useReportFilters.js
 * Module 7.2 — Report Filters & Date Range
 *
 * Custom hook that owns all report filter state, validation, and side effects.
 * Wraps reportsFilterService for data operations; exposes a stable API to pages.
 *
 * Hook API:
 *  {
 *    filters,          — current filter state
 *    errors,           — per-field validation error strings
 *    batches,          — available batch options for the batch selector
 *    students,         — available student options (scoped to selected batch)
 *    batchLoading,     — true while fetching batch options
 *    studentLoading,   — true while fetching student options
 *    serviceError,     — service-level error string (not a field error)
 *    updateFilter,     — (key, value) => void
 *    updateDateRange,  — (preset, from?, to?) => void
 *    resetFilters,     — () => void
 *    validateFilters,  — () => boolean (true = valid)
 *  }
 *
 * Blueprint Sections: 4.4, 4.7, 6.7, 9.3
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  normalizeFilters,
  validateDateRange,
  resetReportFilters,
  getFilteredBatches,
  getFilteredStudents,
  DEFAULT_REPORT_FILTERS,
  DATE_PRESETS,
} from '@services/reportsFilterService';
import {
  getToday,
  toLocalDateString,
  subtractDays,
  isValidDateString,
} from '@utils/dateUtils';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Resolves preset → { from, to } YYYY-MM-DD */
const resolvePresetDates = (preset) => {
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

/** Empty error shape — avoids re-creating a new object on every render */
const EMPTY_ERRORS = Object.freeze({
  dateFrom:   '',
  dateTo:     '',
  dateRange:  '',
  batchId:    '',
  studentId:  '',
  reportType: '',
});

// ── Hook ──────────────────────────────────────────────────────────────────────

const useReportFilters = () => {
  // ── Filter state ────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState(() => {
    const { from, to } = resolvePresetDates(DEFAULT_REPORT_FILTERS.dateRange.preset);
    return {
      ...DEFAULT_REPORT_FILTERS,
      dateRange: {
        preset: DEFAULT_REPORT_FILTERS.dateRange.preset,
        from,
        to,
      },
    };
  });

  // ── Validation errors ───────────────────────────────────────────────────────
  const [errors, setErrors] = useState(EMPTY_ERRORS);

  // ── Batch options ───────────────────────────────────────────────────────────
  const [batches, setBatches]         = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError]   = useState('');

  // ── Student options ─────────────────────────────────────────────────────────
  const [students, setStudents]           = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError]   = useState('');

  // ── Aggregated service error ────────────────────────────────────────────────
  const serviceError = batchError || studentError || '';

  // ── Load batch list on mount ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setBatchLoading(true);
      setBatchError('');
      try {
        const result = await getFilteredBatches({});
        if (cancelled) return;
        if (result.success) {
          setBatches(result.data);
        } else {
          setBatchError(result.error?.message ?? 'Could not load batches.');
        }
      } catch {
        if (!cancelled) setBatchError('Could not load batches.');
      } finally {
        if (!cancelled) setBatchLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Reload student list whenever batchId changes ────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setStudentLoading(true);
      setStudentError('');
      try {
        const result = await getFilteredStudents({ batchId: filters.batchId });
        if (cancelled) return;
        if (result.success) {
          setStudents(result.data);
        } else {
          setStudentError(result.error?.message ?? 'Could not load students.');
        }
      } catch {
        if (!cancelled) setStudentError('Could not load students.');
      } finally {
        if (!cancelled) setStudentLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [filters.batchId]);

  // ── When batchId changes, reset studentId back to 'all' ────────────────────
  // (tracked separately to avoid infinite loops with the effect above)
  const prevBatchRef = { current: filters.batchId };

  // ── Actions ─────────────────────────────────────────────────────────────────

  /**
   * updateFilter(key, value)
   * Generic setter for top-level filter keys: batchId, studentId, reportType.
   * Clears the matching error on change.
   */
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      // If batchId changes, reset studentId to 'all' to avoid stale selections
      if (key === 'batchId') next.studentId = 'all';
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: '' }));
  }, []);

  /**
   * updateDateRange(preset, from?, to?)
   * Updates the dateRange sub-object.
   * When preset !== 'custom', from/to are resolved automatically.
   * When preset === 'custom', caller must supply from/to.
   */
  const updateDateRange = useCallback((preset, from, to) => {
    setFilters((prev) => {
      let resolvedFrom = from ?? prev.dateRange.from;
      let resolvedTo   = to   ?? prev.dateRange.to;

      if (preset !== DATE_PRESETS.CUSTOM) {
        const resolved = resolvePresetDates(preset);
        resolvedFrom   = resolved.from;
        resolvedTo     = resolved.to;
      }

      return {
        ...prev,
        dateRange: { preset, from: resolvedFrom, to: resolvedTo },
      };
    });
    // Clear date errors on any dateRange change
    setErrors((prev) => ({ ...prev, dateFrom: '', dateTo: '', dateRange: '' }));
  }, []);

  /**
   * resetFilters()
   * Restores all filters to their canonical defaults and clears errors.
   */
  const resetFilters = useCallback(async () => {
    const result = await resetReportFilters();
    if (result.success) {
      setFilters(result.data);
    } else {
      // Fallback: resolve locally
      const { from, to } = resolvePresetDates(DEFAULT_REPORT_FILTERS.dateRange.preset);
      setFilters({
        ...DEFAULT_REPORT_FILTERS,
        dateRange: { preset: DEFAULT_REPORT_FILTERS.dateRange.preset, from, to },
      });
    }
    setErrors(EMPTY_ERRORS);
  }, []);

  /**
   * validateFilters()
   * Validates the current filter state.
   * Returns true if valid; false if any error was found.
   * Sets the errors state so UI can display field-level messages.
   */
  const validateFilters = useCallback(async () => {
    const nextErrors = { ...EMPTY_ERRORS };
    let isValid = true;

    const { dateRange } = filters;

    // Only validate date fields when using custom range
    if (dateRange.preset === DATE_PRESETS.CUSTOM) {
      if (dateRange.from && !isValidDateString(dateRange.from)) {
        nextErrors.dateFrom = 'Enter a valid start date (DD/MM/YYYY).';
        isValid = false;
      }
      if (dateRange.to && !isValidDateString(dateRange.to)) {
        nextErrors.dateTo = 'Enter a valid end date (DD/MM/YYYY).';
        isValid = false;
      }
      if (
        dateRange.from && dateRange.to &&
        isValidDateString(dateRange.from) &&
        isValidDateString(dateRange.to)
      ) {
        const rangeResult = await validateDateRange(dateRange.from, dateRange.to);
        if (rangeResult.success && rangeResult.data !== null) {
          // validateDateRange returns a fail() response with the message
        }
        if (!rangeResult.success) {
          nextErrors.dateRange = rangeResult.error?.message ?? 'Invalid date range.';
          isValid = false;
        }
      }
    }

    setErrors(nextErrors);
    return isValid;
  }, [filters]);

  // ── Memoized batch + student select options ──────────────────────────────────
  const batchOptions = useMemo(
    () => [
      { value: 'all', label: 'All Batches' },
      ...batches.map((b) => ({ value: b.id, label: b.label })),
    ],
    [batches]
  );

  const studentOptions = useMemo(
    () => [
      { value: 'all', label: 'All Students' },
      ...students.map((s) => ({ value: s.id, label: `${s.label} (${s.code})` })),
    ],
    [students]
  );

  // ── Return ───────────────────────────────────────────────────────────────────
  return {
    filters,
    errors,
    batches,
    batchOptions,
    students,
    studentOptions,
    batchLoading,
    studentLoading,
    serviceError,
    updateFilter,
    updateDateRange,
    resetFilters,
    validateFilters,
  };
};

export default useReportFilters;
