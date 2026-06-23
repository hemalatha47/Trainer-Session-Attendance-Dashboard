/**
 * StudentFilterBar.jsx
 * Enterprise-grade filter toolbar for Student Management.
 * Module 5.4 — Student Filters
 *
 * Layout:
 *   Row 1: [Search] [Batch ▾] [Status ▾] [Attendance ▾] [Risk ▾] [More ▾] [Reset]
 *   Row 2 (expanded): [Joined From] [Joined To]
 *   Row 3: Quick filter chips
 *   Row 4 (conditional): Active filter summary bar
 *
 * Desktop: adaptive toolbar (2-row if expanded)
 * Mobile:  stacked layout, chips scroll horizontally
 *
 * Accessibility:
 *   - All inputs have labels or aria-label
 *   - Quick filter chips use aria-pressed
 *   - Active filter count uses aria-live
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ChevronDown, ChevronUp,
  AlertTriangle, TrendingDown, Star, UserPlus, UserCheck,
  SlidersHorizontal, RotateCcw, Filter,
} from 'lucide-react';

import { Input }   from '@components/ui/Input';
import { Select }  from '@components/ui/Select';
import { Button }  from '@components/ui/Button';
import { Badge }   from '@components/ui/Badge';

import {
  STUDENT_QUICK_FILTERS,
  STUDENT_STATUS_OPTIONS,
  ATTENDANCE_RANGE_OPTIONS,
  RISK_LEVEL_OPTIONS,
} from '@constants/studentFilters';
import { cn } from '@utils/componentUtils';

// ── Icon map for quick filter chips ──────────────────────────────────────────
const ICON_MAP = {
  AlertTriangle,
  TrendingDown,
  Star,
  UserPlus,
  UserCheck,
  Filter,
};

// ── Chip color map ────────────────────────────────────────────────────────────
const CHIP_COLORS = {
  danger: {
    active:   'bg-red-600 text-white border-red-600',
    inactive: 'bg-white text-textMuted border-border hover:border-red-400 hover:text-red-600',
  },
  warning: {
    active:   'bg-yellow-500 text-white border-yellow-500',
    inactive: 'bg-white text-textMuted border-border hover:border-yellow-400 hover:text-yellow-700',
  },
  success: {
    active:   'bg-green-600 text-white border-green-600',
    inactive: 'bg-white text-textMuted border-border hover:border-green-400 hover:text-green-700',
  },
  accent: {
    active:   'bg-accent-600 text-white border-accent-600',
    inactive: 'bg-white text-textMuted border-border hover:border-accent-400 hover:text-accent-600',
  },
  neutral: {
    active:   'bg-neutral-700 text-white border-neutral-700',
    inactive: 'bg-white text-textMuted border-border hover:border-neutral-400 hover:text-neutral-700',
  },
};

// ── QuickChip ─────────────────────────────────────────────────────────────────
const QuickChip = ({ preset, isActive, onClick }) => {
  const IconComp = ICON_MAP[preset.icon] ?? Filter;
  const colors   = CHIP_COLORS[preset.color] ?? CHIP_COLORS.accent;

  return (
    <motion.button
      type="button"
      onClick={() => onClick(preset.key)}
      aria-pressed={isActive}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
        'border transition-all duration-150 whitespace-nowrap shrink-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-1',
        isActive ? colors.active : colors.inactive
      )}
    >
      <IconComp className="w-3 h-3 shrink-0" aria-hidden="true" />
      {preset.label}
    </motion.button>
  );
};

// ── Date range validation helper ──────────────────────────────────────────────
const isDateRangeInvalid = (from, to) =>
  from && to && from > to;

// ── StudentFilterBar ──────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.filters           — current filter state from useStudentFilters
 * @param {Function} props.setFilter        — (key, value) => void
 * @param {Function} props.resetFilters     — () => void
 * @param {Function} props.applyQuickFilter — (key) => void
 * @param {number}  props.activeFilterCount
 * @param {boolean} props.hasActiveFilters
 * @param {Array}   props.batchOptions      — [{ value, label }] from useStudentFilters
 * @param {number}  [props.totalResults]    — total students after filtering
 */
const StudentFilterBar = ({
  filters,
  setFilter,
  resetFilters,
  applyQuickFilter,
  activeFilterCount,
  hasActiveFilters,
  batchOptions,
  totalResults,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);

  const dateRangeInvalid = isDateRangeInvalid(filters.joinedFrom, filters.joinedTo);

  // Convert static option arrays into Select-compatible format
  const statusOptions       = STUDENT_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }));
  const attendanceOptions   = ATTENDANCE_RANGE_OPTIONS.map((o) => ({ value: o.value, label: o.label }));
  const riskOptions         = RISK_LEVEL_OPTIONS.map((o) => ({ value: o.value, label: o.label }));

  return (
    <div className="flex flex-col gap-3">

      {/* ── Row 1: Primary filters ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] w-full sm:w-auto sm:max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder="Search name, ID, email, phone…"
            aria-label="Search students"
            className={cn(
              'w-full pl-9 pr-3 py-1.5 text-sm rounded-md',
              'border border-border bg-white text-textPrimary placeholder:text-textMuted',
              'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500',
              'transition-colors'
            )}
          />
          {filters.search && (
            <button
              onClick={() => setFilter('search', '')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Batch */}
        <div className="w-full sm:w-auto sm:min-w-[160px]">
          <Select
            aria-label="Filter by batch"
            value={filters.batch}
            onChange={(e) => setFilter('batch', e.target.value)}
            options={batchOptions}
          />
        </div>

        {/* Status */}
        <div className="w-full sm:w-auto sm:min-w-[130px]">
          <Select
            aria-label="Filter by status"
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
            options={statusOptions}
          />
        </div>

        {/* Attendance Range */}
        <div className="w-full sm:w-auto sm:min-w-[150px]">
          <Select
            aria-label="Filter by attendance range"
            value={filters.attendanceRange}
            onChange={(e) => setFilter('attendanceRange', e.target.value)}
            options={attendanceOptions}
          />
        </div>

        {/* Risk Level */}
        <div className="w-full sm:w-auto sm:min-w-[160px]">
          <Select
            aria-label="Filter by risk level"
            value={filters.riskLevel}
            onChange={(e) => setFilter('riskLevel', e.target.value)}
            options={riskOptions}
          />
        </div>

        {/* More / Less toggle */}
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-controls="student-filter-expanded"
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium',
            'border transition-colors whitespace-nowrap',
            expanded
              ? 'bg-neutral-100 border-neutral-300 text-textPrimary'
              : 'bg-white border-border text-textMuted hover:text-textPrimary hover:border-neutral-300'
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
          {expanded ? 'Less' : 'More'}
          {expanded
            ? <ChevronUp   className="w-3 h-3" aria-hidden="true" />
            : <ChevronDown className="w-3 h-3" aria-hidden="true" />}
        </button>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            aria-label="Reset all filters"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
        )}
      </div>

      {/* ── Row 2: Expanded filters (date range) ───────────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="student-filter-expanded"
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start gap-3 pt-1 pb-1">
              <p className="text-xs font-medium text-textMuted self-center shrink-0 hidden sm:block">
                Joined:
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-2 w-full">
                <div className="w-full sm:w-auto">
                  <Input
                    type="date"
                    label="Joined From"
                    value={filters.joinedFrom}
                    onChange={(e) => setFilter('joinedFrom', e.target.value)}
                    max={filters.joinedTo || undefined}
                    aria-label="Joined from date"
                    className="text-sm"
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <Input
                    type="date"
                    label="Joined To"
                    value={filters.joinedTo}
                    onChange={(e) => setFilter('joinedTo', e.target.value)}
                    min={filters.joinedFrom || undefined}
                    aria-label="Joined to date"
                    errorMessage={dateRangeInvalid ? '"Joined To" must be after "Joined From"' : undefined}
                    className="text-sm"
                  />
                </div>
                {(filters.joinedFrom || filters.joinedTo) && (
                  <button
                    type="button"
                    onClick={() => { setFilter('joinedFrom', ''); setFilter('joinedTo', ''); }}
                    aria-label="Clear joined date range"
                    className="text-xs text-textMuted hover:text-textPrimary transition-colors self-end sm:self-auto mt-1 sm:mt-6"
                  >
                    Clear dates
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Row 3: Quick filter chips ───────────────────────────────────── */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none"
        role="group"
        aria-label="Quick filters"
      >
        <span className="text-xs font-medium text-textMuted shrink-0">Quick:</span>
        {STUDENT_QUICK_FILTERS.map((preset) => (
          <QuickChip
            key={preset.key}
            preset={preset}
            isActive={filters.quickFilter === preset.key}
            onClick={applyQuickFilter}
          />
        ))}
      </div>

      {/* ── Row 4: Active filter summary bar ───────────────────────────── */}
      <AnimatePresence initial={false}>
        {hasActiveFilters && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-accent-50 border border-accent-100"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-accent-600 shrink-0" aria-hidden="true" />
              <span className="text-xs text-accent-700 font-medium">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
              </span>
              {typeof totalResults === 'number' && (
                <span className="text-xs text-textMuted">
                  — {totalResults} student{totalResults !== 1 ? 's' : ''} shown
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-accent-600 hover:text-accent-800 font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-500 rounded"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StudentFilterBar;
