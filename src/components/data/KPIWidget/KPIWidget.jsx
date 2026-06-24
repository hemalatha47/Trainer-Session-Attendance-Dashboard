/**
 * KPIWidget.jsx
 * KPI dashboard widget (Module 3.4, Task 8/14).
 *
 * Richer than StatCard — designed for Analytics/Dashboard page hero metrics.
 * Includes: large value, icon, trend, comparison text, status badge, loading state.
 *
 * Typography: Part 2.1 — kpiValue token (text-2xl font-bold).
 *   Consolidated from text-3xl font-extrabold → text-2xl font-bold.
 *   Rationale: text-3xl/extrabold created visual dominance inconsistent with
 *   SaaS enterprise dashboard standard. text-2xl bold is still commanding
 *   while matching StatCard hierarchy and cardValue token.
 *
 * @param {object}  props
 * @param {string}  props.title
 * @param {string|number} props.value
 * @param {string}  [props.unit]
 * @param {React.ReactNode} [props.icon]
 * @param {number}  [props.trend]
 * @param {string}  [props.trendLabel]
 * @param {string}  [props.comparisonValue]
 * @param {'default'|'success'|'warning'|'danger'} [props.status='default']
 * @param {boolean} [props.loading=false]
 * @param {function} [props.onClick]
 * @param {string}  [props.className]
 */

import { motion } from 'framer-motion';
import { cardHover, usePrefersReducedMotion } from '@constants/animations';
import { cn, safeMotion } from '@utils/componentUtils';
import { CardSkeleton } from '@components/feedback/Skeleton';
import { TrendIndicator } from '../TrendIndicator';

const STATUS_STYLES = {
  default: { border: 'border-border',          accent: 'bg-accent-600' },
  success: { border: 'border-success-border',  accent: 'bg-success-DEFAULT' },
  warning: { border: 'border-warning-border',  accent: 'bg-yellow-400' },
  danger:  { border: 'border-danger-border',   accent: 'bg-danger-DEFAULT' },
};

const KPIWidget = ({
  title,
  value,
  unit,
  icon,
  trend,
  trendLabel,
  comparisonValue,
  status = 'default',
  loading = false,
  onClick,
  className,
}) => {
  const reduced = usePrefersReducedMotion();
  if (loading) return <CardSkeleton className={className} />;

  const { border, accent } = STATUS_STYLES[status] ?? STATUS_STYLES.default;

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-md border bg-white shadow-card',
        'flex flex-col gap-3 p-5',
        border,
        onClick && 'cursor-pointer',
        className
      )}
      {...safeMotion(reduced, { variants: cardHover, initial: 'rest', whileHover: 'hover' })}
    >
      {/* Status accent stripe */}
      <span
        className={cn('absolute left-0 inset-y-0 w-1 rounded-l-md', accent)}
        aria-hidden="true"
      />

      {/* Header row */}
      <div className="flex items-center justify-between gap-2 pl-2">
        <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">{title}</p>
        {icon && (
          <span className="text-textMuted" aria-hidden="true">{icon}</span>
        )}
      </div>

      {/* Main value — kpiValue token: text-2xl font-bold */}
      <div className="flex items-end gap-1.5 pl-2">
        <p className="text-2xl font-bold text-textPrimary tabular-nums leading-none">
          {value ?? '—'}
        </p>
        {unit && (
          <span className="text-base font-medium text-textMuted mb-0.5">{unit}</span>
        )}
      </div>

      {/* Footer */}
      {(trend != null || comparisonValue) && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border pl-2">
          {trend != null && (
            <TrendIndicator value={trend} label={trendLabel} size="sm" />
          )}
          {comparisonValue && (
            <p className="text-xs text-textMuted text-right">{comparisonValue}</p>
          )}
        </div>
      )}
    </motion.div>
  );
};

KPIWidget.displayName = 'KPIWidget';

export { KPIWidget };
export default KPIWidget;
