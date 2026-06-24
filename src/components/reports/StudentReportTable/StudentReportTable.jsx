/**
 * StudentReportTable.jsx
 * Module 7.3 — Report Tables & Summary Views
 *
 * Columns: Student ID | Student Name | Batch | Attendance % | Present | Absent | Risk
 *
 * Risk levels reuse riskUtils:
 *   Excellent (≥90) | Good (75–89) | Warning (60–74) | Critical (<60)
 *
 * Blueprint Section 6.7, 9.4, 9.5
 */

import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { DataTable } from '@components/data/DataTable';
import { Badge }     from '@components/ui/Badge';
import { cn }        from '@utils/componentUtils';

// ── Progress bar ──────────────────────────────────────────────────────────────

const PctBar = ({ pct, variant }) => {
  const colorMap = {
    success: 'bg-success-DEFAULT',
    accent:  'bg-accent-500',
    warning: 'bg-warning-DEFAULT',
    danger:  'bg-danger-DEFAULT',
  };
  const textMap = {
    success: 'text-success-DEFAULT',
    accent:  'text-accent-600',
    warning: 'text-warning-text',
    danger:  'text-danger-DEFAULT',
  };
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden min-w-[48px]">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorMap[variant] ?? colorMap.accent)}
          style={{ width: `${Math.min(pct, 100)}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <span className={cn('text-xs font-semibold tabular-nums w-10 text-right', textMap[variant] ?? textMap.accent)}>
        {pct}%
      </span>
    </div>
  );
};

// ── Column definitions ────────────────────────────────────────────────────────

const buildColumns = () => [
  {
    key:      'studentCode',
    label:    'Student ID',
    sortable: true,
    width:    'w-32',
    render:   (value) => (
      <span className="text-xs font-mono text-textMuted">{value}</span>
    ),
  },
  {
    key:      'studentName',
    label:    'Student Name',
    sortable: true,
    render:   (value) => (
      <span className="text-sm font-medium text-textPrimary">{value}</span>
    ),
  },
  {
    key:      'batchName',
    label:    'Batch',
    sortable: true,
    render:   (value) => (
      <span className="text-sm text-textMuted line-clamp-1">{value}</span>
    ),
  },
  {
    key:      'attendancePct',
    label:    'Attendance %',
    sortable: true,
    width:    'min-w-[140px]',
    render:   (value, row) => (
      <PctBar pct={value} variant={row.riskVariant} />
    ),
  },
  {
    key:      'presentCount',
    label:    'Present',
    sortable: true,
    align:    'center',
    render:   (value) => (
      <span className="text-sm font-semibold text-success-DEFAULT tabular-nums">{value}</span>
    ),
  },
  {
    key:      'absentCount',
    label:    'Absent',
    sortable: true,
    align:    'center',
    render:   (value) => (
      <span className="text-sm font-semibold text-danger-DEFAULT tabular-nums">{value}</span>
    ),
  },
  {
    key:    'riskLabel',
    label:  'Risk',
    align:  'center',
    sortable: true,
    render: (value, row) => (
      <Badge variant={row.riskVariant} size="sm">
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
 * @param {string}   [props.className]
 */
const StudentReportTable = ({
  data    = [],
  loading = false,
  error,
  onRetry,
  className,
}) => {
  const columns = useMemo(() => buildColumns(), []);

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-white', className)}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-neutral-50">
        <Users size={16} className="text-warning-text" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-textPrimary">Student Report</h3>
        {!loading && (
          <span className="ml-auto text-xs text-textMuted">
            {data.length} student{data.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={onRetry}
        emptyTitle="No student report data found"
        emptyDescription="No students match the current filters."
        emptyIcon={<Users size={32} />}
        caption="Student report: individual attendance summary"
      />
    </div>
  );
};

export default StudentReportTable;
