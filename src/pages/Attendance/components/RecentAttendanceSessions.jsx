/**
 * RecentAttendanceSessions.jsx
 * Panel showing the 5 most recently submitted attendance sessions.
 * Module: 6.1, Task 8
 *
 * Each row: Batch Name, Date, Marked By, Attendance %, student count.
 * Supports empty state and loading skeleton.
 */

import { motion }       from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { EmptyState }   from '@components/feedback/EmptyState';
import { cn }           from '@utils/componentUtils';
import { TRANSITIONS, usePrefersReducedMotion } from '@constants/animations';
import { safeMotion }   from '@utils/componentUtils';

// ── Attendance rate badge ─────────────────────────────────────────────────────

const RateBadge = ({ rate }) => {
  const colorClass =
    rate >= 75 ? 'bg-success-bg text-success-DEFAULT'
    : rate >= 50 ? 'bg-warning-bg text-warning-text'
    : 'bg-danger-bg text-danger-DEFAULT';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
        colorClass
      )}
    >
      {rate}%
    </span>
  );
};

// ── Row skeleton ──────────────────────────────────────────────────────────────

const RowSkeleton = () => (
  <div className="flex items-center justify-between gap-3 py-3 border-b border-border/50 last:border-0 animate-pulse">
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <div className="h-3 bg-neutral-200 rounded w-2/5" />
      <div className="h-2.5 bg-neutral-200 rounded w-1/4" />
    </div>
    <div className="h-5 bg-neutral-200 rounded-full w-10 shrink-0" />
  </div>
);

// ── Session row ───────────────────────────────────────────────────────────────

const SessionRow = ({ session, reduced }) => {
  const rowProps = safeMotion(reduced, {
    variants:  { hidden: { opacity: 0 }, visible: { opacity: 1, transition: TRANSITIONS.fast } },
  });

  return (
    <motion.div
      className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0"
      {...rowProps}
    >
      {/* Left: batch + date info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-textPrimary truncate leading-snug">
          {session.batchName}
        </p>
        <p className="text-xs text-textMuted mt-0.5 leading-tight">
          {session.formattedDate} &middot; {session.totalCount} students &middot; by {session.markedByName}
        </p>
      </div>

      {/* Right: attendance rate badge */}
      <div className="shrink-0">
        <RateBadge rate={session.attendanceRate} />
      </div>
    </motion.div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {Array}   props.recentSessions  — from useAttendanceDashboard
 * @param {boolean} props.loading
 */
const RecentAttendanceSessions = ({ recentSessions = [], loading = false }) => {
  const reduced = usePrefersReducedMotion();

  const listProps = safeMotion(reduced, {
    variants:  { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } },
    initial:   'hidden',
    animate:   'visible',
  });

  return (
    <section
      className="flex flex-col rounded-md border border-border bg-white shadow-card"
      aria-labelledby="recent-sessions-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <h2
          id="recent-sessions-heading"
          className="text-sm font-semibold text-textPrimary leading-tight"
        >
          Recent Sessions
        </h2>
        <span className="text-xs text-textMuted">Last 5 submissions</span>
      </div>

      {/* Body */}
      <div className="px-5 py-2 flex-1">
        {loading ? (
          <div aria-busy="true" aria-label="Loading recent sessions">
            {[...Array(5)].map((_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : recentSessions.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="w-8 h-8 text-textMuted" aria-hidden="true" />}
            title="No sessions yet"
            description="Attendance sessions will appear here once marked."
            className="py-10"
          />
        ) : (
          <motion.div {...listProps}>
            {recentSessions.map((session) => (
              <SessionRow
                key={session.key}
                session={session}
                reduced={reduced}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

RecentAttendanceSessions.displayName = 'RecentAttendanceSessions';

export default RecentAttendanceSessions;
