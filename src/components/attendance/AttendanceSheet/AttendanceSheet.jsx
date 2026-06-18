/**
 * AttendanceSheet.jsx
 * Attendance entry sheet for a batch + date (Module 3.5, Task 4).
 *
 * Architecture only — no backend calls. Receives students + statuses as props.
 * The parent page (MarkAttendancePage) owns state and calls attendanceService.
 *
 * Features:
 *   - Renders AttendanceRow per student
 *   - Search filter (client-side)
 *   - Status filter pill bar
 *   - Bulk selection + BulkAttendanceToolbar
 *   - Loading skeleton (TableSkeleton)
 *   - Empty states (NoStudentsForBatch, AttendanceSearchEmpty)
 *   - Error state
 *   - Responsive grid layout
 *
 * @param {object[]} props.students           — [{id, name, studentCode}]
 * @param {object}   props.statuses           — { [studentId]: status }
 * @param {function} props.onStatusChange     — (studentId, newStatus) => void
 * @param {boolean}  [props.loading=false]
 * @param {string}   [props.error]
 * @param {function} [props.onRetry]
 * @param {boolean}  [props.readOnly=false]   — hides toggles; only shows chips
 * @param {object}   [props.remarks]          — { [studentId]: string }
 * @param {function} [props.onRemarksChange]  — (studentId, text) => void
 * @param {string}   [props.className]
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { fadeIn, TRANSITIONS, usePrefersReducedMotion } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import { TableSkeleton } from '@components/feedback/Skeleton';
import { ErrorState } from '@components/feedback/ErrorState';
import { AttendanceRow } from '../AttendanceRow';
import { BulkAttendanceToolbar } from '../BulkAttendanceToolbar';
import { NoStudentsForBatch, AttendanceSearchEmpty } from '../AttendanceEmptyStates';
import { AttendanceLegend } from '../AttendanceLegend';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_LABEL,
  ATTENDANCE_CHIP_CLASSES,
  V1_ATTENDANCE_STATUSES,
} from '@constants/attendanceStatus';

// ── Status filter pills ────────────────────────────────────────────────────────
const StatusFilterPill = ({ statusKey, active, count, onClick }) => {
  const classes = ATTENDANCE_CHIP_CLASSES[statusKey] ?? {};
  return (
    <button
      type="button"
      onClick={() => onClick(statusKey)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600',
        active
          ? cn(classes.bg, classes.text, classes.border)
          : 'border-border bg-white text-textMuted hover:border-accent-200',
      )}
      aria-pressed={active}
    >
      {ATTENDANCE_LABEL[statusKey]}
      <span className={cn(
        'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
        active ? 'bg-white/40' : 'bg-neutral-100 text-textMuted',
      )}>
        {count}
      </span>
    </button>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const AttendanceSheet = ({
  students = [],
  statuses = {},
  onStatusChange,
  loading = false,
  error,
  onRetry,
  readOnly = false,
  remarks = {},
  onRemarksChange,
  className,
}) => {
  const reduced = usePrefersReducedMotion();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(null); // null = all
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ── Filtered student list ──────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    let result = students;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q),
      );
    }
    if (statusFilter) {
      result = result.filter((s) => {
        const st = statuses[s.id] ?? ATTENDANCE_STATUS.PRESENT;
        return st === statusFilter;
      });
    }
    return result;
  }, [students, searchQuery, statusFilter, statuses]);

  // ── Status counts (for filter pills) ──────────────────────────────────────
  const statusCounts = useMemo(() => {
    const counts = {};
    students.forEach((s) => {
      const st = statuses[s.id] ?? ATTENDANCE_STATUS.PRESENT;
      counts[st] = (counts[st] ?? 0) + 1;
    });
    return counts;
  }, [students, statuses]);

  // ── Bulk selection helpers ─────────────────────────────────────────────────
  const allFilteredIds = useMemo(() => filteredStudents.map((s) => s.id), [filteredStudents]);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.has(id));
  const someSelected = allFilteredIds.some((id) => selectedIds.has(id));

  const handleSelectAll = useCallback((checked) => {
    setSelectedIds(checked ? new Set(allFilteredIds) : new Set());
  }, [allFilteredIds]);

  const handleSelectOne = useCallback((studentId, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(studentId) : next.delete(studentId);
      return next;
    });
  }, []);

  const handleBulkStatus = useCallback((newStatus) => {
    selectedIds.forEach((id) => onStatusChange?.(id, newStatus));
    setSelectedIds(new Set());
  }, [selectedIds, onStatusChange]);

  const handleClearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const toggleStatusFilter = useCallback((key) => {
    setStatusFilter((prev) => (prev === key ? null : key));
  }, []);

  // ── States ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <TableSkeleton rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load students"
        description={error}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  if (students.length === 0) {
    return <NoStudentsForBatch className={className} />;
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className={cn('flex flex-col gap-4', className)}
    >
      {/* ── Toolbar bar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search student or ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search students"
            className={cn(
              'h-9 w-full rounded-md border border-border bg-white pl-8 pr-8 text-sm',
              'text-textPrimary placeholder:text-textMuted',
              'focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400/25',
              'transition-colors duration-150',
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
            >
              <X size={13} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Student count */}
        <p className="text-xs text-textMuted shrink-0">
          {filteredStudents.length} of {students.length} student{students.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Status filter pills ───────────────────────────────────────────── */}
      {students.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter(null)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-semibold transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600',
              statusFilter === null
                ? 'border-accent-600 bg-accent-600 text-white'
                : 'border-border bg-white text-textMuted hover:border-accent-200',
            )}
            aria-pressed={statusFilter === null}
          >
            All ({students.length})
          </button>
          {V1_ATTENDANCE_STATUSES.map((key) => (
            <StatusFilterPill
              key={key}
              statusKey={key}
              active={statusFilter === key}
              count={statusCounts[key] ?? 0}
              onClick={toggleStatusFilter}
            />
          ))}
        </div>
      )}

      {/* ── Bulk select header ────────────────────────────────────────────── */}
      {!readOnly && filteredStudents.length > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-neutral-50 border border-border">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected && !allSelected;
            }}
            onChange={(e) => handleSelectAll(e.target.checked)}
            aria-label="Select all students"
            className="h-4 w-4 rounded border-border text-accent-600 cursor-pointer
              focus-visible:ring-2 focus-visible:ring-accent-600"
          />
          <span className="text-xs font-medium text-textMuted flex-1">
            {allSelected
              ? `All ${filteredStudents.length} selected`
              : someSelected
                ? `${selectedIds.size} selected`
                : 'Select all'}
          </span>
          {selectedIds.size > 0 && (
            <BulkAttendanceToolbar
              selectedCount={selectedIds.size}
              onMarkPresent={() => handleBulkStatus(ATTENDANCE_STATUS.PRESENT)}
              onMarkAbsent={() => handleBulkStatus(ATTENDANCE_STATUS.ABSENT)}
              onClear={handleClearSelection}
              compact
            />
          )}
        </div>
      )}

      {/* ── Student rows ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {filteredStudents.length === 0 ? (
          <AttendanceSearchEmpty
            key="empty"
            query={searchQuery}
            onClear={() => { setSearchQuery(''); setStatusFilter(null); }}
          />
        ) : (
          <div className="flex flex-col gap-2" role="list" aria-label="Attendance list">
            {filteredStudents.map((student) => (
              <div key={student.id} role="listitem">
                <AttendanceRow
                  student={student}
                  status={statuses[student.id] ?? ATTENDANCE_STATUS.PRESENT}
                  onStatusChange={readOnly ? undefined : onStatusChange}
                  selected={selectedIds.has(student.id)}
                  onSelect={readOnly ? undefined : handleSelectOne}
                  remarks={remarks[student.id] ?? ''}
                  onRemarksChange={readOnly ? undefined : onRemarksChange}
                  disabled={readOnly}
                  inputMode="toggle"
                />
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ── Legend ────────────────────────────────────────────────────────── */}
      <AttendanceLegend className="mt-2 justify-end" />
    </motion.div>
  );
};

AttendanceSheet.displayName = 'AttendanceSheet';

export { AttendanceSheet };
export default AttendanceSheet;
