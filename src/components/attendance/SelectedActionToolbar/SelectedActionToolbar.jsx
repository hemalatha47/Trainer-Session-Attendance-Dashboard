/**
 * SelectedActionToolbar.jsx
 * Conditional toolbar for selected-row bulk actions (Module 6.4, Task 6).
 *
 * Visible ONLY when selectedCount > 0.
 * Displays the selection count and provides:
 *   Mark Selected Present
 *   Mark Selected Absent
 *   Clear Selection
 *
 * Architecture:
 *   - Animated in/out with AnimatePresence.
 *   - Pure presentational — fires callback props.
 *   - Compact layout for inline use inside AttendanceSheet header.
 *   - Full layout for use as a standalone bar above the sheet.
 *
 * @param {number}   props.selectedCount
 * @param {number}   props.totalCount
 * @param {function} props.onMarkPresent   — () => void
 * @param {function} props.onMarkAbsent    — () => void
 * @param {function} props.onClear         — () => void
 * @param {boolean}  [props.disabled=false]
 * @param {'compact'|'full'} [props.layout='full']
 * @param {string}   [props.className]
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X, Users } from 'lucide-react';
import { TRANSITIONS, usePrefersReducedMotion } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import { Button } from '@components/ui/Button';

const SelectedActionToolbar = ({
  selectedCount = 0,
  totalCount    = 0,
  onMarkPresent,
  onMarkAbsent,
  onClear,
  disabled = false,
  layout   = 'full',
  className,
}) => {
  const reduced    = usePrefersReducedMotion();
  const isCompact  = layout === 'compact';
  const hasSelected = selectedCount > 0;

  const motionProps = reduced
    ? {}
    : {
        initial:    { opacity: 0, y: -6, scale: 0.98 },
        animate:    { opacity: 1, y: 0,  scale: 1    },
        exit:       { opacity: 0, y: -6, scale: 0.98 },
        transition: TRANSITIONS.fast,
      };

  return (
    <AnimatePresence>
      {hasSelected && (
        <motion.div
          key="selected-action-toolbar"
          {...motionProps}
          className={cn(
            'flex flex-wrap items-center gap-2',
            !isCompact && [
              'rounded-lg border border-accent-200 bg-accent-50',
              'px-3 py-2.5',
            ],
            className,
          )}
          role="toolbar"
          aria-label={`Bulk actions for ${selectedCount} selected student${selectedCount !== 1 ? 's' : ''}`}
        >
          {/* Selection count badge */}
          {!isCompact && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-accent-700 mr-1 shrink-0">
              <Users size={13} aria-hidden="true" />
              {selectedCount}
              {totalCount > 0 && (
                <span className="font-normal text-accent-500"> of {totalCount}</span>
              )}
              <span> selected</span>
            </span>
          )}

          {/* Separator — only in full layout */}
          {!isCompact && (
            <div
              className="h-5 w-px bg-accent-200 mx-1 shrink-0"
              aria-hidden="true"
            />
          )}

          {/* Mark Selected Present */}
          {onMarkPresent && (
            <Button
              variant="success"
              size="sm"
              onClick={onMarkPresent}
              disabled={disabled}
              iconLeft={<CheckCircle size={13} aria-hidden="true" />}
              aria-label={`Mark ${selectedCount} selected student${selectedCount !== 1 ? 's' : ''} present`}
            >
              {isCompact ? null : 'Mark Present'}
            </Button>
          )}

          {/* Mark Selected Absent */}
          {onMarkAbsent && (
            <Button
              variant="danger"
              size="sm"
              onClick={onMarkAbsent}
              disabled={disabled}
              iconLeft={<XCircle size={13} aria-hidden="true" />}
              aria-label={`Mark ${selectedCount} selected student${selectedCount !== 1 ? 's' : ''} absent`}
            >
              {isCompact ? null : 'Mark Absent'}
            </Button>
          )}

          {/* Clear selection */}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              aria-label="Clear selection"
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md',
                'text-textMuted hover:text-danger-DEFAULT hover:bg-danger-bg',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600',
                'transition-colors duration-150',
                disabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              <X size={13} aria-hidden="true" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

SelectedActionToolbar.displayName = 'SelectedActionToolbar';

export { SelectedActionToolbar };
export default SelectedActionToolbar;
