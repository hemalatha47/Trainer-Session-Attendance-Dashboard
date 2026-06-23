/**
 * AttendanceEmptyStates.jsx
 * Attendance-domain empty state components (Module 3.5, Task 9).
 *
 * Four states, all composing the existing EmptyState component — zero duplication.
 *
 * Exports:
 *   NoAttendanceData      — generic "no attendance records found"
 *   NoStudentsForBatch    — batch exists but has no students
 *   AttendanceNotMarked   — batch+date selected but attendance not yet submitted
 *   AttendanceSearchEmpty — search/filter returned no results
 */

import {
  ClipboardList, UserX, CalendarX, SearchX,
} from 'lucide-react';
import { EmptyState } from '@components/feedback/EmptyState';
import { cn } from '@utils/componentUtils';

// ── 1. No attendance data ─────────────────────────────────────────────────────
/**
 * @param {string}   [props.description]
 * @param {function} [props.onAction]
 * @param {string}   [props.actionLabel]
 * @param {string}   [props.className]
 */
const NoAttendanceData = ({
  description = 'No attendance records have been found for the selected criteria.',
  onAction,
  actionLabel = 'Mark Attendance',
  className,
}) => (
  <EmptyState
    icon={<ClipboardList size={32} />}
    title="No Attendance Records"
    description={description}
    actionLabel={onAction ? actionLabel : undefined}
    onAction={onAction}
    className={className}
  />
);

NoAttendanceData.displayName = 'NoAttendanceData';

// ── 2. No students for batch ──────────────────────────────────────────────────
/**
 * @param {string}   [props.batchName]   — include batch name in description
 * @param {function} [props.onAction]    — "Add Student" handler
 * @param {string}   [props.className]
 */
const NoStudentsForBatch = ({
  batchName,
  onAction,
  className,
}) => (
  <EmptyState
    icon={<UserX size={32} />}
    title="No Students in Batch"
    description={
      batchName
        ? `${batchName} has no enrolled students. Add students to start marking attendance.`
        : 'This batch has no enrolled students. Add students to start marking attendance.'
    }
    actionLabel={onAction ? 'Add Student' : undefined}
    onAction={onAction}
    className={className}
  />
);

NoStudentsForBatch.displayName = 'NoStudentsForBatch';

// ── 3. Attendance not yet marked ──────────────────────────────────────────────
/**
 * @param {string}   [props.date]          — formatted date string
 * @param {string}   [props.batchName]
 * @param {function} [props.onMarkNow]     — "Mark Now" handler
 * @param {string}   [props.className]
 */
const AttendanceNotMarked = ({
  date,
  batchName,
  onMarkNow,
  className,
}) => {
  const desc = [
    batchName && `Batch: ${batchName}`,
    date      && `Date: ${date}`,
    'Attendance has not been recorded for this session.',
  ].filter(Boolean).join('\n');

  return (
    <EmptyState
      icon={<CalendarX size={32} />}
      title="Attendance Not Marked"
      description={desc}
      actionLabel={onMarkNow ? 'Mark Attendance Now' : undefined}
      onAction={onMarkNow}
      className={className}
    />
  );
};

AttendanceNotMarked.displayName = 'AttendanceNotMarked';

// ── 4. Search / filter empty ──────────────────────────────────────────────────
/**
 * @param {string}   [props.query]    — the search query typed
 * @param {function} [props.onClear]  — "Clear filters" handler
 * @param {string}   [props.className]
 */
const AttendanceSearchEmpty = ({
  query,
  onClear,
  className,
}) => (
  <EmptyState
    icon={<SearchX size={32} />}
    title="No Results Found"
    description={
      query
        ? `No students match "${query}". Try a different name or student ID.`
        : 'No records match the selected filters. Try adjusting your search criteria.'
    }
    actionLabel={onClear ? 'Clear Filters' : undefined}
    onAction={onClear}
    secondaryLabel={undefined}
    className={className}
  />
);

AttendanceSearchEmpty.displayName = 'AttendanceSearchEmpty';

export {
  NoAttendanceData,
  NoStudentsForBatch,
  AttendanceNotMarked,
  AttendanceSearchEmpty,
};
