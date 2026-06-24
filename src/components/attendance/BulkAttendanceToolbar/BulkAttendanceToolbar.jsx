/**
 * BulkAttendanceToolbar.jsx
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
 * @param {boolean}  [props.disabled=false]
 * @param {string}   [props.className]
 */

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
  );
};

BulkAttendanceToolbar.displayName = 'BulkAttendanceToolbar';

export { BulkAttendanceToolbar };
export default BulkAttendanceToolbar;
