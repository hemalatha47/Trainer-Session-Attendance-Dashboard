/**
 * AttendanceSheetCounterBar.jsx
 * Live counter strip for the Attendance Sheet page.
 *
 * Module 6.4 — Extended with selected count tile.
 *
 * Shows Present / Absent / Total / Selected counts.
 * Selected tile is only shown when selectedCount > 0.
 *
 * @param {{ present: number, absent: number, pending: number, total: number, selected?: number }} props.counters
 * @param {boolean} [props.loading=false]
 * @param {string}  [props.className]
 */

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Users, UserCheck } from 'lucide-react';
import { TRANSITIONS, usePrefersReducedMotion } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import { Skeleton } from '@components/feedback/Skeleton';

// ── Single counter tile ────────────────────────────────────────────────────────
const CounterTile = ({ icon: Icon, label, value, colorClass, loading }) => (
  <div className={cn(
    'flex items-center gap-2.5 rounded-lg border px-4 py-3 bg-white',
    'shadow-sm flex-1 min-w-0',
    colorClass,
  )}>
    <Icon size={18} aria-hidden="true" className="shrink-0" />
    <div className="min-w-0">
      {loading ? (
        <Skeleton className="h-5 w-8 rounded" />
      ) : (
        <motion.p
          key={value}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={TRANSITIONS.fast}
          className="text-lg font-bold leading-none tabular-nums"
          aria-live="polite"
          aria-atomic="true"
        >
          {value}
        </motion.p>
      )}
      <p className="text-xs text-textMuted mt-0.5">{label}</p>
    </div>
  </div>
);

const AttendanceSheetCounterBar = ({ counters = {}, loading = false, className }) => {
  const { present = 0, absent = 0, total = 0, selected = 0 } = counters;
  const hasSelected = selected > 0;

  return (
    <div
      className={cn('flex gap-3 flex-wrap', className)}
      role="status"
      aria-label="Attendance counters"
    >
      <CounterTile
        icon={CheckCircle}
        label="Present"
        value={present}
        colorClass="border-success-border text-success-text"
        loading={loading}
      />
      <CounterTile
        icon={XCircle}
        label="Absent"
        value={absent}
        colorClass="border-danger-border text-danger-text"
        loading={loading}
      />
      <CounterTile
        icon={Users}
        label="Total"
        value={total}
        colorClass="border-border text-textPrimary"
        loading={loading}
      />

      {/* Selected counter — Module 6.4: visible only when rows are selected */}
      <AnimatePresence>
        {hasSelected && !loading && (
          <motion.div
            key="selected-tile"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={TRANSITIONS.fast}
            className={cn(
              'flex items-center gap-2.5 rounded-lg border px-4 py-3 bg-white',
              'shadow-sm flex-1 min-w-0',
              'border-accent-200 text-accent-700',
            )}
          >
            <UserCheck size={18} aria-hidden="true" className="shrink-0" />
            <div className="min-w-0">
              <p
                className="text-lg font-bold leading-none tabular-nums"
                aria-live="polite"
                aria-atomic="true"
              >
                {selected}
              </p>
              <p className="text-xs text-textMuted mt-0.5">Selected</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

AttendanceSheetCounterBar.displayName = 'AttendanceSheetCounterBar';

export default AttendanceSheetCounterBar;
