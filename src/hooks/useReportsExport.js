/**
 * useReportsExport.js
 * Module 7.4 — Export & Final Polish
 *
 * Orchestrates CSV export and print actions for the Reports module.
 * Wraps reportsExportService, manages loading state, and surfaces
 * toast feedback via useToast.
 *
 * Hook API:
 *  {
 *    exporting,      — boolean  (CSV download in progress)
 *    printing,       — boolean  (print dialog in progress)
 *    exportCSV,      — (filters, threshold) => Promise<void>
 *    printReport,    — () => void
 *  }
 *
 * Blueprint Section 4.8
 */

import { useState, useCallback } from 'react';
import {
  exportAttendanceReport,
  exportBatchReport,
  exportStudentReport,
} from '@services/reportsExportService';
import useToast from '@hooks/useToast';

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @param {object} filters   — from useReportFilters (includes reportType)
 * @param {number} threshold — attendanceThreshold from AppContext
 */
const useReportsExport = (filters = {}, threshold = 75) => {
  const toast = useToast();

  const [exporting, setExporting] = useState(false);
  const [printing,  setPrinting]  = useState(false);

  // ── CSV export ──────────────────────────────────────────────────────────────

  const exportCSV = useCallback(async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const type = filters?.reportType ?? 'attendance';

      let res;
      if (type === 'batch') {
        res = await exportBatchReport(filters, threshold);
      } else if (type === 'student') {
        res = await exportStudentReport(filters, threshold);
      } else {
        res = await exportAttendanceReport(filters, threshold);
      }

      if (res.success) {
        toast.success(
          `Report exported — ${res.data?.filename ?? 'report.csv'}`,
          { title: 'Export Complete' }
        );
      } else {
        toast.error(
          res.error?.message ?? 'Export failed. Please try again.',
          { title: 'Export Failed' }
        );
      }
    } catch (err) {
      toast.error(
        err?.message ?? 'An unexpected error occurred during export.',
        { title: 'Export Error' }
      );
    } finally {
      setExporting(false);
    }
  }, [exporting, filters, threshold, toast]);

  // ── Print ───────────────────────────────────────────────────────────────────

  const printReport = useCallback(() => {
    if (printing) return;
    setPrinting(true);

    try {
      window.print();
      // window.print() is synchronous in most browsers; resolve after a tick
      setTimeout(() => {
        setPrinting(false);
      }, 500);
    } catch (err) {
      toast.error(
        'Could not open the print dialog. Please try again.',
        { title: 'Print Failed' }
      );
      setPrinting(false);
    }
  }, [printing, toast]);

  return {
    exporting,
    printing,
    exportCSV,
    printReport,
  };
};

export default useReportsExport;
