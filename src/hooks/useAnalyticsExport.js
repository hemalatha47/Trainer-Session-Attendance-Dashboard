/**
 * useAnalyticsExport.js
 * Module 8.4 — Analytics Export & Final Polish
 *
 * Custom hook that owns all analytics CSV export and print actions.
 *
 * Design goals:
 *  - Isolates export/print side-effects from the Analytics page.
 *  - Provides per-type loading states (exportingTrend, exportingBatch, exportingRisk).
 *  - Surfaces success/error feedback via AppContext.showToast.
 *  - print() calls window.print() after a 100 ms tick (ensures DOM is painted).
 *
 * Hook API:
 *  {
 *    exportTrend,     — async () => void
 *    exportBatch,     — async () => void
 *    exportRisk,      — async () => void
 *    print,           — () => void
 *    exportingTrend,  — boolean
 *    exportingBatch,  — boolean
 *    exportingRisk,   — boolean
 *    printing,        — boolean
 *  }
 *
 * @param {object}      [options]
 * @param {string|null} [options.batchId]    — current analytics filter
 * @param {string|null} [options.dateFrom]   — current date-range filter start
 * @param {string|null} [options.dateTo]     — current date-range filter end
 * @param {number}      [options.threshold=75]
 */

import { useState, useCallback } from 'react';
import { useAppContext }         from '@context/AppContext';
import {
  exportTrendCSV,
  exportBatchCSV,
  exportRiskCSV,
} from '@services/analyticsExportService';

const useAnalyticsExport = (options = {}) => {
  const { batchId = null, dateFrom = null, dateTo = null, threshold = 75 } = options;

  const { showToast } = useAppContext();

  const [exportingTrend, setExportingTrend] = useState(false);
  const [exportingBatch, setExportingBatch] = useState(false);
  const [exportingRisk,  setExportingRisk]  = useState(false);
  const [printing,       setPrinting]       = useState(false);

  // ── Export trend CSV ───────────────────────────────────────────────────────
  const exportTrend = useCallback(async () => {
    if (exportingTrend) return;
    setExportingTrend(true);
    try {
      const result = await exportTrendCSV({ batchId, from: dateFrom, to: dateTo });
      if (result.success) {
        showToast(`Trend CSV exported (${result.data?.rowCount ?? 0} rows).`, 'success');
      } else {
        showToast(result.error?.message ?? 'Failed to export trend data.', 'error');
      }
    } catch (err) {
      showToast('Unexpected error exporting trend data.', 'error');
    } finally {
      setExportingTrend(false);
    }
  }, [exportingTrend, batchId, dateFrom, dateTo, showToast]);

  // ── Export batch comparison CSV ────────────────────────────────────────────
  const exportBatch = useCallback(async () => {
    if (exportingBatch) return;
    setExportingBatch(true);
    try {
      const result = await exportBatchCSV({ batchId });
      if (result.success) {
        showToast(`Batch comparison CSV exported (${result.data?.rowCount ?? 0} rows).`, 'success');
      } else {
        showToast(result.error?.message ?? 'Failed to export batch data.', 'error');
      }
    } catch (err) {
      showToast('Unexpected error exporting batch data.', 'error');
    } finally {
      setExportingBatch(false);
    }
  }, [exportingBatch, batchId, showToast]);

  // ── Export student risk CSV ────────────────────────────────────────────────
  const exportRisk = useCallback(async () => {
    if (exportingRisk) return;
    setExportingRisk(true);
    try {
      const result = await exportRiskCSV({ batchId, threshold });
      if (result.success) {
        showToast(`Risk CSV exported (${result.data?.rowCount ?? 0} students).`, 'success');
      } else {
        showToast(result.error?.message ?? 'Failed to export risk data.', 'error');
      }
    } catch (err) {
      showToast('Unexpected error exporting risk data.', 'error');
    } finally {
      setExportingRisk(false);
    }
  }, [exportingRisk, batchId, threshold, showToast]);

  // ── Print ──────────────────────────────────────────────────────────────────
  const print = useCallback(() => {
    if (printing) return;
    setPrinting(true);
    try {
      // Small delay ensures React has finished painting any state-driven changes
      setTimeout(() => {
        try {
          window.print();
        } catch (err) {
          showToast('Could not open the print dialog.', 'error');
        } finally {
          setPrinting(false);
        }
      }, 100);
    } catch (err) {
      showToast('Unexpected error preparing print view.', 'error');
      setPrinting(false);
    }
  }, [printing, showToast]);

  return {
    exportTrend,
    exportBatch,
    exportRisk,
    print,
    exportingTrend,
    exportingBatch,
    exportingRisk,
    printing,
  };
};

export default useAnalyticsExport;
