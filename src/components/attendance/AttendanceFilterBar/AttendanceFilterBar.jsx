/**
 * AttendanceFilterBar.jsx
 * Filter controls for attendance views (Module 3.5, Task 6).
 *
 * Used by: MarkAttendancePage, ReportsPage, Analytics filters.
 * Reuses existing Input, Select, Button — no new input primitives.
 *
 * @param {object}    props.filters         — { date, batchId, status, search }
 * @param {function}  props.onFilterChange  — (key, value) => void
 * @param {function}  [props.onReset]
 * @param {object[]}  [props.batches]       — [{ id, name }] for batch dropdown
 * @param {string[]}  [props.statusOptions] — subset of ATTENDANCE_STATUS_LIST
 * @param {boolean}   [props.showBatch=true]
 * @param {boolean}   [props.showStatus=true]
 * @param {boolean}   [props.showDate=true]
 * @param {boolean}   [props.showSearch=true]
 * @param {boolean}   [props.compact=false]  — single-row on md+
 * @param {string}    [props.className]
 */

import { useCallback } from 'react';
import { Search, X, RotateCcw, Calendar } from 'lucide-react';
import { cn } from '@utils/componentUtils';
import { Button } from '@components/ui/Button';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_LABEL,
  V1_ATTENDANCE_STATUSES,
  ATTENDANCE_STATUS_LIST,
} from '@constants/attendanceStatus';

// ── Field wrappers ────────────────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <span className="text-[10px] font-semibold uppercase tracking-wide text-textMuted">
    {children}
  </span>
);

const FilterField = ({ label, children, className }) => (
  <div className={cn('flex flex-col gap-1', className)}>
    {label && <FieldLabel>{label}</FieldLabel>}
    {children}
  </div>
);

// ── Shared input base classes ─────────────────────────────────────────────────
const inputBase = [
  'h-9 w-full rounded-md border border-border bg-white px-3 text-sm',
  'text-textPrimary placeholder:text-textMuted',
  'focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400/25',
  'transition-colors duration-150',
].join(' ');

// ── Main component ────────────────────────────────────────────────────────────
const AttendanceFilterBar = ({
  filters = {},
  onFilterChange,
  onReset,
  batches = [],
  statusOptions = V1_ATTENDANCE_STATUSES,
  showBatch  = true,
  showStatus = true,
  showDate   = true,
  showSearch = true,
  compact    = false,
  className,
}) => {
  const set = useCallback((key, value) => onFilterChange?.(key, value), [onFilterChange]);

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== '' && v !== null && v !== undefined,
  );

  return (
    <div
      role="search"
      aria-label="Attendance filters"
      className={cn(
        'flex flex-col gap-3 rounded-md border border-border bg-white p-3 shadow-sm',
        compact && 'md:flex-row md:items-end md:gap-3',
        className,
      )}
    >
      {/* ── Date ── */}
      {showDate && (
        <FilterField label={compact ? undefined : 'Date'} className={compact ? 'min-w-[140px]' : ''}>
          <div className="relative">
            <Calendar
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="date"
              value={filters.date ?? ''}
              onChange={(e) => set('date', e.target.value)}
              aria-label="Filter by date"
              className={cn(inputBase, 'pl-8')}
            />
          </div>
        </FilterField>
      )}

      {/* ── Batch ── */}
      {showBatch && batches.length > 0 && (
        <FilterField label={compact ? undefined : 'Batch'} className={compact ? 'min-w-[160px]' : ''}>
          <select
            value={filters.batchId ?? ''}
            onChange={(e) => set('batchId', e.target.value)}
            aria-label="Filter by batch"
            className={cn(inputBase, 'cursor-pointer')}
          >
            <option value="">All batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </FilterField>
      )}

      {/* ── Status ── */}
      {showStatus && (
        <FilterField label={compact ? undefined : 'Status'} className={compact ? 'min-w-[130px]' : ''}>
          <select
            value={filters.status ?? ''}
            onChange={(e) => set('status', e.target.value)}
            aria-label="Filter by attendance status"
            className={cn(inputBase, 'cursor-pointer')}
          >
            <option value="">All statuses</option>
            {statusOptions.map((key) => (
              <option key={key} value={key}>
                {ATTENDANCE_LABEL[key] ?? key}
              </option>
            ))}
          </select>
        </FilterField>
      )}

      {/* ── Search ── */}
      {showSearch && (
        <FilterField label={compact ? undefined : 'Search'} className="flex-1">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={filters.search ?? ''}
              onChange={(e) => set('search', e.target.value)}
              placeholder="Search student or ID…"
              aria-label="Search students"
              className={cn(inputBase, 'pl-8 pr-8')}
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => set('search', '')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
              >
                <X size={13} aria-hidden="true" />
              </button>
            )}
          </div>
        </FilterField>
      )}

      {/* ── Reset ── */}
      {onReset && (
        <div className={cn('flex items-end', compact ? '' : 'mt-1')}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={!hasActiveFilters}
            aria-label="Reset all filters"
            iconLeft={<RotateCcw size={13} />}
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  );
};

AttendanceFilterBar.displayName = 'AttendanceFilterBar';

export { AttendanceFilterBar };
export default AttendanceFilterBar;
