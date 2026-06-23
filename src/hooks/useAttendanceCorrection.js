/**
 * useAttendanceCorrection.js
 * Hook for the attendance correction workflow.
 * Module: 6.8 — Task 5
 *
 * Workflow:
 *  1. User selects a historical session from AttendanceHistory.
 *  2. Calls enterCorrectionMode(session) — loads current records.
 *  3. User edits toggle statuses / remarks inline.
 *  4. Calls saveCorrection() — calls correctAttendanceSession, emits audit.
 *  5. exitCorrectionMode() clears state.
 *
 * API:
 *  {
 *    correcting,         // boolean (saving)
 *    correctionMode,     // boolean (panel is open for editing)
 *    sessionBeingCorrected, // { batchId, date, batchName } | null
 *    correctionRows,     // { [studentId]: { status, remarks } }
 *    loadingSession,     // boolean
 *    enterCorrectionMode,  // (session: object) => Promise<void>
 *    exitCorrectionMode,   // () => void
 *    updateCorrectionRow,  // (studentId, field, value) => void
 *    saveCorrection,       // () => Promise<void>
 *  }
 */

import { useState, useCallback } from 'react';
import { getAttendanceByDate }   from '@services/attendanceService';
import { correctAttendanceSession } from '@services/attendanceDeleteService';
import { useAuthContext }         from '@context/AuthContext';
import useToast                   from '@hooks/useToast';

const useAttendanceCorrection = ({ onCorrectionSaved } = {}) => {
  const [correcting,             setCorrectingState]   = useState(false);
  const [correctionMode,         setCorrectionMode]    = useState(false);
  const [sessionBeingCorrected,  setSessionMeta]       = useState(null);
  const [correctionRows,         setCorrectionRows]    = useState({});
  const [loadingSession,         setLoadingSession]    = useState(false);

  const { user } = useAuthContext();
  const toast    = useToast();
  const userId   = user?.id ?? 'unknown';

  /**
   * Enter correction mode for a historical session.
   * Fetches existing records to pre-populate the correction form.
   */
  const enterCorrectionMode = useCallback(async (session) => {
    if (!session?.batchId || !session?.date) return;

    setLoadingSession(true);
    try {
      const res = await getAttendanceByDate(session.batchId, session.date);
      if (!res.success) {
        toast.error(res.error?.message ?? 'Failed to load session for correction');
        return;
      }

      // Build correction rows map: { [studentId]: { status, remarks } }
      const rows = {};
      for (const r of res.data ?? []) {
        rows[r.studentId] = { status: r.status, remarks: r.remarks ?? '' };
      }

      setCorrectionRows(rows);
      setSessionMeta({
        batchId:   session.batchId,
        date:      session.date,
        batchName: session.batchName ?? session.batchId,
      });
      setCorrectionMode(true);
    } catch (err) {
      toast.error('Unexpected error entering correction mode');
      console.error('[useAttendanceCorrection] enterCorrectionMode:', err);
    } finally {
      setLoadingSession(false);
    }
  }, [toast]);

  /** Exit correction mode without saving. */
  const exitCorrectionMode = useCallback(() => {
    setCorrectionMode(false);
    setSessionMeta(null);
    setCorrectionRows({});
  }, []);

  /**
   * Update a single field in the correction rows map.
   * @param {string} studentId
   * @param {'status'|'remarks'} field
   * @param {string} value
   */
  const updateCorrectionRow = useCallback((studentId, field, value) => {
    setCorrectionRows((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), [field]: value },
    }));
  }, []);

  /** Save all corrections and exit correction mode. */
  const saveCorrection = useCallback(async () => {
    if (!sessionBeingCorrected) return;

    const { batchId, date } = sessionBeingCorrected;

    const corrections = Object.entries(correctionRows).map(([studentId, row]) => ({
      studentId,
      status:  row.status,
      remarks: row.remarks ?? '',
    }));

    if (corrections.length === 0) {
      toast.warning('No corrections to save');
      return;
    }

    setCorrectingState(true);
    try {
      const res = await correctAttendanceSession({ batchId, date, corrections, userId });
      if (res.success) {
        toast.success(`Corrections saved for ${res.data?.correctedCount ?? 0} records`);
        exitCorrectionMode();
        onCorrectionSaved?.({ batchId, date });
      } else {
        toast.error(res.error?.message ?? 'Correction save failed');
      }
    } catch (err) {
      toast.error('Unexpected error saving corrections');
      console.error('[useAttendanceCorrection] saveCorrection:', err);
    } finally {
      setCorrectingState(false);
    }
  }, [sessionBeingCorrected, correctionRows, userId, toast, exitCorrectionMode, onCorrectionSaved]);

  return {
    correcting: correcting,
    correctionMode,
    sessionBeingCorrected,
    correctionRows,
    loadingSession,
    enterCorrectionMode,
    exitCorrectionMode,
    updateCorrectionRow,
    saveCorrection,
  };
};

export default useAttendanceCorrection;
export { useAttendanceCorrection };
