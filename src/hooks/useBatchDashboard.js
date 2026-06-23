/**
 * useBatchDashboard.js
 * Custom hook that fetches and exposes batch KPI metrics.
 * Handles loading, error, and memoized calculation states.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getBatchDashboardMetrics } from '../services/batchDashboardService';
import { useAppContext } from '../context/AppContext';

/**
 * @param {object}  options
 * @param {Batch[]} [options.batches]  - Optional filtered batch list.
 *                                       If omitted, the service uses all batches.
 * @param {boolean} [options.autoFetch=true] - Auto-fetch on mount.
 */
export function useBatchDashboard({ batches, autoFetch = true } = {}) {
  const { attendanceThreshold } = useAppContext();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBatchDashboardMetrics({
        batches,
        threshold: attendanceThreshold,
      });
      setMetrics(data);
    } catch (err) {
      setError(err.message ?? 'Failed to load batch metrics.');
    } finally {
      setLoading(false);
    }
  }, [batches, attendanceThreshold]);

  useEffect(() => {
    if (autoFetch) fetchMetrics();
  }, [autoFetch, fetchMetrics]);

  /**
   * Derived display-ready cards list.
   * Memoized so downstream components don't re-compute on every render.
   */
  const kpiCards = useMemo(() => {
    if (!metrics) return [];
    return buildKpiCards(metrics);
  }, [metrics]);

  return {
    metrics,
    kpiCards,
    loading,
    error,
    refresh: fetchMetrics,
  };
}

// ---------------------------------------------------------------------------
// Card descriptor builder — keeps card config out of JSX
// ---------------------------------------------------------------------------

function buildKpiCards(m) {
  const {
    totalBatches,
    activeBatches,
    completedBatches,
    upcomingBatches,
    totalStudents,
    avgStudentsPerBatch,
    capacityUtilization,
    completionRate,
    avgAttendance,
    lowAttendanceCount,
  } = m;

  return [
    // Row 1 — Batch status counts
    {
      id: 'total-batches',
      label: 'Total Batches',
      value: totalBatches,
      icon: 'layers',
      color: 'primary',
      helperText: 'All batches in system',
      trend: null,
    },
    {
      id: 'active-batches',
      label: 'Active Batches',
      value: activeBatches,
      icon: 'play-circle',
      color: 'blue',
      helperText: `${totalBatches ? Math.round((activeBatches / totalBatches) * 100) : 0}% of total`,
      trend: null,
    },
    {
      id: 'completed-batches',
      label: 'Completed',
      value: completedBatches,
      icon: 'check-circle',
      color: 'green',
      helperText: `${completionRate}% completion rate`,
      trend: null,
    },
    {
      id: 'upcoming-batches',
      label: 'Upcoming',
      value: upcomingBatches,
      icon: 'clock',
      color: 'yellow',
      helperText: 'Batches not yet started',
      trend: null,
    },
    // Row 2 — Student metrics
    {
      id: 'total-students',
      label: 'Total Students',
      value: totalStudents,
      icon: 'users',
      color: 'accent',
      helperText: `~${avgStudentsPerBatch} per batch`,
      trend: null,
    },
    {
      id: 'capacity-utilization',
      label: 'Capacity Usage',
      value: `${capacityUtilization}%`,
      icon: 'bar-chart-2',
      color: capacityUtilization >= 80 ? 'red' : capacityUtilization >= 50 ? 'yellow' : 'green',
      helperText: 'Based on 30 students/batch',
      progress: capacityUtilization,
      trend: null,
    },
    // Row 3 — Attendance metrics
    {
      id: 'avg-attendance',
      label: 'Avg Attendance',
      value: `${avgAttendance}%`,
      icon: 'trending-up',
      color: avgAttendance >= 75 ? 'green' : avgAttendance >= 50 ? 'yellow' : 'red',
      helperText: 'Across active batches',
      progress: avgAttendance,
      trend: null,
    },
    {
      id: 'low-attendance',
      label: 'Low Attendance',
      value: lowAttendanceCount,
      icon: 'alert-triangle',
      color: lowAttendanceCount > 0 ? 'red' : 'green',
      helperText: `Students below threshold`,
      trend: null,
    },
  ];
}
