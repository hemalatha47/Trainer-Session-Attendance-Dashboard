/**
 * BatchListPage.jsx
 * Module 4.1 — Batch Management listing screen.
 *
 * Blueprint: Sections 4.1, 6.3, 7.1–7.3, 11.3, 13
 *
 * Architecture:
 *   BatchListPage
 *     → useBatches (hook)
 *       → batchService (service)
 *         → mockBatches / future REST API
 *
 * Sections:
 *   1. Page Header         — title, description, batch count, Add Batch CTA (placeholder)
 *   2. Summary Strip       — StatCard × 4 (Total / Active / Upcoming / Completed)
 *   3. Filter + Search Bar — status chips + search input
 *   4. Batch Table         — DataTable with sorting, pagination, row actions
 *   5. Loading State       — skeleton rows
 *   6. Empty State         — EmptyState component
 *   7. Error State         — ErrorState component
 *
 * Row Actions:
 *   View Details  → /batches/:id (blueprint Section 16.4 BATCH_DETAIL route)
 *   Delete        → ConfirmDialog → removeBatch()
 */

import { useState, useCallback }          from 'react';
import { useNavigate }                    from 'react-router-dom';
import { motion, AnimatePresence }        from 'framer-motion';
import {
  Layers, PlusCircle, Search, RefreshCw,
  Eye, Trash2, Pencil, PlayCircle, Clock, CheckCircle2,
  LayoutGrid, X,
} from 'lucide-react';

import { BatchCreateModal } from '../components/BatchCreateModal';
import { BatchEditModal }   from '../components/BatchEditModal';

import { useBatches }                     from '@hooks/useBatches';
import { useToast }                       from '@hooks/useToast';

import { Button }                         from '@components/ui/Button';
import { Input }                          from '@components/ui/Input';
import { Badge }                          from '@components/ui/Badge';
import { StatCard }                       from '@components/data/StatCard';
import { DataTable }                      from '@components/data/DataTable';
import { ErrorState }                     from '@components/feedback/ErrorState';
import { ConfirmDialog }                  from '@components/overlay/ConfirmDialog';

import {
  BATCH_STATUS_LABELS,
  BATCH_STATUS_BADGE_VARIANTS,
  V1_BATCH_STATUSES,
}                                         from '@constants/batchStatus';
import { ROUTES, buildRoute }             from '@constants/routes';
import { fadeIn }                         from '@constants/animations';
import { cn }                             from '@utils/componentUtils';

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    const [y, m, d] = iso.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
  } catch {
    return iso;
  }
};

// ── Status filter chip ────────────────────────────────────────────────────────
const StatusChip = ({ value, label, active, count, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(active ? '' : value)}
    aria-pressed={active}
    className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
      'border transition-all duration-150 focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-1',
      active
        ? 'bg-accent-600 text-white border-accent-600 shadow-sm'
        : 'bg-white text-textMuted border-border hover:border-accent-400 hover:text-accent-600'
    )}
  >
    {label}
    {count !== undefined && (
      <span
        className={cn(
          'inline-flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full text-[10px] font-semibold',
          active ? 'bg-white/20 text-white' : 'bg-neutral-100 text-textMuted'
        )}
      >
        {count}
      </span>
    )}
  </button>
);

// ── Attendance % cell ─────────────────────────────────────────────────────────
const AttendanceCell = ({ value }) => {
  if (value === null || value === undefined) {
    return <span className="text-textMuted text-xs italic">—</span>;
  }
  const pct = Number(value);
  const color =
    pct >= 75 ? 'text-success-DEFAULT' :
    pct >= 50 ? 'text-warning-text'    :
                'text-danger-DEFAULT';
  return (
    <span className={cn('text-sm font-semibold tabular-nums', color)}>
      {pct.toFixed(1)}%
    </span>
  );
};

// ── Table column definitions ──────────────────────────────────────────────────
const buildColumns = ({ onView, onEdit, onDelete }) => [
  {
    key:      'batchCode',
    label:    'Code',
    sortable: true,
    width:    '130px',
    render:   (val) => (
      <span className="font-mono text-xs bg-neutral-100 text-textPrimary px-1.5 py-0.5 rounded border border-neutral-200 whitespace-nowrap">
        {val}
      </span>
    ),
  },
  {
    key:      'batchName',
    label:    'Batch Name',
    sortable: true,
    render:   (val, row) => (
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-textPrimary leading-tight line-clamp-1">
          {val}
        </span>
        {row.description && (
          <span className="text-xs text-textMuted line-clamp-1 max-w-[220px]">
            {row.description}
          </span>
        )}
      </div>
    ),
  },
  {
    key:      'trainerName',
    label:    'Trainer',
    sortable: true,
    width:    '130px',
    render:   (val) => (
      <span className="text-sm text-textPrimary">{val || '—'}</span>
    ),
  },
  {
    key:      'startDate',
    label:    'Start',
    sortable: true,
    width:    '105px',
    render:   (val) => (
      <span className="text-sm tabular-nums text-textPrimary whitespace-nowrap">
        {fmtDate(val)}
      </span>
    ),
  },
  {
    key:      'endDate',
    label:    'End',
    sortable: true,
    width:    '105px',
    render:   (val) => (
      <span className="text-sm tabular-nums text-textPrimary whitespace-nowrap">
        {fmtDate(val)}
      </span>
    ),
  },
  {
    key:      'currentStudentCount',
    label:    'Students',
    sortable: true,
    width:    '85px',
    align:    'center',
    render:   (val, row) => (
      <span className="text-sm font-medium tabular-nums text-textPrimary">
        {val ?? 0}
        {row.maxStudents ? (
          <span className="text-textMuted font-normal">/{row.maxStudents}</span>
        ) : null}
      </span>
    ),
  },
  {
    key:      'attendancePct',
    label:    'Attendance',
    sortable: false,
    width:    '100px',
    align:    'center',
    render:   (val) => <AttendanceCell value={val} />,
  },
  {
    key:      'status',
    label:    'Status',
    sortable: true,
    width:    '110px',
    align:    'center',
    render:   (val) => (
      <Badge variant={BATCH_STATUS_BADGE_VARIANTS[val] ?? 'neutral'} size="sm">
        {BATCH_STATUS_LABELS[val] ?? val}
      </Badge>
    ),
  },
  {
    key:      '_actions',
    label:    'Actions',
    isAction: true,
    width:    '84px',
    render:   (_val, row) => (
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onView(row); }}
          className={cn(
            'p-1.5 rounded-md text-textMuted transition-colors',
            'hover:bg-accent-50 hover:text-accent-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600'
          )}
          aria-label={`View details for ${row.batchName}`}
          title="View details"
        >
          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(row); }}
          className={cn(
            'p-1.5 rounded-md text-textMuted transition-colors',
            'hover:bg-accent-50 hover:text-accent-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600'
          )}
          aria-label={`Edit ${row.batchName}`}
          title="Edit batch"
        >
          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(row); }}
          className={cn(
            'p-1.5 rounded-md text-textMuted transition-colors',
            'hover:bg-danger-bg hover:text-danger-DEFAULT',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-DEFAULT'
          )}
          aria-label={`Delete ${row.batchName}`}
          title="Delete batch"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    ),
  },
];

// ── Pagination bar ────────────────────────────────────────────────────────────
const PaginationBar = ({ meta, onPageChange }) => {
  if (meta.totalPages <= 1 && meta.filtered <= meta.pageSize) return null;
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 border-t border-border bg-neutral-50 text-xs text-textMuted"
      role="navigation"
      aria-label="Batch list pagination"
    >
      <span>
        {meta.filtered === 0
          ? 'No records'
          : `${meta.from}–${meta.to} of ${meta.filtered} batch${meta.filtered === 1 ? '' : 'es'}`}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          aria-label="Go to previous page"
        >
          ‹ Prev
        </Button>
        <span className="px-2 font-medium text-textPrimary tabular-nums">
          {meta.page} / {meta.totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          aria-label="Go to next page"
        >
          Next ›
        </Button>
      </div>
    </div>
  );
};

// ── BatchListPage ─────────────────────────────────────────────────────────────

const BatchListPage = () => {
  const navigate = useNavigate();
  const toast    = useToast();

  const {
    batches,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    meta,
    reload,
    removeBatch,
    statusCounts,
  } = useBatches();

  // ── Delete confirm dialog state ───────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Create modal state ────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);

  // ── Edit modal state ──────────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState(null); // batch object or null

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleView = useCallback((row) => {
    navigate(buildRoute(ROUTES.BATCH_DETAIL, { id: row.id }));
  }, [navigate]);

  // ── Edit flow ─────────────────────────────────────────────────────────────
  const handleEditClick = useCallback((row) => {
    setEditTarget(row);
  }, []);

  const handleEditSuccess = useCallback((updatedBatch) => {
    // Optimistic update — replace the batch in local state
    toast.success(`"${updatedBatch.batchName}" has been updated`);
    reload();
  }, [toast, reload]);

  const handleEditClose = useCallback(() => setEditTarget(null), []);

  // ── Create flow ───────────────────────────────────────────────────────────
  const handleCreateSuccess = useCallback((newBatch) => {
    toast.success(`"${newBatch.batchName}" has been created`);
    reload();
  }, [toast, reload]);

  // ── Delete flow ───────────────────────────────────────────────────────────
  const handleDeleteClick = useCallback((row) => {
    setDeleteTarget(row);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await removeBatch(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);

    if (res.success) {
      toast.success(`"${deleteTarget.batchName}" has been deleted`);
    } else {
      toast.error(res.error ?? 'Failed to delete batch');
    }
  }, [deleteTarget, removeBatch, toast]);

  const handleDeleteCancel = useCallback(() => setDeleteTarget(null), []);

  // ── Clear all filters ─────────────────────────────────────────────────────
  const clearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('');
  }, [setSearch, setStatusFilter]);

  const hasActiveFilters = search || statusFilter;

  // ── Column definitions ────────────────────────────────────────────────────
  const columns = buildColumns({ onView: handleView, onEdit: handleEditClick, onDelete: handleDeleteClick });

  // ── Summary stats ─────────────────────────────────────────────────────────
  const summaryStats = [
    {
      label:       'Total Batches',
      value:       statusCounts.total,
      icon:        <LayoutGrid className="w-5 h-5" aria-hidden="true" />,
      status:      'default',
      description: 'All programs',
    },
    {
      label:       'Active',
      value:       statusCounts.active,
      icon:        <PlayCircle className="w-5 h-5" aria-hidden="true" />,
      status:      'info',
      description: 'Currently running',
    },
    {
      label:       'Upcoming',
      value:       statusCounts.upcoming,
      icon:        <Clock className="w-5 h-5" aria-hidden="true" />,
      status:      'warning',
      description: 'Scheduled to start',
    },
    {
      label:       'Completed',
      value:       statusCounts.completed,
      icon:        <CheckCircle2 className="w-5 h-5" aria-hidden="true" />,
      status:      'success',
      description: 'Finished programs',
    },
  ];

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6"
    >

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <header>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent-600 shrink-0" aria-hidden="true" />
              <h1 className="text-xl font-semibold text-textPrimary">
                Batch Management
              </h1>
              {!loading && (
                <span
                  className="ml-1 text-xs font-medium text-textMuted bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full tabular-nums"
                  aria-label={`${statusCounts.total} total batches`}
                >
                  {statusCounts.total}
                </span>
              )}
            </div>
            <p className="text-sm text-textMuted">
              Create, monitor, and manage training batches across all programs.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              iconLeft={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={reload}
              disabled={loading}
              aria-label="Refresh batch list"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              iconLeft={<PlusCircle className="w-3.5 h-3.5" />}
              onClick={() => setCreateOpen(true)}
              aria-label="Create a new batch"
            >
              Add Batch
            </Button>
          </div>
        </div>
      </header>

      {/* ── Summary Strip ────────────────────────────────────────────────── */}
      <section aria-label="Batch summary statistics">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaryStats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              status={s.status}
              description={s.description}
              loading={loading}
            />
          ))}
        </div>
      </section>

      {/* ── Filter + Search Bar ──────────────────────────────────────────── */}
      <section
        aria-label="Batch filters"
        className="bg-white rounded-lg border border-border shadow-sm p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Status chips */}
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter batches by status"
          >
            <span className="text-xs font-medium text-textMuted shrink-0 select-none">
              Status:
            </span>
            <StatusChip
              value=""
              label="All"
              active={statusFilter === ''}
              count={statusCounts.total}
              onClick={() => setStatusFilter('')}
            />
            {V1_BATCH_STATUSES.map((s) => (
              <StatusChip
                key={s}
                value={s}
                label={BATCH_STATUS_LABELS[s]}
                active={statusFilter === s}
                count={statusCounts[s]}
                onClick={setStatusFilter}
              />
            ))}
          </div>

          {/* Search */}
          <div className="w-full sm:w-64 shrink-0">
            <Input
              type="search"
              placeholder="Search name, code, trainer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leadingIcon={<Search className="w-3.5 h-3.5" aria-hidden="true" />}
              trailingIcon={
                search ? (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="text-textMuted hover:text-textPrimary focus-visible:outline-none"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null
              }
              aria-label="Search batches"
            />
          </div>
        </div>

        {/* Active filter summary */}
        <AnimatePresence>
          {hasActiveFilters && !loading && (
            <motion.div
              key="filter-banner"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
                <p className="text-xs text-textMuted">
                  Showing{' '}
                  <span className="font-semibold text-textPrimary">
                    {meta.filtered}
                  </span>{' '}
                  {meta.filtered === 1 ? 'batch' : 'batches'}
                  {statusFilter && (
                    <> · status:{' '}
                      <span className="font-semibold text-textPrimary">
                        {BATCH_STATUS_LABELS[statusFilter]}
                      </span>
                    </>
                  )}
                  {search && (
                    <> · search:{' '}
                      <span className="font-semibold text-textPrimary">
                        "{search}"
                      </span>
                    </>
                  )}
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-accent-600 hover:text-accent-700 font-medium focus-visible:outline-none shrink-0"
                  aria-label="Clear all active filters"
                >
                  Clear all
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Batch Table Card ─────────────────────────────────────────────── */}
      <section
        aria-label="Batch list table"
        className="bg-white rounded-lg border border-border shadow-sm overflow-hidden"
      >
        {/* Error state */}
        {error && !loading && (
          <ErrorState
            title="Failed to load batches"
            description={error}
            onRetry={reload}
            className="py-14"
          />
        )}

        {/* DataTable (handles its own loading skeleton + empty state) */}
        {!error && (
          <DataTable
            columns={columns}
            data={batches}
            loading={loading}
            onRowClick={handleView}
            caption="Training batches"
            emptyTitle={
              hasActiveFilters ? 'No matching batches' : 'No batches yet'
            }
            emptyDescription={
              hasActiveFilters
                ? 'Try adjusting your search or removing the status filter.'
                : 'Create your first batch to get started tracking attendance.'
            }
            emptyIcon={<Layers className="w-8 h-8" aria-hidden="true" />}
            emptyActionLabel={hasActiveFilters ? 'Clear filters' : undefined}
            onEmptyAction={hasActiveFilters ? clearFilters : undefined}
          />
        )}

        {/* Pagination */}
        {!error && !loading && (
          <PaginationBar meta={meta} onPageChange={setPage} />
        )}
      </section>

      {/* ── Delete Confirm Dialog ─────────────────────────────────────────── */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen
          title="Delete Batch"
          message={`Are you sure you want to delete "${deleteTarget.batchName}"? This cannot be undone.`}
          confirmText={deleting ? 'Deleting…' : 'Delete'}
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onClose={handleDeleteCancel}
        />
      )}

      {/* ── Create Batch Modal ────────────────────────────────────────────── */}
      <BatchCreateModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* ── Edit Batch Modal ──────────────────────────────────────────────── */}
      {editTarget && (
        <BatchEditModal
          isOpen={Boolean(editTarget)}
          onClose={handleEditClose}
          batchId={editTarget.id}
          onSuccess={handleEditSuccess}
        />
      )}
    </motion.div>
  );
};

export default BatchListPage;
