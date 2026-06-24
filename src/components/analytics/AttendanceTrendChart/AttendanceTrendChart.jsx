/**
 * AttendanceTrendChart.jsx
 * Module 8.3 — Analytics Charts & Summary Views (enhanced from Module 6.7)
 *
 * Line chart showing attendance rate trend with:
 *  - Highest and lowest session markers (custom dot renderer)
 *  - Overall trend direction badge in card header
 *  - Delta label (e.g. "+4.5% over period")
 *  - Batch selector (if multiple batches available)
 *  - Reference line at threshold
 *  - Full loading / empty / error states
 *
 * Blueprint Section 6.8: "Line chart: Attendance trend over time for a selected batch"
 *
 * Recharts: ResponsiveContainer → LineChart → Line, XAxis, YAxis,
 *           CartesianGrid, Tooltip, ReferenceLine, Dot
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
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { fadeIn }           from '@constants/animations';
import { cn }               from '@utils/componentUtils';
import { CardSkeleton }     from '@components/feedback/Skeleton';
import { EmptyState }       from '@components/feedback/EmptyState';
import { COLORS }           from '@constants/colors';

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

const TrendTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload ?? {};
  return (
    <div
      className="bg-surface border border-border rounded-lg shadow-md px-3 py-2 text-xs"
      role="tooltip"
    >
      <p className="font-semibold text-textPrimary mb-1">{d.displayDate ?? d.date}</p>
      <p className="text-textMuted">
        Attendance:{' '}
        <span className="font-semibold text-accent-600">{d.rate}%</span>
      </p>
      <p className="text-textMuted">
        Present: {d.presentCount} · Absent: {d.absentCount}
      </p>
      {d.highPoint && (
        <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-success-bg text-success-DEFAULT text-[10px] font-medium">
          Highest
        </span>
      )}
      {d.lowPoint && (
        <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-danger-bg text-danger-DEFAULT text-[10px] font-medium">
          Lowest
        </span>
      )}
    </div>
  );
};

// ── Custom Dot renderer — highlights high/low points ──────────────────────────

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  if (!payload) return null;

  const lineColor = COLORS?.accent?.DEFAULT ?? '#2563EB';

  if (payload.highPoint) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={COLORS?.success?.DEFAULT ?? '#15803D'}
        stroke="#fff"
        strokeWidth={2}
        aria-label={`Highest point: ${payload.rate}%`}
      />
    );
  }
  if (payload.lowPoint) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={COLORS?.danger?.DEFAULT ?? '#B91C1C'}
        stroke="#fff"
        strokeWidth={2}
        aria-label={`Lowest point: ${payload.rate}%`}
      />
    );
  }
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill={lineColor}
      strokeWidth={0}
    />
  );
};

// ── Trend direction badge ─────────────────────────────────────────────────────

const TrendBadge = ({ trend, delta }) => {
  if (trend === 'flat' || delta === 0) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-textMuted border border-neutral-200">
        <Minus size={11} aria-hidden="true" />
        Stable
      </span>
    );
  }
  const isUp = trend === 'up';
  return (
    <span
      className={cn(
        'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        isUp
          ? 'bg-success-bg text-success-DEFAULT border-success-border'
          : 'bg-danger-bg text-danger-DEFAULT border-danger-border'
      )}
      aria-label={`Trend ${isUp ? 'up' : 'down'} ${Math.abs(delta)}%`}
    >
      {isUp ? <TrendingUp size={11} aria-hidden="true" /> : <TrendingDown size={11} aria-hidden="true" />}
      {isUp ? '+' : ''}{delta}%
    </span>
  );
};

// ── Batch Selector ─────────────────────────────────────────────────────────────

const BatchSelector = ({ batches, value, onChange }) => (
  <select
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value || null)}
    className={cn(
      'text-xs border border-border rounded-md px-2 py-1',
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

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {Array}    props.data              — annotated series from analyticsInsightsService
 * @param {object}   [props.meta]            — { overallTrend, delta, highPoint, lowPoint, from, to }
 * @param {number}   [props.threshold=75]
 * @param {boolean}  [props.loading=false]
 * @param {string}   [props.error]
 * @param {Array}    [props.batches=[]]      — [{ id, name }]
 * @param {string}   [props.selectedBatchId]
 * @param {function} [props.onBatchChange]
 * @param {string}   [props.className]
 */
const AttendanceTrendChart = ({
  data = [],
  meta,
  threshold = 75,
  loading = false,
  error,
  batches = [],
  selectedBatchId,
  onBatchChange,
  className,
}) => {
  if (loading) return <CardSkeleton className={cn('h-80', className)} />;

  const lineColor = COLORS?.accent?.DEFAULT  ?? '#2563EB';
  const refColor  = COLORS?.warning?.DEFAULT ?? '#F59E0B';

  const trend = meta?.overallTrend ?? 'flat';
  const delta = meta?.delta        ?? 0;

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
          {data.length > 0 && <TrendBadge trend={trend} delta={delta} />}
        </div>
        <div className="flex items-center gap-2">
          {batches.length > 0 && onBatchChange && (
            <BatchSelector batches={batches} value={selectedBatchId} onChange={onBatchChange} />
          )}
          {meta?.from && meta?.to && (
            <span className="text-xs text-textMuted">{meta.from} → {meta.to}</span>
          )}
        </div>
      </div>

      {/* High/Low legend */}
      {data.length > 0 && (meta?.highPoint !== null || meta?.lowPoint !== null) && (
        <div className="flex gap-3 text-xs text-textMuted" aria-label="Chart markers legend">
          {meta?.highPoint != null && (
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full border-2 border-white"
                style={{ background: COLORS?.success?.DEFAULT ?? '#15803D' }}
                aria-hidden="true"
              />
              High: {meta.highPoint}%
            </span>
          )}
          {meta?.lowPoint != null && (
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full border-2 border-white"
                style={{ background: COLORS?.danger?.DEFAULT ?? '#B91C1C' }}
                aria-hidden="true"
              />
              Low: {meta.lowPoint}%
            </span>
          )}
        </div>
      )}

      {/* Chart or empty/error */}
      {error ? (
        <div
          className="flex items-center justify-center h-48 text-sm text-danger-600 rounded-lg bg-danger-bg/30 border border-danger-border"
          role="alert"
        >
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
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
              dot={<CustomDot />}
              activeDot={{ r: 5 }}
              name="Attendance %"
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {data.length > 0 && (
        <p className="text-xs text-textMuted text-right">
          Dashed line = {threshold}% threshold · Green dot = highest · Red dot = lowest
        </p>
      )}
    </motion.div>
  );
};

AttendanceTrendChart.displayName = 'AttendanceTrendChart';

export default AttendanceTrendChart;
