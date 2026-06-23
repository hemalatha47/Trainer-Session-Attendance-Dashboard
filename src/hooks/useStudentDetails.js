/**
 * useStudentDetails.js
 * Custom hook for Student Details Page (Module 5.2).
 *
 * Responsibilities:
 *   - Load a single student by ID from studentService
 *   - Load the student's batch info from batchService
 *   - Load full attendance records + computed summary from attendanceService
 *   - Derive recent activity from attendance records + enrollment event
 *   - Expose loading, error, and refresh states to the page
 *
 * Architecture rules:
 *   - Never imports from @data directly — service layer only
 *   - Returns a stable { data, meta, loading, error, refresh } shape
 *   - All service calls are individually error-tracked
 *
 * @module useStudentDetails
 */

import { useState, useEffect, useCallback } from 'react';
import { getStudentById }                    from '@services/studentService';
import { getBatchById }                       from '@services/batchService';
import {
  getStudentAttendance,
  calculateAttendancePercentageForStudent,
} from '@services/attendanceService';

// ── Risk level resolver ───────────────────────────────────────────────────────
// Maps an attendance percentage to a risk label + status color.
// Mirrors the threshold logic used in ReportsPage and Dashboard.
const resolveRiskLevel = (pct) => {
  if (pct >= 90) return { label: 'Excellent', status: 'success' };
  if (pct >= 75) return { label: 'Good',      status: 'success' };
  if (pct >= 60) return { label: 'Warning',   status: 'warning' };
  return            { label: 'Critical',   status: 'danger'  };
};

// ── Recent activity builder ───────────────────────────────────────────────────
// Derives timeline events from attendance records and static enrollment data.
const buildRecentActivity = (student, records) => {
  const events = [];

  // Enrollment event (always first)
  if (student?.enrollmentDate) {
    events.push({
      id:          `enroll-${student.id}`,
      type:        'enrolled',
      title:       'Student enrolled',
      description: `Joined ${student.batchId ? 'the batch' : 'the system'}`,
      timestamp:   student.enrollmentDate,
      status:      'info',
    });
  }

  // Last 10 attendance records, most recent first
  const recent = [...records]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  for (const rec of recent) {
    events.push({
      id:          rec.id,
      type:        rec.status === 'present' ? 'present' : 'absent',
      title:       rec.status === 'present' ? 'Marked present' : 'Marked absent',
      description: `Session on ${rec.date}`,
      timestamp:   rec.date,
      status:      rec.status === 'present' ? 'success' : 'danger',
    });
  }

  // Return events in reverse-chronological order (newest first)
  return events
    .filter((e) => e.timestamp)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 10);
};

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @param {string} studentId  - The :id param from the route
 * @returns {{
 *   student:           object | null,
 *   batch:             object | null,
 *   attendanceSummary: {
 *     totalSessions: number,
 *     presentCount:  number,
 *     absentCount:   number,
 *     percentage:    number,
 *     statusColor:   string,
 *     riskLevel:     { label: string, status: string },
 *   } | null,
 *   recentActivity:    Array,
 *   loading:           boolean,
 *   error:             string | null,
 *   refresh:           () => void,
 * }}
 */
const useStudentDetails = (studentId) => {
  const [student,           setStudent]           = useState(null);
  const [batch,             setBatch]             = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [recentActivity,    setRecentActivity]    = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState(null);
  const [tick,              setTick]              = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!studentId) {
      setError('No student ID provided.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      // ── 1. Load student ────────────────────────────────────────────────────
      const studentRes = await getStudentById(studentId);
      if (cancelled) return;

      if (!studentRes.success) {
        setError(studentRes.error?.message || 'Student not found.');
        setLoading(false);
        return;
      }

      const loadedStudent = studentRes.data;
      setStudent(loadedStudent);

      // ── 2. Load batch (parallel with attendance) ───────────────────────────
      const [batchRes, attendanceRes, summaryRes] = await Promise.all([
        getBatchById(loadedStudent.batchId),
        getStudentAttendance(studentId, { batchId: loadedStudent.batchId, order: 'desc' }),
        calculateAttendancePercentageForStudent(studentId, loadedStudent.batchId),
      ]);

      if (cancelled) return;

      // Batch — non-fatal: page can render without it
      if (batchRes.success) {
        setBatch(batchRes.data);
      }

      // Attendance records
      const records = attendanceRes.success ? (attendanceRes.data ?? []) : [];

      // Computed summary
      if (summaryRes.success && summaryRes.data) {
        const { totalSessions, presentCount, absentCount, percentage } = summaryRes.data;
        setAttendanceSummary({
          totalSessions,
          presentCount,
          absentCount,
          percentage,
          statusColor: summaryRes.data.statusColor ?? 'default',
          riskLevel:   resolveRiskLevel(percentage),
        });
      } else {
        // Fallback: derive from attendancePercentage stored on the student record
        const pct = typeof loadedStudent.attendancePercentage === 'number'
          ? loadedStudent.attendancePercentage
          : 0;
        setAttendanceSummary({
          totalSessions: records.length,
          presentCount:  records.filter((r) => r.status === 'present').length,
          absentCount:   records.filter((r) => r.status === 'absent').length,
          percentage:    pct,
          statusColor:   pct >= 75 ? 'success' : pct >= 50 ? 'warning' : 'danger',
          riskLevel:     resolveRiskLevel(pct),
        });
      }

      // Recent activity derived from records + enrollment
      setRecentActivity(buildRecentActivity(loadedStudent, records));

      setLoading(false);
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, [studentId, tick]);

  return {
    student,
    batch,
    attendanceSummary,
    recentActivity,
    loading,
    error,
    refresh,
  };
};

export default useStudentDetails;
