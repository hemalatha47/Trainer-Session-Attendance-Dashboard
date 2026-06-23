/**
 * src/components/attendance/index.js
<<<<<<< HEAD
 * Barrel export for the Attendance Component Library.
 *
 * Module 6.5 additions:
 *   AttendanceSaveBar   — sticky save bar with counters, dirty state, save button
 *
 * Import from here in pages/hooks:
 *   import { AttendanceStatusChip, AttendanceSaveBar } from '@components/attendance';
=======
 * Barrel export for the entire Module 3.5 Attendance Component Library.
 *
 * Import from here in pages/hooks:
 *   import { AttendanceStatusChip, AttendanceToggle } from '@components/attendance';
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
 */

// ── Status display ─────────────────────────────────────────────────────────────
export { AttendanceStatusChip }    from './AttendanceStatusChip';
export { AttendanceLegend }        from './AttendanceLegend';

// ── Input / marking ───────────────────────────────────────────────────────────
export { AttendanceToggle }        from './AttendanceToggle';
export { AttendanceStatusSelector } from './AttendanceStatusSelector';
<<<<<<< HEAD

// ── Bulk toolbars (Module 6.4) ────────────────────────────────────────────────
export { BulkAttendanceToolbar }   from './BulkAttendanceToolbar';     // backward-compat
export { GlobalBulkToolbar }       from './GlobalBulkToolbar';          // Task 5
export { SelectedActionToolbar }   from './SelectedActionToolbar';      // Task 6

// ── Save bar (Module 6.5) ─────────────────────────────────────────────────────
export { AttendanceSaveBar }       from './AttendanceSaveBar';          // Task 9
=======
export { BulkAttendanceToolbar }   from './BulkAttendanceToolbar';
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726

// ── Composite rows / sheet ────────────────────────────────────────────────────
export { AttendanceRow }           from './AttendanceRow';
export { AttendanceSheet }         from './AttendanceSheet';
export { AttendanceFilterBar }     from './AttendanceFilterBar';

// ── Cards / KPIs ──────────────────────────────────────────────────────────────
export { AttendanceSummaryCard }   from './AttendanceSummaryCard';
export { AttendanceKPIWidget }     from './AttendanceKPIWidget';
export { AttendanceTrendCard }     from './AttendanceTrendCard';

// ── Indicators ────────────────────────────────────────────────────────────────
export { AttendancePercentageIndicator } from './AttendancePercentageIndicator';

// ── Timeline ──────────────────────────────────────────────────────────────────
export {
  AttendanceTimeline,
  AttendanceTimelineItem,
  AttendanceActivityItem,
} from './AttendanceTimeline';

// ── Calendar ──────────────────────────────────────────────────────────────────
export { AttendanceCalendar }      from './AttendanceCalendar';

<<<<<<< HEAD
// ── Charts ────────────────────────────────────────────────────────────────────
export { StudentAttendanceChart }  from './StudentAttendanceChart';

=======
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
// ── Empty states ──────────────────────────────────────────────────────────────
export {
  NoAttendanceData,
  NoStudentsForBatch,
  AttendanceNotMarked,
  AttendanceSearchEmpty,
} from './AttendanceEmptyStates';
