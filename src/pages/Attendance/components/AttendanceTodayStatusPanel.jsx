/**
 * AttendanceTodayStatusPanel.jsx
 * Shows batch-wise attendance status for today.
 * Module: 6.1, Task 9
 *
 * Status values:
 *   completed   — all students in batch marked for today
 *   in_progress — partially marked
 *   pending     — not yet marked today
 *
 * Each row displays: Batch Name, Status Badge, optional progress indicator.
 */

import { motion }        from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { EmptyState }    from '@components/feedback/EmptyState';
import { cn }            from '@utils/componentUtils';
import { TRANSITIONS, usePrefersReducedMotion } from '@constants/animations';
import { safeMotion }    from '@utils/componentUtils';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  completed: {
    label:      'Completed',
    icon:       CheckCircle2,
    badgeClass: 'bg-success-bg text-success-DEFAULT',
    iconClass:  'text-success-DEFAULT',
  },
  in_progress: {
    label:      'In Progress',
    icon:       Clock,
    badgeClass: 'bg-warning-bg text-warning-text',
    iconClass:  'text-yellow-500',
  },
  pending: {
    label:      'Pending',
    icon:       AlertCircle,
    badgeClass: 'bg-neutral-100 text-textMuted',
    iconClass:  'text-textMuted',
  },
};

// ── Progress bar ──────────────────────────────────────────────────────────────

const MiniProgress = ({ markedCount, expectedCount }) => {
  const pct = expectedCount > 0 ? Math.round((markedCount / expectedCount) * 100) : 0;

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden"
        aria-hidden="true"
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            pct >= 100 ? 'bg-success-DEFAULT'
            : pct > 0  ? 'bg-yellow-400'
            :            'bg-neutral-300'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-textMuted tabular-nums shrink-0 w-12 text-right">
        {markedCount}/{expectedCount}
      </span>
    </div>
  );
};

// ── Single batch row ──────────────────────────────────────────────────────────

const BatchStatusRow = ({ batchStatus, reduced }) => {
  const config = STATUS_CONFIG[batchStatus.statusLabel] ?? STATUS_CONFIG.pending;
  const Icon   = config.icon;

  const rowProps = safeMotion(reduced, {
    variants: {
      hidden:  { opacity: 0, x: -6 },
      visible: { opacity: 1, x: 0, transition: TRANSITIONS.fast },
    },
  });

  return (
    <motion.div
      className="flex flex-col gap-2 py-3 border-b border-border/50 last:border-0"
      {...rowProps}
    >
      {/* Top row: batch name + status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon
            className={cn('w-4 h-4 shrink-0', config.iconClass)}
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-textPrimary truncate leading-snug">
            {batchStatus.batchName}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold shrink-0',
            config.badgeClass
          )}
        >
          {config.label}
        </span>
      </div>

      {/* Progress (always show for context) */}
      <MiniProgress
        markedCount={batchStatus.markedCount}
        expectedCount={batchStatus.expectedCount}
      />

      {/* Trainer name */}
      <p className="text-xs text-textMuted leading-tight">
        Trainer: {batchStatus.trainerName}
      </p>
    </motion.div>
  );
};

// ── Row skeleton ──────────────────────────────────────────────────────────────

const RowSkeleton = () => (
  <div className="flex flex-col gap-2 py-3 border-b border-border/50 last:border-0 animate-pulse">
    <div className="flex items-center justify-between gap-2">
      <div className="h-3 bg-neutral-200 rounded w-2/5" />
      <div className="h-5 bg-neutral-200 rounded-full w-20" />
    </div>
    <div className="h-1.5 bg-neutral-200 rounded-full w-full" />
    <div className="h-2.5 bg-neutral-200 rounded w-1/3" />
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {Array}   props.todayBatchStatuses  — from metrics.todayBatchStatuses
 * @param {boolean} props.loading
 */
const AttendanceTodayStatusPanel = ({ todayBatchStatuses = [], loading = false }) => {
  const reduced = usePrefersReducedMotion();

  const listProps = safeMotion(reduced, {
    variants: { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } },
    initial:  'hidden',
    animate:  'visible',
  });

  // Summary counts for the header
  const completedCount  = todayBatchStatuses.filter((s) => s.statusLabel === 'completed').length;
  const pendingCount    = todayBatchStatuses.filter((s) => s.statusLabel === 'pending').length;
  const inProgressCount = todayBatchStatuses.filter((s) => s.statusLabel === 'in_progress').length;

  return (
    <section
      className="flex flex-col rounded-md border border-border bg-white shadow-card"
      aria-labelledby="today-status-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <h2
          id="today-status-heading"
          className="text-sm font-semibold text-textPrimary leading-tight"
        >
          Today's Status
        </h2>
        {!loading && todayBatchStatuses.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-textMuted">
            <span className="text-success-DEFAULT font-medium">{completedCount} done</span>
            {inProgressCount > 0 && (
              <span className="text-yellow-600 font-medium">{inProgressCount} active</span>
            )}
            {pendingCount > 0 && (
              <span className="text-textMuted">{pendingCount} pending</span>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-2 flex-1">
        {loading ? (
          <div aria-busy="true" aria-label="Loading today's batch status">
            {[...Array(3)].map((_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : todayBatchStatuses.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="w-8 h-8 text-textMuted" aria-hidden="true" />}
            title="No active batches"
            description="Today's batch status will appear here."
            className="py-10"
          />
        ) : (
          <motion.div {...listProps}>
            {todayBatchStatuses.map((bs) => (
              <BatchStatusRow
                key={bs.batchId}
                batchStatus={bs}
                reduced={reduced}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

AttendanceTodayStatusPanel.displayName = 'AttendanceTodayStatusPanel';

export default AttendanceTodayStatusPanel;
