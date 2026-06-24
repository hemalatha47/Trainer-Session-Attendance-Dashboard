/**
 * useAnalyticsFilters.js
 * Module 8.2 — Analytics Filters & Time Range
 *
 * Custom hook that owns all analytics filter state, validation, and side effects.
 * Wraps analyticsFilterService for data operations; exposes a stable API to pages.
 *
 * Hook API:
 *  {
 *    filters,         — current filter state
 *    errors,          — per-field validation error strings
 *    batches,         — available batch options [{ value, label }]
 *    students,        — available student options (scoped to selected batch)
 *    batchLoading,    — true while fetching batch options
 *    studentLoading,  — true while fetching student options
 *    serviceError,    — service-level error string (not a field error)
 *    isFiltered,      — true when any filter differs from defaults
 *    updateFilter,    — (key, value) => void
 *    updateDateRange, — (preset, from?, to?) => void
 *    resetFilters,    — () => void
 *    validateFilters, — () => Promise<boolean>  (true = valid)
 *  }
 *
 * Blueprint Sections: 4.4, 4.7, 6.8, 9.3
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  normalizeAnalyticsFilters,
  validateAnalyticsFilters,
  resetAnalyticsFilters,
  getFilteredBatches,
  getFilteredStudents,
  DEFAULT_ANALYTICS_FILTERS,
  ANALYTICS_DATE_PRESETS,
  resolvePresetDates,
} from '@services/analyticsFilterService';
import {
  getToday,
  toLocalDateString,
  subtractDays,
} from '@utils/dateUtils';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Resolves preset → { from, to } for the initial state computation. */
const resolveInitialDates = (preset) => {
  if (preset === ANALYTICS_DATE_PRESETS.CUSTOM) {
    return { from: null, to: null };
  }
  return resolvePresetDates(preset);
};

/** Empty per-field error shape — avoids re-creating a new object on every render */
const EMPTY_ERRORS = Object.freeze({
  dateFrom:  '',
  dateTo:    '',
  dateRange: '',
  batchId:   '',
  studentId: '',
  metric:    '',
});

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @returns {object}  Filter state, option lists, loading flags, and action callbacks
 */
const useAnalyticsFilters = () => {
  // ── Filter state ────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState(() => {
    const preset = DEFAULT_ANALYTICS_FILTERS.dateRange.preset;
    const { from, to } = resolveInitialDates(preset);
    return {
      ...DEFAULT_ANALYTICS_FILTERS,
      dateRange: { preset, from, to },
    };
  });

  // ── Validation error state ──────────────────────────────────────────────────
  const [errors, setErrors] = useState(EMPTY_ERRORS);

  // ── Option list state ───────────────────────────────────────────────────────
  const [batches, setBatches]               = useState([]);
  const [students, setStudents]             = useState([]);
  const [batchLoading, setBatchLoading]     = useState(true);
  const [studentLoading, setStudentLoading] = useState(false);
  const [serviceError, setServiceError]     = useState(null);

  // ── Load batch options once on mount ───────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const loadBatches = async () => {
      setBatchLoading(true);
      const result = await getFilteredBatches(filters);
      if (cancelled) return;
      if (result.success) {
        setBatches(result.data ?? []);
        setServiceError(null);
      } else {
        setServiceError(result.error?.message ?? 'Failed to load batch options.');
      }
      setBatchLoading(false);
    };
    loadBatches();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reload student options whenever batchId changes ────────────────────────
  useEffect(() => {
    let cancelled = false;
    const loadStudents = async () => {
      setStudentLoading(true);
      const result = await getFilteredStudents({ batchId: filters.batchId });
      if (cancelled) return;
      if (result.success) {
        setStudents(result.data ?? []);
        setServiceError(null);
      } else {
        setServiceError(result.error?.message ?? 'Failed to load student options.');
      }
      setStudentLoading(false);
    };
    loadStudents();
    return () => { cancelled = true; };
  }, [filters.batchId]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  /**
   * updateFilter(key, value)
   *
   * Updates a single top-level filter key.
   * When batchId changes, studentId is reset to 'all' (batch-scope invalidation).
   *
   * @param {string} key
   * @param {*}      value
   */
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      // Reset student selection when batch changes
      if (key === 'batchId') {
        next.studentId = 'all';
      }
      return next;
    });
    // Clear the field-level error on user interaction
    setErrors((prev) => {
      if (prev[key] === undefined) return prev;
      return { ...prev, [key]: '' };
    });
  }, []);

  /**
   * updateDateRange(preset, from?, to?)
   *
   * Updates the date range filter.
   * For non-custom presets, from/to are auto-resolved from the preset.
   * For 'custom', caller must provide from and to.
   *
   * @param {string}       preset
   * @param {string|null}  [from]
   * @param {string|null}  [to]
   */
  const updateDateRange = useCallback((preset, from, to) => {
    setFilters((prev) => {
      if (preset !== ANALYTICS_DATE_PRESETS.CUSTOM) {
        const resolved = resolvePresetDates(preset);
        return {
          ...prev,
          dateRange: { preset, from: resolved.from, to: resolved.to },
        };
      }
      // Custom — caller supplies from/to directly
      return {
        ...prev,
        dateRange: {
          preset,
          from: from ?? prev.dateRange.from,
          to:   to   ?? prev.dateRange.to,
        },
      };
    });
    // Clear date-related errors on change
    setErrors((prev) => ({
      ...prev,
      dateFrom:  '',
      dateTo:    '',
      dateRange: '',
    }));
  }, []);

  /**
   * resetFilters()
   *
   * Resets all filters to their defaults and clears validation errors.
   */
  const resetFilters = useCallback(async () => {
    const result = await resetAnalyticsFilters();
    if (result.success) {
      setFilters(result.data);
    } else {
      // Fallback to synchronous default if service fails
      const preset = DEFAULT_ANALYTICS_FILTERS.dateRange.preset;
      const { from, to } = resolveInitialDates(preset);
      setFilters({
        ...DEFAULT_ANALYTICS_FILTERS,
        dateRange: { preset, from, to },
      });
    }
    setErrors(EMPTY_ERRORS);
  }, []);

  /**
   * validateFilters()
   *
   * Runs full filter validation via the service layer.
   * Sets per-field errors in state.
   *
   * @returns {Promise<boolean>}  true when all filters are valid
   */
  const validateFilters = useCallback(async () => {
    const result = await validateAnalyticsFilters(filters);
    if (result.success) {
      setErrors({ ...EMPTY_ERRORS, ...result.data.errors });
      return result.data.isValid;
    }
    // Service failure — treat as valid to avoid blocking the user
    return true;
  }, [filters]);

  // ── Derived: isFiltered ─────────────────────────────────────────────────────

  const isFiltered = useMemo(() => {
    const def = DEFAULT_ANALYTICS_FILTERS;
    return (
      filters.dateRange.preset !== def.dateRange.preset ||
      filters.batchId          !== def.batchId          ||
      filters.studentId        !== def.studentId        ||
      filters.metric           !== def.metric
    );
  }, [filters]);

  // ── Build option arrays for selectors ──────────────────────────────────────

  const batchOptions = useMemo(
    () => [{ value: 'all', label: 'All Batches' }, ...batches],
    [batches]
  );

  const studentOptions = useMemo(
    () => [{ value: 'all', label: 'All Students' }, ...students],
    [students]
  );

  return {
    filters,
    errors,
    batches:        batchOptions,
    students:       studentOptions,
    batchLoading,
    studentLoading,
    serviceError,
    isFiltered,
    updateFilter,
    updateDateRange,
    resetFilters,
    validateFilters,
  };
};

export default useAnalyticsFilters;
