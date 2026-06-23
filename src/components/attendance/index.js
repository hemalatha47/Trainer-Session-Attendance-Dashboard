/**
 * src/components/attendance/index.js
 * Barrel export for the Attendance Component Library.
 *
 * Module 6.5 additions:
 *   AttendanceSaveBar   — sticky save bar with counters, dirty state, save button
 *
 * Import from here in pages/hooks:
 *   import { AttendanceStatusChip, AttendanceSaveBar } from '@components/attendance';
 */

// ── Status display ─────────────────────────────────────────────────────────────
export { AttendanceStatusChip }    from './AttendanceStatusChip';
export { AttendanceLegend }        from './AttendanceLegend';

// ── Input / marking ───────────────────────────────────────────────────────────
export { AttendanceToggle }        from './AttendanceToggle';
export { AttendanceStatusSelector } from './AttendanceStatusSelector';

// ── Bulk toolbars (Module 6.4) ────────────────────────────────────────────────
export { BulkAttendanceToolbar }   from './BulkAttendanceToolbar';     // backward-compat
export { GlobalBulkToolbar }       from './GlobalBulkToolbar';          // Task 5
export { SelectedActionToolbar }   from './SelectedActionToolbar';      // Task 6

// ── Save bar (Module 6.5) ─────────────────────────────────────────────────────
export { AttendanceSaveBar }       from './AttendanceSaveBar';          // Task 9

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

// ── Charts ────────────────────────────────────────────────────────────────────
export { StudentAttendanceChart }  from './StudentAttendanceChart';

// ── Empty states ──────────────────────────────────────────────────────────────
export {
  NoAttendanceData,
  NoStudentsForBatch,
  AttendanceNotMarked,
  AttendanceSearchEmpty,
} from './AttendanceEmptyStates';
