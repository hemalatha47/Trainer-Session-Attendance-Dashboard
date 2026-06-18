/**
 * StatCard.jsx
 * Dashboard statistic card (Module 3.4, Task 4).
 *
 * Displays a single KPI: label, value, icon, optional trend, optional description.
 * Hover animation via framer-motion cardHover variant.
 * Loading state via CardSkeleton.
 *
 * Usage:
 *   <StatCard label="Total Students" value={243} icon={<Users />} trend={+5.2} trendLabel="vs last batch" />
 */

import { motion } from 'framer-motion';
import { cardHover, usePrefersReducedMotion } from '@constants/animations';
import { cn, safeMotion } from '@utils/componentUtils';
import { CardSkeleton } from '@components/feedback/Skeleton';
import { TrendIndicator } from '../TrendIndicator';

/**
 * @param {object}  props
 * @param {string}  props.label
 * @param {string|number} [props.value]
 * @param {React.ReactNode} [props.icon]
 * @param {string}  [props.description]
 * @param {number}  [props.trend]          — positive = up, negative = down, 0/null = neutral
 * @param {string}  [props.trendLabel]     — e.g. "vs last batch"
 * @param {'default'|'success'|'warning'|'danger'|'info'} [props.status='default']
 * @param {boolean} [props.loading=false]
 * @param {function} [props.onClick]
 * @param {string}  [props.className]
 */
const StatCard = ({
  label,
  value,
  icon,
  description,
  trend,
  trendLabel,
  status = 'default',
  loading = false,
  onClick,
  className,
}) => {
  const reduced = usePrefersReducedMotion();

  if (loading) return <CardSkeleton className={className} />;

  const STATUS_ICON_BG = {
    default: 'bg-accent-100 text-accent-600',
    success: 'bg-success-bg text-success-DEFAULT',
    warning: 'bg-warning-bg text-warning-text',
    danger:  'bg-danger-bg text-danger-DEFAULT',
    info:    'bg-info-bg text-info-DEFAULT',
  };

  const motionProps = safeMotion(reduced, {
    variants: cardHover,
    initial: 'rest',
    whileHover: 'hover',
  });

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'flex flex-col gap-3 rounded-md border border-border bg-white p-5 shadow-card',
        onClick && 'cursor-pointer',
        className
      )}
      {...motionProps}
    >
      {/* Top row: icon + label */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-textMuted leading-snug">{label}</p>
        {icon && (
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
              STATUS_ICON_BG[status] ?? STATUS_ICON_BG.default
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-textPrimary tabular-nums leading-none">
        {value ?? '—'}
      </p>

      {/* Trend + description */}
      {(trend != null || description) && (
        <div className="flex items-center justify-between gap-2 mt-auto">
          {trend != null ? (
            <TrendIndicator value={trend} label={trendLabel} size="sm" />
          ) : (
            <span />
          )}
          {description && (
            <p className="text-xs text-textMuted text-right truncate">{description}</p>
          )}
        </div>
      )}
    </motion.div>
  );
};

StatCard.displayName = 'StatCard';

export { StatCard };
export default StatCard;
