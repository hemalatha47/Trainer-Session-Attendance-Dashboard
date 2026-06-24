/**
 * MetricCard.jsx
 * Large KPI metric card for Analytics/Dashboard (Module 3.4, Task 5).
 *
 * Typography: Part 2.1 — kpiValue token (text-2xl font-bold).
 *   Consolidated from text-3xl font-bold → text-2xl font-bold.
 *   Unit: text-lg font-semibold → text-base font-medium (kpiUnit token).
 */

import { motion } from 'framer-motion';
import { cardHover, usePrefersReducedMotion } from '@constants/animations';
import { cn, safeMotion } from '@utils/componentUtils';
import { CardSkeleton } from '@components/feedback/Skeleton';
import { TrendIndicator } from '../TrendIndicator';

/**
 * @param {object}  props
 * @param {string}  props.label
 * @param {string|number} props.value
 * @param {string}  [props.unit]
 * @param {string}  [props.comparisonLabel]
 * @param {number}  [props.trend]
 * @param {string}  [props.trendLabel]
 * @param {React.ReactNode} [props.chart]
 * @param {React.ReactNode} [props.icon]
 * @param {boolean} [props.loading=false]
 * @param {string}  [props.className]
 */
const MetricCard = ({
  label,
  value,
  unit,
  comparisonLabel,
  trend,
  trendLabel,
  chart,
  icon,
  loading = false,
  className,
}) => {
  const reduced = usePrefersReducedMotion();
  if (loading) return <CardSkeleton className={className} />;

  return (
    <motion.div
      className={cn(
        'flex flex-col gap-2 rounded-md border border-border bg-white p-5 shadow-card',
        className
      )}
      {...safeMotion(reduced, { variants: cardHover, initial: 'rest', whileHover: 'hover' })}
    >
      {/* Label row — cardTitle token */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-textMuted">{label}</p>
        {icon && (
          <span className="text-textMuted" aria-hidden="true">{icon}</span>
        )}
      </div>

      {/* Value — kpiValue token: text-2xl font-bold */}
      <div className="flex items-end gap-1">
        <p className="text-2xl font-bold text-textPrimary tabular-nums leading-none">
          {value ?? '—'}
        </p>
        {unit && (
          <span className="text-base font-medium text-textMuted mb-0.5">{unit}</span>
        )}
      </div>

      {/* Mini chart */}
      {chart && (
        <div className="h-14 -mx-1" aria-hidden="true">{chart}</div>
      )}

      {/* Comparison + trend */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
        {comparisonLabel && (
          <p className="text-xs text-textMuted">{comparisonLabel}</p>
        )}
        {trend != null && (
          <TrendIndicator value={trend} label={trendLabel} size="sm" />
        )}
      </div>
    </motion.div>
  );
};

MetricCard.displayName = 'MetricCard';

export { MetricCard };
export default MetricCard;
