/**
 * AttendanceTrendCard.jsx
 * Attendance trend visualization card (Module 3.5, Task 3).
 *
 * Wraps MetricCard with attendance-specific data contract:
 *   - Colour-coded % value based on threshold
 *   - Period selector (week / month / custom)
 *   - Comparison display vs previous period
 *
 * Reuses MetricCard + TrendIndicator — no new trend logic.
 *
 * @param {object}   props.data
 *   @param {number} data.current       — current period %
 *   @param {number} [data.previous]    — previous period % (for trend calc)
 *   @param {number} [data.trend]       — pre-calculated trend; derived if omitted
 *   @param {string} [data.label]       — e.g. "Apr 7 – Apr 11"
 * @param {'week'|'month'|'quarter'|'custom'} [props.period='week']
 * @param {number}   [props.threshold=75]
 * @param {React.ReactNode} [props.chart]  — mini sparkline slot (pass Recharts component)
 * @param {boolean}  [props.loading=false]
 * @param {string}   [props.className]
 */

import { Activity } from 'lucide-react';
import { MetricCard } from '@components/data/MetricCard';
import { getAttendanceColor } from '@constants/attendanceStatus';
import { clamp } from '@utils/componentUtils';

const PERIOD_LABEL = {
  week:    'This week',
  month:   'This month',
  quarter: 'This quarter',
  custom:  'Selected period',
};

const AttendanceTrendCard = ({
  data = {},
  period = 'week',
  threshold = 75,
  chart,
  loading = false,
  className,
}) => {
  const { current = 0, previous, label } = data;
  const pct = clamp(current, 0, 100);

  // Derive trend when not pre-calculated
  const trend = data.trend != null
    ? data.trend
    : previous != null
      ? +(pct - previous).toFixed(1)
      : null;

  const ck = getAttendanceColor(pct, threshold);
  const statusMap = { success: 'success', warning: 'warning', danger: 'danger' };

  const comparisonText = previous != null
    ? `Prev. period: ${Math.round(previous)}%`
    : label ?? PERIOD_LABEL[period];

  return (
    <MetricCard
      label={`Attendance Trend · ${PERIOD_LABEL[period] ?? period}`}
      value={`${Math.round(pct)}`}
      unit="%"
      trend={trend}
      trendLabel={comparisonText}
      chart={chart ?? (
        <Activity size={18} className="text-textMuted" aria-hidden="true" />
      )}
      loading={loading}
      className={className}
    />
  );
};

AttendanceTrendCard.displayName = 'AttendanceTrendCard';

export { AttendanceTrendCard };
export default AttendanceTrendCard;
