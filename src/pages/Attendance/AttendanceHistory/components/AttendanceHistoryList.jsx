/**
 * AttendanceHistoryList.jsx
 * Paginated table of past attendance sessions.
 * Module: 6.6 — Task 5
 *
 * Columns: Date | Batch | Trainer | Present | Absent | % | Status | Actions
 *
 * Props:
 *  history     — object[] from useAttendanceHistory
 *  pagination  — PaginationMeta
 *  loading     — boolean
 *  error       — string | null
 *  onRetry     — () => void
 *  onPageChange — (page: number) => void
 *  onViewSession — (session: object) => void
 */

import { Eye, CalendarDays, Download, Trash2, PenLine } from 'lucide-react';
import { DataTable }           from '@components/data/DataTable';
import { Button }              from '@components/ui/Button';
import { cn }                  from '@utils/componentUtils';

// ── Status colour badge ───────────────────────────────────────────────────────

const PctBadge = ({ pct, color }) => {
  const cls = {
    success: 'bg-success-bg text-success-text border border-success-border',
    warning: 'bg-warning-bg text-warning-text border border-warning-border',
    danger:  'bg-danger-bg  text-danger-text  border border-danger-border',
  }[color] ?? 'bg-neutral-100 text-neutral-600';

  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', cls)}
    >
      {pct}%
    </span>
  );
};

// ── Pagination controls ───────────────────────────────────────────────────────

const PaginationBar = ({ pagination, onPageChange }) => {
  const { page, totalPages, total, from, to, hasNext, hasPrev } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
      <p className="text-xs text-textMuted">
        Showing <span className="font-medium">{from}</span>–
        <span className="font-medium">{to}</span> of{' '}
        <span className="font-medium">{total}</span> sessions
      </p>

      <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          ‹ Prev
        </Button>

        {/* Page numbers — show ≤5 pages */}
        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
          const p = i + 1;
          return (
            <Button
              key={p}
              variant={p === page ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              className="w-8 px-0"
            >
              {p}
            </Button>
          );
        })}

        {totalPages > 5 && page < totalPages && (
          <span className="text-textMuted text-sm px-1">…</span>
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next ›
        </Button>
      </div>
    </div>
  );
};

// ── Column definitions ────────────────────────────────────────────────────────

const buildColumns = (onViewSession, onExportSession, onDeleteSession, onCorrectSession) => [
  {
    key:      'displayDate',
    label:    'Session Date',
    sortable: true,
    render:   (val, row) => (
      <div className="flex items-center gap-2">
        <CalendarDays size={14} className="text-textMuted shrink-0" />
        <span className="text-sm font-medium text-textPrimary">{val}</span>
      </div>
    ),
  },
  {
    key:      'batchName',
    label:    'Batch',
    sortable: true,
    render:   (val) => (
      <span className="text-sm text-textPrimary truncate max-w-[180px] block">{val}</span>
    ),
  },
  {
    key:      'trainerName',
    label:    'Trainer',
    sortable: false,
    render:   (val) => <span className="text-sm text-textMuted">{val}</span>,
  },
  {
    key:      'presentCount',
    label:    'Present',
    align:    'center',
    sortable: true,
    render:   (val) => (
      <span className="text-sm font-semibold text-success-DEFAULT">{val}</span>
    ),
  },
  {
    key:      'absentCount',
    label:    'Absent',
    align:    'center',
    sortable: true,
    render:   (val) => (
      <span className="text-sm font-semibold text-danger-DEFAULT">{val}</span>
    ),
  },
  {
    key:      'percentage',
    label:    'Attendance %',
    align:    'center',
    sortable: true,
    render:   (val, row) => <PctBadge pct={val} color={row.statusColor} />,
  },
  {
    key:      'markedByName',
    label:    'Marked By',
    sortable: false,
    render:   (val) => <span className="text-sm text-textMuted">{val}</span>,
  },
  {
    key:      '_actions',
    label:    '',
    isAction: true,
    render:   (_, row) => (
      <div className="flex items-center gap-1" role="group" aria-label="Session actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onViewSession?.(row); }}
          aria-label={`View session for ${row.batchName} on ${row.displayDate}`}
          title="View session"
        >
          <Eye size={14} className="mr-1" />
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onExportSession?.(row); }}
          aria-label={`Export session for ${row.batchName} on ${row.displayDate}`}
          title="Export CSV"
          className="text-accent-600 hover:text-accent-700"
        >
          <Download size={13} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onCorrectSession?.(row); }}
          aria-label={`Correct session for ${row.batchName} on ${row.displayDate}`}
          title="Correct attendance"
          className="text-warning-text hover:text-warning-DEFAULT"
        >
          <PenLine size={13} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onDeleteSession?.(row); }}
          aria-label={`Delete session for ${row.batchName} on ${row.displayDate}`}
          title="Delete session"
          className="text-danger-DEFAULT hover:text-danger-700"
        >
          <Trash2 size={13} />
        </Button>
      </div>
    ),
  },
];

// ── AttendanceHistoryList ─────────────────────────────────────────────────────

const AttendanceHistoryList = ({
  history          = [],
  pagination       = {},
  loading          = false,
  error            = null,
  onRetry,
  onPageChange,
  onViewSession,
  onExportSession,
  onDeleteSession,
  onCorrectSession,
}) => {
  const columns = buildColumns(onViewSession, onExportSession, onDeleteSession, onCorrectSession);

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={columns}
        data={history}
        loading={loading}
        error={error}
        onRetry={onRetry}
        onRowClick={onViewSession}
        emptyTitle="No attendance history"
        emptyDescription="No sessions match your current filters. Try adjusting the date range or batch filter."
        emptyIcon={<CalendarDays size={36} className="text-textMuted" />}
        caption="Attendance session history"
      />

      <PaginationBar pagination={pagination} onPageChange={onPageChange} />
    </div>
  );
};

export default AttendanceHistoryList;
