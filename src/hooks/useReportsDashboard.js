/**
 * useReportsDashboard.js
 * Custom hook for Module 7.1 — Reports Dashboard Page.
 *
 * Orchestrates data loading from reportsDashboardService.
 * All business logic stays in the service; this hook owns React state only.
 *
 * Hook API:
 *  {
 *    summary,       — { totalSessions, totalBatches, averageAttendance, atRiskStudents }
 *    reportTypes,   — array of report type card metadata
 *    overviewPanels,— { attendancePanel, batchPanel, studentPanel }
 *    loading,       — true while any fetch is in flight
 *    error,         — string | null
 *    refresh,       — () => void — triggers a full reload
 *  }
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from '@context/AppContext';
import {
  getReportsDashboardSummary,
  getReportTypeCards,
  getOverviewPanels,
} from '@services/reportsDashboardService';

// ── Default shapes (guard against undefined in UI before data loads) ──────────

const DEFAULT_SUMMARY = {
  totalSessions:     0,
  totalBatches:      0,
  averageAttendance: 0,
  atRiskStudents:    0,
};

const DEFAULT_OVERVIEW = {
  attendancePanel: {
    averageAttendance: 0,
    absentRatio:       0,
    recentSessionDate: null,
  },
  batchPanel: {
    activeBatches:        0,
    completedBatches:     0,
    lowPerformingBatches: 0,
  },
  studentPanel: {
    totalStudents:     0,
    atRiskStudents:    0,
    excellentStudents: 0,
  },
};

// ── Hook ──────────────────────────────────────────────────────────────────────

const useReportsDashboard = () => {
  const { attendanceThreshold } = useAppContext();

  const [summary,        setSummary]        = useState(DEFAULT_SUMMARY);
  const [reportTypes,    setReportTypes]    = useState([]);
  const [overviewPanels, setOverviewPanels] = useState(DEFAULT_OVERVIEW);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [refreshToken,   setRefreshToken]   = useState(0);

  const refresh = useCallback(() => setRefreshToken((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const [summaryRes, typesRes, panelsRes] = await Promise.all([
        getReportsDashboardSummary(attendanceThreshold),
        getReportTypeCards(),
        getOverviewPanels(attendanceThreshold),
      ]);

      if (cancelled) return;

      // Summary is mandatory — fail hard if unavailable
      if (!summaryRes.success) {
        setError(summaryRes.error?.message ?? 'Failed to load reports dashboard');
        setLoading(false);
        return;
      }

      setSummary(summaryRes.data ?? DEFAULT_SUMMARY);

      // Report type cards — non-fatal if missing
      if (typesRes.success) {
        setReportTypes(typesRes.data ?? []);
      }

      // Overview panels — non-fatal if missing
      if (panelsRes.success) {
        setOverviewPanels(panelsRes.data ?? DEFAULT_OVERVIEW);
      }

      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [refreshToken, attendanceThreshold]);

  // Memoised derived: whether any data exists to display
  const hasData = useMemo(
    () => summary.totalBatches > 0 || summary.totalSessions > 0,
    [summary]
  );

  return {
    summary,
    reportTypes,
    overviewPanels,
    loading,
    error,
    refresh,
    hasData,
  };
};

export default useReportsDashboard;
