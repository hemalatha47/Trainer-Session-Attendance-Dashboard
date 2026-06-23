/**
 * AttendanceSheetToolbar.jsx
 * Quick-action toolbar for the Attendance Sheet page (Module 6.3, Task 9).
 *
 * Actions:
 *   Mark All Present — sets every student to Present
 *   Mark All Absent  — sets every student to Absent
 *   Reset All        — reverts to initial/loaded values
 *
 * All callbacks are passed from the parent; no business logic here.
 *
 * @param {function} props.onMarkAllPresent
 * @param {function} props.onMarkAllAbsent
 * @param {function} props.onResetAll
 * @param {boolean}  [props.disabled=false]
 * @param {boolean}  [props.loading=false]
 * @param {boolean}  [props.dirty=false]  — shows reset button only when dirty
 * @param {string}   [props.className]
 */

import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@utils/componentUtils';
import { Button } from '@components/ui/Button';
import { Skeleton } from '@components/feedback/Skeleton';

const AttendanceSheetToolbar = ({
  onMarkAllPresent,
  onMarkAllAbsent,
  onResetAll,
  disabled = false,
  loading  = false,
  dirty    = false,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-8 w-26 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      role="toolbar"
      aria-label="Attendance quick actions"
    >
      <Button
        variant="success"
        size="sm"
        onClick={onMarkAllPresent}
        disabled={disabled}
        iconLeft={<CheckCircle size={13} aria-hidden="true" />}
        aria-label="Mark all students present"
      >
        All Present
      </Button>

      <Button
        variant="danger"
        size="sm"
        onClick={onMarkAllAbsent}
        disabled={disabled}
        iconLeft={<XCircle size={13} aria-hidden="true" />}
        aria-label="Mark all students absent"
      >
        All Absent
      </Button>

      {dirty && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetAll}
          disabled={disabled}
          iconLeft={<RotateCcw size={13} aria-hidden="true" />}
          aria-label="Reset all changes"
        >
          Reset
        </Button>
      )}
    </div>
  );
};

AttendanceSheetToolbar.displayName = 'AttendanceSheetToolbar';

export default AttendanceSheetToolbar;
