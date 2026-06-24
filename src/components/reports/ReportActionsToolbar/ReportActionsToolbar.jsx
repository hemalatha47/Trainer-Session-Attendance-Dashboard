/**
 * ReportActionsToolbar.jsx
 * Module 7.4 — Export & Final Polish
 *
 * Actions toolbar placed above the report table section.
 * Provides: Export CSV, Print Report, Refresh Data.
 *
 * Props:
 *   onExportCSV   — () => void          called on Export CSV click
 *   onPrint       — () => void          called on Print Report click
 *   onRefresh     — () => void          called on Refresh click
 *   exporting     — boolean             disables Export CSV while in progress
 *   printing      — boolean             disables Print while in progress
 *   loading       — boolean             disables Refresh while loading
 *   reportType    — 'attendance'|'batch'|'student'
 *   className     — string (optional)
 *
 * Blueprint Section 4.8, 7.4
 */

import { Download, Printer, RefreshCw } from 'lucide-react';
import { motion }                        from 'framer-motion';
import { fadeIn, usePrefersReducedMotion } from '@constants/animations';
import { safeMotion, cn }                from '@utils/componentUtils';
import { Button }                        from '@components/ui/Button';

// ── Report type label map ─────────────────────────────────────────────────────

const REPORT_LABELS = {
  attendance: 'Attendance Report',
  batch:      'Batch Report',
  student:    'Student Report',
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {Function} props.onExportCSV
 * @param {Function} props.onPrint
 * @param {Function} props.onRefresh
 * @param {boolean}  [props.exporting=false]
 * @param {boolean}  [props.printing=false]
 * @param {boolean}  [props.loading=false]
 * @param {string}   [props.reportType='attendance']
 * @param {string}   [props.className]
 */
const ReportActionsToolbar = ({
  onExportCSV,
  onPrint,
  onRefresh,
  exporting = false,
  printing  = false,
  loading   = false,
  reportType = 'attendance',
  className,
}) => {
  const reduced    = usePrefersReducedMotion();
  const typeLabel  = REPORT_LABELS[reportType] ?? 'Report';

  return (
    <motion.div
      {...safeMotion(reduced, { variants: fadeIn, initial: 'initial', animate: 'animate' })}
      className={cn(
        'flex flex-wrap items-center justify-between gap-3',
        'rounded-lg border border-border bg-white px-4 py-3 shadow-card',
        'print:hidden',          // hide entire toolbar in print view
        className
      )}
      role="toolbar"
      aria-label={`Actions for ${typeLabel}`}
    >
      {/* ── Left: context label ────────────────────────────────────────────── */}
      <p className="text-sm font-medium text-textPrimary">
        {typeLabel}
        <span className="ml-1.5 text-xs font-normal text-textMuted">
          — Actions
        </span>
      </p>

      {/* ── Right: action buttons ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Refresh */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh report data"
          iconLeft={
            <RefreshCw
              size={14}
              className={cn(loading && 'animate-spin')}
              aria-hidden="true"
            />
          }
        >
          Refresh
        </Button>

        {/* Print */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
          disabled={printing}
          aria-label="Print this report"
          iconLeft={
            <Printer
              size={14}
              className={cn(printing && 'opacity-60')}
              aria-hidden="true"
            />
          }
        >
          {printing ? 'Printing…' : 'Print'}
        </Button>

        {/* Export CSV */}
        <Button
          variant="primary"
          size="sm"
          onClick={onExportCSV}
          disabled={exporting || loading}
          aria-label="Export report as CSV file"
          iconLeft={
            <Download
              size={14}
              className={cn(exporting && 'animate-bounce')}
              aria-hidden="true"
            />
          }
        >
          {exporting ? 'Exporting…' : 'Export CSV'}
        </Button>

      </div>
    </motion.div>
  );
};

export default ReportActionsToolbar;
