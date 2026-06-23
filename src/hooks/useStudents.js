/**
 * useStudents.js
 * Custom hook for the Student List Page (Module 5.1 / 5.3).
 *
 * Responsibilities:
 *   - Load all students from studentService
 *   - Client-side search (name, code, email, phone)
 *   - Client-side sort
 *   - Pagination (10 per page)
 *   - KPI summary (total, active, avg attendance, low-attendance count)
 *   - reload() for after create/edit/delete operations
 *
 * Returns a stable API consumed by StudentListPage.
 *
 * @module useStudents
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getStudents } from '@services/studentService';
import { sortData, SORT_ORDER } from '@utils/sorting';

// ── Constants ─────────────────────────────────────────────────────────────────
const PAGE_SIZE              = 10;
const DEFAULT_SORT_FIELD     = 'enrollmentDate';
const DEFAULT_SORT_ORDER     = SORT_ORDER.DESC;
const LOW_ATTENDANCE_THRESHOLD = 75;

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @returns {{
 *   students:         Array,        — current page of students
 *   filteredStudents: Array,        — all students after search+sort (pre-paginate)
 *   loading:          boolean,
 *   error:            string | null,
 *   searchTerm:       string,
 *   setSearchTerm:    (s: string) => void,
 *   sortConfig:       { field: string, order: string },
 *   toggleSort:       (field: string) => void,
 *   page:             number,
 *   setPage:          (p: number) => void,
 *   pagination:       object,
 *   kpi:              object,
 *   reload:           () => void,
 * }}
 */
const useStudents = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [searchTerm,  setSearchTermRaw] = useState('');
  const [sortConfig,  setSortConfig]  = useState({
    field: DEFAULT_SORT_FIELD,
    order: DEFAULT_SORT_ORDER,
  });
  const [page,        setPage]        = useState(1);
  const [tick,        setTick]        = useState(0);

  // Wrap setSearchTerm to reset to page 1 on new search
  const setSearchTerm = useCallback((term) => {
    setSearchTermRaw(term);
    setPage(1);
  }, []);

  // ── Load all students ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const res = await getStudents({ includeInactive: false });

      if (cancelled) return;

      if (res.success) {
        setAllStudents(res.data ?? []);
      } else {
        setError(res.error?.message ?? 'Failed to load students');
      }

      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  // ── Search filter ──────────────────────────────────────────────────────────
  const searched = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allStudents;

    return allStudents.filter((s) => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      return (
        fullName.includes(q) ||
        (s.studentCode?.toLowerCase().includes(q)) ||
        (s.email?.toLowerCase().includes(q)) ||
        (s.phone?.includes(q))
      );
    });
  }, [allStudents, searchTerm]);

  // ── Sort ───────────────────────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    // Map sort field names used in the table header to actual student object keys
    const fieldMap = {
      fullName:             'firstName',
      studentCode:          'studentCode',
      attendancePercentage: 'attendancePercentage',
      enrollmentDate:       'enrollmentDate',
    };
    const actualField = fieldMap[sortConfig.field] ?? sortConfig.field;
    return sortData(searched, actualField, sortConfig.order);
  }, [searched, sortConfig]);

  // ── Toggle sort ────────────────────────────────────────────────────────────
  const toggleSort = useCallback((field) => {
    setSortConfig((prev) => ({
      field,
      order:
        prev.field === field && prev.order === SORT_ORDER.ASC
          ? SORT_ORDER.DESC
          : SORT_ORDER.ASC,
    }));
    setPage(1);
  }, []);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const pagination = useMemo(() => {
    const total      = filteredStudents.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage   = Math.min(page, totalPages);
    const from       = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
    const to         = Math.min(safePage * PAGE_SIZE, total);

    return {
      page:       safePage,
      totalPages,
      total,
      from,
      to,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    };
  }, [filteredStudents.length, page]);

  const students = useMemo(() => {
    const { page: safePage } = pagination;
    return filteredStudents.slice(
      (safePage - 1) * PAGE_SIZE,
      safePage * PAGE_SIZE
    );
  }, [filteredStudents, pagination]);

  // ── KPI summary ────────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const total       = allStudents.length;
    const active      = allStudents.filter((s) => s.status === 'active').length;
    const percentages = allStudents
      .map((s) => s.attendancePercentage)
      .filter((p) => typeof p === 'number');
    const avgAttendance =
      percentages.length > 0
        ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
        : 0;
    const lowAttendance = allStudents.filter(
      (s) =>
        typeof s.attendancePercentage === 'number' &&
        s.attendancePercentage < LOW_ATTENDANCE_THRESHOLD
    ).length;

    return { total, active, avgAttendance, lowAttendance };
  }, [allStudents]);

  return {
    students,
    filteredStudents,
    allStudents,      // Module 5.4: exposed for useStudentFilters
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortConfig,
    toggleSort,
    page,
    setPage,
    pagination,
    kpi,
    reload,
  };
};

export default useStudents;
