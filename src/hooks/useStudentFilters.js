/**
 * useStudentFilters.js
 * Custom hook for student filtering state and logic.
 * Module 5.4 — Student Filters
 *
 * Architecture:
 *   useStudentFilters(allStudents) → {
 *     filters, setFilter, resetFilters, applyQuickFilter,
 *     filteredStudents, activeFilterCount, hasActiveFilters,
 *     batchOptions,
 *   }
 *
 * Responsibilities:
 *   - Own all filter state (single source of truth)
 *   - Derive batch option list dynamically from live student data + mockBatches
 *   - Apply all filters via applyStudentFilters
 *   - Count active filters for the summary badge
 *   - Reset all filters back to defaults
 *
 * Integration:
 *   - Called by StudentListPage alongside useStudents
 *   - filteredStudents replaces the previous searched array in useStudents pipeline
 *   - Pagination reset is the caller's responsibility (pass setPage)
 */

import { useState, useCallback, useMemo, useRef } from 'react';

import {
  DEFAULT_STUDENT_FILTERS,
  STUDENT_QUICK_FILTERS,
  ATTENDANCE_RANGE_OPTIONS,
} from '@constants/studentFilters';
import { applyStudentFilters } from '@utils/filtering';
import { getRiskLevelKey }     from '@utils/riskUtils';
import { mockBatches }         from '@data/mockBatches';

// ── Batch lookup map (id → batchName) — built once at module load ──────────────
const BATCH_LOOKUP = Object.fromEntries(
  mockBatches.map((b) => [b.id, b.batchName])
);

// ── Debounce helper (search input only) ───────────────────────────────────────
const useDebounced = (initialValue, delay = 300) => {
  const [raw, setRaw]       = useState(initialValue);
  const [debounced, setDeb] = useState(initialValue);
  const timerRef            = useRef(null);

  const setDebounced = useCallback((value) => {
    setRaw(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDeb(value), delay);
  }, [delay]);

  return [raw, debounced, setDebounced];
};

// ── useStudentFilters ─────────────────────────────────────────────────────────

/**
 * @param {object[]} allStudents  — raw student array from useStudents / studentService
 * @param {{ onFilterChange?: () => void }} [options]
 *
 * @returns {{
 *   filters:           object,
 *   setFilter:         (key: string, value: any) => void,
 *   resetFilters:      () => void,
 *   applyQuickFilter:  (key: string) => void,
 *   filteredStudents:  object[],
 *   activeFilterCount: number,
 *   hasActiveFilters:  boolean,
 *   batchOptions:      { value: string, label: string }[],
 * }}
 */
const useStudentFilters = (allStudents = [], options = {}) => {
  const { onFilterChange } = options;

  // ── Search is debounced; all other filters are instant ────────────────────
  const [searchRaw, searchDebounced, setSearch] = useDebounced('', 300);

  // ── Individual filter fields ───────────────────────────────────────────────
  const [batch,           setBatch]           = useState(DEFAULT_STUDENT_FILTERS.batch);
  const [status,          setStatus]          = useState(DEFAULT_STUDENT_FILTERS.status);
  const [attendanceRange, setAttendanceRange] = useState(DEFAULT_STUDENT_FILTERS.attendanceRange);
  const [riskLevel,       setRiskLevel]       = useState(DEFAULT_STUDENT_FILTERS.riskLevel);
  const [joinedFrom,      setJoinedFrom]      = useState(DEFAULT_STUDENT_FILTERS.joinedFrom);
  const [joinedTo,        setJoinedTo]        = useState(DEFAULT_STUDENT_FILTERS.joinedTo);
  const [quickFilter,     setQuickFilter]     = useState(DEFAULT_STUDENT_FILTERS.quickFilter);

  // ── Consolidated filters object (raw search for display) ─────────────────
  const filters = useMemo(() => ({
    search: searchRaw,
    batch,
    status,
    attendanceRange,
    riskLevel,
    joinedFrom,
    joinedTo,
    quickFilter,
  }), [searchRaw, batch, status, attendanceRange, riskLevel, joinedFrom, joinedTo, quickFilter]);

  // ── Generic setter ────────────────────────────────────────────────────────
  const setFilter = useCallback((key, value) => {
    const setters = {
      search:          setSearch,
      batch:           setBatch,
      status:          setStatus,
      attendanceRange: setAttendanceRange,
      riskLevel:       setRiskLevel,
      joinedFrom:      setJoinedFrom,
      joinedTo:        setJoinedTo,
      quickFilter:     setQuickFilter,
    };
    const setter = setters[key];
    if (setter) {
      setter(value);
      onFilterChange?.();
    }
  }, [setSearch, onFilterChange]);

  // ── Reset all filters ─────────────────────────────────────────────────────
  const resetFilters = useCallback(() => {
    setSearch('');
    setBatch(DEFAULT_STUDENT_FILTERS.batch);
    setStatus(DEFAULT_STUDENT_FILTERS.status);
    setAttendanceRange(DEFAULT_STUDENT_FILTERS.attendanceRange);
    setRiskLevel(DEFAULT_STUDENT_FILTERS.riskLevel);
    setJoinedFrom(DEFAULT_STUDENT_FILTERS.joinedFrom);
    setJoinedTo(DEFAULT_STUDENT_FILTERS.joinedTo);
    setQuickFilter(DEFAULT_STUDENT_FILTERS.quickFilter);
    onFilterChange?.();
  }, [setSearch, onFilterChange]);

  // ── Quick filter application ──────────────────────────────────────────────
  const applyQuickFilter = useCallback((key) => {
    if (quickFilter === key) {
      resetFilters();
      return;
    }

    const preset = STUDENT_QUICK_FILTERS.find((q) => q.key === key);
    if (!preset) return;

    const resolved = typeof preset.filter === 'function'
      ? preset.filter()
      : preset.filter;

    // Reset to defaults first, then merge preset
    setSearch('');
    setBatch(resolved.batch                ?? DEFAULT_STUDENT_FILTERS.batch);
    setStatus(resolved.status              ?? DEFAULT_STUDENT_FILTERS.status);
    setAttendanceRange(resolved.attendanceRange ?? DEFAULT_STUDENT_FILTERS.attendanceRange);
    setRiskLevel(resolved.riskLevel        ?? DEFAULT_STUDENT_FILTERS.riskLevel);
    setJoinedFrom(resolved.joinedFrom      ?? DEFAULT_STUDENT_FILTERS.joinedFrom);
    setJoinedTo(resolved.joinedTo          ?? DEFAULT_STUDENT_FILTERS.joinedTo);
    setQuickFilter(key);
    onFilterChange?.();
  }, [quickFilter, resetFilters, setSearch, onFilterChange]);

  // ── Dynamic batch options (from live students + batch lookup) ─────────────
  const batchOptions = useMemo(() => {
    if (!Array.isArray(allStudents)) return [{ value: 'all', label: 'All Batches' }];

    const seen = new Set();
    const options = [];

    // Maintain order from mockBatches to keep alphabetical/chronological
    mockBatches.forEach((b) => {
      const hasStudents = allStudents.some((s) => s.batchId === b.id);
      if (hasStudents && !seen.has(b.id)) {
        seen.add(b.id);
        options.push({ value: b.id, label: b.batchName });
      }
    });

    return [{ value: 'all', label: 'All Batches' }, ...options];
  }, [allStudents]);

  // ── Apply all filters (uses debounced search) ─────────────────────────────
  const filteredStudents = useMemo(() => {
    const filtersWithDebounced = { ...filters, search: searchDebounced };
    return applyStudentFilters(allStudents, filtersWithDebounced, {
      rangeOptions: ATTENDANCE_RANGE_OPTIONS,
      getRiskKey:   getRiskLevelKey,
    });
  }, [allStudents, filters, searchDebounced]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Active filter count ───────────────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchDebounced)                                               count++;
    if (batch           !== DEFAULT_STUDENT_FILTERS.batch)           count++;
    if (status          !== DEFAULT_STUDENT_FILTERS.status)          count++;
    if (attendanceRange !== DEFAULT_STUDENT_FILTERS.attendanceRange) count++;
    if (riskLevel       !== DEFAULT_STUDENT_FILTERS.riskLevel)       count++;
    if (joinedFrom      !== DEFAULT_STUDENT_FILTERS.joinedFrom)      count++;
    if (joinedTo        !== DEFAULT_STUDENT_FILTERS.joinedTo)        count++;
    return count;
  }, [searchDebounced, batch, status, attendanceRange, riskLevel, joinedFrom, joinedTo]);

  const hasActiveFilters = activeFilterCount > 0;

  return {
    filters,
    setFilter,
    resetFilters,
    applyQuickFilter,
    filteredStudents,
    activeFilterCount,
    hasActiveFilters,
    batchOptions,
  };
};

export { useStudentFilters };
export default useStudentFilters;
