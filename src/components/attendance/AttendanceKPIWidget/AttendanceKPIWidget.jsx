/**
 * AttendanceKPIWidget.jsx
 * Domain-specific KPI widget for attendance metrics (Module 3.5, Task 1).
 *
 * Wraps the existing KPIWidget with attendance-aware status colour logic,
 * threshold awareness, and a normalised data contract.
 *
 * Modes (period):
 *   'daily'   — today's attendance rate
 *   'weekly'  — this week average
 *   'monthly' — this month average
 *   'batch'   — overall batch average
 *   'student' — individual student %
 *
 * @param {object}  props.data            — { value, total?, present?, trend?, comparisonLabel? }
 * @param {'daily'|'weekly'|'monthly'|'batch'|'student'} [props.period='batch']
 * @param {number}  [props.threshold=75]
 * @param {string}  [props.title]         — override auto title
 * @param {boolean} [props.loading=false]
 * @param {function} [props.onClick]
 * @param {string}  [props.className]
 */

import { Users, CalendarDays, BarChart2, TrendingUp, UserCheck } from 'lucide-react';
import { KPIWidget } from '@components/data/KPIWidget';
import { getAttendanceColor } from '@constants/attendanceStatus';
import { cn, clamp } from '@utils/componentUtils';

// ── Period meta ───────────────────────────────────────────────────────────────
const PERIOD_META = {
  daily:   { label: "Today's Attendance",  icon: <CalendarDays size={20} />, unit: '%' },
  weekly:  { label: 'Weekly Average',      icon: <BarChart2   size={20} />, unit: '%' },
  monthly: { label: 'Monthly Average',     icon: <TrendingUp  size={20} />, unit: '%' },
  batch:   { label: 'Batch Attendance',    icon: <Users       size={20} />, unit: '%' },
  student: { label: 'Student Attendance',  icon: <UserCheck   size={20} />, unit: '%' },
};

const AttendanceKPIWidget = ({
  data = {},
  period = 'batch',
  threshold = 75,
  title,
  loading = false,
  onClick,
  className,
}) => {
  const {
    value = 0,
    trend,
    comparisonLabel,
    present,
    total,
  } = data;

  const pct = clamp(
    data.percentage != null
      ? data.percentage
      : total > 0
        ? (present / total) * 100
        : value,
    0, 100,
  );

  const colorKey = getAttendanceColor(pct, threshold);
  const statusMap = { success: 'success', warning: 'warning', danger: 'danger' };

  const meta = PERIOD_META[period] ?? PERIOD_META.batch;

  return (
    <KPIWidget
      title={title ?? meta.label}
      value={Math.round(pct)}
      unit={meta.unit}
      icon={meta.icon}
      trend={trend}
      trendLabel={comparisonLabel ?? `vs threshold ${threshold}%`}
      comparisonValue={total != null ? `${present ?? '—'} / ${total} sessions` : undefined}
      status={statusMap[colorKey]}
      loading={loading}
      onClick={onClick}
      className={className}
    />
  );
};

AttendanceKPIWidget.displayName = 'AttendanceKPIWidget';

export { AttendanceKPIWidget };
export default AttendanceKPIWidget;
