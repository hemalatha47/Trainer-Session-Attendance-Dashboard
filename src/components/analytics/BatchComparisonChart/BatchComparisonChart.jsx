/**
 * BatchComparisonChart.jsx
 * Bar chart comparing average attendance across batches.
 * Module 6.7 — Attendance Analytics & Alerts.
 *
 * Blueprint Section 6.8: "Bar chart: Attendance comparison across all active batches"
 *
 * X-axis: batch short name / code
 * Y-axis: average attendance %
 * Color: green ≥85%, blue ≥75%, yellow ≥60%, red <60%
 */

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import { motion }       from 'framer-motion';
import { BarChart2 }    from 'lucide-react';
import { fadeIn }       from '@constants/animations';
import { cn }           from '@utils/componentUtils';
import { CardSkeleton } from '@components/feedback/Skeleton';
import { EmptyState }   from '@components/feedback/EmptyState';
import { COLORS }       from '@constants/colors';
import { classifyRisk, ANALYTICS_RISK_META } from '@services/attendanceAnalyticsService';

// ── Helpers ───────────────────────────────────────────────────────────────────

const _barColor = (risk) => {
  const map = {
    low:      COLORS?.success?.DEFAULT  ?? '#22C55E',
    medium:   COLORS?.accent?.DEFAULT   ?? '#2563EB',
    high:     COLORS?.warning?.DEFAULT  ?? '#F59E0B',
    critical: COLORS?.danger?.DEFAULT   ?? '#EF4444',
  };
  return map[risk] ?? map.medium;
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────

const BatchTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload ?? {};
  const meta = ANALYTICS_RISK_META[d.risk] ?? {};
  return (
    <div className="bg-surface border border-border rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-textPrimary mb-1 max-w-[200px] truncate">{d.batchName}</p>
      <p className="text-textMuted">
        Avg Attendance:{' '}
        <span className="font-semibold text-textPrimary">{d.averageRate}%</span>
      </p>
      <p className="text-textMuted">Sessions: {d.totalSessions}</p>
      <span className={cn('inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium border', meta.bgClass)}>
        {meta.label}
      </span>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {Array}   props.data        — [{ batchId, batchName, shortName, averageRate, totalSessions, risk }]
 * @param {number}  [props.threshold=75]
 * @param {boolean} [props.loading=false]
 * @param {string}  [props.error]
 * @param {string}  [props.className]
 */
const BatchComparisonChart = ({
  data = [],
  threshold = 75,
  loading = false,
  error,
  className,
}) => {
  if (loading) return <CardSkeleton className={cn('h-72', className)} />;

  const refColor = COLORS?.warning?.DEFAULT ?? '#F59E0B';

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
      aria-label="Batch attendance comparison chart"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart2 size={18} className="text-accent-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-textPrimary">Batch Comparison</h3>
      </div>

      {error ? (
        <div className="flex items-center justify-center h-48 text-sm text-danger-600">
          {error}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={<BarChart2 size={28} />}
          title="No batch data available"
          description="Batches with attendance records will appear here."
          className="py-8"
        />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="shortName"
              tick={{ fontSize: 10, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={40}
            />
            <Tooltip content={<BatchTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
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
            <Bar dataKey="averageRate" radius={[4, 4, 0, 0]} maxBarSize={60}>
              {data.map((entry) => (
                <Cell key={entry.batchId} fill={_barColor(entry.risk)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {data.length > 0 && (
        <div className="flex flex-wrap gap-3 text-xs text-textMuted">
          {[
            { risk: 'low',      label: '≥85%',  color: COLORS?.success?.DEFAULT  ?? '#22C55E' },
            { risk: 'medium',   label: '75–84%', color: COLORS?.accent?.DEFAULT   ?? '#2563EB' },
            { risk: 'high',     label: '60–74%', color: COLORS?.warning?.DEFAULT  ?? '#F59E0B' },
            { risk: 'critical', label: '<60%',   color: COLORS?.danger?.DEFAULT   ?? '#EF4444' },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: color }}
                aria-hidden="true"
              />
              {label}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default BatchComparisonChart;
