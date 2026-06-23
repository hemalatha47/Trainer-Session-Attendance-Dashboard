/**
 * useBatchFilters.js
 * Custom hook for batch filtering state and logic.
 * Module 4.4 — Batch Filters
 *
 * Architecture:
 *   useBatchFilters(allBatches) → { filters, setFilter, resetFilters, filteredBatches, activeFilterCount, trainerOptions, courseOptions }
 *
 * Responsibilities:
 *   - Own all filter state (single source of truth)
 *   - Derive trainer and course option lists dynamically from live batch data
 *   - Apply all filters in order via applyBatchFilters
 *   - Count active filters for the summary badge
 *   - Reset all filters back to defaults
 *
 * Integration:
 *   - Called by BatchListPage alongside useBatches
 *   - filteredBatches replaces the previous simple filtered array in useBatches
 *   - Pagination resets are the caller's responsibility (pass setPage)
 */

import { useState, useCallback, useMemo, useRef } from 'react';

import { DEFAULT_BATCH_FILTERS, QUICK_FILTERS, deriveCourseKey, deriveCourseFromCode } from '@constants/batchFilters';
import { applyBatchFilters } from '@utils/filtering';

// ── Debounce helper (search input) ────────────────────────────────────────────
const useDebounced = (initialValue, delay = 300) => {
  const [raw, setRaw]         = useState(initialValue);
  const [debounced, setDeb]   = useState(initialValue);
  const timerRef              = useRef(null);

  const setDebounced = useCallback((value) => {
    setRaw(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDeb(value), delay);
  }, [delay]);

  return [raw, debounced, setDebounced];
};

// ── useBatchFilters ───────────────────────────────────────────────────────────

/**
 * @param {object[]} allBatches  — raw batch array from useBatches / batchService
 * @param {{ onFilterChange?: () => void }} [options]
 *
 * @returns {{
 *   filters:            object,      — current filter state (search is the raw/instant value)
 *   setFilter:          (key, value) => void,
 *   resetFilters:       () => void,
 *   applyQuickFilter:   (key: string) => void,
 *   filteredBatches:    object[],
 *   activeFilterCount:  number,
 *   trainerOptions:     { value: string, label: string }[],
 *   courseOptions:      { value: string, label: string }[],
 *   hasActiveFilters:   boolean,
 * }}
 */
const useBatchFilters = (allBatches = [], options = {}) => {
  const { onFilterChange } = options;

  // ── Search uses debouncing; other filters are instant ─────────────────────
  const [searchRaw, searchDebounced, setSearch] = useDebounced('', 300);

  // ── All other filter fields ───────────────────────────────────────────────
  const [status,      setStatus]      = useState(DEFAULT_BATCH_FILTERS.status);
  const [trainer,     setTrainer]     = useState(DEFAULT_BATCH_FILTERS.trainer);
  const [course,      setCourse]      = useState(DEFAULT_BATCH_FILTERS.course);
  const [capacityMin, setCapacityMin] = useState(DEFAULT_BATCH_FILTERS.capacityMin);
  const [capacityMax, setCapacityMax] = useState(DEFAULT_BATCH_FILTERS.capacityMax);
  const [startDate,   setStartDate]   = useState(DEFAULT_BATCH_FILTERS.startDate);
  const [endDate,     setEndDate]     = useState(DEFAULT_BATCH_FILTERS.endDate);
  const [activeOnly,  setActiveOnly]  = useState(DEFAULT_BATCH_FILTERS.activeOnly);
  const [quickFilter, setQuickFilter] = useState(DEFAULT_BATCH_FILTERS.quickFilter);

  // ── Consolidated filters object (uses debounced search for filtering) ─────
  const filters = useMemo(() => ({
    search:      searchRaw,       // raw value for the input display
    status,
    trainer,
    course,
    capacityMin,
    capacityMax,
    startDate,
    endDate,
    activeOnly,
    quickFilter,
  }), [searchRaw, status, trainer, course, capacityMin, capacityMax, startDate, endDate, activeOnly, quickFilter]);

  // ── Generic setter ────────────────────────────────────────────────────────
  const setFilter = useCallback((key, value) => {
    const setters = {
      search:      setSearch,
      status:      setStatus,
      trainer:     setTrainer,
      course:      setCourse,
      capacityMin: setCapacityMin,
      capacityMax: setCapacityMax,
      startDate:   setStartDate,
      endDate:     setEndDate,
      activeOnly:  setActiveOnly,
      quickFilter: setQuickFilter,
    };

    const setter = setters[key];
    if (setter) {
      setter(value);
      onFilterChange?.();
    }
  }, [setSearch, onFilterChange]);

  // ── Reset all filters to defaults ─────────────────────────────────────────
  const resetFilters = useCallback(() => {
    setSearch('');
    setStatus(DEFAULT_BATCH_FILTERS.status);
    setTrainer(DEFAULT_BATCH_FILTERS.trainer);
    setCourse(DEFAULT_BATCH_FILTERS.course);
    setCapacityMin(DEFAULT_BATCH_FILTERS.capacityMin);
    setCapacityMax(DEFAULT_BATCH_FILTERS.capacityMax);
    setStartDate(DEFAULT_BATCH_FILTERS.startDate);
    setEndDate(DEFAULT_BATCH_FILTERS.endDate);
    setActiveOnly(DEFAULT_BATCH_FILTERS.activeOnly);
    setQuickFilter(DEFAULT_BATCH_FILTERS.quickFilter);
    onFilterChange?.();
  }, [setSearch, onFilterChange]);

  // ── Quick filter application ──────────────────────────────────────────────
  const applyQuickFilter = useCallback((key) => {
    // Toggle off if same key
    if (quickFilter === key) {
      resetFilters();
      return;
    }

    const preset = QUICK_FILTERS.find((q) => q.key === key);
    if (!preset) return;

    // Resolve filter: function or plain object
    const resolved = typeof preset.filter === 'function'
      ? preset.filter()
      : preset.filter;

    // Reset first, then apply preset values
    setSearch('');
    setStatus(resolved.status      ?? DEFAULT_BATCH_FILTERS.status);
    setTrainer(resolved.trainer    ?? DEFAULT_BATCH_FILTERS.trainer);
    setCourse(resolved.course      ?? DEFAULT_BATCH_FILTERS.course);
    setCapacityMin(resolved.capacityMin ?? DEFAULT_BATCH_FILTERS.capacityMin);
    setCapacityMax(resolved.capacityMax ?? DEFAULT_BATCH_FILTERS.capacityMax);
    setStartDate(resolved.startDate ?? DEFAULT_BATCH_FILTERS.startDate);
    setEndDate(resolved.endDate     ?? DEFAULT_BATCH_FILTERS.endDate);
    setActiveOnly(resolved.activeOnly ?? DEFAULT_BATCH_FILTERS.activeOnly);
    setQuickFilter(key);
    onFilterChange?.();
  }, [quickFilter, resetFilters, setSearch, onFilterChange]);

  // ── Dynamic trainer options (derived from live data) ─────────────────────
  const trainerOptions = useMemo(() => {
    if (!Array.isArray(allBatches)) return [];
    const names = [...new Set(
      allBatches
        .map((b) => b.trainerName)
        .filter(Boolean)
    )].sort();

    return [
      { value: 'all', label: 'All Trainers' },
      ...names.map((n) => ({ value: n, label: n })),
    ];
  }, [allBatches]);

  // ── Dynamic course options (derived from batchCode prefixes) ─────────────
  const courseOptions = useMemo(() => {
    if (!Array.isArray(allBatches)) return [];
    const seen = new Map();
    allBatches.forEach((b) => {
      const key   = deriveCourseKey(b.batchCode);
      const label = deriveCourseFromCode(b.batchCode);
      if (key && !seen.has(key)) seen.set(key, label);
    });

    const sorted = [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    return [
      { value: 'all', label: 'All Courses' },
      ...sorted.map(([value, label]) => ({ value, label })),
    ];
  }, [allBatches]);

  // ── Apply filters (uses debounced search value) ───────────────────────────
  const filteredBatches = useMemo(() => {
    const filtersWithDebounced = { ...filters, search: searchDebounced };
    return applyBatchFilters(allBatches, filtersWithDebounced);
  }, [allBatches, filters, searchDebounced]);

  // ── Active filter count ───────────────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchDebounced)                               count++;
    if (status      !== DEFAULT_BATCH_FILTERS.status)      count++;
    if (trainer     !== DEFAULT_BATCH_FILTERS.trainer)     count++;
    if (course      !== DEFAULT_BATCH_FILTERS.course)      count++;
    if (capacityMin !== DEFAULT_BATCH_FILTERS.capacityMin) count++;
    if (capacityMax !== DEFAULT_BATCH_FILTERS.capacityMax) count++;
    if (startDate   !== DEFAULT_BATCH_FILTERS.startDate)   count++;
    if (endDate     !== DEFAULT_BATCH_FILTERS.endDate)     count++;
    if (activeOnly  !== DEFAULT_BATCH_FILTERS.activeOnly)  count++;
    return count;
  }, [searchDebounced, status, trainer, course, capacityMin, capacityMax, startDate, endDate, activeOnly]);

  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    setFilter,
    resetFilters,
    applyQuickFilter,
    filteredBatches,
    activeFilterCount,
    hasActiveFilters,
    trainerOptions,
    courseOptions,
  };
};

export { useBatchFilters };
export default useBatchFilters;
