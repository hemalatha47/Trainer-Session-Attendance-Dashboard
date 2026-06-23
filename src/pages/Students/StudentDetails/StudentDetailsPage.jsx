/**
 * StudentDetailsPage.jsx
 * Module 5.6 update — StudentTabSystem receives studentId + batchId for Attendance tab.
 *
 * Changes from Module 5.3:
 *   - Passes student.id and student.batchId as props to StudentTabSystem
 *   - No other layout or logic changes
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useCallback }  from 'react';
import { GraduationCap }          from 'lucide-react';

import useStudentDetails         from '@hooks/useStudentDetails';
import { EmptyState }            from '@components/feedback/EmptyState';
import { ErrorState }            from '@components/feedback/ErrorState';
import StudentEditModal          from '../components/StudentEditModal';

import StudentDetailsSkeleton    from './components/StudentDetailsSkeleton';
import StudentHeaderSection      from './components/StudentHeaderSection';
import StudentKPICards           from './components/StudentKPICards';
import StudentTabSystem          from './components/StudentTabSystem';
import StudentProfilePanel       from './components/StudentProfilePanel';
import StudentBatchPanel         from './components/StudentBatchPanel';
import StudentAttendanceSummary  from './components/StudentAttendanceSummary';
import StudentRecentActivity     from './components/StudentRecentActivity';

// ── Page component ────────────────────────────────────────────────────────────

const StudentDetailsPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  // ── Edit modal state (Module 5.3) ──────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);

  const {
    student,
    batch,
    attendanceSummary,
    recentActivity,
    loading,
    error,
    refresh,
  } = useStudentDetails(id);

  // ── Edit modal handlers ────────────────────────────────────────────────────
  const handleOpenEdit    = useCallback(() => setEditOpen(true), []);
  const handleCloseEdit   = useCallback(() => setEditOpen(false), []);
  const handleEditSuccess = useCallback(() => {
    setEditOpen(false);
    refresh();
  }, [refresh]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return <StudentDetailsSkeleton />;
  }

  // ── Error / not-found state ────────────────────────────────────────────────
  if (error && !student) {
    const isNotFound = error.toLowerCase().includes('not found');

    if (isNotFound) {
      return (
        <EmptyState
          icon={<GraduationCap className="w-8 h-8" />}
          title="Student not found"
          description={`No student with ID "${id}" exists in the system.`}
          actionLabel="Back to Students"
          onAction={() => navigate('/students')}
        />
      );
    }

    return (
      <ErrorState
        title="Failed to load student"
        description={error}
        retryLabel="Try again"
        onRetry={refresh}
        actions={
          <button
            className="text-sm text-accent-600 underline mt-2"
            onClick={() => navigate('/students')}
          >
            Back to Students
          </button>
        }
      />
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Hero header */}
      <StudentHeaderSection
        student={student}
        batch={batch}
        attendanceSummary={attendanceSummary}
        onBack={() => navigate('/students')}
        onEdit={handleOpenEdit}
      />

      {/* 2. KPI summary cards */}
      <StudentKPICards
        attendanceSummary={attendanceSummary}
        loading={false}
      />

      {/* 3. Tab system — Module 5.6: studentId + batchId enable Attendance tab */}
      <StudentTabSystem
        studentId={student?.id}
        batchId={student?.batchId}
      >
        {/* Overview tab — two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <StudentProfilePanel student={student} loading={false} />
            <StudentBatchPanel
              batch={batch}
              student={student}
              loading={false}
            />
          </div>

          {/* Right column (1/3 width) */}
          <div className="flex flex-col gap-6">
            <StudentAttendanceSummary
              attendanceSummary={attendanceSummary}
              loading={false}
            />
            <StudentRecentActivity
              recentActivity={recentActivity}
              loading={false}
            />
          </div>
        </div>
      </StudentTabSystem>

      {/* Edit modal (Module 5.3) */}
      <StudentEditModal
        isOpen={editOpen}
        onClose={handleCloseEdit}
        studentId={id}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default StudentDetailsPage;
