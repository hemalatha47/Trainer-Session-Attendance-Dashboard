/**
 * useAttendanceAnalytics.js
 * Custom hook for Module 6.7 — Attendance Analytics & Alerts.
 *
 * Loads analytics data, trend series, batch comparison, and risk alerts.
 * All heavy aggregation is delegated to attendanceAnalyticsService.
 *
 * Hook API:
 *  {
 *    analytics,       — master KPI object
 *    trendData,       — array of { date, rate, presentCount, absentCount }
 *    batchComparison, — array of { batchId, batchName, averageRate, risk }
 *    alerts,          — array of risk alert objects (sorted by severity)
 *    loading,         — true while any fetch is in flight
 *    error,           — string error message or null
 *    refresh,         — () => void — triggers a full reload
 *    selectedBatchId, — string|null — active batch filter for trend chart
 *    setSelectedBatchId, — (id: string|null) => void
 *  }
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from '@context/AppContext';
import {
  getAttendanceAnalytics,
  buildTrendData,
  buildBatchComparison,
  calculateRiskAlerts,
} from '@services/attendanceAnalyticsService';

/**
 * @param {object} [options]
 * @param {number} [options.threshold]   — override AppContext threshold
 * @param {string} [options.batchId]     — initial batch filter for trend
 */
const useAttendanceAnalytics = (options = {}) => {
  const { attendanceThreshold: ctxThreshold } = useAppContext();
  const threshold = options.threshold ?? ctxThreshold;

  const [selectedBatchId, setSelectedBatchId] = useState(options.batchId ?? null);
  const [analytics,       setAnalytics]       = useState(null);
  const [trendData,       setTrendData]       = useState([]);
  const [batchComparison, setBatchComparison] = useState([]);
  const [alerts,          setAlerts]          = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [tick,            setTick]            = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  // ── Load all analytics in parallel ───────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const [analyticsRes, trendRes, comparisonRes, alertsRes] = await Promise.all([
        getAttendanceAnalytics(threshold),
        buildTrendData(selectedBatchId),
        buildBatchComparison(),
        calculateRiskAlerts(threshold),
      ]);

      if (cancelled) return;

      // Collect any errors
      const errors = [analyticsRes, trendRes, comparisonRes, alertsRes]
        .filter((r) => !r.success)
        .map((r) => r.error?.message ?? 'Unknown error');

      if (errors.length === 4) {
        // All failed
        setError(errors[0]);
      } else {
        setError(null);
      }

      if (analyticsRes.success)  setAnalytics(analyticsRes.data);
      if (trendRes.success)      setTrendData(trendRes.data ?? []);
      if (comparisonRes.success) setBatchComparison(comparisonRes.data ?? []);
      if (alertsRes.success)     setAlerts(alertsRes.data ?? []);

      setLoading(false);
    };

    load();

    return () => { cancelled = true; };
  }, [threshold, selectedBatchId, tick]);

  // ── Reload trend only when selected batch changes ─────────────────────────
  // (already handled above since selectedBatchId is in the dep array)

  // ── Derived KPI values ────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    if (!analytics) {
      return {
        overallRate:       0,
        absentRatio:       0,
        atRiskCount:       0,
        criticalCount:     0,
        totalStudents:     0,
        totalSessions:     0,
        activeBatchCount:  0,
      };
    }
    return {
      overallRate:      analytics.overallRate,
      absentRatio:      analytics.absentRatio,
      atRiskCount:      analytics.atRiskCount,
      criticalCount:    analytics.criticalCount,
      totalStudents:    analytics.totalStudents,
      totalSessions:    analytics.totalSessions,
      activeBatchCount: analytics.activeBatchCount,
    };
  }, [analytics]);

  // ── Available batches for the trend dropdown ───────────────────────────────
  const availableBatches = useMemo(
    () => (analytics?.batchSummaries ?? []).map((b) => ({ id: b.batchId, name: b.batchName })),
    [analytics]
  );

  return {
    analytics,
    trendData,
    batchComparison,
    alerts,
    loading,
    error,
    refresh,
    kpis,
    availableBatches,
    selectedBatchId,
    setSelectedBatchId,
  };
};

export default useAttendanceAnalytics;
