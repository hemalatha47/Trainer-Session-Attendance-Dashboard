/**
 * AttendanceTrendChart.jsx
 * Line chart showing daily attendance rate trend.
 * Module 6.7 — Attendance Analytics & Alerts.
 *
 * Blueprint Section 6.8: "Line chart: Attendance trend over time for a selected batch"
 *
 * X-axis: session dates
 * Y-axis: attendance % (0–100)
 * Reference line: at threshold
 * Empty / loading / error states handled.
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
  Legend,
} from 'recharts';
import { motion }          from 'framer-motion';
import { Activity }        from 'lucide-react';
import { fadeIn }          from '@constants/animations';
import { cn }              from '@utils/componentUtils';
import { CardSkeleton }    from '@components/feedback/Skeleton';
import { EmptyState }      from '@components/feedback/EmptyState';
import { COLORS }          from '@constants/colors';

// ── Custom Tooltip ────────────────────────────────────────────────────────────

const TrendTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload ?? {};
  return (
    <div className="bg-surface border border-border rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-textPrimary mb-1">{d.displayDate ?? d.date}</p>
      <p className="text-textMuted">
        Attendance:{' '}
        <span className="font-semibold text-accent-600">{d.rate}%</span>
      </p>
      <p className="text-textMuted">
        Present: {d.presentCount} · Absent: {d.absentCount}
      </p>
    </div>
  );
};

// ── Batch Selector ────────────────────────────────────────────────────────────

const BatchSelector = ({ batches, value, onChange }) => (
  <select
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value || null)}
    className={cn(
      'text-sm border border-border rounded-md px-2 py-1',
      'bg-surface text-textPrimary',
      'focus:outline-none focus:ring-2 focus:ring-accent-400'
    )}
    aria-label="Select batch for trend chart"
  >
    <option value="">All Batches</option>
    {batches.map((b) => (
      <option key={b.id} value={b.id}>{b.name}</option>
    ))}
  </select>
);

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {Array}    props.data              — [{ date, displayDate, rate, presentCount, absentCount }]
 * @param {number}   [props.threshold=75]
 * @param {boolean}  [props.loading=false]
 * @param {string}   [props.error]
 * @param {Array}    [props.batches=[]]       — [{ id, name }]
 * @param {string}   [props.selectedBatchId]
 * @param {function} [props.onBatchChange]
 * @param {string}   [props.className]
 */
const AttendanceTrendChart = ({
  data = [],
  threshold = 75,
  loading = false,
  error,
  batches = [],
  selectedBatchId,
  onBatchChange,
  className,
}) => {
  if (loading) return <CardSkeleton className={cn('h-72', className)} />;

  const lineColor = COLORS?.accent?.DEFAULT ?? '#2563EB';
  const refColor  = COLORS?.warning?.DEFAULT ?? '#F59E0B';

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className={cn(
        'bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col gap-4',
        className
      )}
      role="region"
      aria-label="Attendance trend chart"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-accent-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-textPrimary">Attendance Trend</h3>
        </div>
        {batches.length > 0 && onBatchChange && (
          <BatchSelector
            batches={batches}
            value={selectedBatchId}
            onChange={onBatchChange}
          />
        )}
      </div>

      {/* Chart or empty/error */}
      {error ? (
        <div className="flex items-center justify-center h-48 text-sm text-danger-600">
          {error}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={<Activity size={28} />}
          title="No trend data available"
          description="Attendance sessions will appear here once data is recorded."
          className="py-8"
        />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={40}
            />
            <Tooltip content={<TrendTooltip />} />
            <ReferenceLine
              y={threshold}
              stroke={refColor}
              strokeDasharray="4 4"
              label={{
                value: `${threshold}%`,
                fill: refColor,
                fontSize: 11,
                position: 'insideTopRight',
              }}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke={lineColor}
              strokeWidth={2.5}
              dot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              name="Attendance %"
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Legend note */}
      {data.length > 0 && (
        <p className="text-xs text-textMuted text-right">
          Dashed line = {threshold}% threshold
        </p>
      )}
    </motion.div>
  );
};

export default AttendanceTrendChart;
