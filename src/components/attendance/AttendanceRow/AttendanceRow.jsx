/**
 * AttendanceRow.jsx
 * Single student attendance row (Module 3.5, Task 3).
 *
 * Used in AttendanceSheet as the repeating list item.
 * Composed from existing AvatarSystem, AttendanceToggle, AttendanceStatusChip.
 *
 * Layout (responsive):
 *   Desktop  : [checkbox] [avatar+name+id] [status chip] [toggle] [selector] [remarks]
 *   Mobile   : [checkbox+name] / [toggle stack]
 *
 * @param {object}   props.student         — { id, name, studentCode }
 * @param {string}   props.status          — current attendance status
 * @param {function} props.onStatusChange  — (studentId, newStatus) => void
 * @param {boolean}  [props.selected=false]  — row checkbox selected
 * @param {function} [props.onSelect]       — (studentId, checked) => void
 * @param {string}   [props.remarks]        — remarks text
 * @param {function} [props.onRemarksChange] — (studentId, text) => void
 * @param {boolean}  [props.disabled=false]
 * @param {'toggle'|'selector'|'both'} [props.inputMode='toggle']
 * @param {'sm'|'md'} [props.size='md']
 * @param {string}   [props.className]
 */

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { usePrefersReducedMotion, TRANSITIONS } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import { AttendanceToggle } from '../AttendanceToggle';
import { AttendanceStatusChip } from '../AttendanceStatusChip';
import { AttendanceStatusSelector } from '../AttendanceStatusSelector';
import { AttendanceAvatar } from '@components/data/AvatarSystem';
import { ATTENDANCE_STATUS } from '@constants/attendanceStatus';

const AttendanceRow = ({
  student,
  status = ATTENDANCE_STATUS.PRESENT,
  onStatusChange,
  selected = false,
  onSelect,
  remarks = '',
  onRemarksChange,
  disabled = false,
  inputMode = 'toggle',
  size = 'md',
  className,
}) => {
  const reduced = usePrefersReducedMotion();
  const [showRemarks, setShowRemarks] = useState(!!remarks);

  const handleStatusChange = useCallback((newStatus) => {
    onStatusChange?.(student.id, newStatus);
  }, [student.id, onStatusChange]);

  const handleSelectChange = useCallback((e) => {
    onSelect?.(student.id, e.target.checked);
  }, [student.id, onSelect]);

  const handleRemarksChange = useCallback((e) => {
    onRemarksChange?.(student.id, e.target.value);
  }, [student.id, onRemarksChange]);

  const isAbsent = status === ATTENDANCE_STATUS.ABSENT;

  return (
    <motion.div
      layout={!reduced}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={TRANSITIONS.fast}
      className={cn(
        'group flex flex-col rounded-lg border border-border bg-white transition-shadow duration-150',
        'hover:shadow-sm hover:border-accent-200',
        selected && 'ring-2 ring-accent-400 ring-offset-1',
        disabled && 'opacity-60',
        className,
      )}
    >
      {/* Main row */}
      <div className={cn(
        'flex items-center gap-3 px-3',
        size === 'sm' ? 'py-2' : 'py-3',
      )}>
        {/* Checkbox */}
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={handleSelectChange}
            disabled={disabled}
            aria-label={`Select ${student.name}`}
            className={cn(
              'h-4 w-4 shrink-0 rounded border-border text-accent-600',
              'focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-1',
              'cursor-pointer',
            )}
          />
        )}

        {/* Avatar + Student info */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <AttendanceAvatar
            name={student.name}
            attendanceStatus={status}
            size={size === 'sm' ? 'sm' : 'md'}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-textPrimary truncate leading-snug">
              {student.name}
            </span>
            <span className="text-xs text-textMuted tabular-nums">
              {student.studentCode}
            </span>
          </div>
        </div>

        {/* Status chip — shown on md+ screens */}
        <div className="hidden sm:flex shrink-0">
          <AttendanceStatusChip
            status={status}
            mode="compact"
            size="sm"
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Remarks toggle */}
          {onRemarksChange && (
            <button
              type="button"
              onClick={() => setShowRemarks((v) => !v)}
              aria-label="Toggle remarks"
              aria-expanded={showRemarks}
              disabled={disabled}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                'text-textMuted hover:text-accent-600 hover:bg-accent-50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600',
                showRemarks && 'text-accent-600 bg-accent-50',
                disabled && 'cursor-not-allowed',
              )}
            >
              <MessageSquare size={14} aria-hidden="true" />
            </button>
          )}

          {/* Input: toggle or selector or both */}
          {(inputMode === 'toggle' || inputMode === 'both') && (
            <AttendanceToggle
              status={status}
              onChange={handleStatusChange}
              disabled={disabled}
              label={student.name}
              size={size}
            />
          )}

          {(inputMode === 'selector' || inputMode === 'both') && (
            <div className="hidden sm:block">
              <AttendanceStatusSelector
                value={status}
                onChange={handleStatusChange}
                disabled={disabled}
                variant="pill"
              />
            </div>
          )}
        </div>
      </div>

      {/* Remarks row */}
      {showRemarks && onRemarksChange && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={TRANSITIONS.fast}
          className="px-3 pb-3 pt-0"
        >
          <input
            type="text"
            value={remarks}
            onChange={handleRemarksChange}
            placeholder="Add remarks (optional)…"
            disabled={disabled}
            maxLength={200}
            aria-label={`Remarks for ${student.name}`}
            className={cn(
              'w-full rounded-md border border-border bg-neutral-50 px-3 py-1.5',
              'text-xs text-textPrimary placeholder:text-textMuted',
              'focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400/30',
              'transition-colors duration-150',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

AttendanceRow.displayName = 'AttendanceRow';

export { AttendanceRow };
export default AttendanceRow;
