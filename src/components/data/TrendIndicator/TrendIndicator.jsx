/**
 * TrendIndicator.jsx
 * Visual trend indicator (Module 3.4, Task 10).
 *
 * Shows positive/negative/neutral percentage change with icon and color.
 * Used in StatCard, MetricCard, KPIWidget, Analytics page.
 *
 * @param {number}  props.value       — numeric change (positive = up, negative = down)
 * @param {string}  [props.label]     — contextual label, e.g. "vs last batch"
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.showIcon=true]
 * @param {string}  [props.className]
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@utils/componentUtils';

const SIZE = {
  sm: { text: 'text-xs', icon: 'w-3.5 h-3.5', gap: 'gap-0.5' },
  md: { text: 'text-sm', icon: 'w-4 h-4',     gap: 'gap-1'   },
  lg: { text: 'text-base', icon: 'w-5 h-5',   gap: 'gap-1.5' },
};

const TrendIndicator = ({
  value,
  label,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const { text, icon, gap } = SIZE[size] ?? SIZE.md;

  const isUp      = value > 0;
  const isDown    = value < 0;
  const isNeutral = value === 0 || value == null;

  const colorCls = isUp
    ? 'text-success-DEFAULT'
    : isDown
      ? 'text-danger-DEFAULT'
      : 'text-textMuted';

  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const displayValue = value != null ? `${isUp ? '+' : ''}${Number(value).toFixed(1)}%` : '—';

  return (
    <span
      className={cn('inline-flex items-center flex-wrap', gap, className)}
      aria-label={`Trend: ${displayValue}${label ? ` ${label}` : ''}`}
    >
      <span className={cn('inline-flex items-center', gap, colorCls)}>
        {showIcon && <Icon className={cn(icon, 'shrink-0')} aria-hidden="true" />}
        <span className={cn('font-medium tabular-nums', text)}>{displayValue}</span>
      </span>
      {label && (
        <span className={cn('text-textMuted', text === 'text-xs' ? 'text-[10px]' : 'text-xs')}>
          {label}
        </span>
      )}
    </span>
  );
};

TrendIndicator.displayName = 'TrendIndicator';

export { TrendIndicator };
export default TrendIndicator;
