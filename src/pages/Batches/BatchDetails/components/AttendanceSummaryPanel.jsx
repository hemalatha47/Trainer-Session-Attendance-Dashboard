/**
 * AttendanceSummaryPanel.jsx
 * Attendance statistics panel for Batch Details page.
 *
 * Displays: overall attendance %, present/absent totals,
 *           low-attendance student count, session count.
 *
 * Reuses: AttendanceSummaryCard, ProgressBar, CardSkeleton, EmptyState
 *
 * Blueprint: Sections 4.3, 6.4, 9.4–9.5, 11.3
 * Module: 4.2 — Task 9
 */

import { motion }                 from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  BarChart2,
}                                 from 'lucide-react';

import { AttendanceSummaryCard }  from '@components/attendance/AttendanceSummaryCard';
import { InfoCard }               from '@components/data/InfoCard';
import { ProgressBar }            from '@components/data/ProgressBar';
import { EmptyState }             from '@components/feedback/EmptyState';
import { CardSkeleton }           from '@components/feedback/Skeleton';
import { fadeIn }                 from '@constants/animations';
import { cn }                     from '@utils/componentUtils';

// ── Metric row ────────────────────────────────────────────────────────────────

const MetricRow = ({ icon: Icon, label, value, note, colorClass = 'text-accent-600' }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
    <Icon size={14} className={cn('shrink-0', colorClass)} aria-hidden="true" />
    <span className="flex-1 text-sm text-textMuted">{label}</span>
    <span className="text-sm font-semibold text-textPrimary tabular-nums">{value}</span>
    {note && (
      <span className="text-[10px] text-textMuted ml-1">{note}</span>
    )}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.attendanceSummary  — from getBatchAttendanceSummary
 * @param {object[]} props.sessionDates      — distinct session date strings
 * @param {boolean} [props.loading]
 * @param {number}  [props.threshold=75]
 * @param {string}  [props.className]
 */
const AttendanceSummaryPanel = ({
  attendanceSummary,
  sessionDates,
  loading,
  threshold = 75,
  className,
}) => {
  if (loading) {
    return <CardSkeleton className={cn('h-64', className)} />;
  }

  const hasData = attendanceSummary && (sessionDates?.length > 0);

  if (!hasData) {
    return (
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className={className}
      >
        <InfoCard title="Attendance" className="h-full">
          <EmptyState
            icon={<BarChart2 size={28} />}
            title="No attendance data"
            description="Attendance will appear here once sessions are marked."
            className="py-8"
          />
        </InfoCard>
      </motion.div>
    );
  }

  const {
    totalSessions      = 0,
    totalPresent       = 0,
    totalAbsent        = 0,
    averagePercentage  = 0,
    belowThresholdCount = 0,
    studentCount       = 0,
  } = attendanceSummary;

  const pct        = Math.round(averagePercentage);
  const sessionCount = sessionDates?.length ?? totalSessions;

  const summaryData = {
    present:    totalPresent,
    absent:     totalAbsent,
    total:      totalPresent + totalAbsent,
    percentage: pct,
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className={className}
    >
      <InfoCard title="Attendance" className="h-full">
        {/* Summary card — reuses existing attendance component */}
        <div className="px-4 pt-4 pb-2">
          <AttendanceSummaryCard
            data={summaryData}
            threshold={threshold}
            compact
          />
        </div>

        {/* Detail metrics */}
        <div className="px-5 pb-3 pt-1">
          <MetricRow
            icon={Calendar}
            label="Total Sessions"
            value={sessionCount}
          />
          <MetricRow
            icon={BarChart2}
            label="Students Tracked"
            value={studentCount}
          />
          {belowThresholdCount > 0 && (
            <MetricRow
              icon={AlertTriangle}
              label={`Below ${threshold}%`}
              value={belowThresholdCount}
              note="students"
              colorClass="text-warning-text"
            />
          )}

          {/* Attendance % progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-textMuted">Overall Rate</span>
              <span
                className={cn(
                  'text-xs font-semibold',
                  pct >= threshold         ? 'text-success-DEFAULT'
                  : pct >= threshold * 0.7 ? 'text-warning-text'
                  :                          'text-danger-DEFAULT'
                )}
              >
                {pct}%
              </span>
            </div>
            <ProgressBar
              value={pct}
              max={100}
              color={
                pct >= threshold         ? 'success'
                : pct >= threshold * 0.7 ? 'warning'
                :                         'danger'
              }
              aria-label={`Overall attendance rate ${pct}%`}
            />
            <p className="text-[10px] text-textMuted mt-1">
              Threshold: {threshold}%
            </p>
          </div>
        </div>
      </InfoCard>
    </motion.div>
  );
};

export default AttendanceSummaryPanel;
