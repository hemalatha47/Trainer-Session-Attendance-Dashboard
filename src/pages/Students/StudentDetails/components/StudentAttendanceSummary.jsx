/**
 * StudentAttendanceSummary.jsx
 * Module 5.2 — Student Details Page
 *
 * Compact attendance summary panel.
 * Shows: percentage ring, present/absent counts, progress bar.
 * No advanced charts — those belong to Module 5.x analytics.
 *
 * Props:
 *   attendanceSummary  {object | null}
 *   loading            {boolean}
 */

import { CheckCircle, XCircle }  from 'lucide-react';
import { motion }                from 'framer-motion';
import { fadeIn }                from '@constants/animations';
import { cn }                    from '@utils/componentUtils';
import { CircularProgress }      from '@components/data/CircularProgress';
import { ProgressBar }           from '@components/data/ProgressBar';
import { CardSkeleton }          from '@components/feedback/Skeleton';

// ── Stat mini-row ─────────────────────────────────────────────────────────────
const StatRow = ({ icon: Icon, label, value, colorClass }) => (
  <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
    <span className={cn('flex items-center gap-2 text-sm', colorClass)}>
      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      {label}
    </span>
    <span className="text-sm font-semibold text-textPrimary">{value}</span>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const StudentAttendanceSummary = ({ attendanceSummary, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
        <h2 className="text-sm font-semibold text-textPrimary mb-4">Attendance</h2>
        <CardSkeleton />
      </div>
    );
  }

  const {
    percentage    = 0,
    presentCount  = 0,
    absentCount   = 0,
    totalSessions = 0,
    statusColor   = 'default',
  } = attendanceSummary ?? {};

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="bg-surface rounded-xl border border-border shadow-sm p-5"
    >
      <h2 className="text-sm font-semibold text-textPrimary mb-1">Attendance</h2>
      <p className="text-xs text-textMuted mb-4">Session performance overview</p>

      {/* Circular progress + label */}
      <div className="flex flex-col items-center gap-3 mb-5">
        <CircularProgress
          value={percentage}
          size={88}
          strokeWidth={8}
          color={statusColor}
          threshold={75}
          showValue
          label={`${percentage}% attendance rate`}
        />
        <p className="text-xs text-textMuted">{totalSessions} total sessions</p>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <ProgressBar
          value={percentage}
          max={100}
          color={statusColor}
          threshold={75}
          showLabel
          label="Attendance rate"
          size="md"
        />
      </div>

      {/* Present / Absent breakdown */}
      <div>
        <StatRow
          icon={CheckCircle}
          label="Present"
          value={presentCount}
          colorClass="text-success-DEFAULT"
        />
        <StatRow
          icon={XCircle}
          label="Absent"
          value={absentCount}
          colorClass="text-danger-DEFAULT"
        />
      </div>
    </motion.div>
  );
};

export default StudentAttendanceSummary;
