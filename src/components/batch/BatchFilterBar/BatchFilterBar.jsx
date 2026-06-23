/**
 * BatchFilterBar.jsx
 * Enterprise-grade filter toolbar for Batch Management.
 * Module 4.4 — Batch Filters
 *
 * Layout:
 *   Row 1: [Search] [Status ▾] [Trainer ▾] [Course ▾] [More ▾] [Reset]
 *   Row 2 (expanded): [Capacity Range] [Date Range] [Active Only toggle]
 *   Row 3: Quick filter chips
 *   Row 4 (conditional): Active filter summary bar
 *
 * Desktop: single adaptive toolbar (2-row if expanded)
 * Mobile:  stacked layout, chips scroll horizontally
 *
 * Accessibility:
 *   - All inputs have associated labels or aria-label
 *   - Filter chips use aria-pressed
 *   - Active filter count announced via aria-live
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence }        from 'framer-motion';
import {
  Search, X, ChevronDown, ChevronUp,
  PlayCircle, CalendarClock, Users, Sparkles, CheckCircle2,
  SlidersHorizontal, RotateCcw, Filter,
} from 'lucide-react';

import { Input }  from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { Button } from '@components/ui/Button';
import { Badge }  from '@components/ui/Badge';
import { Switch } from '@components/ui/Switch';

import { QUICK_FILTERS }            from '@constants/batchFilters';
import { V1_BATCH_STATUS_OPTIONS }  from '@constants/batchStatus';
import { cn }                       from '@utils/componentUtils';

// ── Icon map for quick filter icons ──────────────────────────────────────────
const ICON_MAP = {
  PlayCircle,
  CalendarClock,
  Users,
  Sparkles,
  CheckCircle2,
};

// ── Quick chip color map ──────────────────────────────────────────────────────
const CHIP_COLORS = {
  accent:  {
    active:   'bg-accent-600 text-white border-accent-600',
    inactive: 'bg-white text-textMuted border-border hover:border-accent-400 hover:text-accent-600',
  },
  yellow: {
    active:   'bg-yellow-500 text-white border-yellow-500',
    inactive: 'bg-white text-textMuted border-border hover:border-yellow-400 hover:text-yellow-700',
  },
  orange: {
    active:   'bg-orange-500 text-white border-orange-500',
    inactive: 'bg-white text-textMuted border-border hover:border-orange-400 hover:text-orange-600',
  },
  purple: {
    active:   'bg-purple-600 text-white border-purple-600',
    inactive: 'bg-white text-textMuted border-border hover:border-purple-400 hover:text-purple-600',
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
        'border transition-all duration-150 whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-1',
        isActive ? colors.active : colors.inactive
      )}
    >
      <IconComp className="w-3 h-3 shrink-0" aria-hidden="true" />
      {preset.label}
    </motion.button>
  );
};

// ── CapacityRangeFields ───────────────────────────────────────────────────────
const CapacityRangeFields = ({ min, max, onChange }) => {
  const minNum = min !== '' ? Number(min) : NaN;
  const maxNum = max !== '' ? Number(max) : NaN;
  const hasError = !isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-textMuted">Capacity</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          placeholder="Min"
          min={0}
          value={min}
          onChange={(e) => onChange('capacityMin', e.target.value)}
          aria-label="Minimum capacity"
          className={cn(
            'w-20 h-9 px-2.5 text-sm rounded-md border bg-white text-textPrimary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600/30',
            'placeholder:text-textMuted tabular-nums',
            hasError ? 'border-danger-DEFAULT' : 'border-border'
          )}
        />
        <span className="text-textMuted text-xs">–</span>
        <input
          type="number"
          placeholder="Max"
          min={0}
          value={max}
          onChange={(e) => onChange('capacityMax', e.target.value)}
          aria-label="Maximum capacity"
          className={cn(
            'w-20 h-9 px-2.5 text-sm rounded-md border bg-white text-textPrimary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600/30',
            'placeholder:text-textMuted tabular-nums',
            hasError ? 'border-danger-DEFAULT' : 'border-border'
          )}
        />
      </div>
      {hasError && (
        <p className="text-xs text-danger-DEFAULT">Min must be ≤ Max</p>
      )}
    </div>
  );
};

// ── DateRangeFields ───────────────────────────────────────────────────────────
const DateRangeFields = ({ startDate, endDate, onChange }) => {
  const hasError = startDate && endDate && startDate > endDate;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-textMuted">Date Range</label>
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onChange('startDate', e.target.value)}
          aria-label="Start date from"
          className={cn(
            'h-9 px-2.5 text-sm rounded-md border bg-white text-textPrimary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600/30',
            hasError ? 'border-danger-DEFAULT' : 'border-border'
          )}
        />
        <span className="text-textMuted text-xs shrink-0">to</span>
        <input
          type="date"
          value={endDate}
          min={startDate || undefined}
          onChange={(e) => onChange('endDate', e.target.value)}
          aria-label="End date to"
          className={cn(
            'h-9 px-2.5 text-sm rounded-md border bg-white text-textPrimary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600/30',
            hasError ? 'border-danger-DEFAULT' : 'border-border'
          )}
        />
      </div>
      {hasError && (
        <p className="text-xs text-danger-DEFAULT">Start date must be before end date</p>
      )}
    </div>
  );
};

// ── BatchFilterBar ────────────────────────────────────────────────────────────

/**
 * @param {{
 *   filters:           object,
 *   setFilter:         (key: string, value: any) => void,
 *   resetFilters:      () => void,
 *   applyQuickFilter:  (key: string) => void,
 *   activeFilterCount: number,
 *   hasActiveFilters:  boolean,
 *   trainerOptions:    { value: string, label: string }[],
 *   courseOptions:     { value: string, label: string }[],
 *   resultCount:       number,
 *   className?:        string,
 * }} props
 */
const BatchFilterBar = ({
  filters,
  setFilter,
  resetFilters,
  applyQuickFilter,
  activeFilterCount,
  hasActiveFilters,
  trainerOptions,
  courseOptions,
  resultCount,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);
  const searchRef = useRef(null);

  const handleSearchClear = useCallback(() => {
    setFilter('search', '');
    searchRef.current?.focus();
  }, [setFilter]);

  const statusOptions = [
    { value: 'all',  label: 'All Statuses' },
    ...V1_BATCH_STATUS_OPTIONS,
  ];

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-border shadow-sm',
        className
      )}
      role="search"
      aria-label="Batch filter controls"
    >
      {/* ── Primary Row ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:flex-wrap">

        {/* Search */}
        <div className="flex-1 min-w-0 sm:min-w-[200px] sm:max-w-[280px]">
          <label className="block text-xs font-medium text-textMuted mb-1">
            Search
          </label>
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-textMuted pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              type="search"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder="Name, code, trainer…"
              aria-label="Search batches"
              className={cn(
                'w-full h-9 pl-8 pr-8 text-sm rounded-md border border-border bg-white',
                'text-textPrimary placeholder:text-textMuted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600/30',
                'transition-colors duration-150'
              )}
            />
            <AnimatePresence>
              {filters.search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.1 }}
                  type="button"
                  onClick={handleSearchClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary focus-visible:outline-none"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Status */}
        <div className="sm:w-40">
          <label className="block text-xs font-medium text-textMuted mb-1">
            Status
          </label>
          <Select
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
            options={statusOptions}
            aria-label="Filter by status"
          />
        </div>

        {/* Trainer */}
        {trainerOptions.length > 1 && (
          <div className="sm:w-44">
            <label className="block text-xs font-medium text-textMuted mb-1">
              Trainer
            </label>
            <Select
              value={filters.trainer}
              onChange={(e) => setFilter('trainer', e.target.value)}
              options={trainerOptions}
              aria-label="Filter by trainer"
            />
          </div>
        )}

        {/* Course */}
        {courseOptions.length > 1 && (
          <div className="sm:w-48">
            <label className="block text-xs font-medium text-textMuted mb-1">
              Course
            </label>
            <Select
              value={filters.course}
              onChange={(e) => setFilter('course', e.target.value)}
              options={courseOptions}
              aria-label="Filter by course"
            />
          </div>
        )}

        {/* More / Less toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="batch-filter-expanded"
          iconLeft={<SlidersHorizontal className="w-3.5 h-3.5" />}
          iconRight={expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          className="shrink-0 self-end"
        >
          {expanded ? 'Less' : 'More'}
        </Button>

        {/* Reset */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden shrink-0 self-end"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                iconLeft={<RotateCcw className="w-3.5 h-3.5" />}
                aria-label="Reset all filters"
                className="text-danger-DEFAULT hover:bg-danger-bg hover:text-danger-DEFAULT"
              >
                Reset
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Expanded Row: capacity + date + active-only ───────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="batch-filter-expanded"
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-border">
              <div className="pt-3 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">

                <CapacityRangeFields
                  min={filters.capacityMin}
                  max={filters.capacityMax}
                  onChange={setFilter}
                />

                <DateRangeFields
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  onChange={setFilter}
                />

                {/* Active Only toggle */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-textMuted">
                    Active Only
                  </span>
                  <div className="flex items-center gap-2 h-9">
                    <Switch
                      checked={filters.activeOnly}
                      onChange={(e) => setFilter('activeOnly', e?.target?.checked ?? !filters.activeOnly)}
                      aria-label="Show active batches only"
                    />
                    <span className="text-sm text-textMuted">
                      {filters.activeOnly ? 'Active only' : 'All statuses'}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick Filter Chips ────────────────────────────────────────────── */}
      <div className="px-4 pb-3 border-t border-border">
        <div className="pt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-xs font-medium text-textMuted shrink-0 select-none">
            Quick:
          </span>
          <div
            className="flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto sm:scrollbar-thin"
            role="group"
            aria-label="Quick filter presets"
          >
            {QUICK_FILTERS.map((preset) => (
              <QuickChip
                key={preset.key}
                preset={preset}
                isActive={filters.quickFilter === preset.key}
                onClick={applyQuickFilter}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Active Filter Summary ─────────────────────────────────────────── */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-0 border-t border-border">
              <div
                className="pt-3 flex items-center justify-between gap-3"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="info" size="sm">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                  </Badge>
                  <span className="text-xs text-textMuted">
                    Showing{' '}
                    <span className="font-semibold text-textPrimary tabular-nums">
                      {resultCount}
                    </span>{' '}
                    {resultCount === 1 ? 'batch' : 'batches'}

                    {filters.status && filters.status !== 'all' && (
                      <>
                        {' '}· status:{' '}
                        <span className="font-medium text-textPrimary">
                          {filters.status}
                        </span>
                      </>
                    )}
                    {filters.trainer && filters.trainer !== 'all' && (
                      <>
                        {' '}· trainer:{' '}
                        <span className="font-medium text-textPrimary">
                          {filters.trainer}
                        </span>
                      </>
                    )}
                    {filters.course && filters.course !== 'all' && (
                      <>
                        {' '}· course:{' '}
                        <span className="font-medium text-textPrimary">
                          {filters.course}
                        </span>
                      </>
                    )}
                    {filters.search && (
                      <>
                        {' '}· "{filters.search}"
                      </>
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  className={cn(
                    'text-xs font-medium text-accent-600 hover:text-accent-700 shrink-0',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 rounded'
                  )}
                  aria-label="Clear all active filters"
                >
                  Clear all
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { BatchFilterBar };
export default BatchFilterBar;
