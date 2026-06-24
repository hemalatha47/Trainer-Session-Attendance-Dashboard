/**
 * AnalyticsTrendPreview.jsx
 * Module 8.1 — Analytics Dashboard Page.
 *
 * Lightweight line chart showing the last 14 days of attendance trend
 * across all batches combined. Purpose: quick visual trend at a glance.
 *
 * Reuses Recharts (already in the project bundle).
 * Full analytics charts live on the existing Analytics page.
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
import { motion }         from 'framer-motion';
import { TrendingUp }     from 'lucide-react';
import { fadeIn, usePrefersReducedMotion } from '@constants/animations';
import { cn, safeMotion } from '@utils/componentUtils';
import { CardSkeleton }   from '@components/feedback/Skeleton';
import { EmptyState }     from '@components/feedback/EmptyState';

// ── Custom tooltip ─────────────────────────────────────────────────────────────

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const rate = payload[0]?.value;
  return (
    <div
      className="bg-white border border-border rounded-md shadow-floating px-3 py-2 text-xs"
      role="tooltip"
    >
      <p className="font-medium text-textPrimary">{label}</p>
      <p className="text-textMuted mt-0.5">
        Attendance:{' '}
        <span className="font-semibold text-textPrimary">{rate}%</span>
      </p>
    </div>
  );
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {Array}    props.data           — trend data from getTrendPreview()
 * @param {number}   [props.threshold=75]
 * @param {boolean}  [props.loading=false]
 * @param {string}   [props.error]
 * @param {string}   [props.className]
 */
const AnalyticsTrendPreview = ({
  data = [],
  threshold = 75,
  loading = false,
  error,
  className,
}) => {
  const reduced = usePrefersReducedMotion();

  if (loading) {
    return (
      <div className={cn('rounded-md border border-border bg-white p-5 shadow-card', className)}>
        <CardSkeleton />
      </div>
    );
  }

  const lineColor = '#2563EB';  // accent-600
  const refColor  = '#F59E0B';  // warning

  return (
    <motion.div
      {...safeMotion(reduced, { variants: fadeIn, initial: 'initial', animate: 'animate' })}
      className={cn(
        'rounded-md border border-border bg-white p-5 shadow-card flex flex-col gap-4',
        className
      )}
      role="region"
      aria-label="14-day attendance trend preview"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp size={18} className="text-accent-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-textPrimary">14-Day Trend</h3>
        <span className="ml-auto text-xs text-textMuted">All batches combined</span>
      </div>

      {/* Chart content */}
      {error ? (
        <div className="flex items-center justify-center h-48 text-sm text-danger-600">
          {error}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={<TrendingUp size={28} />}
          title="No trend data yet"
          description="Attendance trend will appear once sessions are recorded."
          className="py-8"
        />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 10, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#64748B' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={36}
            />
            <Tooltip content={<TrendTooltip />} />
            <ReferenceLine
              y={threshold}
              stroke={refColor}
              strokeDasharray="4 4"
              label={{
                value: `${threshold}%`,
                fill: refColor,
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ r: 2.5, fill: lineColor, strokeWidth: 0 }}
              activeDot={{ r: 4 }}
              name="Attendance %"
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {data.length > 0 && (
        <p className="text-xs text-textMuted text-right">
          Dashed line = {threshold}% threshold
        </p>
      )}
    </motion.div>
  );
};

AnalyticsTrendPreview.displayName = 'AnalyticsTrendPreview';

export default AnalyticsTrendPreview;
