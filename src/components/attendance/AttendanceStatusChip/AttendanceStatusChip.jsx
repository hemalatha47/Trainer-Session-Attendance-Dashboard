/**
 * AttendanceStatusChip.jsx
 * Unified, domain-aware attendance status display (Module 3.5, Task 2).
 *
 * Wraps existing Badge + icons into a single semantically rich chip.
 * Supports all current and future attendance statuses via constants.
 *
 * Modes:
 *   compact — icon + short label (calendar cells, dense tables)
 *   full    — icon + full label (sheets, detail views)
 *   dot     — dot only (space-constrained list rows)
 *
 * @param {'present'|'absent'|'late'|'leave'|'halfDay'|'excused'} props.status
 * @param {'compact'|'full'|'dot'} [props.mode='full']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.animated=true]
 * @param {string}  [props.className]
 */

import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle, Clock, Calendar,
  Circle, MinusCircle,
} from 'lucide-react';
import { usePrefersReducedMotion, TRANSITIONS } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import {
  ATTENDANCE_LABEL,
  ATTENDANCE_SHORT_LABEL,
  ATTENDANCE_CHIP_CLASSES,
  ATTENDANCE_STATUS,
} from '@constants/attendanceStatus';

// ── Icon map ──────────────────────────────────────────────────────────────────
const ICON_MAP = {
  [ATTENDANCE_STATUS.PRESENT]:  CheckCircle,
  [ATTENDANCE_STATUS.ABSENT]:   XCircle,
  [ATTENDANCE_STATUS.LATE]:     Clock,
  [ATTENDANCE_STATUS.LEAVE]:    Calendar,
  [ATTENDANCE_STATUS.HALF_DAY]: Circle,
  [ATTENDANCE_STATUS.EXCUSED]:  MinusCircle,
};

// ── Size presets ──────────────────────────────────────────────────────────────
const SIZE_CLASSES = {
  sm: { chip: 'h-5 px-2 text-[10px] gap-1',   icon: 12, dot: 'h-1.5 w-1.5' },
  md: { chip: 'h-6 px-2.5 text-xs gap-1.5',   icon: 13, dot: 'h-2 w-2'   },
  lg: { chip: 'h-7 px-3 text-sm gap-1.5',     icon: 15, dot: 'h-2.5 w-2.5' },
};

const AttendanceStatusChip = ({
  status,
  mode = 'full',
  size = 'md',
  animated = true,
  className,
}) => {
  const reduced = usePrefersReducedMotion();
  const key = status?.toLowerCase() ?? 'absent';
  const classes = ATTENDANCE_CHIP_CLASSES[key] ?? ATTENDANCE_CHIP_CLASSES[ATTENDANCE_STATUS.ABSENT];
  const sizeSet = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const IconComp = ICON_MAP[key];

  // Dot-only mode — just a colored circle
  if (mode === 'dot') {
    return (
      <span
        title={ATTENDANCE_LABEL[key] ?? key}
        aria-label={ATTENDANCE_LABEL[key] ?? key}
        className={cn('inline-block rounded-full shrink-0', classes.dot, sizeSet.dot, className)}
      />
    );
  }

  const label = mode === 'compact'
    ? ATTENDANCE_SHORT_LABEL[key] ?? key.slice(0, 2).toUpperCase()
    : ATTENDANCE_LABEL[key] ?? key;

  const Wrapper = animated && !reduced ? motion.span : 'span';
  const motionProps = animated && !reduced
    ? { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: TRANSITIONS.fast }
    : {};

  return (
    <Wrapper
      role="status"
      aria-label={ATTENDANCE_LABEL[key] ?? key}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold',
        'whitespace-nowrap shrink-0 border',
        classes.bg,
        classes.text,
        classes.border,
        sizeSet.chip,
        className,
      )}
      {...motionProps}
    >
      {IconComp && (
        <IconComp
          size={sizeSet.icon}
          strokeWidth={2.2}
          aria-hidden="true"
          className="shrink-0"
        />
      )}
      {label}
    </Wrapper>
  );
};

AttendanceStatusChip.displayName = 'AttendanceStatusChip';

export { AttendanceStatusChip };
export default AttendanceStatusChip;
