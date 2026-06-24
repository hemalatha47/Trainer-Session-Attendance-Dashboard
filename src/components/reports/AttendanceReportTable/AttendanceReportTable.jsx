/**
 * AttendanceReportTable.jsx
 * Module 7.3 — Report Tables & Summary Views
 *
 * Columns: Date | Batch | Trainer | Present | Absent | Attendance % | Status
 *
 * Status rules:
 *   ≥ 90 → Excellent (success)
 *   80–89 → Good     (primary/accent)
 *   70–79 → Warning  (warning)
 *   < 70  → Critical (danger)
 *
 * Blueprint Section 6.7
 */

import { useMemo } from 'react';
import { ClipboardList } from 'lucide-react';
import { DataTable }     from '@components/data/DataTable';
import { Badge }         from '@components/ui/Badge';
import { cn }            from '@utils/componentUtils';

// ── Progress bar for attendance % ────────────────────────────────────────────

const AttendanceBar = ({ pct, variant }) => {
  const colorMap = {
    success: 'bg-success-DEFAULT',
    primary: 'bg-accent-500',
    warning: 'bg-warning-DEFAULT',
    danger:  'bg-danger-DEFAULT',
  };
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden min-w-[48px]">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorMap[variant] ?? colorMap.primary)}
          style={{ width: `${Math.min(pct, 100)}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums w-10 text-right text-textPrimary">
        {pct}%
      </span>
    </div>
  );
};

// ── Column definitions ────────────────────────────────────────────────────────

const buildColumns = () => [
  {
    key:      'date',
    label:    'Date',
    sortable: true,
    width:    'w-32',
    render:   (value) => (
      <span className="text-sm font-medium text-textPrimary tabular-nums">
        {value}
      </span>
    ),
  },
  {
    key:      'batchName',
    label:    'Batch',
    sortable: true,
    render:   (value) => (
      <span className="text-sm text-textPrimary line-clamp-1">{value}</span>
    ),
  },
  {
    key:      'trainerName',
    label:    'Trainer',
    sortable: true,
    render:   (value) => (
      <span className="text-sm text-textMuted">{value}</span>
    ),
  },
  {
    key:      'presentCount',
    label:    'Present',
    sortable: true,
    align:    'center',
    render:   (value) => (
      <span className="text-sm font-semibold text-success-DEFAULT tabular-nums">
        {value}
      </span>
    ),
  },
  {
    key:      'absentCount',
    label:    'Absent',
    sortable: true,
    align:    'center',
    render:   (value) => (
      <span className="text-sm font-semibold text-danger-DEFAULT tabular-nums">
        {value}
      </span>
    ),
  },
  {
    key:    'attendancePct',
    label:  'Attendance %',
    sortable: true,
    width:  'min-w-[140px]',
    render: (value, row) => (
      <AttendanceBar pct={value} variant={row.statusVariant} />
    ),
  },
  {
    key:    'statusLabel',
    label:  'Status',
    align:  'center',
    render: (value, row) => (
      <Badge variant={row.statusVariant} size="sm">
        {value}
      </Badge>
    ),
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {Array}    props.data           — rows from useReportsData
 * @param {boolean}  [props.loading]
 * @param {string}   [props.error]
 * @param {Function} [props.onRetry]
 * @param {object}   [props.sortConfig]   — { key, dir }
 * @param {Function} [props.onSort]       — ({ key, dir }) => void
 * @param {string}   [props.className]
 */
const AttendanceReportTable = ({
  data        = [],
  loading     = false,
  error,
  onRetry,
  sortConfig,
  onSort,
  className,
}) => {
  const columns = useMemo(() => buildColumns(), []);

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-white', className)}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-neutral-50">
        <ClipboardList size={16} className="text-accent-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-textPrimary">Attendance Report</h3>
        {!loading && (
          <span className="ml-auto text-xs text-textMuted">
            {data.length} record{data.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={onRetry}
        emptyTitle="No attendance records found"
        emptyDescription="Adjust your filters or mark attendance to see records here."
        emptyIcon={<ClipboardList size={32} />}
        caption="Attendance report: date-by-date summary per batch"
      />
    </div>
  );
};

export default AttendanceReportTable;
