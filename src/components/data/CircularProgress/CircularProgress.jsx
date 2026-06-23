/**
 * CircularProgress.jsx
 * SVG circular progress ring + PercentageIndicator (Module 3.4, Task 4/9).
 *
 * CircularProgress: animated SVG arc showing a percentage value.
 * PercentageIndicator: compact inline text+color representation.
 */

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@constants/animations';
import { cn, clamp } from '@utils/componentUtils';
import { COLORS } from '@constants/colors';

// ── Shared color resolver (mirrors ProgressBar's 'auto' logic) ────────────────
const resolveStroke = (color, pct, threshold) => {
  if (color === 'auto') {
    if (pct >= threshold) return COLORS.present.dot;  // success green
    if (pct >= threshold * 0.67) return COLORS.late.dot;  // warning yellow
    return COLORS.absent.dot;                              // danger red
  }
  const map = {
    default: COLORS.accent[600],
    success: COLORS.present.dot,
    warning: COLORS.late.dot,
    danger:  COLORS.absent.dot,
  };
  return map[color] ?? map.default;
};

// ── CircularProgress ─────────────────────────────────────────────────────────

/**
 * @param {number}  props.value
 * @param {number}  [props.max=100]
 * @param {number}  [props.size=64]        — diameter in px
 * @param {number}  [props.strokeWidth=6]
 * @param {'default'|'success'|'warning'|'danger'|'auto'} [props.color='default']
 * @param {number}  [props.threshold=75]
 * @param {boolean} [props.showValue=true] — center label
 * @param {string}  [props.label]          — aria-label
 * @param {string}  [props.className]
 */
const CircularProgress = ({
  value = 0,
  max = 100,
  size = 64,
  strokeWidth = 6,
  color = 'default',
  threshold = 75,
  showValue = true,
  label,
  className,
}) => {
  const reduced = usePrefersReducedMotion();
  const pct = clamp((value / max) * 100, 0, 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const stroke = resolveStroke(color, pct, threshold);

  return (
    <div
      role="img"
      aria-label={label ?? `${Math.round(pct)}% progress`}
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={COLORS.neutral[200]}
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        {reduced ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        ) : (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}
      </svg>

      {/* Center value */}
      {showValue && (
        <span
          className="absolute text-xs font-bold tabular-nums text-textPrimary"
          aria-hidden="true"
        >
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
};

CircularProgress.displayName = 'CircularProgress';

// ── PercentageIndicator ───────────────────────────────────────────────────────

/**
 * Compact inline text badge showing a percentage with color based on value.
 *
 * @param {number}  props.value
 * @param {number}  [props.threshold=75]
 * @param {string}  [props.className]
 * @param {boolean} [props.showBar=false] — inline mini bar
 */
const PercentageIndicator = ({ value, threshold = 75, className, showBar = false }) => {
  const pct = clamp(Number(value ?? 0), 0, 100);
  const colorCls =
    pct >= threshold
      ? 'text-success-DEFAULT'
      : pct >= threshold * 0.67
        ? 'text-warning-text'
        : 'text-danger-DEFAULT';

  return (
    <span
      className={cn('inline-flex items-center gap-1.5', className)}
      aria-label={`${Math.round(pct)}%`}
    >
      <span className={cn('text-sm font-semibold tabular-nums', colorCls)}>
        {Math.round(pct)}%
      </span>
      {showBar && (
        <span className="inline-block w-12 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
          <span
            className={cn(
              'block h-full rounded-full',
              pct >= threshold
                ? 'bg-success-DEFAULT'
                : pct >= threshold * 0.67
                  ? 'bg-yellow-400'
                  : 'bg-danger-DEFAULT'
            )}
            style={{ width: `${pct}%` }}
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
};

PercentageIndicator.displayName = 'PercentageIndicator';

export { CircularProgress, PercentageIndicator };
export default CircularProgress;
