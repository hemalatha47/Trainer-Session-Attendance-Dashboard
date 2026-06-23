/**
 * StudentAttendanceChart.jsx
 * Attendance trend line chart for Student Details Page (Module 5.6).
 *
 * Renders a running-average attendance rate over sessions using Recharts.
 * Each data point represents: cumulative attendance % after each session.
 *
 * Design:
 *   - Compact card with section header
 *   - ResponsiveContainer → LineChart
 *   - Threshold reference line at configured %
 *   - Color-coded line based on final percentage
 *   - Handles empty state gracefully
 *
 * @param {object[]} chartSeries  — [{ date, rate, sessionIndex }]
 * @param {number}   [threshold=75]
 * @param {boolean}  [loading=false]
 * @param {string}   [className]
 */

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { motion }           from 'framer-motion';
import { Activity }         from 'lucide-react';
import { fadeIn }           from '@constants/animations';
import { cn }               from '@utils/componentUtils';
import { CardSkeleton }     from '@components/feedback/Skeleton';
import { NoAttendanceData } from '@components/attendance/AttendanceEmptyStates';
import { FONT_SIZE_PX }     from '@constants/typography';

// ── Custom tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const { date, rate } = payload[0]?.payload ?? {};
  return (
    <div className="bg-surface border border-border rounded-md shadow-md px-3 py-2">
      <p className="text-xs font-semibold text-textPrimary">{date ?? label}</p>
      <p className="text-xs text-textMuted mt-0.5">
        Running rate:{' '}
        <span className="font-semibold text-textPrimary">{rate}%</span>
      </p>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const StudentAttendanceChart = ({
  chartSeries = [],
  threshold = 75,
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn('bg-surface rounded-xl border border-border shadow-sm p-5', className)}>
        <h3 className="text-base font-semibold text-textPrimary mb-4">Attendance Trend</h3>
        <CardSkeleton />
      </div>
    );
  }

  const hasData = Array.isArray(chartSeries) && chartSeries.length > 0;

  // Determine line color from final rate
  const finalRate = hasData ? (chartSeries[chartSeries.length - 1]?.rate ?? 0) : 0;
  const lineColor = finalRate >= threshold
    ? 'var(--color-success, #16a34a)'
    : finalRate >= 60
      ? 'var(--color-warning, #d97706)'
      : 'var(--color-danger, #dc2626)';

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className={cn(
        'bg-surface rounded-xl border border-border shadow-sm p-5',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-textMuted" aria-hidden="true" />
        <h3 className="text-base font-semibold text-textPrimary">Attendance Trend</h3>
        {hasData && (
          <span className="ml-auto text-xs text-textMuted">
            {chartSeries.length} session{chartSeries.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Chart or empty state */}
      {!hasData ? (
        <NoAttendanceData className="py-6" />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart
            data={chartSeries}
            margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e2e8f0)" vertical={false} />
            <XAxis
              dataKey="sessionIndex"
              tick={{ fontSize: FONT_SIZE_PX.xs, fill: 'var(--color-textMuted, #64748b)' }}
              tickLine={false}
              axisLine={false}
              label={{
                value: 'Session',
                position: 'insideBottom',
                offset: -2,
                fontSize: FONT_SIZE_PX.xs,
                fill: 'var(--color-textMuted, #64748b)',
              }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: FONT_SIZE_PX.xs, fill: 'var(--color-textMuted, #64748b)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<ChartTooltip />} />
            {/* Threshold reference line */}
            <ReferenceLine
              y={threshold}
              stroke="var(--color-warning, #d97706)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `${threshold}%`,
                position: 'right',
                fontSize: FONT_SIZE_PX.xs,
                fill: 'var(--color-warning, #d97706)',
              }}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke={lineColor}
              strokeWidth={2}
              dot={chartSeries.length <= 15}
              activeDot={{ r: 4 }}
              name="Attendance %"
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Legend row */}
      {hasData && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-0.5 inline-block rounded"
              style={{ backgroundColor: lineColor }}
            />
            <span className="text-xs text-textMuted">Cumulative rate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 inline-block rounded bg-yellow-500 opacity-60" style={{ borderTop: '2px dashed' }} />
            <span className="text-xs text-textMuted">{threshold}% threshold</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

StudentAttendanceChart.displayName = 'StudentAttendanceChart';

export { StudentAttendanceChart };
export default StudentAttendanceChart;
