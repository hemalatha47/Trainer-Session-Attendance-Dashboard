/**
 * useAnalyticsDashboard.js
 * Module 8.1 — Analytics Dashboard Page.
 *
 * Loads analytics landing page data: KPI summary, trend preview, overview panels.
 * All heavy aggregation is delegated to analyticsDashboardService.
 *
 * Hook API:
 *  {
 *    summary,        — { avgAttendance, activeBatches, atRiskStudents, totalSessions, ... }
 *    trendData,      — array of { date, displayDate, rate, presentCount, absentCount }
 *    overviewPanels, — { panel1, panel2, panel3 }
 *    loading,        — true while any fetch is in flight
 *    error,          — string error message or null
 *    refresh,        — () => void — triggers a full reload
 *  }
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from '@context/AppContext';
import {
  getAnalyticsSummary,
  getTrendPreview,
  getOverviewPanels,
} from '@services/analyticsDashboardService';

// ── Default shapes (prevents undefined crashes in UI) ────────────────────────

const DEFAULT_SUMMARY = {
  avgAttendance:    0,
  activeBatches:    0,
  atRiskStudents:   0,
  criticalStudents: 0,
  totalSessions:    0,
  totalStudents:    0,
  batchCount:       0,
};

const DEFAULT_PANELS = {
  panel1: { avgAttendance: 0, absentRatio: 0, weeklyDelta: null, totalRecords: 0 },
  panel2: { bestBatch: null, worstBatch: null, avgBatchPerformance: 0, totalBatches: 0 },
  panel3: { riskStudents: 0, criticalStudents: 0, improvementCount: 0, totalStudents: 0, alertCount: 0 },
};

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @param {object}  [options]
 * @param {number}  [options.threshold] — override AppContext threshold
 */
const useAnalyticsDashboard = (options = {}) => {
  const { attendanceThreshold: ctxThreshold } = useAppContext();
  const threshold = options.threshold ?? ctxThreshold;

  const [summary,        setSummary]        = useState(DEFAULT_SUMMARY);
  const [trendData,      setTrendData]      = useState([]);
  const [overviewPanels, setOverviewPanels] = useState(DEFAULT_PANELS);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [tick,           setTick]           = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const [summaryRes, trendRes, panelsRes] = await Promise.all([
        getAnalyticsSummary(threshold),
        getTrendPreview(),
        getOverviewPanels(threshold),
      ]);

      if (cancelled) return;

      const failures = [summaryRes, trendRes, panelsRes].filter((r) => !r.success);
      if (failures.length === 3) {
        setError(failures[0]?.error?.message ?? 'Failed to load analytics data');
      } else {
        setError(null);
      }

      if (summaryRes.success) setSummary(summaryRes.data);
      if (trendRes.success)   setTrendData(trendRes.data ?? []);
      if (panelsRes.success)  setOverviewPanels(panelsRes.data ?? DEFAULT_PANELS);

      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [threshold, tick]);

  // ── Memoized derived values ───────────────────────────────────────────────

  const hasData = useMemo(
    () => summary.totalStudents > 0 || summary.activeBatches > 0,
    [summary]
  );

  return {
    summary,
    trendData,
    overviewPanels,
    loading,
    error,
    refresh,
    hasData,
  };
};

export default useAnalyticsDashboard;
