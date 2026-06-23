/**
 * useAttendanceExport.js
 * Hook for attendance CSV export actions with loading and toast feedback.
 * Module: 6.8 — Task 3
 *
 * API:
 *  {
 *    exporting,            // boolean — true while any export is in progress
 *    exportSession,        // (batchId, date) => Promise<void>
 *    exportHistory,        // (sessions, label?) => Promise<void>
 *    exportBatch,          // (batchId, options?) => Promise<void>
 *  }
 */

import { useState, useCallback } from 'react';
import {
  exportAttendanceSession,
  exportAttendanceHistory,
  exportBatchAttendance,
} from '@services/attendanceExportService';
import { useAuthContext } from '@context/AuthContext';
import useToast           from '@hooks/useToast';

const useAttendanceExport = () => {
  const [exporting, setExporting] = useState(false);
  const { user }  = useAuthContext();
  const toast     = useToast();
  const userId    = user?.id ?? 'unknown';

  const exportSession = useCallback(async (batchId, date) => {
    setExporting(true);
    try {
      const res = await exportAttendanceSession(batchId, date, userId);
      if (res.success) {
        toast.success(`Exported ${res.data?.rowCount ?? 0} records for ${date}`);
      } else {
        toast.error(res.error?.message ?? 'Export failed');
      }
    } finally {
      setExporting(false);
    }
  }, [userId, toast]);

  const exportHistory = useCallback(async (sessions, label = 'history') => {
    setExporting(true);
    try {
      const res = await exportAttendanceHistory(sessions, label, userId);
      if (res.success) {
        toast.success(`Exported ${res.data?.rowCount ?? 0} sessions`);
      } else {
        toast.error(res.error?.message ?? 'Export failed');
      }
    } finally {
      setExporting(false);
    }
  }, [userId, toast]);

  const exportBatch = useCallback(async (batchId, options = {}) => {
    setExporting(true);
    try {
      const res = await exportBatchAttendance(batchId, options, userId);
      if (res.success) {
        toast.success(`Exported ${res.data?.rowCount ?? 0} attendance records`);
      } else {
        toast.error(res.error?.message ?? 'Export failed');
      }
    } finally {
      setExporting(false);
    }
  }, [userId, toast]);

  return { exporting, exportSession, exportHistory, exportBatch };
};

export default useAttendanceExport;
export { useAttendanceExport };
