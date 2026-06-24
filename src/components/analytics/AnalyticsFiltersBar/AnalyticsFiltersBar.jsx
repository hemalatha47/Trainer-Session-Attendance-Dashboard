/**
 * AnalyticsFiltersBar.jsx
 * Module 8.2 — Analytics Filters & Time Range
 *
 * Composed filter bar for the Analytics Dashboard.
 * Renders all analytics filter controls in a single responsive container.
 *
 * Layout:
 *  Desktop (lg+): single wrapped row — [Date Presets] [From] [To] | [Batch] [Student] [Metric] [Reset] [Apply]
 *  Tablet (md):   two rows — date controls top, selectors bottom
 *  Mobile (sm):   full stack — each control takes full width
 *
 * Props:
 *  filters           — current filter state from useAnalyticsFilters
 *  errors            — per-field validation errors
 *  batchOptions      — [{ value, label }] for batch selector
 *  studentOptions    — [{ value, label }] for student selector
 *  batchLoading      — boolean
 *  studentLoading    — boolean
 *  isFiltered        — boolean — true when filters differ from defaults
 *  onUpdateFilter    — (key, value) => void
 *  onUpdateDateRange — (preset, from?, to?) => void
 *  onReset           — () => void
 *  onApply           — () => void
 *
 * Blueprint Sections 6.8, 9.3
 */

import { useId }         from 'react';
import { Calendar, RotateCcw, SlidersHorizontal, Check } from 'lucide-react';
import { Select }        from '@components/ui/Select';
import { Button }        from '@components/ui/Button';
import { cn }            from '@utils/componentUtils';
import {
  ANALYTICS_DATE_PRESET_LIST,
  ANALYTICS_DATE_PRESETS,
  ANALYTICS_METRIC_LIST,
} from '@services/analyticsFilterService';

// ── Sub-components ─────────────────────────────────────────────────────────────

/**
 * PresetButton — pill-style toggle for date preset selection.
 */
const PresetButton = ({ value, label, isActive, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    aria-pressed={isActive}
    className={cn(
      'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-1',
      isActive
        ? 'bg-accent-600 text-white border-accent-600'
        : 'bg-white text-textMuted border-border hover:border-accent-400 hover:text-accent-700'
    )}
  >
    {label}
  </button>
);

/**
 * DateInput — native date picker with label and optional error.
 */
const DateInput = ({ id, label, value, onChange, min, max, errorMessage, disabled }) => {
  const helpId   = `${id}-help`;
  const hasError = Boolean(errorMessage);
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <label htmlFor={id} className="block text-xs font-medium text-secondary-700">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError ? helpId : undefined}
        className={cn(
          'block w-full rounded-md border bg-white text-sm text-textPrimary',
          'h-9 px-3 outline-none transition-colors duration-150',
          'focus-visible:ring-2 focus-visible:ring-offset-0',
          disabled
            ? 'border-border bg-neutral-50 text-textMuted cursor-not-allowed opacity-60'
            : hasError
              ? 'border-danger-DEFAULT focus-visible:ring-danger-DEFAULT/30'
              : 'border-border focus-visible:border-accent-600 focus-visible:ring-accent-600/25'
        )}
      />
      {hasError && (
        <p id={helpId} role="alert" className="text-xs text-danger-DEFAULT">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * AnalyticsFiltersBar
 *
 * @param {object}   props
 * @param {object}   props.filters
 * @param {object}   props.errors
 * @param {Array}    props.batchOptions
 * @param {Array}    props.studentOptions
 * @param {boolean}  props.batchLoading
 * @param {boolean}  props.studentLoading
 * @param {boolean}  props.isFiltered
 * @param {Function} props.onUpdateFilter
 * @param {Function} props.onUpdateDateRange
 * @param {Function} props.onReset
 * @param {Function} props.onApply
 */
const AnalyticsFiltersBar = ({
  filters,
  errors,
  batchOptions    = [],
  studentOptions  = [],
  batchLoading    = false,
  studentLoading  = false,
  isFiltered      = false,
  onUpdateFilter,
  onUpdateDateRange,
  onReset,
  onApply,
}) => {
  const uid             = useId();
  const fromId          = `${uid}-from`;
  const toId            = `${uid}-to`;
  const batchId         = `${uid}-batch`;
  const studentId       = `${uid}-student`;
  const metricId        = `${uid}-metric`;

  const isCustomPreset  = filters.dateRange.preset === ANALYTICS_DATE_PRESETS.CUSTOM;
  const today           = new Date().toISOString().split('T')[0]; // max for date inputs

  const handlePresetClick = (preset) => {
    onUpdateDateRange(preset);
  };

  const handleFromChange = (val) => {
    onUpdateDateRange(ANALYTICS_DATE_PRESETS.CUSTOM, val, filters.dateRange.to);
  };

  const handleToChange = (val) => {
    onUpdateDateRange(ANALYTICS_DATE_PRESETS.CUSTOM, filters.dateRange.from, val);
  };

  // Combine date range errors for display
  const dateRangeError = errors.dateRange || errors.dateFrom || errors.dateTo || '';

  return (
    <div
      role="search"
      aria-label="Analytics filters"
      className="bg-white border border-border rounded-lg p-4 shadow-sm"
    >
      {/* ── Filter bar header ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal size={14} className="text-textMuted" aria-hidden="true" />
        <span className="text-xs font-semibold text-textMuted uppercase tracking-wide">
          Filters
        </span>
        {isFiltered && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-accent-600 font-medium">
            <Check size={12} aria-hidden="true" />
            Active
          </span>
        )}
      </div>

      {/* ── Controls grid ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">

        {/* Row 1: Date presets + custom range ───────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {/* Preset pills */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Date range preset">
            <Calendar size={14} className="text-textMuted self-center flex-shrink-0" aria-hidden="true" />
            {ANALYTICS_DATE_PRESET_LIST.map((p) => (
              <PresetButton
                key={p.value}
                value={p.value}
                label={p.label}
                isActive={filters.dateRange.preset === p.value}
                onClick={handlePresetClick}
              />
            ))}
          </div>

          {/* Custom date range inputs — visible when 'custom' preset is selected */}
          {isCustomPreset && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:max-w-md">
              <DateInput
                id={fromId}
                label="From"
                value={filters.dateRange.from}
                onChange={handleFromChange}
                max={filters.dateRange.to ?? today}
                errorMessage={errors.dateFrom}
              />
              <DateInput
                id={toId}
                label="To"
                value={filters.dateRange.to}
                onChange={handleToChange}
                min={filters.dateRange.from ?? undefined}
                max={today}
                errorMessage={errors.dateTo}
              />
            </div>
          )}

          {/* Cross-field date range error */}
          {errors.dateRange && (
            <p role="alert" className="text-xs text-danger-DEFAULT">
              {errors.dateRange}
            </p>
          )}
        </div>

        {/* Row 2: Selectors + actions ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          {/* Batch selector */}
          <Select
            id={batchId}
            label="Batch"
            placeholder="Select batch…"
            options={batchOptions}
            value={filters.batchId}
            onChange={(e) => onUpdateFilter('batchId', e.target.value)}
            loading={batchLoading}
            errorMessage={errors.batchId}
            aria-label="Filter by batch"
          />

          {/* Student selector */}
          <Select
            id={studentId}
            label="Student"
            placeholder="Select student…"
            options={studentOptions}
            value={filters.studentId}
            onChange={(e) => onUpdateFilter('studentId', e.target.value)}
            loading={studentLoading}
            disabled={studentLoading}
            errorMessage={errors.studentId}
            aria-label="Filter by student"
          />

          {/* Metric selector */}
          <Select
            id={metricId}
            label="Metric"
            options={ANALYTICS_METRIC_LIST}
            value={filters.metric}
            onChange={(e) => onUpdateFilter('metric', e.target.value)}
            errorMessage={errors.metric}
            aria-label="Select analytics metric"
          />

          {/* Action buttons */}
          <div className="flex items-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onReset}
              disabled={!isFiltered}
              aria-label="Reset all filters to defaults"
              iconLeft={<RotateCcw size={14} aria-hidden="true" />}
              className="flex-shrink-0"
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onApply}
              aria-label="Apply analytics filters"
              className="flex-1 justify-center"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFiltersBar;
