/**
 * useStudentDashboard.js
 * Custom hook for Student Dashboard KPI Cards (Module 5.5, Task 4).
 *
 * Responsibilities:
 *  - Loads student KPI metrics via studentDashboardService
 *  - Fetches active batch IDs via batchService.getActiveBatches
 *  - Loads today's absent count via attendanceService.getTodayDashboardSummary
 *  - Manages loading / error / refresh state
 *  - Memoizes derived values to prevent unnecessary re-renders
 *  - Reads attendanceThreshold from AppContext so Settings changes propagate
 *
 * Hook API:
 *  { metrics, loading, error, refresh }
 *
 * Where `metrics` is:
 *  {
 *    totalStudents,      activeStudents,     inactiveStudents,
 *    avgAttendance,      lowAttendanceCount, absentToday,
 *    highPerformers,     threshold,          today,
 *  }
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getStudentDashboardMetrics }  from '@services/studentDashboardService';
import { getTodayDashboardSummary }    from '@services/attendanceService';
import { getActiveBatches }            from '@services/batchService';
import { useAppContext }               from '@context/AppContext';
import { DEFAULT_ATTENDANCE_THRESHOLD } from '@constants/validation';

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @returns {{
 *   metrics:  StudentDashboardMetrics | null,
 *   loading:  boolean,
 *   error:    string | null,
 *   refresh:  () => void,
 * }}
 */
const useStudentDashboard = () => {
  const { attendanceThreshold } = useAppContext();
  const threshold = attendanceThreshold ?? DEFAULT_ATTENDANCE_THRESHOLD;

  const [metrics,  setMetrics]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [tick,     setTick]     = useState(0);

  // Stable refresh callback — safe to pass as dependency
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Track mount state to prevent setting state on unmounted component
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // Step 1: get active batch IDs so todayDashboardSummary can filter correctly
        const batchRes = await getActiveBatches();
        const activeBatchIds = batchRes.success
          ? (batchRes.data ?? []).map((b) => b.id)
          : [];

        if (cancelled) return;

        // Step 2: fetch today's absent count using real active batch IDs
        const todayRes = await getTodayDashboardSummary(activeBatchIds, threshold);
        const absentTodayCount = todayRes.success
          ? (todayRes.data?.absentToday ?? 0)
          : 0;

        if (cancelled) return;

        // Step 3: fetch student KPI metrics, injecting today's absent count
        const metricsRes = await getStudentDashboardMetrics({
          threshold,
          absentTodayCount,
        });

        if (cancelled) return;

        if (!mountedRef.current) return;

        if (metricsRes.success) {
          setMetrics(metricsRes.data);
          setError(null);
        } else {
          setError(metricsRes.error?.message ?? 'Failed to load student metrics');
          setMetrics(null);
        }
      } catch (err) {
        if (cancelled || !mountedRef.current) return;
        setError(err?.message ?? 'Unexpected error loading student metrics');
        setMetrics(null);
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [tick, threshold]);

  // Memoised safe-access metrics (prevents null-checks in UI)
  const safeMetrics = useMemo(() => ({
    totalStudents:      metrics?.totalStudents      ?? 0,
    activeStudents:     metrics?.activeStudents     ?? 0,
    inactiveStudents:   metrics?.inactiveStudents   ?? 0,
    avgAttendance:      metrics?.avgAttendance      ?? 0,
    lowAttendanceCount: metrics?.lowAttendanceCount ?? 0,
    absentToday:        metrics?.absentToday        ?? 0,
    highPerformers:     metrics?.highPerformers     ?? 0,
    threshold:          metrics?.threshold          ?? threshold,
    today:              metrics?.today              ?? '',
  }), [metrics, threshold]);

  return {
    metrics: safeMetrics,
    loading,
    error,
    refresh,
  };
};

export default useStudentDashboard;
