/**
 * useAttendanceDashboard.js
 * Custom hook for the Attendance Dashboard page.
 * Module: 6.1
 *
 * Blueprint Section 11.2 — hooks own data-fetching workflows.
 * Pages call hooks, hooks call services — never skip the layer.
 *
 * API:
 *  { metrics, recentSessions, loading, error, refresh }
 *
 * - metrics        : { todayRate, totalMarkedToday, presentToday, absentToday,
 *                      pendingCount, activeBatchCount, todayBatchStatuses,
 *                      pendingBatches }
 * - recentSessions : array of recent submission events
 * - loading        : boolean
 * - error          : string | null
 * - refresh        : () => void — triggers a manual reload
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAttendanceDashboardMetrics,
  getRecentAttendanceSessions,
} from '@services/attendanceDashboardService';

// ── Default metric shape (prevents undefined crashes in UI) ──────────────────

const DEFAULT_METRICS = {
  todayRate:          0,
  totalMarkedToday:   0,
  presentToday:       0,
  absentToday:        0,
  pendingCount:       0,
  activeBatchCount:   0,
  todayBatchStatuses: [],
  pendingBatches:     [],
};

// ── Hook ──────────────────────────────────────────────────────────────────────

const useAttendanceDashboard = () => {
  const [metrics,        setMetrics]        = useState(DEFAULT_METRICS);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [refreshToken,   setRefreshToken]   = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const [metricsRes, sessionsRes] = await Promise.all([
        getAttendanceDashboardMetrics(),
        getRecentAttendanceSessions(5),
      ]);

      if (cancelled) return;

      if (!metricsRes.success) {
        setError(metricsRes.error?.message ?? 'Failed to load attendance metrics');
        setLoading(false);
        return;
      }

      setMetrics(metricsRes.data ?? DEFAULT_METRICS);

      if (sessionsRes.success) {
        setRecentSessions(sessionsRes.data ?? []);
      }
      // Sessions failure is non-fatal — metrics still show

      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [refreshToken]);

  // Memoize derived values to avoid re-computation on every render
  const todayStatusSummary = useMemo(() => {
    const statuses = metrics.todayBatchStatuses;
    return {
      completed:   statuses.filter((s) => s.statusLabel === 'completed').length,
      in_progress: statuses.filter((s) => s.statusLabel === 'in_progress').length,
      pending:     statuses.filter((s) => s.statusLabel === 'pending').length,
    };
  }, [metrics.todayBatchStatuses]);

  return {
    metrics,
    recentSessions,
    todayStatusSummary,
    loading,
    error,
    refresh,
  };
};

export default useAttendanceDashboard;
