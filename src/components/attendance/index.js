/**
 * src/components/attendance/index.js
 * Barrel export for the entire Module 3.5 Attendance Component Library.
 *
 * Import from here in pages/hooks:
 *   import { AttendanceStatusChip, AttendanceToggle } from '@components/attendance';
 */

// ── Status display ─────────────────────────────────────────────────────────────
export { AttendanceStatusChip }    from './AttendanceStatusChip';
export { AttendanceLegend }        from './AttendanceLegend';

// ── Input / marking ───────────────────────────────────────────────────────────
export { AttendanceToggle }        from './AttendanceToggle';
export { AttendanceStatusSelector } from './AttendanceStatusSelector';
export { BulkAttendanceToolbar }   from './BulkAttendanceToolbar';

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

// ── Empty states ──────────────────────────────────────────────────────────────
export {
  NoAttendanceData,
  NoStudentsForBatch,
  AttendanceNotMarked,
  AttendanceSearchEmpty,
} from './AttendanceEmptyStates';
