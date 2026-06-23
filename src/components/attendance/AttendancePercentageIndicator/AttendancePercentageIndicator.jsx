/**
 * AttendancePercentageIndicator.jsx
 * Attendance percentage display component (Module 3.5, Task 2).
 *
 * Three display modes — reuses existing ProgressBar, CircularProgress,
 * TrendIndicator. Contains NO duplicated progress logic.
 *
 * Modes:
 *   'bar'      — horizontal ProgressBar + label
 *   'circular' — CircularProgress ring + label
 *   'inline'   — compact text badge with colour
 *
 * @param {number}  props.value          — percentage (0–100)
 * @param {number}  [props.threshold=75] — below this = warning/danger
 * @param {'bar'|'circular'|'inline'} [props.mode='bar']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {number}  [props.trend]        — vs previous period
 * @param {string}  [props.trendLabel]
 * @param {boolean} [props.showTrend=false]
 * @param {boolean} [props.showLabel=true]
 * @param {string}  [props.label]         — override "Attendance"
 * @param {boolean} [props.animated=true]
 * @param {string}  [props.className]
 */

import { ProgressBar } from '@components/data/ProgressBar';
import { CircularProgress, PercentageIndicator } from '@components/data/CircularProgress';
import { TrendIndicator } from '@components/data/TrendIndicator';
import { cn, clamp } from '@utils/componentUtils';
import { getAttendanceColor } from '@constants/attendanceStatus';

// ── Size presets ──────────────────────────────────────────────────────────────
const CIRCULAR_SIZE = { sm: 48, md: 64, lg: 88 };
const STROKE_W      = { sm: 4,  md: 6,  lg: 7  };

const AttendancePercentageIndicator = ({
  value = 0,
  threshold = 75,
  mode = 'bar',
  size = 'md',
  trend,
  trendLabel = 'vs last period',
  showTrend = false,
  showLabel = true,
  label = 'Attendance',
  animated = true,
  className,
}) => {
  const pct = clamp(value, 0, 100);
  const colorKey = getAttendanceColor(pct, threshold);
  const barColor = colorKey; // 'success' | 'warning' | 'danger' → ProgressBar accepts these

  // ── Inline mode ─────────────────────────────────────────────────────────────
  if (mode === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-1.5', className)}>
        <PercentageIndicator value={pct} threshold={threshold} />
        {showTrend && trend != null && (
          <TrendIndicator value={trend} label={trendLabel} size="sm" />
        )}
      </span>
    );
  }

  // ── Circular mode ────────────────────────────────────────────────────────────
  if (mode === 'circular') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        {showLabel && size !== 'sm' && (
          <p className="text-xs font-medium text-textMuted">{label}</p>
        )}
        <CircularProgress
          value={pct}
          size={CIRCULAR_SIZE[size] ?? 64}
          strokeWidth={STROKE_W[size] ?? 6}
          color="auto"
          threshold={threshold}
          showValue
          animated={animated}
          label={`${label}: ${Math.round(pct)}%`}
        />
        {showTrend && trend != null && (
          <TrendIndicator value={trend} label={trendLabel} size="sm" />
        )}
      </div>
    );
  }

  // ── Bar mode (default) ────────────────────────────────────────────────────
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(showLabel || showTrend) && (
        <div className="flex items-center justify-between gap-2">
          {showLabel && (
            <span className="text-xs font-medium text-textMuted">{label}</span>
          )}
          {showTrend && trend != null && (
            <TrendIndicator value={trend} label={trendLabel} size="sm" />
          )}
        </div>
      )}
      <ProgressBar
        value={pct}
        color={barColor}
        threshold={threshold}
        size={size}
        animated={animated}
        showValue
        label={label}
      />
    </div>
  );
};

AttendancePercentageIndicator.displayName = 'AttendancePercentageIndicator';

export { AttendancePercentageIndicator };
export default AttendancePercentageIndicator;
