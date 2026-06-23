/**
 * HistoryFilterBar.jsx
 * Filter controls for the Attendance History page.
 * Module: 6.6
 *
 * Filters:
 *  - Batch selector (dropdown)
 *  - Date range (from / to)
 *  - Status / risk filter (All / Good / Warning / Low)
 *  - Search (batch name or trainer)
 *  - Reset button
 *
 * Props:
 *  filters   — current filter state from useAttendanceHistory
 *  batches   — Batch[] for batch selector options
 *  onChange  — (partial: Partial<filters>) => void
 *  onReset   — () => void
 *  loading   — boolean (disables controls while fetching)
 */

import { useCallback, useRef }    from 'react';
import { Search, X, Filter }      from 'lucide-react';
import { motion }                  from 'framer-motion';
import { fadeIn }                  from '@constants/animations';
import { cn }                      from '@utils/componentUtils';
import { Input }                   from '@components/ui/Input';
import { Select }                  from '@components/ui/Select';
import { Button }                  from '@components/ui/Button';

// ── Status colour options ─────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: '',        label: 'All Sessions' },
  { value: 'success', label: '≥75% — Good'  },
  { value: 'warning', label: '50–74% — Warning' },
  { value: 'danger',  label: '<50% — Low'   },
];

// ── Component ─────────────────────────────────────────────────────────────────

const HistoryFilterBar = ({
  filters  = {},
  batches  = [],
  onChange,
  onReset,
  loading  = false,
}) => {
  // Debounce search
  const searchTimer = useRef(null);

  const handleSearch = useCallback(
    (e) => {
      const val = e.target.value;
      clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => onChange?.({ search: val }), 300);
    },
    [onChange]
  );

  const batchOptions = [
    { value: '', label: 'All Batches' },
    ...batches.map((b) => ({
      value: b.id,
      label: b.batchName ?? b.name ?? b.id,
    })),
  ];

  const hasActiveFilters =
    filters.batchId ||
    filters.from ||
    filters.to ||
    filters.statusColor ||
    filters.search;

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="bg-white border border-border rounded-lg p-4 flex flex-col gap-4"
      role="search"
      aria-label="Filter attendance history"
    >
      {/* Row 1 — Search + Batch + Status */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <Input
            type="search"
            placeholder="Search batch or trainer…"
            defaultValue={filters.search}
            onChange={handleSearch}
            disabled={loading}
            leadingIcon={<Search size={14} />}
            aria-label="Search history"
          />
        </div>

        {/* Batch selector */}
        <div className="w-full sm:w-56">
          <Select
            placeholder="All Batches"
            options={batchOptions}
            value={filters.batchId}
            onChange={(e) => onChange?.({ batchId: e.target.value })}
            disabled={loading}
            aria-label="Filter by batch"
          />
        </div>

        {/* Status filter */}
        <div className="w-full sm:w-52">
          <Select
            placeholder="All Sessions"
            options={STATUS_OPTIONS}
            value={filters.statusColor}
            onChange={(e) => onChange?.({ statusColor: e.target.value })}
            disabled={loading}
            aria-label="Filter by attendance level"
          />
        </div>
      </div>

      {/* Row 2 — Date range + Reset */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-textMuted whitespace-nowrap">Date range:</span>

          <Input
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(e) => onChange?.({ from: e.target.value })}
            disabled={loading}
            aria-label="From date"
            className="w-40"
          />

          <span className="text-sm text-textMuted">to</span>

          <Input
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(e) => onChange?.({ to: e.target.value })}
            disabled={loading}
            aria-label="To date"
            className="w-40"
          />
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={loading}
            className="ml-auto shrink-0"
            aria-label="Clear all filters"
          >
            <X size={14} className="mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </motion.div>
  );
};

HistoryFilterBar.displayName = 'HistoryFilterBar';
export default HistoryFilterBar;
