/**
 * ProgressBar.jsx
 * Animated horizontal progress bar (Module 3.4, Task 4/9).
 *
 * Used for: attendance percentage, completion tracking, analytics bars.
 * Color is automatically derived from value vs threshold for attendance use cases.
 *
 * @param {number}  props.value         — 0–100
 * @param {number}  [props.max=100]
 * @param {string}  [props.label]       — visible label above bar
 * @param {boolean} [props.showValue=false] — show percentage inside/after bar
 * @param {'default'|'success'|'warning'|'danger'|'auto'} [props.color='default']
 *   'auto' = green ≥75, yellow 50–74, red <50 (attendance threshold)
 * @param {number}  [props.threshold=75] — used when color='auto'
 * @param {'xs'|'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.animated=true]
 * @param {string}  [props.className]
 */

import { motion } from 'framer-motion';
import { TRANSITIONS, usePrefersReducedMotion } from '@constants/animations';
import { cn, clamp } from '@utils/componentUtils';

const SIZE_H = { xs: 'h-1', sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

const BAR_COLOR = {
  default: 'bg-accent-600',
  success: 'bg-success-DEFAULT',
  warning: 'bg-yellow-400',
  danger:  'bg-danger-DEFAULT',
};

const resolveColor = (color, value, threshold) => {
  if (color === 'auto') {
    if (value >= threshold) return BAR_COLOR.success;
    if (value >= threshold * 0.67) return BAR_COLOR.warning;
    return BAR_COLOR.danger;
  }
  return BAR_COLOR[color] ?? BAR_COLOR.default;
};

const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  showValue = false,
  color = 'default',
  threshold = 75,
  size = 'md',
  animated = true,
  className,
}) => {
  const reduced = usePrefersReducedMotion();
  const pct = clamp((value / max) * 100, 0, 100);
  const barColor = resolveColor(color, pct, threshold);
  const heightCls = SIZE_H[size] ?? SIZE_H.md;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* Label row */}
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <span className="text-xs font-medium text-textMuted truncate">{label}</span>
          )}
          {showValue && (
            <span className="text-xs font-semibold text-textPrimary tabular-nums shrink-0">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${Math.round(pct)}% progress`}
        className={cn('w-full overflow-hidden rounded-full bg-neutral-200', heightCls)}
      >
        {/* Fill */}
        {animated && !reduced ? (
          <motion.div
            className={cn('h-full rounded-full', barColor)}
            initial={{ width: '0%' }}
            animate={{ width: `${pct}%` }}
            transition={{ ...TRANSITIONS.slow, type: 'tween' }}
          />
        ) : (
          <div
            className={cn('h-full rounded-full', barColor)}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';

export { ProgressBar };
export default ProgressBar;
