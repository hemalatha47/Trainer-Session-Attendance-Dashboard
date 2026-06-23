/**
 * useAttendanceHistory.js
 * Custom hook for the Attendance History & Timeline page.
 * Module: 6.6
 *
 * API:
 *  {
 *    history,       // object[]  — paginated session rows
 *    timeline,      // object[]  — chronological timeline entries
 *    summary,       // { totalSessions, averageAttendance, updatedSessions, lowAttendanceCount }
 *    filters,       // current filter state
 *    pagination,    // PaginationMeta from service
 *    loading,       // boolean
 *    summaryLoading,// boolean
 *    error,         // string | null
 *    setFilters,    // (partial) => void — merge update
 *    setPage,       // (number) => void
 *    refresh,       // () => void
 *    openSession,   // (session: object) => void
 *    closeSession,  // () => void
 *    selectedSession, // object | null
 *    sessionLoading,  // boolean
 *  }
 *
 * Blueprint Section 11.2 — hooks encapsulate data-fetching; pages call hooks.
 * Memoization via useMemo / useCallback to prevent unnecessary rerenders.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  getAttendanceHistory,
  getHistorySummary,
  buildAttendanceTimeline,
  getSessionDetails,
} from '@services/attendanceHistoryService';
import { useAppContext } from '@context/AppContext';
import { getToday, toLocalDateString, subtractDays } from '@utils/dateUtils';
import { DEFAULT_ATTENDANCE_THRESHOLD } from '@constants/validation';

// ── Default filter state ──────────────────────────────────────────────────────

const DEFAULT_FILTERS = {
  batchId:     '',
  from:        '',
  to:          '',
  statusColor: '',
  search:      '',
};

// ── Default pagination meta (before first load) ───────────────────────────────

const DEFAULT_PAGINATION = {
  total:      0,
  page:       1,
  pageSize:   10,
  totalPages: 1,
  from:       0,
  to:         0,
  hasNext:    false,
  hasPrev:    false,
  totalSessions: 0,
  batchCount:    0,
};

// ── Hook ──────────────────────────────────────────────────────────────────────

const useAttendanceHistory = () => {
  const { attendanceThreshold } = useAppContext();
  const threshold = attendanceThreshold ?? DEFAULT_ATTENDANCE_THRESHOLD;

  // ── Filters & page ─────────────────────────────────────────────────────────
  const [filters, setFiltersState] = useState(DEFAULT_FILTERS);
  const [page,    setPage]         = useState(1);
  const PAGE_SIZE = 10;

  // ── History list state ─────────────────────────────────────────────────────
  const [history,    setHistory]    = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  // ── Summary KPI state ──────────────────────────────────────────────────────
  const [summary,        setSummary]        = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // ── Timeline (derived from history) ───────────────────────────────────────
  const timeline = useMemo(
    () => buildAttendanceTimeline(history, 20),
    [history]
  );

  // ── Session detail state ───────────────────────────────────────────────────
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionLoading,  setSessionLoading]  = useState(false);

  // ── Abort ref (prevent stale updates on fast filter changes) ──────────────
  const abortRef = useRef(0);

  // ── Load history ───────────────────────────────────────────────────────────
  const loadHistory = useCallback(async (activeFilters, activePage) => {
    const runId = ++abortRef.current;

    setLoading(true);
    setError(null);

    const res = await getAttendanceHistory({
      ...activeFilters,
      page:      activePage,
      pageSize:  PAGE_SIZE,
      threshold,
    });

    if (runId !== abortRef.current) return; // stale

    if (res.success) {
      setHistory(res.data ?? []);
      setPagination({ ...DEFAULT_PAGINATION, ...res.meta });
    } else {
      setError(res.error?.message ?? 'Failed to load attendance history');
      setHistory([]);
      setPagination(DEFAULT_PAGINATION);
    }

    setLoading(false);
  }, [threshold]);

  // ── Load summary KPIs ──────────────────────────────────────────────────────
  const loadSummary = useCallback(async (activeFilters) => {
    setSummaryLoading(true);

    const res = await getHistorySummary({
      batchId:   activeFilters.batchId,
      from:      activeFilters.from,
      to:        activeFilters.to,
      threshold,
    });

    setSummary(res.success ? res.data : null);
    setSummaryLoading(false);
  }, [threshold]);

  // ── Effect: reload when filters or page change ─────────────────────────────
  useEffect(() => {
    loadHistory(filters, page);
    loadSummary(filters);
  }, [filters, page, loadHistory, loadSummary]);

  // ── Public setFilters (merges partial update, resets page to 1) ───────────
  const setFilters = useCallback((partial) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
    setPage(1);
  }, []);

  // ── Page setter (clamped) ─────────────────────────────────────────────────
  const goToPage = useCallback((p) => {
    setPage(Math.max(1, p));
  }, []);

  // ── Refresh (re-run current filters) ──────────────────────────────────────
  const refresh = useCallback(() => {
    loadHistory(filters, page);
    loadSummary(filters);
  }, [filters, page, loadHistory, loadSummary]);

  // ── Session detail open/close ─────────────────────────────────────────────
  const openSession = useCallback(async (session) => {
    if (!session?.batchId || !session?.date) return;

    setSessionLoading(true);
    const res = await getSessionDetails(session.batchId, session.date, threshold);
    setSelectedSession(res.success ? res.data : session); // fallback to row data
    setSessionLoading(false);
  }, [threshold]);

  const closeSession = useCallback(() => {
    setSelectedSession(null);
  }, []);

  return {
    history,
    timeline,
    summary,
    filters,
    pagination,
    loading,
    summaryLoading,
    error,
    setFilters,
    setPage: goToPage,
    refresh,
    openSession,
    closeSession,
    selectedSession,
    sessionLoading,
  };
};

export default useAttendanceHistory;
