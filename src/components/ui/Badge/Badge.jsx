/**
 * Badge.jsx
 * Color-coded status pill component (Module 3.2, Task 10).
 *
 * Variants : primary | secondary | success | warning | danger | info | neutral
 * Attendance: present | absent | late | leave
 * Batch     : active | completed | upcoming
 * Sizes    : sm | md | lg
 *
 * Always includes text label alongside color — color is never the sole indicator.
 * Optionally renders a dot indicator or icon prefix.
 */

import { cn } from '@utils/componentUtils';

// ── Variant definitions ──────────────────────────────────────────────────────
const VARIANT_CLASSES = {
  // Generic
  primary:
    'bg-accent-100 text-accent-700 border border-accent-200',
  secondary:
    'bg-secondary-100 text-secondary-700 border border-secondary-200',
  success:
    'bg-success-bg text-success-text border border-success-border',
  warning:
    'bg-warning-bg text-warning-text border border-warning-border',
  danger:
    'bg-danger-bg text-danger-text border border-danger-border',
  info:
    'bg-info-bg text-info-text border border-info-border',
  neutral:
    'bg-neutral-100 text-neutral-600 border border-neutral-200',

  // Attendance-specific (Section 16.2 / 7.2)
  present:
    'bg-success-bg text-success-text border border-success-border',
  absent:
    'bg-danger-bg text-danger-text border border-danger-border',
  late:
    'bg-warning-bg text-warning-text border border-warning-border',
  leave:
    'bg-leave-bg text-leave-text border border-leave-bg',

  // Batch status (Section 16.3)
  active:
    'bg-accent-100 text-accent-700 border border-accent-200',
  completed:
    'bg-neutral-100 text-neutral-600 border border-neutral-200',
  upcoming:
    'bg-warning-bg text-warning-text border border-warning-border',
};

// ── Dot colors ───────────────────────────────────────────────────────────────
const DOT_CLASSES = {
  primary: 'bg-accent-600',
  secondary: 'bg-secondary-500',
  success: 'bg-success-DEFAULT',
  warning: 'bg-yellow-500',
  danger: 'bg-danger-DEFAULT',
  info: 'bg-info-DEFAULT',
  neutral: 'bg-neutral-400',
  present: 'bg-success-DEFAULT',
  absent: 'bg-danger-DEFAULT',
  late: 'bg-yellow-500',
  leave: 'bg-leave-dot',
  active: 'bg-accent-600',
  completed: 'bg-neutral-400',
  upcoming: 'bg-yellow-500',
};

// ── Size styles ──────────────────────────────────────────────────────────────
const SIZE_CLASSES = {
  sm: 'h-4 px-1.5 text-[10px] gap-1',
  md: 'h-5 px-2 text-xs gap-1.5',
  lg: 'h-6 px-2.5 text-xs gap-1.5',
};

const DOT_SIZE_CLASSES = {
  sm: 'h-1.5 w-1.5',
  md: 'h-1.5 w-1.5',
  lg: 'h-2 w-2',
};

/**
 * @param {object}  props
 * @param {string}  [props.variant='neutral']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {React.ReactNode} props.children   — label text
 * @param {boolean} [props.dot=false]         — show a leading dot indicator
 * @param {React.ReactNode} [props.icon]      — custom icon element
 * @param {string}  [props.className]
 */
const Badge = ({
  variant = 'neutral',
  size = 'md',
  children,
  dot = false,
  icon,
  className,
}) => {
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.neutral;
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const dotClass = DOT_CLASSES[variant] ?? DOT_CLASSES.neutral;
  const dotSizeClass = DOT_SIZE_CLASSES[size] ?? DOT_SIZE_CLASSES.md;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        'whitespace-nowrap shrink-0',
        variantClass,
        sizeClass,
        className
      )}
    >
      {dot && !icon && (
        <span
          className={cn('rounded-full shrink-0', dotClass, dotSizeClass)}
          aria-hidden="true"
        />
      )}
      {icon && (
        <span className="shrink-0 flex items-center" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export { Badge };
export default Badge;
