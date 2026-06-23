/**
 * useStudentAttendance.js
 * Custom hook for Student Attendance Integration (Module 5.6).
 *
 * Responsibilities:
 *   - Load complete attendance analytics for a student via studentAttendanceService
 *   - Manage loading, error, and refresh states
 *   - Expose stable, memoized data to the consuming page/component
 *
 * Architecture rules:
 *   - Never imports from @data directly — service layer only
 *   - Returns a stable { analytics, loading, error, refresh } shape
 *   - All service calls go through studentAttendanceService
 *
 * @module useStudentAttendance
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getStudentAttendanceAnalytics } from '@services/studentAttendanceService';
import { DEFAULT_ATTENDANCE_THRESHOLD }  from '@constants/validation';

/**
 * @param {string} studentId
 * @param {string} batchId
 * @param {number} [threshold=75]
 *
 * @returns {{
 *   analytics: {
 *     records:           object[],
 *     timeline:          object[],
 *     chartSeries:       object[],
 *     percentage:        number,
 *     totalSessions:     number,
 *     presentCount:      number,
 *     absentCount:       number,
 *     statusColor:       string,
 *     risk:              object,
 *     streaks:           object,
 *     alerts:            Array,
 *     recentRate:        number,
 *   } | null,
 *   loading:  boolean,
 *   error:    string | null,
 *   refresh:  () => void,
 * }}
 */
const useStudentAttendance = (
  studentId,
  batchId,
  threshold = DEFAULT_ATTENDANCE_THRESHOLD
) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [tick,      setTick]      = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!studentId || !batchId) {
      setAnalytics(null);
      setError('Student ID and batch ID are required.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      const res = await getStudentAttendanceAnalytics(studentId, batchId, threshold);

      if (cancelled) return;

      if (!res.success) {
        setError(res.error?.message ?? 'Failed to load attendance analytics.');
        setLoading(false);
        return;
      }

      setAnalytics(res.data);
      setLoading(false);
    };

    fetchAnalytics();

    return () => {
      cancelled = true;
    };
  }, [studentId, batchId, threshold, tick]);

  // Stable memoized return — prevents unnecessary re-renders downstream
  const result = useMemo(
    () => ({ analytics, loading, error, refresh }),
    [analytics, loading, error, refresh]
  );

  return result;
};

export default useStudentAttendance;
