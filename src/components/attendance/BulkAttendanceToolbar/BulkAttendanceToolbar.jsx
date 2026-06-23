/**
 * BulkAttendanceToolbar.jsx
<<<<<<< HEAD
 * Bulk actions toolbar for multi-selected attendance rows.
 *
 * Module 6.4 — Updated to delegate to SelectedActionToolbar.
 * Remains backward-compatible: existing usages in AttendanceSheet continue
 * to work without any prop changes.
 *
 * Two modes:
 *   compact=false (default) — full panel with count badge and labeled buttons.
 *   compact=true            — icon-only buttons; count shown by parent row.
 *
 * Future: extend with late/leave/excused bulk actions when Section 14 activates.
 *
 * @param {number}   props.selectedCount
 * @param {number}   [props.totalCount]
 * @param {function} [props.onMarkPresent]
 * @param {function} [props.onMarkAbsent]
 * @param {function} [props.onBulkStatus]    — (status) => void (future)
 * @param {function} [props.onClear]         — deselect all
 * @param {boolean}  [props.compact=false]   — icon-only mode
=======
 * Bulk actions toolbar for multi-selected attendance rows (Module 3.5, Task 8).
 *
 * Architecture only — no backend calls. Fires callback props.
 * Future: extend with late/leave/excused bulk actions when Section 14 activates.
 *
 * @param {number}   props.selectedCount
 * @param {function} [props.onMarkPresent]
 * @param {function} [props.onMarkAbsent]
 * @param {function} [props.onBulkStatus]     — (status) => void (future)
 * @param {function} [props.onClear]           — deselect all
 * @param {boolean}  [props.compact=false]     — icon-only mode
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
 * @param {boolean}  [props.disabled=false]
 * @param {string}   [props.className]
 */

<<<<<<< HEAD
import { SelectedActionToolbar } from '../SelectedActionToolbar';

const BulkAttendanceToolbar = ({
  selectedCount = 0,
  totalCount,
  onMarkPresent,
  onMarkAbsent,
  onBulkStatus,   // reserved for future use
  onClear,
  compact  = false,
  disabled = false,
  className,
}) => {
  // Delegate to the canonical SelectedActionToolbar.
  // compact=true maps to layout='compact' (icon-only buttons, no count badge).
  return (
    <SelectedActionToolbar
      selectedCount={selectedCount}
      totalCount={totalCount}
      onMarkPresent={onMarkPresent}
      onMarkAbsent={onMarkAbsent}
      onClear={onClear}
      disabled={disabled}
      layout={compact ? 'compact' : 'full'}
      className={className}
    />
=======
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X, Users } from 'lucide-react';
import { TRANSITIONS, usePrefersReducedMotion } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import { Button } from '@components/ui/Button';

// ── Action button ─────────────────────────────────────────────────────────────
const BulkBtn = ({ icon, label, onClick, variant = 'outline', disabled, compact }) => (
  <Button
    variant={variant}
    size="sm"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    iconLeft={icon}
    className={cn(compact && 'hidden sm:inline-flex')}
  >
    {!compact && label}
  </Button>
);

const BulkAttendanceToolbar = ({
  selectedCount = 0,
  onMarkPresent,
  onMarkAbsent,
  onBulkStatus,
  onClear,
  compact = false,
  disabled = false,
  className,
}) => {
  const reduced = usePrefersReducedMotion();

  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="bulk-toolbar"
        initial={{ opacity: 0, y: 4, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.97 }}
        transition={TRANSITIONS.fast}
        className={cn(
          'flex flex-wrap items-center gap-2',
          !compact && 'rounded-md border border-accent-200 bg-accent-50 px-3 py-2',
          className,
        )}
        role="toolbar"
        aria-label={`Bulk actions for ${selectedCount} selected student${selectedCount !== 1 ? 's' : ''}`}
      >
        {/* Count */}
        {!compact && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-accent-700 mr-2">
            <Users size={13} aria-hidden="true" />
            {selectedCount} selected
          </span>
        )}

        {/* Mark present */}
        {onMarkPresent && (
          <BulkBtn
            icon={<CheckCircle size={13} />}
            label="Mark Present"
            onClick={onMarkPresent}
            variant="success"
            disabled={disabled}
            compact={compact}
          />
        )}

        {/* Mark absent */}
        {onMarkAbsent && (
          <BulkBtn
            icon={<XCircle size={13} />}
            label="Mark Absent"
            onClick={onMarkAbsent}
            variant="danger"
            disabled={disabled}
            compact={compact}
          />
        )}

        {/* Future: bulk status dropdown — placeholder slot */}
        {/* onBulkStatus is forwarded from parent; menu rendered by parent if needed */}

        {/* Clear */}
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
    </AnimatePresence>
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
  );
};

BulkAttendanceToolbar.displayName = 'BulkAttendanceToolbar';

export { BulkAttendanceToolbar };
export default BulkAttendanceToolbar;
