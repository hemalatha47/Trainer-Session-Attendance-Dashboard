/**
 * useBatchDetails.js
 * Data-fetching and orchestration hook for the Batch Details page.
 *
 * Blueprint: Sections 4.1, 4.2, 4.3, 6.4, 8.2–8.4, 9.4–9.5, 11.2
 * Module: 4.2
 *
 * Architecture:
 *   BatchDetailsPage
 *     → useBatchDetails (this hook)
 *       → batchService.getBatchById()
 *       → studentService.getStudentsByBatch()
 *       → attendanceService.getBatchAttendanceSummary()
 *       → attendanceService.getAttendanceTrend()
 *       → attendanceService.getAttendanceByDate() (today)
 *
 * Rules:
 *   - Page never imports services directly; always via this hook.
 *   - Hook never imports mock data; only via services.
 *   - Returns consistent, stable shape regardless of loading / error state.
 */

import { useState, useEffect, useCallback } from 'react';
import { getBatchById }                      from '@services/batchService';
import { getStudentsByBatch }                from '@services/studentService';
import {
  getBatchAttendanceSummary,
  getAttendanceByDate,
  getAttendanceTrend,
  getSessionDates,
}                                            from '@services/attendanceService';
import { getToday, subtractDays }            from '@utils/dateUtils';

// ── Constants ─────────────────────────────────────────────────────────────────
const TREND_DAYS = 30; // days of trend history to load

/**
 * @param {string} batchId — from route param
 *
 * @returns {{
 *   batch:           object | null,
 *   students:        object[],
 *   attendanceSummary: object | null,
 *   todayAttendance: object[],
 *   trend:           object[],
 *   sessionDates:    string[],
 *   loading:         boolean,
 *   batchLoading:    boolean,
 *   studentsLoading: boolean,
 *   attendanceLoading: boolean,
 *   error:           string | null,
 *   notFound:        boolean,
 *   reload:          () => void,
 * }}
 */
const useBatchDetails = (batchId) => {
  const [batch,             setBatch]             = useState(null);
  const [students,          setStudents]           = useState([]);
  const [attendanceSummary, setAttendanceSummary]  = useState(null);
  const [todayAttendance,   setTodayAttendance]    = useState([]);
  const [trend,             setTrend]              = useState([]);
  const [sessionDates,      setSessionDates]       = useState([]);

  const [batchLoading,      setBatchLoading]       = useState(true);
  const [studentsLoading,   setStudentsLoading]    = useState(true);
  const [attendanceLoading, setAttendanceLoading]  = useState(true);

  const [error,    setError]    = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [tick,     setTick]     = useState(0);

  // ── Reload trigger ──────────────────────────────────────────────────────────
  const reload = useCallback(() => setTick((t) => t + 1), []);

  // ── Load batch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!batchId) {
      setNotFound(true);
      setBatchLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setBatchLoading(true);
      setError(null);
      setNotFound(false);

      const res = await getBatchById(batchId);

      if (cancelled) return;

      if (res.success) {
        setBatch(res.data);
      } else {
        setBatch(null);
        if (res.error?.code === 'BATCH_NOT_FOUND' || res.error?.code === 'BATCH_INVALID_ID') {
          setNotFound(true);
        } else {
          setError(res.error?.message ?? 'Failed to load batch');
        }
      }

      setBatchLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [batchId, tick]);

  // ── Load students ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!batchId) return;

    let cancelled = false;

    const load = async () => {
      setStudentsLoading(true);

      const res = await getStudentsByBatch(batchId, { includeInactive: true });

      if (cancelled) return;

      if (res.success) {
        setStudents(res.data ?? []);
      } else {
        setStudents([]);
      }

      setStudentsLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [batchId, tick]);

  // ── Load attendance data ────────────────────────────────────────────────────
  useEffect(() => {
    if (!batchId) return;

    let cancelled = false;

    const load = async () => {
      setAttendanceLoading(true);

      const today  = getToday();
      const from   = subtractDays(today, TREND_DAYS);

      // Run in parallel for performance
      const [todayRes, trendRes, datesRes] = await Promise.all([
        getAttendanceByDate(batchId, today),
        getAttendanceTrend(batchId, from, today),
        getSessionDates(batchId),
      ]);

      if (cancelled) return;

      // Today's attendance records
      if (todayRes.success) {
        setTodayAttendance(todayRes.data ?? []);
      } else {
        setTodayAttendance([]);
      }

      // Trend data
      if (trendRes.success) {
        setTrend(trendRes.data ?? []);
      } else {
        setTrend([]);
      }

      // Session dates
      if (datesRes.success) {
        setSessionDates(datesRes.data ?? []);
      } else {
        setSessionDates([]);
      }

      setAttendanceLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [batchId, tick]);

  // ── Load attendance summary (depends on students) ───────────────────────────
  useEffect(() => {
    if (!batchId || studentsLoading) return;

    let cancelled = false;

    const load = async () => {
      const studentIds = students.map((s) => s.id);

      const res = await getBatchAttendanceSummary(batchId, studentIds);

      if (cancelled) return;

      if (res.success) {
        setAttendanceSummary(res.data);
      } else {
        setAttendanceSummary(null);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [batchId, students, studentsLoading, tick]);

  // ── Derived loading flag ────────────────────────────────────────────────────
  const loading = batchLoading || studentsLoading || attendanceLoading;

  return {
    batch,
    students,
    attendanceSummary,
    todayAttendance,
    trend,
    sessionDates,
    loading,
    batchLoading,
    studentsLoading,
    attendanceLoading,
    error,
    notFound,
    reload,
  };
};

export default useBatchDetails;
