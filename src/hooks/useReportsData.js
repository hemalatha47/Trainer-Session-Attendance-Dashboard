/**
 * useReportsData.js
 * Module 7.3 — Report Tables & Summary Views
 *
 * Loads filtered report data for all three table views plus summary cards.
 * Exposes pagination, sorting, loading, error, and refresh.
 *
 * Hook API:
 *  {
 *    reportData,     — array of rows for the active report type
 *    summaryCards,   — { totalSessions, avgAttendance, lowAttendanceBatches, atRiskStudents }
 *    loading,        — boolean
 *    error,          — string | null
 *    pagination,     — { page, pageSize, total, totalPages, hasNext, hasPrev }
 *    setPage,        — (n: number) => void
 *    sortConfig,     — { key: string | null, dir: 'asc' | 'desc' }
 *    setSortConfig,  — ({ key, dir }) => void
 *    refresh,        — () => void
 *  }
 *
 * Blueprint Sections: 4.5, 4.6, 6.7, 9.4, 9.5
 */

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useAppContext } from '@context/AppContext';
import {
  getAttendanceReport,
  getBatchReport,
  getStudentReport,
  getReportSummaryCards,
} from '@services/reportsTableService';
import { paginate } from '@utils/pagination';

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const DEFAULT_SUMMARY = {
  totalSessions:       0,
  avgAttendance:       0,
  lowAttendanceBatches: 0,
  atRiskStudents:      0,
};

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @param {object}  filters        — from useReportFilters
 * @param {string}  filters.reportType  — 'attendance' | 'batch' | 'student'
 * @param {object}  filters.dateRange   — { from, to }
 * @param {string}  filters.batchId     — 'all' or a specific batchId
 * @param {string}  filters.studentId   — 'all' or a specific studentId
 */
const useReportsData = (filters) => {
  const { attendanceThreshold } = useAppContext();

  // ── Full dataset (all rows, unpaged) ────────────────────────────────────────
  const [allRows,      setAllRows]      = useState([]);
  const [summaryCards, setSummaryCards] = useState(DEFAULT_SUMMARY);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  // ── Pagination ──────────────────────────────────────────────────────────────
  const [page,     setPage]     = useState(1);
  const [pageSize]              = useState(PAGE_SIZE);

  // ── Sorting ─────────────────────────────────────────────────────────────────
  const [sortConfig, setSortConfig] = useState({ key: null, dir: 'asc' });

  const refresh = useCallback(() => {
    setPage(1);
    setRefreshToken((n) => n + 1);
  }, []);

  // Reset to page 1 when filters change
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    if (prevFiltersRef.current !== filters) {
      setPage(1);
      prevFiltersRef.current = filters;
    }
  });

  // ── Load data ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!filters) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { reportType } = filters;

      // Fetch the appropriate report and summary in parallel
      const [reportRes, summaryRes] = await Promise.all([
        reportType === 'attendance'
          ? getAttendanceReport(filters, attendanceThreshold)
          : reportType === 'batch'
            ? getBatchReport(filters, attendanceThreshold)
            : getStudentReport(filters, attendanceThreshold),
        getReportSummaryCards(filters, attendanceThreshold),
      ]);

      if (cancelled) return;

      if (!reportRes.success) {
        setError(reportRes.error?.message ?? 'Failed to load report data.');
        setAllRows([]);
        setLoading(false);
        return;
      }

      setAllRows(reportRes.data ?? []);

      if (summaryRes.success) {
        setSummaryCards(summaryRes.data ?? DEFAULT_SUMMARY);
      }

      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [filters, attendanceThreshold, refreshToken]);

  // ── Client-side sort ────────────────────────────────────────────────────────
  const sortedRows = useMemo(() => {
    const { key, dir } = sortConfig;
    if (!key) return allRows;

    return [...allRows].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return dir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal ?? '').toLowerCase();
      const bStr = String(bVal ?? '').toLowerCase();
      if (aStr < bStr) return dir === 'asc' ? -1 :  1;
      if (aStr > bStr) return dir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [allRows, sortConfig]);

  // ── Paginate ─────────────────────────────────────────────────────────────────
  const { data: reportData, meta: paginationMeta } = useMemo(
    () => paginate(sortedRows, page, pageSize),
    [sortedRows, page, pageSize]
  );

  return {
    reportData,
    summaryCards,
    loading,
    error,
    pagination: paginationMeta,
    setPage,
    sortConfig,
    setSortConfig,
    refresh,
  };
};

export default useReportsData;
