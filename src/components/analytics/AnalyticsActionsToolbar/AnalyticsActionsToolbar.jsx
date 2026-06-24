/**
 * AnalyticsActionsToolbar.jsx
 * Module 8.4 — Analytics Export & Final Polish
 *
 * Actions toolbar for the Analytics Dashboard.
 * Renders: Export CSV (dropdown), Print Analytics, Refresh.
 *
 * Props:
 *   onExportTrend    — () => void  — export trend CSV
 *   onExportBatch    — () => void  — export batch comparison CSV
 *   onExportRisk     — () => void  — export risk CSV
 *   onPrint          — () => void  — trigger window.print()
 *   onRefresh        — () => void  — refresh all analytics data
 *   exportingTrend   — boolean
 *   exportingBatch   — boolean
 *   exportingRisk    — boolean
 *   printing         — boolean
 *   loading          — boolean
 *   className        — string (optional)
 *
 * Blueprint Section 4.8, 8.4
 */

import { useState, useRef, useEffect }              from 'react';
import { Download, Printer, RefreshCw, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence }                   from 'framer-motion';
import { fadeIn, usePrefersReducedMotion }           from '@constants/animations';
import { safeMotion, cn }                            from '@utils/componentUtils';
import { Button }                                    from '@components/ui/Button';

// ── Export option config ──────────────────────────────────────────────────────

const EXPORT_OPTIONS = [
  {
    key:   'trend',
    label: 'Attendance Trend CSV',
    desc:  'Daily attendance rate over the selected date range',
  },
  {
    key:   'batch',
    label: 'Batch Comparison CSV',
    desc:  'Average attendance ranked by batch',
  },
  {
    key:   'risk',
    label: 'Student Risk CSV',
    desc:  'All students grouped by attendance risk level',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {Function} props.onExportTrend
 * @param {Function} props.onExportBatch
 * @param {Function} props.onExportRisk
 * @param {Function} props.onPrint
 * @param {Function} props.onRefresh
 * @param {boolean}  [props.exportingTrend=false]
 * @param {boolean}  [props.exportingBatch=false]
 * @param {boolean}  [props.exportingRisk=false]
 * @param {boolean}  [props.printing=false]
 * @param {boolean}  [props.loading=false]
 * @param {string}   [props.className]
 */
const AnalyticsActionsToolbar = ({
  onExportTrend,
  onExportBatch,
  onExportRisk,
  onPrint,
  onRefresh,
  exportingTrend = false,
  exportingBatch = false,
  exportingRisk  = false,
  printing       = false,
  loading        = false,
  className,
}) => {
  const reduced          = usePrefersReducedMotion();
  const [open, setOpen]  = useState(false);
  const dropdownRef      = useRef(null);

  const anyExporting = exportingTrend || exportingBatch || exportingRisk;

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  // ── Close dropdown on Escape ──────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const handleExport = (key) => {
    setOpen(false);
    if (key === 'trend' && onExportTrend) onExportTrend();
    if (key === 'batch' && onExportBatch) onExportBatch();
    if (key === 'risk'  && onExportRisk)  onExportRisk();
  };

  // ── Whether a specific option is currently exporting ─────────────────────
  const isExporting = (key) => {
    if (key === 'trend') return exportingTrend;
    if (key === 'batch') return exportingBatch;
    if (key === 'risk')  return exportingRisk;
    return false;
  };

  return (
    <motion.div
      {...safeMotion(reduced, { variants: fadeIn, initial: 'initial', animate: 'animate' })}
      className={cn(
        'flex flex-wrap items-center justify-between gap-3',
        'rounded-lg border border-border bg-white px-4 py-3 shadow-card',
        'print:hidden',
        className
      )}
      role="toolbar"
      aria-label="Analytics actions"
    >
      {/* ── Left label ───────────────────────────────────────────────────────── */}
      <p className="text-sm font-medium text-textPrimary">
        Analytics Dashboard
        <span className="ml-1.5 text-xs font-normal text-textMuted">
          — Export &amp; Actions
        </span>
      </p>

      {/* ── Right action group ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Export and utility actions">

        {/* Export CSV dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setOpen((v) => !v)}
            disabled={anyExporting || loading}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label="Export analytics data as CSV"
            iconLeft={
              <Download
                size={14}
                className={cn(anyExporting && 'animate-pulse')}
                aria-hidden="true"
              />
            }
            iconRight={
              <ChevronDown
                size={12}
                className={cn(
                  'transition-transform duration-150',
                  open && 'rotate-180'
                )}
                aria-hidden="true"
              />
            }
          >
            {anyExporting ? 'Exporting…' : 'Export CSV'}
          </Button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {open && (
              <motion.ul
                role="listbox"
                aria-label="CSV export options"
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={  { opacity: 0, y: -4, scale: 0.97  }}
                transition={{ duration: 0.12 }}
                className={cn(
                  'absolute right-0 top-full z-50 mt-1 w-72',
                  'rounded-lg border border-border bg-white shadow-md',
                  'overflow-hidden',
                  'focus-within:outline-none'
                )}
              >
                {EXPORT_OPTIONS.map((opt) => {
                  const busy = isExporting(opt.key);
                  return (
                    <li key={opt.key} role="option" aria-selected="false">
                      <button
                        type="button"
                        onClick={() => handleExport(opt.key)}
                        disabled={busy || anyExporting}
                        className={cn(
                          'w-full text-left px-4 py-3',
                          'hover:bg-secondary-50 focus-visible:bg-secondary-50',
                          'focus-visible:outline-none focus-visible:ring-2',
                          'focus-visible:ring-inset focus-visible:ring-accent-600',
                          'transition-colors duration-100',
                          (busy || anyExporting) && 'opacity-50 cursor-not-allowed'
                        )}
                        aria-busy={busy}
                        aria-label={`${opt.label}${busy ? ' — exporting' : ''}`}
                      >
                        <span className="block text-sm font-medium text-textPrimary leading-tight">
                          {busy ? 'Exporting…' : opt.label}
                        </span>
                        <span className="block text-xs text-textMuted mt-0.5 leading-snug">
                          {opt.desc}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Print button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onPrint}
          disabled={printing || loading}
          aria-label="Print analytics dashboard"
          iconLeft={
            <Printer
              size={14}
              className={cn(printing && 'animate-pulse')}
              aria-hidden="true"
            />
          }
        >
          {printing ? 'Preparing…' : 'Print'}
        </Button>

        {/* Refresh button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh analytics data"
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
      </div>
    </motion.div>
  );
};

export default AnalyticsActionsToolbar;
