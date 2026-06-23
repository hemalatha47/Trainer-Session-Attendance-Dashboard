/**
 * BatchDetailsPage.jsx
 * Module 4.2 — Batch Details Page.
 *
 * Blueprint: Sections 4.1–4.3, 6.4, 7.1–7.3, 9.4–9.5, 11.3, 13
 *
 * Architecture:
 *   BatchDetailsPage
 *     → useBatchDetails (hook)
 *       → batchService.getBatchById()
 *       → studentService.getStudentsByBatch()
 *       → attendanceService.getBatchAttendanceSummary()
 *       → attendanceService.getAttendanceByDate()
 *       → attendanceService.getSessionDates()
 *
 * Layout:
 *   1. Page Header          — name, code, status, trainer, date range, actions
 *   2. Overview KPI Strip   — 6 stat cards
 *   3. Tab System           — Overview | Students* | Attendance* | Reports* | Analytics*
 *      └── Overview Tab:
 *            Left column:   Batch Info Panel + Attendance Summary Panel
 *            Right column:  Student Summary Panel + Recent Activity Panel
 *
 * (* = future modules — placeholder only)
 *
 * States:
 *   loading  → skeleton throughout
 *   notFound → 404-style empty state
 *   error    → ErrorState with retry
 *   success  → full layout
 */

import { useState }              from 'react';
import { useParams }             from 'react-router-dom';
import { motion }                from 'framer-motion';
import { RefreshCw, Layers }     from 'lucide-react';

import useBatchDetails           from '@hooks/useBatchDetails';
import { useAppContext }         from '@context/AppContext';
import { useToast }              from '@hooks/useToast';

import { ErrorState }            from '@components/feedback/ErrorState';
import { EmptyState }            from '@components/feedback/EmptyState';
import { Button }                from '@components/ui/Button';
import { fadeIn }                from '@constants/animations';

import BatchHeaderSection        from './components/BatchHeaderSection';
import BatchOverviewCards        from './components/BatchOverviewCards';
import BatchInfoPanel            from './components/BatchInfoPanel';
import StudentSummaryPanel       from './components/StudentSummaryPanel';
import AttendanceSummaryPanel    from './components/AttendanceSummaryPanel';
import RecentActivityPanel       from './components/RecentActivityPanel';
import BatchTabSystem            from './components/BatchTabSystem';
import { BatchEditModal }        from '../components/BatchEditModal';

// ── Overview tab content ──────────────────────────────────────────────────────

const OverviewTabContent = ({
  batch,
  students,
  attendanceSummary,
  todayAttendance,
  sessionDates,
  batchLoading,
  studentsLoading,
  attendanceLoading,
  threshold,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2 flex flex-col gap-4">
      <BatchInfoPanel
        batch={batch}
        loading={batchLoading}
      />
      <AttendanceSummaryPanel
        attendanceSummary={attendanceSummary}
        sessionDates={sessionDates}
        loading={attendanceLoading}
        threshold={threshold}
      />
    </div>
    <div className="lg:col-span-1 flex flex-col gap-4">
      <StudentSummaryPanel
        students={students}
        loading={studentsLoading}
      />
      <RecentActivityPanel
        sessionDates={sessionDates}
        todayAttendance={todayAttendance}
        loading={attendanceLoading}
      />
    </div>
  </div>
);

// ── Not found state ───────────────────────────────────────────────────────────

const BatchNotFound = ({ id }) => (
  <EmptyState
    icon={<Layers size={36} />}
    title="Batch Not Found"
    description={`No batch exists with ID "${id}". It may have been removed or the link is incorrect.`}
    actionLabel="Back to All Batches"
    onAction={() => window.history.back()}
    className="min-h-[60vh]"
  />
);

// ── Main page ─────────────────────────────────────────────────────────────────

const BatchDetailsPage = () => {
  const { id }            = useParams();
  const { attendanceThreshold } = useAppContext();
  const toast             = useToast();

  const [editOpen, setEditOpen] = useState(false);

  const {
    batch,
    students,
    attendanceSummary,
    todayAttendance,
    sessionDates,
    batchLoading,
    studentsLoading,
    attendanceLoading,
    loading,
    error,
    notFound,
    reload,
  } = useBatchDetails(id);

  const handleEditSuccess = (updatedBatch) => {
    toast.success(`"${updatedBatch.batchName}" has been updated`);
    reload();
    setEditOpen(false);
  };

  if (!batchLoading && notFound) {
    return <BatchNotFound id={id} />;
  }

  if (!loading && error) {
    return (
      <ErrorState
        title="Failed to Load Batch"
        description={error}
        action={
          <Button variant="primary" size="sm" onClick={reload} className="gap-2">
            <RefreshCw size={14} aria-hidden="true" />
            Try Again
          </Button>
        }
        className="min-h-[60vh]"
      />
    );
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6"
    >
      <BatchHeaderSection batch={batch} loading={batchLoading} onEdit={() => setEditOpen(true)} />

      <BatchOverviewCards
        batch={batch}
        students={students}
        attendanceSummary={attendanceSummary}
        todayAttendance={todayAttendance}
        batchLoading={batchLoading}
        studentsLoading={studentsLoading}
        attendanceLoading={attendanceLoading}
        threshold={attendanceThreshold}
      />

      <BatchTabSystem
        overviewContent={
          <OverviewTabContent
            batch={batch}
            students={students}
            attendanceSummary={attendanceSummary}
            todayAttendance={todayAttendance}
            sessionDates={sessionDates}
            batchLoading={batchLoading}
            studentsLoading={studentsLoading}
            attendanceLoading={attendanceLoading}
            threshold={attendanceThreshold}
          />
        }
      />

      {/* ── Edit Batch Modal ──────────────────────────────────────────────── */}
      {id && (
        <BatchEditModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          batchId={id}
          onSuccess={handleEditSuccess}
        />
      )}
    </motion.div>
  );
};

export default BatchDetailsPage;
