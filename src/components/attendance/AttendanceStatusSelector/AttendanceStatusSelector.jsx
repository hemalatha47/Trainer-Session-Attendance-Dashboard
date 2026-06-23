/**
 * AttendanceStatusSelector.jsx
 * Status picker for attendance marking (Module 3.5, Task 2).
 *
 * Renders an accessible radio-style group where each option shows the
 * attendanceStatusChip visual. Supports all current + future statuses.
 *
 * V1: shows only Present/Absent by default (v1Statuses prop).
 * Future: pass `statuses={ATTENDANCE_STATUS_LIST}` to show all six.
 *
 * @param {string}   props.value          — currently selected status
 * @param {function} props.onChange        — (newStatus) => void
 * @param {string[]} [props.statuses]      — subset of ATTENDANCE_STATUS_LIST; defaults to V1_ATTENDANCE_STATUSES
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string}   [props.label]         — group label for accessibility
 * @param {boolean}  [props.disabled=false]
 * @param {'pill'|'card'} [props.variant='pill']
 * @param {string}   [props.className]
 */

import { useId } from 'react';
import { motion } from 'framer-motion';
import { TRANSITIONS, usePrefersReducedMotion } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import {
  ATTENDANCE_LABEL,
  ATTENDANCE_CHIP_CLASSES,
  ATTENDANCE_STATUS,
  V1_ATTENDANCE_STATUSES,
  ATTENDANCE_STATUS_LIST,
} from '@constants/attendanceStatus';
import {
  CheckCircle, XCircle, Clock, Calendar, Circle, MinusCircle
} from 'lucide-react';

const ICON_MAP = {
  [ATTENDANCE_STATUS.PRESENT]:  CheckCircle,
  [ATTENDANCE_STATUS.ABSENT]:   XCircle,
  [ATTENDANCE_STATUS.LATE]:     Clock,
  [ATTENDANCE_STATUS.LEAVE]:    Calendar,
  [ATTENDANCE_STATUS.HALF_DAY]: Circle,
  [ATTENDANCE_STATUS.EXCUSED]:  MinusCircle,
};

// ── Pill variant (compact, inline) ────────────────────────────────────────────
const PillOption = ({ statusKey, selected, onSelect, disabled, groupId, reduced }) => {
  const classes = ATTENDANCE_CHIP_CLASSES[statusKey];
  const IconComp = ICON_MAP[statusKey];
  const id = `${groupId}-${statusKey}`;

  return (
    <label
      htmlFor={id}
      className={cn(
        'relative flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5',
        'text-xs font-semibold transition-all duration-150',
        'focus-within:ring-2 focus-within:ring-accent-600 focus-within:ring-offset-1',
        selected
          ? cn(classes.bg, classes.text, classes.border)
          : 'border-border bg-white text-textMuted hover:border-accent-300 hover:text-textPrimary',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
      )}
    >
      <input
        id={id}
        type="radio"
        name={groupId}
        value={statusKey}
        checked={selected}
        disabled={disabled}
        onChange={() => !disabled && onSelect(statusKey)}
        className="sr-only"
        aria-label={ATTENDANCE_LABEL[statusKey]}
      />
      {IconComp && <IconComp size={13} strokeWidth={2.2} aria-hidden="true" />}
      {ATTENDANCE_LABEL[statusKey]}
    </label>
  );
};

// ── Card variant (larger, full description) ────────────────────────────────────
const CardOption = ({ statusKey, selected, onSelect, disabled, groupId, reduced }) => {
  const classes = ATTENDANCE_CHIP_CLASSES[statusKey];
  const IconComp = ICON_MAP[statusKey];
  const id = `${groupId}-card-${statusKey}`;

  const Wrapper = !reduced ? motion.label : 'label';
  const motionProps = !reduced ? {
    whileHover: disabled ? {} : { scale: 1.02, y: -1 },
    transition: TRANSITIONS.fast,
  } : {};

  return (
    <Wrapper
      htmlFor={id}
      className={cn(
        'relative flex flex-1 min-w-[80px] flex-col items-center gap-2 rounded-lg border p-3',
        'cursor-pointer text-xs font-semibold transition-all duration-150',
        'focus-within:ring-2 focus-within:ring-accent-600 focus-within:ring-offset-1',
        selected
          ? cn(classes.bg, classes.text, classes.border, 'shadow-sm')
          : 'border-border bg-white text-textMuted hover:border-accent-200 hover:shadow-sm',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
      )}
      {...motionProps}
    >
      <input
        id={id}
        type="radio"
        name={groupId}
        value={statusKey}
        checked={selected}
        disabled={disabled}
        onChange={() => !disabled && onSelect(statusKey)}
        className="sr-only"
        aria-label={ATTENDANCE_LABEL[statusKey]}
      />
      {IconComp && (
        <span className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full',
          selected ? classes.bg : 'bg-neutral-100',
        )}>
          <IconComp size={16} strokeWidth={2} aria-hidden="true" />
        </span>
      )}
      <span className="text-center leading-tight">{ATTENDANCE_LABEL[statusKey]}</span>
      {selected && (
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-current opacity-60" />
      )}
    </Wrapper>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const AttendanceStatusSelector = ({
  value,
  onChange,
  statuses = V1_ATTENDANCE_STATUSES,
  size = 'md',
  label,
  disabled = false,
  variant = 'pill',
  className,
}) => {
  const reduced = usePrefersReducedMotion();
  const groupId = useId();

  const OptionComp = variant === 'card' ? CardOption : PillOption;

  return (
    <fieldset
      className={cn('border-0 p-0 m-0', className)}
      disabled={disabled}
    >
      {label && (
        <legend className="mb-2 text-xs font-medium text-textMuted">{label}</legend>
      )}
      <div
        role="radiogroup"
        aria-label={label ?? 'Attendance status'}
        className={cn(
          'flex flex-wrap gap-2',
          variant === 'card' && 'gap-2',
        )}
      >
        {statuses.map((statusKey) => (
          <OptionComp
            key={statusKey}
            statusKey={statusKey}
            selected={value?.toLowerCase() === statusKey}
            onSelect={onChange}
            disabled={disabled}
            groupId={groupId}
            reduced={reduced}
          />
        ))}
      </div>
    </fieldset>
  );
};

AttendanceStatusSelector.displayName = 'AttendanceStatusSelector';

export { AttendanceStatusSelector };
export default AttendanceStatusSelector;
