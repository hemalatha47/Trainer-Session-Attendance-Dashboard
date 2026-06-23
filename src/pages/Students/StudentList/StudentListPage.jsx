/**
 * StudentListPage.jsx
 * Module 5.7 update — Student Export & Advanced Actions.
 *
 * New in this module:
 *   - Row-level checkboxes for bulk selection
 *   - Select-all checkbox in table header
 *   - StudentBulkActionToolbar (shows when selection > 0)
 *   - Export CSV (all / filtered / selected)
 *   - Transfer batch modal (StudentBatchTransferModal)
 *   - Deactivate flow (single or bulk via ConfirmDialog)
 *   - Delete flow (ConfirmDialog with soft-delete guard)
 *   - Row-level Deactivate / Delete actions in action column
 *   - Loading overlays during bulk async operations
 *
 * All existing functionality (sort, filter, pagination, edit, view) is preserved.
 *
 * Blueprint Sections: 4.2, 4.7, 4.8, 6.5, 7.1, 7.2, 7.3, 9.5
 */

import { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, ChevronsUpDown,
  Eye, GraduationCap, UserPlus, Pencil,
  Download, UserX, Trash2, MoreHorizontal,
} from 'lucide-react';
import { motion } from 'framer-motion';

import useStudents         from '@hooks/useStudents';
import useStudentFilters   from '@hooks/useStudentFilters';
import useStudentDashboard from '@hooks/useStudentDashboard';
import { mockBatches }     from '@data/mockBatches';
import { sortData, SORT_ORDER } from '@utils/sorting';
import {
  deactivateStudent,
  deleteStudent,
  bulkDeleteStudents,
  exportStudentsCSV,
  STUDENT_STATUS,
} from '@services/studentService';
import { exportToCSV } from '@utils/exportUtils';
import { useAppContext } from '@context/AppContext';

import { Avatar }      from '@components/ui/Avatar';
import { Badge }       from '@components/ui/Badge';
import { Button }      from '@components/ui/Button';
import { Checkbox }    from '@components/ui/Checkbox';
import { ProgressBar } from '@components/data/ProgressBar';
import { EmptyState }  from '@components/feedback/EmptyState';
import { ErrorState }  from '@components/feedback/ErrorState';
import { TableSkeleton } from '@components/feedback/Skeleton';
import { ConfirmDialog } from '@components/overlay';

import { cn }     from '@utils/componentUtils';
import { fadeIn } from '@constants/animations';

import StudentCreateModal       from '../components/StudentCreateModal';
import StudentEditModal         from '../components/StudentEditModal';
import StudentFilterBar         from '@components/StudentFilterBar';
import StudentDashboardCards    from '../components/StudentDashboardCards';
import StudentBulkActionToolbar from '../components/StudentBulkActionToolbar';
import StudentBatchTransferModal from '../components/StudentBatchTransferModal';

// ── Constants ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

// ── CSV column definitions ────────────────────────────────────────────────────
const STUDENT_CSV_COLUMNS = [
  { key: 'studentCode',          label: 'Student ID'          },
  { key: 'fullName',             label: 'Full Name'           },
  { key: 'email',                label: 'Email'               },
  { key: 'phone',                label: 'Phone'               },
  { key: 'batch',                label: 'Batch'               },
  { key: 'status',               label: 'Status'              },
  { key: 'attendancePercentage', label: 'Attendance %'        },
  { key: 'joinedDate',           label: 'Joined Date'         },
];

// ── Batch lookup map ──────────────────────────────────────────────────────────
const BATCH_MAP = Object.fromEntries(
  mockBatches.map((b) => [b.id, { batchName: b.batchName, batchCode: b.batchCode }])
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const getAttendanceBadgeVariant = (pct) => {
  if (pct >= 75) return 'success';
  if (pct >= 50) return 'warning';
  return 'danger';
};

// ── Sort icon ─────────────────────────────────────────────────────────────────
const SortIcon = ({ field, sortConfig }) => {
  if (sortConfig.field !== field)
    return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40 shrink-0" aria-hidden="true" />;
  return sortConfig.order === SORT_ORDER.ASC
    ? <ChevronUp   className="w-3.5 h-3.5 text-accent-600 shrink-0" aria-hidden="true" />
    : <ChevronDown className="w-3.5 h-3.5 text-accent-600 shrink-0" aria-hidden="true" />;
};

// ── Pagination bar ────────────────────────────────────────────────────────────
const PaginationBar = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total, from, to, hasNext, hasPrev } = pagination;
  const pages = useMemo(() => {
    const range = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++)
      range.push(i);
    return range;
  }, [page, totalPages]);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-4 border-t border-border">
      <p className="text-xs text-textMuted order-2 sm:order-1">
        Showing <span className="font-medium text-textPrimary">{from}–{to}</span> of{' '}
        <span className="font-medium text-textPrimary">{total}</span> students
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2" role="navigation" aria-label="Pagination">
        <button onClick={() => onPageChange(page - 1)} disabled={!hasPrev} aria-label="Previous page"
          className="p-1.5 rounded text-textMuted hover:text-textPrimary hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages[0] > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className={pageButtonClass(1, page)}>1</button>
            {pages[0] > 2 && <span className="px-1 text-textMuted text-xs">…</span>}
          </>
        )}
        {pages.map((p) => (
          <button key={p} onClick={() => onPageChange(p)} aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined} className={pageButtonClass(p, page)}>
            {p}
          </button>
        ))}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-textMuted text-xs">…</span>}
            <button onClick={() => onPageChange(totalPages)} className={pageButtonClass(totalPages, page)}>
              {totalPages}
            </button>
          </>
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={!hasNext} aria-label="Next page"
          className="p-1.5 rounded text-textMuted hover:text-textPrimary hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const pageButtonClass = (p, current) =>
  cn('min-w-[28px] h-7 px-1.5 rounded text-xs font-medium transition-colors',
    p === current ? 'bg-accent-600 text-white' : 'text-textMuted hover:text-textPrimary hover:bg-neutral-100');

// ── Sortable column header ────────────────────────────────────────────────────
const SortableHeader = ({ label, field, sortConfig, onSort }) => (
  <th scope="col" className="px-4 py-3 text-xs font-semibold text-textMuted uppercase tracking-wider whitespace-nowrap text-left">
    <button onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 hover:text-textPrimary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded"
      aria-label={`Sort by ${label}`}>
      {label}
      <SortIcon field={field} sortConfig={sortConfig} />
    </button>
  </th>
);

// ── Student table row ─────────────────────────────────────────────────────────
const StudentRow = ({
  student, batch, onView, onEdit, onDeactivate, onDelete, index,
  isSelected, onToggleSelect, bulkLoading,
}) => {
  const fullName          = `${student.firstName} ${student.lastName}`;
  const attendanceVariant = getAttendanceBadgeVariant(student.attendancePercentage ?? 0);
  const isInactive        = student.status === STUDENT_STATUS.INACTIVE;

  return (
    <motion.tr
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className={cn(
        'border-b border-border hover:bg-accent-50 transition-colors group',
        index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/60',
        isSelected && 'bg-accent-50 hover:bg-accent-100'
      )}
    >
      {/* Checkbox */}
      <td className="px-3 py-3 w-10">
        <Checkbox
          checked={isSelected}
          onChange={() => onToggleSelect(student.id)}
          disabled={bulkLoading}
          aria-label={`Select ${fullName}`}
        />
      </td>

      {/* Avatar + Name */}
      <td className="px-4 py-3 cursor-pointer" onClick={() => onView(student.id)}>
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={fullName} size="sm" className="shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-textPrimary leading-tight truncate">{fullName}</p>
            <p className="text-xs text-textMuted truncate">{student.email || '—'}</p>
          </div>
        </div>
      </td>

      {/* Student Code */}
      <td className="px-4 py-3">
        <span className="text-xs font-mono font-medium text-textPrimary bg-neutral-100 px-2 py-0.5 rounded">
          {student.studentCode}
        </span>
      </td>

      {/* Batch */}
      <td className="px-4 py-3 hidden md:table-cell">
        {batch ? (
          <div className="min-w-0">
            <p className="text-sm text-textPrimary truncate max-w-[180px]">{batch.batchName}</p>
            <p className="text-xs text-textMuted font-mono">{batch.batchCode}</p>
          </div>
        ) : <span className="text-xs text-textMuted">—</span>}
      </td>

      {/* Attendance */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <div className="min-w-[100px]">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={attendanceVariant} size="sm" label={`${student.attendancePercentage ?? 0}%`} />
          </div>
          <ProgressBar value={student.attendancePercentage ?? 0} color="auto" size="xs" className="max-w-[100px]" />
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <Badge
          variant={student.status === 'active' ? 'success' : 'neutral'}
          label={student.status === 'active' ? 'Active' : 'Inactive'}
          dot
          size="md"
        />
      </td>

      {/* Enrolled date */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-sm text-textMuted">
          {student.enrollmentDate
            ? new Date(student.enrollmentDate + 'T00:00:00').toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
              })
            : '—'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(student.id); }}
            aria-label={`Edit ${fullName}`}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1 text-xs font-medium text-textMuted hover:text-accent-600 hover:bg-accent-50 px-2 py-1 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:opacity-40"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onView(student.id); }}
            aria-label={`View ${fullName}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-accent-600 hover:text-accent-700 hover:bg-accent-50 px-2 py-1 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">View</span>
          </button>

          {/* Deactivate / Delete row actions */}
          {!isInactive && (
            <button
              onClick={(e) => { e.stopPropagation(); onDeactivate(student.id); }}
              aria-label={`Deactivate ${fullName}`}
              disabled={bulkLoading}
              className="hidden lg:inline-flex items-center gap-1 text-xs font-medium text-textMuted hover:text-amber-700 hover:bg-amber-50 px-2 py-1 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-40"
            >
              <UserX className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onDelete(student.id); }}
            aria-label={`Delete ${fullName}`}
            disabled={bulkLoading}
            className="hidden lg:inline-flex items-center gap-1 text-xs font-medium text-textMuted hover:text-danger-DEFAULT hover:bg-red-50 px-2 py-1 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-DEFAULT disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ── Page header ───────────────────────────────────────────────────────────────
const PageHeader = ({ onAddStudent, onExportAll, exportLoading }) => (
  <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div>
      <h1 className="text-xl font-semibold text-textPrimary leading-tight">Students</h1>
      <p className="text-sm text-textMuted mt-0.5">View and manage students across all training batches.</p>
    </div>
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        iconLeft={<Download className="w-4 h-4" aria-hidden="true" />}
        onClick={onExportAll}
        loading={exportLoading}
        aria-label="Export all students as CSV"
      >
        Export All
      </Button>
      <Button
        variant="primary"
        size="sm"
        iconLeft={<UserPlus className="w-4 h-4" aria-hidden="true" />}
        onClick={onAddStudent}
        aria-label="Add a new student"
      >
        Add Student
      </Button>
    </div>
  </header>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const StudentListPage = () => {
  const navigate = useNavigate();
  const { showToast } = useAppContext();

  // ── Modal / dialog state ───────────────────────────────────────────────────
  const [createOpen,     setCreateOpen]     = useState(false);
  const [editOpen,       setEditOpen]       = useState(false);
  const [editStudentId,  setEditStudentId]  = useState(null);
  const [transferOpen,   setTransferOpen]   = useState(false);

  // ── Confirm dialog state ───────────────────────────────────────────────────
  const [confirmState, setConfirmState] = useState({
    open:    false,
    title:   '',
    message: '',
    variant: 'danger',
    onConfirm: null,
  });

  // ── Bulk selection state ───────────────────────────────────────────────────
  const [selectedIds,  setSelectedIds]  = useState(new Set());
  const [bulkLoading,  setBulkLoading]  = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // ── Sort / pagination state ────────────────────────────────────────────────
  const [sortConfig, setSortConfig] = useState({ field: 'enrollmentDate', order: SORT_ORDER.DESC });
  const [page, setPage] = useState(1);

  // ── Data ───────────────────────────────────────────────────────────────────
  const { allStudents, loading, error, reload } = useStudents();
  const { metrics: dashboardMetrics, loading: dashboardLoading, error: dashboardError, refresh: dashboardRefresh } = useStudentDashboard();

  // ── Filters ────────────────────────────────────────────────────────────────
  const {
    filters, setFilter, resetFilters, applyQuickFilter,
    filteredStudents: filterPipelineStudents,
    activeFilterCount, hasActiveFilters, batchOptions,
  } = useStudentFilters(allStudents, { onFilterChange: () => setPage(1) });

  // ── Sort ───────────────────────────────────────────────────────────────────
  const sortedStudents = useMemo(() => {
    const fieldMap = {
      fullName: 'firstName', studentCode: 'studentCode',
      attendancePercentage: 'attendancePercentage', enrollmentDate: 'enrollmentDate',
    };
    return sortData(filterPipelineStudents, fieldMap[sortConfig.field] ?? sortConfig.field, sortConfig.order);
  }, [filterPipelineStudents, sortConfig]);

  const toggleSort = useCallback((field) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC,
    }));
    setPage(1);
  }, []);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const pagination = useMemo(() => {
    const total      = sortedStudents.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage   = Math.min(page, totalPages);
    const from       = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
    const to         = Math.min(safePage * PAGE_SIZE, total);
    return { page: safePage, totalPages, total, from, to, hasNext: safePage < totalPages, hasPrev: safePage > 1 };
  }, [sortedStudents.length, page]);

  const pageStudents = useMemo(() => {
    const { page: safePage } = pagination;
    return sortedStudents.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  }, [sortedStudents, pagination]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const selectedCount     = selectedIds.size;
  const allPageSelected   = pageStudents.length > 0 && pageStudents.every((s) => selectedIds.has(s.id));
  const somePageSelected  = pageStudents.some((s) => selectedIds.has(s.id));
  const indeterminate     = somePageSelected && !allPageSelected;

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageStudents.forEach((s) => next.delete(s.id));
      } else {
        pageStudents.forEach((s) => next.add(s.id));
      }
      return next;
    });
  }, [allPageSelected, pageStudents]);

  const handleClearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleView = useCallback((id) => navigate(`/students/${id}`), [navigate]);

  // ── Modal handlers ─────────────────────────────────────────────────────────
  const handleOpenCreate    = useCallback(() => setCreateOpen(true), []);
  const handleCloseCreate   = useCallback(() => setCreateOpen(false), []);
  const handleCreateSuccess = useCallback(() => { reload(); setCreateOpen(false); }, [reload]);

  const handleOpenEdit  = useCallback((id) => { setEditStudentId(id); setEditOpen(true); }, []);
  const handleCloseEdit = useCallback(() => { setEditOpen(false); setEditStudentId(null); }, []);
  const handleEditSuccess = useCallback(() => { reload(); setEditOpen(false); setEditStudentId(null); }, [reload]);

  // ── Confirm dialog helpers ─────────────────────────────────────────────────
  const openConfirm = useCallback((opts) => setConfirmState({ open: true, ...opts }), []);
  const closeConfirm = useCallback(() => setConfirmState((prev) => ({ ...prev, open: false })), []);

  // ── Single deactivate ──────────────────────────────────────────────────────
  const handleSingleDeactivate = useCallback((id) => {
    const student = allStudents.find((s) => s.id === id);
    const name    = student ? `${student.firstName} ${student.lastName}` : id;
    openConfirm({
      title:   'Deactivate Student',
      message: `Deactivate "${name}"? They will be removed from future attendance sheets. Their attendance history is preserved.`,
      variant: 'warning',
      confirmText: 'Deactivate',
      onConfirm: async () => {
        closeConfirm();
        setBulkLoading(true);
        const res = await deactivateStudent(id);
        setBulkLoading(false);
        if (res.success) {
          showToast(`${name} deactivated.`, 'success');
          reload();
        } else {
          showToast(res.error?.message || 'Failed to deactivate student.', 'error');
        }
      },
    });
  }, [allStudents, openConfirm, closeConfirm, reload, showToast]);

  // ── Single delete ──────────────────────────────────────────────────────────
  const handleSingleDelete = useCallback((id) => {
    const student = allStudents.find((s) => s.id === id);
    const name    = student ? `${student.firstName} ${student.lastName}` : id;
    openConfirm({
      title:   'Delete Student',
      message: `Delete "${name}"? This will permanently remove the student record. Attendance history will be preserved.`,
      variant: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        closeConfirm();
        setBulkLoading(true);
        const res = await deleteStudent(id);
        setBulkLoading(false);
        if (res.success) {
          showToast(`${name} deleted.`, 'success');
          setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
          reload();
        } else {
          showToast(res.error?.message || 'Failed to delete student.', 'error');
        }
      },
    });
  }, [allStudents, openConfirm, closeConfirm, reload, showToast]);

  // ── Bulk deactivate ────────────────────────────────────────────────────────
  const handleBulkDeactivate = useCallback(() => {
    const ids = Array.from(selectedIds);
    openConfirm({
      title:   `Deactivate ${ids.length} Students`,
      message: `Deactivate all ${ids.length} selected students? They will be excluded from future attendance sheets. History is preserved.`,
      variant: 'warning',
      confirmText: 'Deactivate All',
      onConfirm: async () => {
        closeConfirm();
        setBulkLoading(true);
        const results = await Promise.all(ids.map((id) => deactivateStudent(id)));
        const succeeded = results.filter((r) => r.success).length;
        setBulkLoading(false);
        showToast(`${succeeded} of ${ids.length} students deactivated.`, succeeded === ids.length ? 'success' : 'warning');
        handleClearSelection();
        reload();
      },
    });
  }, [selectedIds, openConfirm, closeConfirm, reload, showToast, handleClearSelection]);

  // ── Bulk delete ────────────────────────────────────────────────────────────
  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    openConfirm({
      title:   `Delete ${ids.length} Students`,
      message: `Delete all ${ids.length} selected students? This action cannot be undone. Attendance history will be preserved.`,
      variant: 'danger',
      confirmText: 'Delete All',
      onConfirm: async () => {
        closeConfirm();
        setBulkLoading(true);
        const res = await bulkDeleteStudents(ids);
        setBulkLoading(false);
        const succeeded = res.data?.succeeded?.length ?? 0;
        showToast(`${succeeded} of ${ids.length} students deleted.`, succeeded === ids.length ? 'success' : 'warning');
        handleClearSelection();
        reload();
      },
    });
  }, [selectedIds, openConfirm, closeConfirm, reload, showToast, handleClearSelection]);

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExportSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setExportLoading(true);
    const res = await exportStudentsCSV(Array.from(selectedIds));
    setExportLoading(false);
    if (res.success) {
      exportToCSV(`students-selected-${new Date().toISOString().slice(0, 10)}`, STUDENT_CSV_COLUMNS, res.data);
      showToast(`Exported ${res.data.length} students.`, 'success');
    } else {
      showToast('Export failed. Please try again.', 'error');
    }
  }, [selectedIds, showToast]);

  const handleExportAll = useCallback(async () => {
    setExportLoading(true);
    const res = await exportStudentsCSV(null);
    setExportLoading(false);
    if (res.success) {
      exportToCSV(`students-all-${new Date().toISOString().slice(0, 10)}`, STUDENT_CSV_COLUMNS, res.data);
      showToast(`Exported ${res.data.length} students.`, 'success');
    } else {
      showToast('Export failed. Please try again.', 'error');
    }
  }, [showToast]);

  // ── Transfer success ───────────────────────────────────────────────────────
  const handleTransferSuccess = useCallback(() => {
    handleClearSelection();
    reload();
  }, [handleClearSelection, reload]);

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader onAddStudent={handleOpenCreate} onExportAll={handleExportAll} exportLoading={exportLoading} />
        <ErrorState title="Failed to load students" description={error} onRetry={reload} retryLabel="Try again" />
        <StudentCreateModal isOpen={createOpen} onClose={handleCloseCreate} onSuccess={handleCreateSuccess} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <PageHeader onAddStudent={handleOpenCreate} onExportAll={handleExportAll} exportLoading={exportLoading} />

      {/* KPI Summary Cards */}
      <StudentDashboardCards
        loading={dashboardLoading}
        error={dashboardError}
        metrics={dashboardMetrics}
        onRetry={dashboardRefresh}
      />

      {/* Bulk Action Toolbar */}
      <StudentBulkActionToolbar
        selectedCount={selectedCount}
        onExport={handleExportSelected}
        onTransfer={() => setTransferOpen(true)}
        onDeactivate={handleBulkDeactivate}
        onDelete={handleBulkDelete}
        onClear={handleClearSelection}
        loading={bulkLoading}
      />

      {/* Filter Bar + Table Card */}
      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">

        {/* Filter Bar */}
        <div className="px-4 py-4 border-b border-border">
          {loading ? (
            <div className="h-9 bg-neutral-100 rounded animate-pulse" />
          ) : (
            <StudentFilterBar
              filters={filters}
              setFilter={setFilter}
              resetFilters={resetFilters}
              applyQuickFilter={applyQuickFilter}
              activeFilterCount={activeFilterCount}
              hasActiveFilters={hasActiveFilters}
              batchOptions={batchOptions}
              totalResults={pagination.total}
            />
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={8} columns={8} />
          </div>
        ) : pageStudents.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="w-10 h-10 text-textMuted" />}
            title={hasActiveFilters ? 'No students match current filters' : 'No students found'}
            description={
              hasActiveFilters
                ? 'Try adjusting or clearing your filters to see more results.'
                : 'Add your first student using the button above.'
            }
            actionLabel={hasActiveFilters ? 'Reset Filters' : 'Add Student'}
            onAction={hasActiveFilters ? resetFilters : handleOpenCreate}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm" role="table" aria-label="Student list">
                <thead className="bg-neutral-50 border-b border-border">
                  <tr>
                    {/* Select-all checkbox */}
                    <th scope="col" className="px-3 py-3 w-10">
                      <Checkbox
                        checked={allPageSelected}
                        indeterminate={indeterminate}
                        onChange={handleToggleAll}
                        disabled={bulkLoading}
                        aria-label={allPageSelected ? 'Deselect all on this page' : 'Select all on this page'}
                      />
                    </th>
                    <SortableHeader label="Student"    field="fullName"            sortConfig={sortConfig} onSort={toggleSort} />
                    <SortableHeader label="ID"         field="studentCode"          sortConfig={sortConfig} onSort={toggleSort} />
                    <th scope="col" className="px-4 py-3 text-xs font-semibold text-textMuted uppercase tracking-wider text-left hidden md:table-cell">Batch</th>
                    <SortableHeader label="Attendance" field="attendancePercentage" sortConfig={sortConfig} onSort={toggleSort} />
                    <th scope="col" className="px-4 py-3 text-xs font-semibold text-textMuted uppercase tracking-wider text-left hidden sm:table-cell">Status</th>
                    <SortableHeader label="Enrolled"   field="enrollmentDate"       sortConfig={sortConfig} onSort={toggleSort} />
                    <th scope="col" className="px-4 py-3 text-xs font-semibold text-textMuted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageStudents.map((student, i) => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      batch={BATCH_MAP[student.batchId]}
                      onView={handleView}
                      onEdit={handleOpenEdit}
                      onDeactivate={handleSingleDeactivate}
                      onDelete={handleSingleDelete}
                      index={i}
                      isSelected={selectedIds.has(student.id)}
                      onToggleSelect={handleToggleSelect}
                      bulkLoading={bulkLoading}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-4 pt-2">
              <PaginationBar pagination={pagination} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <StudentCreateModal isOpen={createOpen} onClose={handleCloseCreate} onSuccess={handleCreateSuccess} />
      <StudentEditModal   isOpen={editOpen}   onClose={handleCloseEdit}   studentId={editStudentId} onSuccess={handleEditSuccess} />

      <StudentBatchTransferModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        selectedIds={Array.from(selectedIds)}
        onSuccess={handleTransferSuccess}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.open}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        confirmText={confirmState.confirmText || 'Confirm'}
        cancelText="Cancel"
      />
    </div>
  );
};

export default StudentListPage;
