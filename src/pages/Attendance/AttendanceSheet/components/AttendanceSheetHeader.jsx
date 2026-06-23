/**
 * AttendanceSheetHeader.jsx
 * Page header for the Attendance Sheet (Module 6.3).
 *
 * Displays:
 *   - Batch name + date
 *   - Edit mode badge when re-marking an existing session
 *   - Back button to return to session setup
 *   - Dirty indicator (unsaved changes warning)
 *
 * @param {string}  props.batchName
 * @param {string}  props.date          — YYYY-MM-DD
 * @param {'create'|'edit'} props.mode
 * @param {boolean} [props.dirty=false]
 * @param {function} props.onBack
 * @param {string}  [props.className]
 */

import { ArrowLeft, ClipboardCheck, Edit3 } from 'lucide-react';
import { cn } from '@utils/componentUtils';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';

// Format YYYY-MM-DD to a readable date
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
};

const AttendanceSheetHeader = ({
  batchName,
  date,
  mode     = 'create',
  dirty    = false,
  onBack,
  className,
}) => (
  <header className={cn('flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between', className)}>
    <div className="flex flex-col gap-1">
      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        className={cn(
          'inline-flex w-fit items-center gap-1.5 text-xs text-textMuted',
          'hover:text-accent-600 transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 rounded',
        )}
        aria-label="Back to session setup"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        Session Setup
      </button>

      {/* Title row */}
      <div className="flex items-center gap-2 flex-wrap">
        <ClipboardCheck className="w-5 h-5 text-accent-600 shrink-0" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-textPrimary">
          {batchName ?? 'Attendance Sheet'}
        </h1>
        {mode === 'edit' && (
          <Badge variant="warning" size="sm">
            <Edit3 size={10} aria-hidden="true" className="mr-1" />
            Editing Session
          </Badge>
        )}
      </div>

      {/* Date */}
      <p className="text-sm text-textMuted">
        {date ? formatDate(date) : ''}
        {dirty && (
          <span className="ml-2 inline-flex items-center gap-1 text-warning-text text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-warning-DEFAULT inline-block" aria-hidden="true" />
            Unsaved changes
          </span>
        )}
      </p>
    </div>
  </header>
);

AttendanceSheetHeader.displayName = 'AttendanceSheetHeader';

export default AttendanceSheetHeader;
