/**
 * BatchReportTable.jsx
 * Module 7.3 — Report Tables & Summary Views
 *
 * Columns: Batch Name | Trainer | Students | Sessions | Avg Attendance | Risk Level | Status
 *
 * Blueprint Section 6.7, 9.5
 */

import { useMemo } from 'react';
import { Layers } from 'lucide-react';
import { DataTable } from '@components/data/DataTable';
import { Badge }     from '@components/ui/Badge';
import { cn }        from '@utils/componentUtils';

// ── Avg Attendance progress bar ───────────────────────────────────────────────

const AvgBar = ({ pct }) => {
  const barColor =
    pct >= 90 ? 'bg-success-DEFAULT' :
    pct >= 75 ? 'bg-accent-500'      :
    pct >= 60 ? 'bg-warning-DEFAULT' :
                'bg-danger-DEFAULT';

  const textColor =
    pct >= 90 ? 'text-success-DEFAULT' :
    pct >= 75 ? 'text-accent-600'      :
    pct >= 60 ? 'text-warning-text'    :
                'text-danger-DEFAULT';

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden min-w-[48px]">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${Math.min(pct, 100)}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <span className={cn('text-xs font-semibold tabular-nums w-10 text-right', textColor)}>
        {pct}%
      </span>
    </div>
  );
};

// ── Column definitions ────────────────────────────────────────────────────────

const buildColumns = () => [
  {
    key:      'batchName',
    label:    'Batch Name',
    sortable: true,
    render:   (value, row) => (
      <div className="min-w-0">
        <p className="text-sm font-medium text-textPrimary line-clamp-1">{value}</p>
        <p className="text-xs text-textMuted mt-0.5">{row.batchCode}</p>
      </div>
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
    key:      'totalStudents',
    label:    'Students',
    sortable: true,
    align:    'center',
    render:   (value) => (
      <span className="text-sm font-semibold text-textPrimary tabular-nums">{value}</span>
    ),
  },
  {
    key:      'totalSessions',
    label:    'Sessions',
    sortable: true,
    align:    'center',
    render:   (value) => (
      <span className="text-sm font-semibold text-textPrimary tabular-nums">{value}</span>
    ),
  },
  {
    key:      'avgAttendance',
    label:    'Avg Attendance',
    sortable: true,
    width:    'min-w-[140px]',
    render:   (value) => <AvgBar pct={value} />,
  },
  {
    key:    'riskLabel',
    label:  'Risk Level',
    align:  'center',
    sortable: true,
    render: (value, row) => (
      <Badge variant={row.riskVariant} size="sm">
        {value}
      </Badge>
    ),
  },
  {
    key:    'status',
    label:  'Status',
    align:  'center',
    render: (value, row) => (
      <Badge variant={row.statusVariant} size="sm">
        {value.charAt(0).toUpperCase() + value.slice(1)}
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
const BatchReportTable = ({
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
        <Layers size={16} className="text-success-DEFAULT" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-textPrimary">Batch Report</h3>
        {!loading && (
          <span className="ml-auto text-xs text-textMuted">
            {data.length} batch{data.length !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={onRetry}
        emptyTitle="No batch report data found"
        emptyDescription="No batches match the current filters."
        emptyIcon={<Layers size={32} />}
        caption="Batch report: aggregated metrics per batch"
      />
    </div>
  );
};

export default BatchReportTable;
