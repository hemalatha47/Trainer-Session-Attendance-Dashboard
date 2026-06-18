/**
 * AttendanceToggle.jsx
 * Quick-mark attendance toggle (Module 3.5, Task 1).
 *
 * V1: toggles between Present ↔ Absent on single click.
 * Future: `allowedStatuses` prop unlocks multi-status cycling (Late, Leave, etc.)
 * without any structural redesign — just pass the expanded status list.
 *
 * @param {string}   props.status          — current status value
 * @param {function} props.onChange         — (newStatus) => void
 * @param {string[]} [props.allowedStatuses]  — ordered cycle list; defaults to [present, absent]
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean}  [props.disabled=false]
 * @param {string}   [props.label]         — accessible label (e.g. student name)
 * @param {boolean}  [props.animated=true]
 * @param {string}   [props.className]
 */

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Calendar, Circle, MinusCircle } from 'lucide-react';
import { TRANSITIONS, usePrefersReducedMotion } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_LABEL,
  ATTENDANCE_CHIP_CLASSES,
  V1_ATTENDANCE_STATUSES,
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
const SIZE_MAP = {
  sm: { outer: 'h-8 w-8',   icon: 15, ring: 'ring-2' },
  md: { outer: 'h-10 w-10', icon: 18, ring: 'ring-2' },
  lg: { outer: 'h-12 w-12', icon: 22, ring: 'ring-2' },
};

const AttendanceToggle = ({
  status,
  onChange,
  allowedStatuses = V1_ATTENDANCE_STATUSES,
  size = 'md',
  disabled = false,
  label,
  animated = true,
  className,
}) => {
  const reduced = usePrefersReducedMotion();

  // Advance to next status in the cycle
  const handleToggle = useCallback(() => {
    if (disabled || !onChange) return;
    const idx = allowedStatuses.indexOf(status);
    const next = allowedStatuses[(idx + 1) % allowedStatuses.length];
    onChange(next);
  }, [status, onChange, allowedStatuses, disabled]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  const key = status?.toLowerCase() ?? ATTENDANCE_STATUS.ABSENT;
  const chipClasses = ATTENDANCE_CHIP_CLASSES[key] ?? ATTENDANCE_CHIP_CLASSES[ATTENDANCE_STATUS.ABSENT];
  const IconComp = ICON_MAP[key];
  const sizeSet = SIZE_MAP[size] ?? SIZE_MAP.md;
  const ariaLabel = `${label ? `${label}: ` : ''}${ATTENDANCE_LABEL[key] ?? key}. Click to change.`;

  const Wrapper = animated && !reduced ? motion.button : 'button';
  const motionProps = animated && !reduced ? {
    whileHover: disabled ? {} : { scale: 1.08 },
    whileTap:   disabled ? {} : { scale: 0.93 },
    transition: TRANSITIONS.fast,
  } : {};

  return (
    <Wrapper
      type="button"
      role="switch"
      aria-checked={key === ATTENDANCE_STATUS.PRESENT}
      aria-label={ariaLabel}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      tabIndex={0}
      className={cn(
        'relative flex items-center justify-center rounded-full border transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2',
        chipClasses.bg,
        chipClasses.border,
        chipClasses.text,
        sizeSet.outer,
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-sm active:scale-95',
        className,
      )}
      {...motionProps}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={key}
          initial={animated && !reduced ? { opacity: 0, scale: 0.7, rotate: -15 } : {}}
          animate={animated && !reduced ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          exit={animated && !reduced ? { opacity: 0, scale: 0.7, rotate: 15 } : {}}
          transition={TRANSITIONS.fast}
          className="flex items-center justify-center"
        >
          {IconComp && (
            <IconComp
              size={sizeSet.icon}
              strokeWidth={2.2}
              aria-hidden="true"
            />
          )}
        </motion.span>
      </AnimatePresence>
    </Wrapper>
  );
};

AttendanceToggle.displayName = 'AttendanceToggle';

export { AttendanceToggle };
export default AttendanceToggle;
