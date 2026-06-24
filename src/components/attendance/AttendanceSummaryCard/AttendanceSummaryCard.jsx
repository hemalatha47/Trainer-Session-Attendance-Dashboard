/**
 * AttendanceSummaryCard.jsx
 * Attendance breakdown card (Module 3.5, Task 5).
 *
 * Typography: Part 2.1 — big percentage capped at text-2xl font-bold.
 *   Consolidated from text-4xl → text-2xl (kpiValue token).
 *   StatPill count: text-lg font-bold → text-base font-semibold.
 *   Unit "%": text-lg → text-sm (helper context, not a KPI standalone).
 */

import { motion } from 'framer-motion';
import { cardHover, usePrefersReducedMotion } from '@constants/animations';
import { cn, safeMotion, clamp } from '@utils/componentUtils';
import { ProgressBar } from '@components/data/ProgressBar';
import { TrendIndicator } from '@components/data/TrendIndicator';
import { CardSkeleton } from '@components/feedback/Skeleton';
import { AttendanceStatusChip } from '../AttendanceStatusChip';
import { ATTENDANCE_STATUS, getAttendanceColor } from '@constants/attendanceStatus';

// ── Stat pill ─────────────────────────────────────────────────────────────────
const StatPill = ({ status, count }) => (
  <div className="flex flex-col items-center gap-1 min-w-[52px]">
    <span className="text-base font-semibold text-textPrimary tabular-nums leading-none">
      {count ?? 0}
    </span>
    <AttendanceStatusChip status={status} mode="compact" size="sm" />
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const AttendanceSummaryCard = ({
  data = {},
  threshold = 75,
  trend,
  trendLabel = 'vs last period',
  title = 'Attendance Summary',
  loading = false,
  compact = false,
  className,
}) => {
  const reduced = usePrefersReducedMotion();

  if (loading) return <CardSkeleton className={className} />;

  const { present = 0, absent = 0, late = 0, leave = 0, total = 0 } = data;
  const pct = data.percentage != null
    ? clamp(data.percentage, 0, 100)
    : total > 0 ? clamp((present / total) * 100, 0, 100) : 0;

  const colorKey = getAttendanceColor(pct, threshold);
  const colorMap = { success: 'success', warning: 'warning', danger: 'danger' };
  const barColor = colorMap[colorKey];

  const motionProps = safeMotion(reduced, {
    variants: cardHover,
    initial: 'rest',
    whileHover: 'hover',
  });

  return (
    <motion.div
      className={cn(
        'flex flex-col gap-4 rounded-md border border-border bg-white shadow-card',
        compact ? 'p-4' : 'p-5',
        className,
      )}
      {...motionProps}
    >
      {/* Header — sectionTitle token */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-textPrimary">{title}</h3>
        {trend != null && (
          <TrendIndicator value={trend} label={trendLabel} size="sm" />
        )}
      </div>

      {/* Big percentage — kpiValue token: text-2xl font-bold */}
      <div className="flex items-end gap-2">
        <span className={cn(
          'text-2xl font-bold tabular-nums leading-none',
          colorKey === 'success' ? 'text-success-DEFAULT'
            : colorKey === 'warning' ? 'text-warning-text'
              : 'text-danger-DEFAULT',
        )}>
          {Math.round(pct)}
        </span>
        <span className="text-sm font-medium text-textMuted mb-0.5">%</span>
        <span className="ml-auto text-xs text-textMuted">
          {present}/{total} sessions
        </span>
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={pct}
        color={barColor}
        threshold={threshold}
        size="md"
        animated
      />

      {/* Breakdown pills */}
      {!compact && (
        <div className="flex items-center justify-around pt-1 border-t border-border">
          <StatPill status={ATTENDANCE_STATUS.PRESENT} count={present} />
          <StatPill status={ATTENDANCE_STATUS.ABSENT}  count={absent}  />
          {late  > 0 && <StatPill status={ATTENDANCE_STATUS.LATE}  count={late}  />}
          {leave > 0 && <StatPill status={ATTENDANCE_STATUS.LEAVE} count={leave} />}
        </div>
      )}
    </motion.div>
  );
};

AttendanceSummaryCard.displayName = 'AttendanceSummaryCard';

export { AttendanceSummaryCard };
export default AttendanceSummaryCard;
