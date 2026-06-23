/**
 * useAttendanceSave.js
 * Save / Edit workflow hook for the Attendance Sheet.
 *
 * Module 6.5 — Attendance Save & Edit Workflow
 * Blueprint Sections: 4.3, 9.1, 9.2, 11.2
 *
 * RESPONSIBILITIES:
 *  - Orchestrate the full save lifecycle: idle → saving → success/error.
 *  - Detect duplicate sessions and surface overwrite confirmation.
 *  - Call attendanceSaveService (create or update mode).
 *  - Expose stable callbacks to the page layer.
 *  - Integrate with useToast for user feedback.
 *  - Reset dirty state on success via the provided callback.
 *
 * SAVE STATES:
 *  'idle'    — nothing in progress
 *  'saving'  — async operation in flight
 *  'success' — last operation completed successfully
 *  'error'   — last operation failed
 *
 * HOOK API:
 *  {
 *    saveAttendance,      — triggers the save flow (checks duplicates first)
 *    confirmOverwrite,    — user confirmed overwrite; proceeds with update
 *    cancelOverwrite,     — user cancelled overwrite dialog
 *    saveState,           — 'idle' | 'saving' | 'success' | 'error'
 *    loading,             — boolean (saveState === 'saving')
 *    error,               — string | null  (last error message)
 *    success,             — boolean (saveState === 'success')
 *    overwriteRequired,   — boolean (duplicate detected, awaiting user decision)
 *  }
 *
 * USAGE:
 *  const saveMethods = useAttendanceSave({
 *    batchId,
 *    date,
 *    buildRecords,     // () => Array<{ studentId, status, remarks }>
 *    markedBy,
 *    mode,             // 'create' | 'edit' from useAttendanceSheet
 *    onSuccess,        // () => void  — called on successful save (reset dirty)
 *  });
 */

import {
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  checkExistingAttendance,
  saveAttendance as saveAttendanceService,
  updateAttendanceSession,
  validateAttendanceBeforeSave,
} from '@services/attendanceSaveService';
import useToast from '@hooks/useToast';

// ── Save state constants ───────────────────────────────────────────────────────

export const SAVE_STATE = Object.freeze({
  IDLE:    'idle',
  SAVING:  'saving',
  SUCCESS: 'success',
  ERROR:   'error',
});

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {{
 *   batchId:      string,
 *   date:         string,
 *   buildRecords: () => Array<{ studentId: string, status: string, remarks?: string }>,
 *   markedBy:     string,
 *   mode:         'create' | 'edit',
 *   onSuccess:    () => void,
 * }} config
 */
const useAttendanceSave = ({
  batchId,
  date,
  buildRecords,
  markedBy,
  mode,
  onSuccess,
}) => {
  const toast = useToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const [saveState,        setSaveState]        = useState(SAVE_STATE.IDLE);
  const [error,            setError]            = useState(null);
  const [overwriteRequired, setOverwriteRequired] = useState(false);

  // Hold the pending payload so confirmOverwrite can proceed without
  // rebuilding it (records state may have changed if we awaited user input).
  const pendingPayloadRef = useRef(null);

  // ── Internal helpers ───────────────────────────────────────────────────────

  const _beginSaving = useCallback(() => {
    setSaveState(SAVE_STATE.SAVING);
    setError(null);
  }, []);

  const _setSuccess = useCallback((countMsg) => {
    setSaveState(SAVE_STATE.SUCCESS);
    // Return to idle after brief visual success window
    setTimeout(() => setSaveState(SAVE_STATE.IDLE), 2000);
    if (typeof onSuccess === 'function') onSuccess();
    toast.success(countMsg);
  }, [onSuccess, toast]);

  const _setError = useCallback((message) => {
    setSaveState(SAVE_STATE.ERROR);
    setError(message);
    toast.error(message, { duration: 6000 });
    // Return to idle so user can retry
    setTimeout(() => setSaveState(SAVE_STATE.IDLE), 100);
  }, [toast]);

  // ── Core persist operation ─────────────────────────────────────────────────

  /**
   * Executes the actual service call for create or edit mode.
   * @param {{ batchId, date, records, markedBy, mode }} payload
   */
  const _persist = useCallback(async (payload) => {
    _beginSaving();

    const { batchId: bid, date: d, records, markedBy: by, mode: m } = payload;

    const res = m === 'edit'
      ? await updateAttendanceSession({ batchId: bid, date: d, records, markedBy: by })
      : await saveAttendanceService({ batchId: bid, date: d, records, markedBy: by });

    if (!res.success) {
      _setError(res.error?.message ?? 'Failed to save attendance. Please try again.');
      return;
    }

    const { saved = [], inserted = 0, updated = 0 } = res.data ?? {};
    const total = saved.length;
    const msg   = m === 'edit'
      ? `Attendance updated — ${total} student${total !== 1 ? 's' : ''} recorded.`
      : `Attendance saved — ${total} student${total !== 1 ? 's' : ''} recorded.`;

    _setSuccess(msg);
  }, [_beginSaving, _setSuccess, _setError]);

  // ── Public: saveAttendance ─────────────────────────────────────────────────

  /**
   * Main entry point. Called by the save bar / save button.
   *
   * Flow:
   *  1. Build records snapshot from current sheet state.
   *  2. Client-side validation.
   *  3. If mode === 'edit' (pre-loaded existing records) → persist directly.
   *  4. If mode === 'create' → check for duplicates on the server.
   *     4a. No duplicates → persist.
   *     4b. Duplicates exist → set overwriteRequired, store pending payload.
   */
  const saveAttendance = useCallback(async () => {
    if (saveState === SAVE_STATE.SAVING) return; // prevent double-submit

    const records = typeof buildRecords === 'function' ? buildRecords() : [];

    // Client-side validation first (fast, no network)
    const { valid, errors } = validateAttendanceBeforeSave({ batchId, date, records, markedBy });
    if (!valid) {
      setError(errors[0]);
      toast.error(errors[0], { title: 'Cannot Save', duration: 6000 });
      return;
    }

    const payload = { batchId, date, records, markedBy, mode };

    if (mode === 'edit') {
      // Already know records exist (hook pre-loaded them) — go straight to update
      await _persist(payload);
      return;
    }

    // Create mode: check for duplicate session before writing
    _beginSaving();
    const checkRes = await checkExistingAttendance(batchId, date);

    if (!checkRes.success) {
      _setError(checkRes.error?.message ?? 'Could not verify existing attendance. Please retry.');
      return;
    }

    if (checkRes.data.exists) {
      // Duplicates found → prompt user for confirmation (overwrite)
      setSaveState(SAVE_STATE.IDLE);
      pendingPayloadRef.current = { ...payload, mode: 'edit' };
      setOverwriteRequired(true);
      return;
    }

    // No duplicates — safe to insert
    await _persist(payload);
  }, [saveState, buildRecords, batchId, date, markedBy, mode, _persist, _beginSaving, _setError, toast]);

  // ── Public: confirmOverwrite ───────────────────────────────────────────────

  /**
   * Called when user clicks "Continue Update" in the ConfirmDialog.
   * Uses the payload snapshot stored before the dialog was opened.
   */
  const confirmOverwrite = useCallback(async () => {
    setOverwriteRequired(false);
    if (!pendingPayloadRef.current) return;
    await _persist(pendingPayloadRef.current);
    pendingPayloadRef.current = null;
  }, [_persist]);

  // ── Public: cancelOverwrite ────────────────────────────────────────────────

  /**
   * Called when user clicks "Cancel" in the overwrite ConfirmDialog.
   */
  const cancelOverwrite = useCallback(() => {
    setOverwriteRequired(false);
    pendingPayloadRef.current = null;
    setSaveState(SAVE_STATE.IDLE);
    setError(null);
  }, []);

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    saveAttendance,
    confirmOverwrite,
    cancelOverwrite,
    saveState,
    loading:          saveState === SAVE_STATE.SAVING,
    error,
    success:          saveState === SAVE_STATE.SUCCESS,
    overwriteRequired,
  };
};

export default useAttendanceSave;
