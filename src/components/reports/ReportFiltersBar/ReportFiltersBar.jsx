/**
 * ReportFiltersBar.jsx
 * Module 7.2 — Report Filters & Date Range
 *
 * Composed filter bar for the Reports Dashboard.
 * Renders all four filter controls in a single responsive row/stack.
 *
 * Layout:
 *  Desktop (lg+): single row — [Date Preset] [From] [To] | [Batch] [Student] [Type] [Reset]
 *  Tablet (md):   two rows   — date controls top, selectors bottom
 *  Mobile (sm):   full stack — each control takes full width
 *
 * Props:
 *  filters         — current filter state from useReportFilters
 *  errors          — per-field validation errors from useReportFilters
 *  batchOptions    — [{ value, label }] for batch selector
 *  studentOptions  — [{ value, label }] for student selector
 *  batchLoading    — boolean
 *  studentLoading  — boolean
 *  reportTypes     — [{ id, title }] from useReportsDashboard (for type chips)
 *  onUpdateFilter  — (key, value) => void
 *  onUpdateDateRange — (preset, from?, to?) => void
 *  onReset         — () => void
 *
 * Blueprint Section 6.7, 7.2 (filter bar placement)
 */

import { useId }         from 'react';
import { Calendar, RotateCcw, Filter } from 'lucide-react';
import { Select }        from '@components/ui/Select';
import { Button }        from '@components/ui/Button';
import { cn }            from '@utils/componentUtils';
import {
  DATE_PRESET_LIST,
  DATE_PRESETS,
  REPORT_TYPES,
} from '@services/reportsFilterService';

// ── Internal sub-components ───────────────────────────────────────────────────

/**
 * PresetButton — pill-style button for date preset selection.
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
 * DateInput — native date picker with label and optional error message.
 */
const DateInput = ({ id, label, value, onChange, min, max, errorMessage, disabled }) => {
  const helpId = `${id}-help`;
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

/**
 * ReportTypeChips — compact tab-style selector for report type.
 * Reuses visual style consistent with ReportTypeSelector cards but in chip form
 * for the compact filter bar context.
 */
const REPORT_TYPE_OPTIONS = [
  { value: REPORT_TYPES.ATTENDANCE, label: 'Attendance' },
  { value: REPORT_TYPES.BATCH,      label: 'Batch'      },
  { value: REPORT_TYPES.STUDENT,    label: 'Student'    },
];

const ReportTypeChips = ({ value, onChange }) => (
  <div
    role="group"
    aria-label="Report type"
    className="flex items-center gap-1 flex-wrap"
  >
    {REPORT_TYPE_OPTIONS.map((opt) => {
      const isActive = value === opt.value;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={isActive}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-1',
            isActive
              ? 'bg-accent-50 text-accent-700 border-accent-400'
              : 'bg-white text-textMuted border-border hover:border-accent-300 hover:text-accent-600'
          )}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

/**
 * ReportFiltersBar
 *
 * @param {object}   props
 * @param {object}   props.filters          — filter state from useReportFilters
 * @param {object}   props.errors           — validation errors from useReportFilters
 * @param {Array}    props.batchOptions     — [{ value, label }]
 * @param {Array}    props.studentOptions   — [{ value, label }]
 * @param {boolean}  props.batchLoading
 * @param {boolean}  props.studentLoading
 * @param {Function} props.onUpdateFilter   — (key, value) => void
 * @param {Function} props.onUpdateDateRange — (preset, from?, to?) => void
 * @param {Function} props.onReset          — () => void
 */
const ReportFiltersBar = ({
  filters,
  errors,
  batchOptions     = [],
  studentOptions   = [],
  batchLoading     = false,
  studentLoading   = false,
  onUpdateFilter,
  onUpdateDateRange,
  onReset,
}) => {
  const dateFromId = useId();
  const dateToId   = useId();

  const { dateRange, batchId, studentId, reportType } = filters;
  const isCustomRange = dateRange.preset === DATE_PRESETS.CUSTOM;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handlePresetClick = (preset) => {
    onUpdateDateRange(preset);
  };

  const handleFromChange = (val) => {
    onUpdateDateRange(DATE_PRESETS.CUSTOM, val, dateRange.to);
  };

  const handleToChange = (val) => {
    onUpdateDateRange(DATE_PRESETS.CUSTOM, dateRange.from, val);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        'bg-white border border-border rounded-lg p-4',
        'flex flex-col gap-4'
      )}
      role="search"
      aria-label="Report filters"
    >
      {/* ── Bar header (mobile label) ──────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-textMuted shrink-0" aria-hidden="true" />
        <span className="text-xs font-semibold text-textPrimary uppercase tracking-wide">
          Filters
        </span>
      </div>

      {/* ── Date Range Section ─────────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-3 border-0 m-0 p-0">
        <legend className="text-xs font-medium text-secondary-700 flex items-center gap-1.5 mb-1">
          <Calendar size={13} className="text-textMuted" aria-hidden="true" />
          Date Range
        </legend>

        {/* Preset pills */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Date range preset">
          {DATE_PRESET_LIST.map((preset) => (
            <PresetButton
              key={preset.value}
              value={preset.value}
              label={preset.label}
              isActive={dateRange.preset === preset.value}
              onClick={handlePresetClick}
            />
          ))}
        </div>

        {/* Custom date inputs — only shown when Custom Range is active */}
        {isCustomRange && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <DateInput
              id={dateFromId}
              label="From"
              value={dateRange.from}
              onChange={handleFromChange}
              max={dateRange.to ?? undefined}
              errorMessage={errors.dateFrom}
            />
            <DateInput
              id={dateToId}
              label="To"
              value={dateRange.to}
              onChange={handleToChange}
              min={dateRange.from ?? undefined}
              errorMessage={errors.dateTo}
            />
          </div>
        )}

        {/* Cross-field date range error */}
        {errors.dateRange && (
          <p role="alert" className="text-xs text-danger-DEFAULT mt-0.5">
            {errors.dateRange}
          </p>
        )}
      </fieldset>

      {/* ── Selectors Row ─────────────────────────────────────────────────────
          Desktop: flex row. Mobile: stacked.
      ───────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

        {/* Batch selector */}
        <Select
          label="Batch"
          value={batchId}
          options={batchOptions}
          loading={batchLoading}
          disabled={batchLoading}
          errorMessage={errors.batchId}
          aria-label="Filter by batch"
          onChange={(e) => onUpdateFilter('batchId', e.target.value)}
        />

        {/* Student selector */}
        <Select
          label="Student"
          value={studentId}
          options={studentOptions}
          loading={studentLoading}
          disabled={studentLoading || batchLoading}
          errorMessage={errors.studentId}
          aria-label="Filter by student"
          onChange={(e) => onUpdateFilter('studentId', e.target.value)}
        />

        {/* Report type (wrapped label + chips) */}
        <div className="flex flex-col gap-1.5">
          <span
            id="report-type-filter-label"
            className="block text-sm font-medium text-secondary-700"
          >
            Report Type
          </span>
          <ReportTypeChips
            value={reportType}
            onChange={(val) => onUpdateFilter('reportType', val)}
            aria-labelledby="report-type-filter-label"
          />
        </div>
      </div>

      {/* ── Reset button ───────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-1 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          aria-label="Reset all report filters to default"
          iconLeft={<RotateCcw size={13} aria-hidden="true" />}
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default ReportFiltersBar;
