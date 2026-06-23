/**
 * useAttendanceDelete.js
 * Hook for attendance delete flow with ConfirmDialog integration.
 * Module: 6.8 — Task 4
 *
 * API:
 *  {
 *    deleting,           // boolean
 *    confirmState,       // { isOpen, batchId, date, recordId, mode } — dialog state
 *    requestDeleteSession, // (batchId, date) => void   — opens confirm dialog
 *    requestDeleteRecord,  // (recordId) => void        — opens confirm dialog
 *    confirmDelete,      // () => Promise<void>          — executes on dialog confirm
 *    cancelDelete,       // () => void                   — closes dialog without action
 *  }
 */

import { useState, useCallback } from 'react';
import {
  deleteAttendanceSession,
  deleteAttendanceRecord,
} from '@services/attendanceDeleteService';
import { useAuthContext } from '@context/AuthContext';
import useToast           from '@hooks/useToast';

const INITIAL_CONFIRM = {
  isOpen:   false,
  mode:     null,   // 'session' | 'record'
  batchId:  null,
  date:     null,
  recordId: null,
};

const useAttendanceDelete = ({ onSessionDeleted, onRecordDeleted } = {}) => {
  const [deleting,      setDeleting]      = useState(false);
  const [confirmState,  setConfirmState]  = useState(INITIAL_CONFIRM);
  const { user } = useAuthContext();
  const toast    = useToast();
  const userId   = user?.id ?? 'unknown';

  const requestDeleteSession = useCallback((batchId, date) => {
    setConfirmState({ isOpen: true, mode: 'session', batchId, date, recordId: null });
  }, []);

  const requestDeleteRecord = useCallback((recordId) => {
    setConfirmState({ isOpen: true, mode: 'record', batchId: null, date: null, recordId });
  }, []);

  const cancelDelete = useCallback(() => {
    setConfirmState(INITIAL_CONFIRM);
  }, []);

  const confirmDelete = useCallback(async () => {
    const { mode, batchId, date, recordId } = confirmState;
    setDeleting(true);
    setConfirmState(INITIAL_CONFIRM);

    try {
      if (mode === 'session') {
        const res = await deleteAttendanceSession(batchId, date, userId);
        if (res.success) {
          toast.success(`Session deleted: ${res.data?.deletedCount ?? 0} records removed`);
          onSessionDeleted?.({ batchId, date });
        } else {
          toast.error(res.error?.message ?? 'Failed to delete session');
        }
      } else if (mode === 'record') {
        const res = await deleteAttendanceRecord(recordId, userId);
        if (res.success) {
          toast.success('Attendance record deleted');
          onRecordDeleted?.({ recordId, record: res.data?.deletedRecord });
        } else {
          toast.error(res.error?.message ?? 'Failed to delete record');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred during delete');
      console.error('[useAttendanceDelete]', err);
    } finally {
      setDeleting(false);
    }
  }, [confirmState, userId, toast, onSessionDeleted, onRecordDeleted]);

  return {
    deleting,
    confirmState,
    requestDeleteSession,
    requestDeleteRecord,
    confirmDelete,
    cancelDelete,
  };
};

export default useAttendanceDelete;
export { useAttendanceDelete };
