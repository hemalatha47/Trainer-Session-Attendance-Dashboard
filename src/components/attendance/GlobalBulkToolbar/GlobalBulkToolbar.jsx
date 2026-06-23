/**
 * GlobalBulkToolbar.jsx
 * Global bulk action toolbar for the Attendance Sheet (Module 6.4, Task 5).
 *
 * Always visible (when students exist). Handles session-wide operations:
 *   Mark All Present  — sets every student to Present
 *   Mark All Absent   — sets every student to Absent
 *   Select All        — selects every student
 *   Reset All         — reverts all to initial values (only when dirty)
 *
 * Architecture:
 *   - Pure presentational — fires callback props, no internal state.
 *   - Integrates with the dirty flag to show/hide Reset All.
 *   - Disabled during loading or error states.
 *   - Responsive: wraps cleanly on mobile.
 *
 * @param {function} props.onMarkAllPresent  — () => void
 * @param {function} props.onMarkAllAbsent   — () => void
 * @param {function} props.onSelectAll       — () => void
 * @param {function} props.onResetAll        — () => void
 * @param {boolean}  [props.dirty=false]     — show Reset only when dirty
 * @param {boolean}  [props.disabled=false]  — disables all buttons
 * @param {boolean}  [props.loading=false]   — shows loading skeleton
 * @param {number}   [props.totalCount=0]    — total student count for aria
 * @param {string}   [props.className]
 */

import { CheckCircle, XCircle, RotateCcw, CheckCircle2 } from 'lucide-react';
import { cn } from '@utils/componentUtils';
import { Button } from '@components/ui/Button';
import { Skeleton } from '@components/feedback/Skeleton';

// ── Skeleton for loading state ─────────────────────────────────────────────────
const GlobalToolbarSkeleton = ({ className }) => (
  <div className={cn('flex flex-wrap items-center gap-2', className)}>
    <Skeleton className="h-8 w-28 rounded-md" />
    <Skeleton className="h-8 w-28 rounded-md" />
    <Skeleton className="h-8 w-24 rounded-md" />
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const GlobalBulkToolbar = ({
  onMarkAllPresent,
  onMarkAllAbsent,
  onSelectAll,
  onResetAll,
  dirty      = false,
  disabled   = false,
  loading    = false,
  totalCount = 0,
  className,
}) => {
  if (loading) return <GlobalToolbarSkeleton className={className} />;

  // Don't render if no students (Task 11 — empty state guard)
  if (totalCount === 0) return null;

  const isDisabled = disabled || totalCount === 0;

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      role="toolbar"
      aria-label="Global attendance actions"
    >
      {/* Mark All Present */}
      <Button
        variant="success"
        size="sm"
        onClick={onMarkAllPresent}
        disabled={isDisabled}
        iconLeft={<CheckCircle size={13} aria-hidden="true" />}
        aria-label={`Mark all ${totalCount} students present`}
      >
        All Present
      </Button>

      {/* Mark All Absent */}
      <Button
        variant="danger"
        size="sm"
        onClick={onMarkAllAbsent}
        disabled={isDisabled}
        iconLeft={<XCircle size={13} aria-hidden="true" />}
        aria-label={`Mark all ${totalCount} students absent`}
      >
        All Absent
      </Button>

      {/* Select All */}
      <Button
        variant="outline"
        size="sm"
        onClick={onSelectAll}
        disabled={isDisabled}
        iconLeft={<CheckCircle2 size={13} aria-hidden="true" />}
        aria-label={`Select all ${totalCount} students`}
      >
        Select All
      </Button>

      {/* Reset All — only shown when dirty */}
      {dirty && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetAll}
          disabled={isDisabled}
          iconLeft={<RotateCcw size={13} aria-hidden="true" />}
          aria-label="Reset all attendance changes"
        >
          Reset
        </Button>
      )}
    </div>
  );
};

GlobalBulkToolbar.displayName = 'GlobalBulkToolbar';

export { GlobalBulkToolbar };
export default GlobalBulkToolbar;
