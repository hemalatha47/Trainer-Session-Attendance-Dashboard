/**
 * BatchListPage.jsx
 * Module 4.1 — Batch Management listing screen.
 * Updated in Module 4.4 — Batch Filters integration.
 *
 * Architecture:
 *   BatchListPage
 *     → useBatches (raw data fetch + basic status counts)
 *     → useBatchFilters (advanced filter state + filteredBatches pipeline)
 *       → applyBatchFilters (filtering.js)
 *
 * Filter pipeline:
 *   allBatches → applyBatchFilters (search+status+trainer+course+capacity+date) → pagination → DataTable
 *
 * Blueprint: Sections 4.1, 6.3, 7.1–7.3, 11.3, 13
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate }                        from 'react-router-dom';
import { motion, AnimatePresence }            from 'framer-motion';
import {
  Layers, PlusCircle, RefreshCw,
  Eye, Trash2, Pencil, PlayCircle, Clock, CheckCircle2,
  LayoutGrid,
} from 'lucide-react';

import { BatchCreateModal } from '../components/BatchCreateModal';
import { BatchEditModal }   from '../components/BatchEditModal';
import { BatchFilterBar }   from '@components/batch/BatchFilterBar';

import { useBatches }       from '@hooks/useBatches';
import { useBatchFilters }  from '@hooks/useBatchFilters';
import { useToast }         from '@hooks/useToast';

import { Button }           from '@components/ui/Button';
import { Badge }            from '@components/ui/Badge';
import { StatCard }         from '@components/data/StatCard';
import { DataTable }        from '@components/data/DataTable';
import { ErrorState }       from '@components/feedback/ErrorState';
import { ConfirmDialog }    from '@components/overlay/ConfirmDialog';

import {
  BATCH_STATUS_LABELS,
  BATCH_STATUS_BADGE_VARIANTS,
} from '@constants/batchStatus';
import { ROUTES, buildRoute } from '@constants/routes';
import { fadeIn }             from '@constants/animations';
import { cn }                 from '@utils/componentUtils';

const PAGE_SIZE = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Attendance % cell ─────────────────────────────────────────────────────────
const AttendanceCell = ({ value }) => {
  if (value === null || value === undefined) {
    return <span className="text-textMuted text-xs italic">—</span>;
  }
  const pct   = Number(value);
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

// ── Column definitions ────────────────────────────────────────────────────────
const buildColumns = ({ onView, onEdit, onDelete }) => [
  {
    key: 'batchCode', label: 'Code', sortable: true, width: '130px',
    render: (val) => (
      <span className="font-mono text-xs bg-neutral-100 text-textPrimary px-1.5 py-0.5 rounded border border-neutral-200 whitespace-nowrap">
        {val}
      </span>
    ),
  },
  {
    key: 'batchName', label: 'Batch Name', sortable: true,
    render: (val, row) => (
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-textPrimary leading-tight line-clamp-1">{val}</span>
        {row.description && (
          <span className="text-xs text-textMuted line-clamp-1 max-w-[220px]">{row.description}</span>
        )}
      </div>
    ),
  },
  {
    key: 'trainerName', label: 'Trainer', sortable: true, width: '130px',
    render: (val) => <span className="text-sm text-textPrimary">{val || '—'}</span>,
  },
  {
    key: 'startDate', label: 'Start', sortable: true, width: '105px',
    render: (val) => <span className="text-sm tabular-nums text-textPrimary whitespace-nowrap">{fmtDate(val)}</span>,
  },
  {
    key: 'endDate', label: 'End', sortable: true, width: '105px',
    render: (val) => <span className="text-sm tabular-nums text-textPrimary whitespace-nowrap">{fmtDate(val)}</span>,
  },
  {
    key: 'currentStudentCount', label: 'Students', sortable: true, width: '85px', align: 'center',
    render: (val, row) => (
      <span className="text-sm font-medium tabular-nums text-textPrimary">
        {val ?? 0}
        {row.maxStudents ? <span className="text-textMuted font-normal">/{row.maxStudents}</span> : null}
      </span>
    ),
  },
  {
    key: 'attendancePct', label: 'Attendance', sortable: false, width: '100px', align: 'center',
    render: (val) => <AttendanceCell value={val} />,
  },
  {
    key: 'status', label: 'Status', sortable: true, width: '110px', align: 'center',
    render: (val) => (
      <Badge variant={BATCH_STATUS_BADGE_VARIANTS[val] ?? 'neutral'} size="sm">
        {BATCH_STATUS_LABELS[val] ?? val}
      </Badge>
    ),
  },
  {
    key: '_actions', label: 'Actions', isAction: true, width: '84px',
    render: (_val, row) => (
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onView(row); }}
          className={cn('p-1.5 rounded-md text-textMuted transition-colors','hover:bg-accent-50 hover:text-accent-600','focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600')}
          aria-label={`View details for ${row.batchName}`}
          title="View details"
        >
          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(row); }}
          className={cn('p-1.5 rounded-md text-textMuted transition-colors','hover:bg-accent-50 hover:text-accent-600','focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600')}
          aria-label={`Edit ${row.batchName}`}
          title="Edit batch"
        >
          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(row); }}
          className={cn('p-1.5 rounded-md text-textMuted transition-colors','hover:bg-danger-bg hover:text-danger-DEFAULT','focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-DEFAULT')}
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
        <Button variant="ghost" size="sm" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)} aria-label="Go to previous page">
          ‹ Prev
        </Button>
        <span className="px-2 font-medium text-textPrimary tabular-nums">
          {meta.page} / {meta.totalPages}
        </span>
        <Button variant="ghost" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => onPageChange(meta.page + 1)} aria-label="Go to next page">
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

  // Raw data + status counts from useBatches
  const {
    allBatches,
    loading,
    error,
    reload,
    removeBatch,
    statusCounts,
  } = useBatches();

  // Advanced filter system from useBatchFilters
  const {
    filters,
    setFilter,
    resetFilters,
    applyQuickFilter,
    filteredBatches,
    activeFilterCount,
    hasActiveFilters,
    trainerOptions,
    courseOptions,
  } = useBatchFilters(allBatches, {
    onFilterChange: () => setPage(1),
  });

  // ── Pagination (local, applied after filter) ───────────────────────────────
  const [page, setPage] = useState(1);

  // Reset page to 1 when filtered count changes
  useEffect(() => { setPage(1); }, [filteredBatches.length]);

  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageStart  = (safePage - 1) * PAGE_SIZE;
  const pageBatches = filteredBatches.slice(pageStart, pageStart + PAGE_SIZE);

  const meta = {
    total:      allBatches.length,
    filtered:   filteredBatches.length,
    page:       safePage,
    pageSize:   PAGE_SIZE,
    totalPages,
    from:       filteredBatches.length === 0 ? 0 : pageStart + 1,
    to:         Math.min(safePage * PAGE_SIZE, filteredBatches.length),
  };

  // ── Delete confirm dialog ──────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleView = useCallback((row) => {
    navigate(buildRoute(ROUTES.BATCH_DETAIL, { id: row.id }));
  }, [navigate]);

  const handleEditClick  = useCallback((row) => setEditTarget(row), []);
  const handleEditClose  = useCallback(() => setEditTarget(null), []);

  const handleEditSuccess = useCallback((updatedBatch) => {
    toast.success(`"${updatedBatch.batchName}" has been updated`);
    reload();
  }, [toast, reload]);

  const handleCreateSuccess = useCallback((newBatch) => {
    toast.success(`"${newBatch.batchName}" has been created`);
    reload();
  }, [toast, reload]);

  const handleDeleteClick = useCallback((row) => setDeleteTarget(row), []);
  const handleDeleteCancel = useCallback(() => setDeleteTarget(null), []);

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

  // ── Column definitions ─────────────────────────────────────────────────────
  const columns = buildColumns({ onView: handleView, onEdit: handleEditClick, onDelete: handleDeleteClick });

  // ── Summary stats ──────────────────────────────────────────────────────────
  const summaryStats = [
    { label: 'Total Batches', value: statusCounts.total,     icon: <LayoutGrid className="w-5 h-5" />,    status: 'default',  description: 'All programs' },
    { label: 'Active',        value: statusCounts.active,    icon: <PlayCircle className="w-5 h-5" />,    status: 'info',     description: 'Currently running' },
    { label: 'Upcoming',      value: statusCounts.upcoming,  icon: <Clock className="w-5 h-5" />,         status: 'warning',  description: 'Scheduled to start' },
    { label: 'Completed',     value: statusCounts.completed, icon: <CheckCircle2 className="w-5 h-5" />, status: 'success',  description: 'Finished programs' },
  ];

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6"
    >
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <header>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent-600 shrink-0" aria-hidden="true" />
              <h1 className="text-xl font-semibold text-textPrimary">Batch Management</h1>
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

      {/* ── Summary Strip ──────────────────────────────────────────────── */}
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

      {/* ── Advanced Filter Bar ─────────────────────────────────────────── */}
      {!error && (
        <BatchFilterBar
          filters={filters}
          setFilter={setFilter}
          resetFilters={resetFilters}
          applyQuickFilter={applyQuickFilter}
          activeFilterCount={activeFilterCount}
          hasActiveFilters={hasActiveFilters}
          trainerOptions={trainerOptions}
          courseOptions={courseOptions}
          resultCount={filteredBatches.length}
        />
      )}

      {/* ── Batch Table Card ───────────────────────────────────────────── */}
      <section aria-label="Batch list table" className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">

        {error && !loading && (
          <ErrorState
            title="Failed to load batches"
            description={error}
            onRetry={reload}
            className="py-14"
          />
        )}

        {!error && (
          <DataTable
            columns={columns}
            data={pageBatches}
            loading={loading}
            onRowClick={handleView}
            caption="Training batches"
            emptyTitle={hasActiveFilters ? 'No matching batches' : 'No batches yet'}
            emptyDescription={
              hasActiveFilters
                ? 'Try adjusting your search criteria or clearing a filter.'
                : 'Create your first batch to get started tracking attendance.'
            }
            emptyIcon={<Layers className="w-8 h-8" aria-hidden="true" />}
            emptyActionLabel={hasActiveFilters ? 'Clear filters' : undefined}
            onEmptyAction={hasActiveFilters ? resetFilters : undefined}
          />
        )}

        {!error && !loading && (
          <PaginationBar meta={meta} onPageChange={setPage} />
        )}
      </section>

      {/* ── Delete Confirm Dialog ──────────────────────────────────────── */}
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

      {/* ── Create Batch Modal ─────────────────────────────────────────── */}
      <BatchCreateModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* ── Edit Batch Modal ───────────────────────────────────────────── */}
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
