/**
 * BatchListPage.jsx
 * Lists all batches with status filtering, search, and the new KPI dashboard
 * cards section (Module 4.5).
 *
 * Layout order:
 *   Page Header (title + Add Batch CTA)
 *   └── BatchDashboardCards   ← Module 4.5 (uses GLOBAL dataset always)
 *   └── Filters (status + search)
 *   └── DataTable
 *   └── Modal (Add/Edit Batch)
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

import { PageWrapper } from '@components/layout/PageWrapper';
import { Button } from '@components/common/Button';
import { SearchBar } from '@components/common/SearchBar';
import { DataTable } from '@components/common/DataTable';
import { Badge } from '@components/common/Badge';
import { Modal } from '@components/common/Modal';
import { BatchDashboardCards } from '@components/common/BatchDashboardCards';

import { useBatch } from '@hooks/useBatch';
import { useAppContext } from '@context/AppContext';
import { BATCH_STATUS, BATCH_STATUS_LABEL, BATCH_BADGE_COLOR } from '@constants/batchStatus';
import { ROUTES, buildRoute } from '@constants/routes';
import { formatDisplayDate } from '@utils/dateUtils';
import BatchFormModal from './BatchFormModal';

// ---------------------------------------------------------------------------
// Status filter tabs
// ---------------------------------------------------------------------------
const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: BATCH_STATUS.ACTIVE },
  { label: 'Completed', value: BATCH_STATUS.COMPLETED },
  { label: 'Upcoming', value: BATCH_STATUS.UPCOMING },
];

// ---------------------------------------------------------------------------
// Table column definitions
// ---------------------------------------------------------------------------
const COLUMNS = [
  {
    key: 'name',
    label: 'Batch Name',
    render: (v) => <span className="font-medium text-gray-900">{v}</span>,
  },
  {
    key: 'startDate',
    label: 'Start',
    render: (v) => formatDisplayDate(v),
  },
  {
    key: 'endDate',
    label: 'End',
    render: (v) => formatDisplayDate(v),
  },
  {
    key: 'studentCount',
    label: 'Students',
    render: (v) => <span className="text-gray-700">{v ?? '—'}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (v) => (
      <Badge
        status={v}
        label={BATCH_STATUS_LABEL[v] ?? v}
        color={BATCH_BADGE_COLOR[v]}
      />
    ),
  },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export function BatchListPage() {
  const navigate = useNavigate();
  const { setActiveBatch } = useAppContext();

  const { batches, loading, error, createBatch, updateBatch, archiveBatch, refresh } =
    useBatch();

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  // ---------------------------------------------------------------------------
  // Derived / filtered list for the TABLE (not for the KPI cards)
  // KPI cards always use the global dataset — no prop passed to BatchDashboardCards
  // ---------------------------------------------------------------------------
  const filteredBatches = useMemo(() => {
    let list = batches ?? [];
    if (statusFilter) list = list.filter((b) => b.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((b) => b.name.toLowerCase().includes(q));
    }
    return list;
  }, [batches, statusFilter, search]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  function handleRowClick(batch) {
    setActiveBatch(batch.id);
    navigate(buildRoute(ROUTES.BATCH_DETAIL, { id: batch.id }));
  }

  function handleAddClick() {
    setEditingBatch(null);
    setModalOpen(true);
  }

  function handleEditClick(batch) {
    setEditingBatch(batch);
    setModalOpen(true);
  }

  async function handleFormSubmit(formData) {
    if (editingBatch) {
      await updateBatch(editingBatch.id, formData);
    } else {
      await createBatch(formData);
    }
    setModalOpen(false);
  }

  async function handleArchive(batch) {
    await archiveBatch(batch.id);
  }

  // Action column — injected into DataTable via extraActions
  const actionColumn = {
    key: '_actions',
    label: '',
    render: (_, row) => (
      <div className="flex gap-2 justify-end">
        <Button
          variant="secondary"
          onClick={(e) => { e.stopPropagation(); handleEditClick(row); }}
          aria-label={`Edit ${row.name}`}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          onClick={(e) => { e.stopPropagation(); handleArchive(row); }}
          aria-label={`Archive ${row.name}`}
        >
          Archive
        </Button>
      </div>
    ),
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <PageWrapper title="Batches">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A5F]">Batch Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage training batches, track progress, and monitor attendance.
          </p>
        </div>
        <Button variant="primary" onClick={handleAddClick} icon={<Plus size={16} />}>
          Add Batch
        </Button>
      </div>

      {/* ── Module 4.5 — Dashboard KPI Cards (global dataset) ───────────── */}
      <BatchDashboardCards />

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Status tabs */}
        <div
          className="flex gap-1 p-1 bg-gray-100 rounded-lg"
          role="group"
          aria-label="Filter by status"
        >
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-white text-[#1E3A5F] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-pressed={statusFilter === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs">
          <SearchBar
            placeholder="Search batches…"
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      {/* ── Batch table ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <DataTable
          columns={[...COLUMNS, actionColumn]}
          data={filteredBatches}
          loading={loading}
          error={error}
          onRetry={refresh}
          onRowClick={handleRowClick}
          emptyMessage="No batches found. Add your first batch to get started."
        />
      </motion.div>

      {/* ── Add/Edit Modal ──────────────────────────────────────────────── */}
      {modalOpen && (
        <Modal
          title={editingBatch ? 'Edit Batch' : 'Add New Batch'}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        >
          <BatchFormModal
            initial={editingBatch}
            onSubmit={handleFormSubmit}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </PageWrapper>
  );
}

export default BatchListPage;
