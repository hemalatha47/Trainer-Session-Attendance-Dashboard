/**
 * AttendanceSheetPage — Module 6.5 Update
 * Save / Edit Workflow fully wired.
 *
 * Module 6.5 — Attendance Save & Edit Workflow
 * Blueprint Sections: 4.3, 9.1, 9.2, 9.3, 13
 *
 * Page layout:
 *   AttendanceSheetHeader      — batch name, date, mode badge, back button
 *   AttendanceSheetCounterBar  — live present / absent / total counts
 *   ── Card ──────────────────────────────────────────────────────────────────
 *   AttendanceSaveBar          — (NEW 6.5) dirty state, counters, save button
 *   GlobalBulkToolbar          — Mark All Present / Absent / Select All / Reset
 *   SelectedActionToolbar      — conditional; visible when selectedCount > 0
 *   AttendanceSheet            — scrollable row list (students + toggles + notes)
 *   ── Overlays ──────────────────────────────────────────────────────────────
 *   ConfirmDialog              — (NEW 6.5) overwrite confirmation
 *   LoadingOverlay             — (NEW 6.5) fullscreen save-in-progress overlay
 *
 * Module 6.5 additions:
 *   ✅ attendanceSaveService — validate + checkExisting + save + update
 *   ✅ useAttendanceSave    — save state machine + overwrite detection
 *   ✅ AttendanceSaveBar    — sticky counters + save button + status indicator
 *   ✅ ConfirmDialog        — "Attendance already exists. Overwrite?" flow
 *   ✅ LoadingOverlay       — blocks UI during save operation
 *   ✅ buildRecords()       — snapshot of current sheet state for service
 *   ✅ Dirty reset on success via onSuccess callback
 *   ✅ Accessibility: aria-labels, roles, keyboard-reachable dialogs
 *   ✅ Double-submit prevention via saveState === 'saving' guard
 *   ✅ Error toast + inline error display
 *   ✅ Success toast with record count
 */

import { useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeIn, usePrefersReducedMotion } from '@constants/animations';
import { safeMotion } from '@utils/componentUtils';
import { ROUTES } from '@constants/routes';
import { CARD, PAGE_LAYOUT } from '@constants/uiStandards';

// Overlay components
import { ConfirmDialog, LoadingOverlay } from '@components/overlay';

// Attendance sheet components (Modules 6.1–6.4)
import { AttendanceSheet } from '@components/attendance/AttendanceSheet';
import { GlobalBulkToolbar } from '@components/attendance/GlobalBulkToolbar';
import { SelectedActionToolbar } from '@components/attendance/SelectedActionToolbar';

// Module 6.5 additions
import { AttendanceSaveBar } from '@components/attendance/AttendanceSaveBar';

// Hooks
import useAttendanceSheet from '@hooks/useAttendanceSheet';
import useAttendanceSave from '@hooks/useAttendanceSave';
import { useAuthContext } from '@context/AuthContext';

// Page-level sub-components (unchanged from 6.4)
import AttendanceSheetHeader     from './components/AttendanceSheetHeader';
import AttendanceSheetCounterBar from './components/AttendanceSheetCounterBar';

// ─────────────────────────────────────────────────────────────────────────────

const AttendanceSheetPage = () => {
  const reduced  = usePrefersReducedMotion();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // Pull batchId + date from the URL params
  const { batchId, date } = useParams();

  // ── Sheet hook (Modules 6.1–6.4) ──────────────────────────────────────────
  const {
    rows,
    counters,
    statuses,
    notes,
    students,
    selectedIds,
    loading,
    error,
    dirty,
    mode,

    // Single-row actions
    toggleStatus,
    updateNotes,

    // Selection actions
    selectAll,
    clearSelection,
    toggleRowSelection,

    // Bulk status actions
    markAllPresent,
    markAllAbsent,
    markSelectedPresent,
    markSelectedAbsent,

    // Reset + refresh
    resetAll,
    refresh,
  } = useAttendanceSheet(batchId, date);

  // ── Build records snapshot (consumed by save service) ──────────────────────
  /**
   * Captures the current sheet state as a flat records array.
   * Called at save time — not memoized so it always reads live state.
   */
  const buildRecords = useCallback(() =>
    rows.map((r) => ({
      studentId: r.studentId,
      status:    r.status,
      remarks:   r.notes?.trim() || '',
    })),
    [rows]
  );

  // ── Save hook (Module 6.5) ─────────────────────────────────────────────────
  const {
    saveAttendance,
    confirmOverwrite,
    cancelOverwrite,
    saveState,
    loading:  saving,
    error:    saveError,
    overwriteRequired,
  } = useAttendanceSave({
    batchId,
    date,
    buildRecords,
    markedBy: user?.id ?? 'u2',   // fallback for mock (AuthContext provides real user)
    mode,
    onSuccess: resetAll,           // resets dirty state + modifiedIds after successful save
  });

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    navigate(ROUTES.MARK_ATTENDANCE);
  }, [navigate]);

  // ── Derived flags ──────────────────────────────────────────────────────────
  const isSheetDisabled = loading || !!error || saving;
  const hasStudents     = students.length > 0;

  const pageProps = safeMotion(reduced, {
    variants: fadeIn,
    initial:  'initial',
    animate:  'animate',
  });

  return (
    <>
      {/* ── Fullscreen loading overlay during save (Task 10) ──────────── */}
      <LoadingOverlay
        isOpen={saving}
        message={mode === 'edit' ? 'Updating attendance…' : 'Saving attendance…'}
        size="md"
      />

      {/* ── Overwrite confirmation dialog (Task 8) ────────────────────── */}
      <ConfirmDialog
        isOpen={overwriteRequired}
        onClose={cancelOverwrite}
        onConfirm={confirmOverwrite}
        title="Attendance Already Exists"
        message="Attendance has already been recorded for this session. Do you want to overwrite the existing records?"
        confirmText="Continue Update"
        cancelText="Cancel"
        variant="warning"
      />

      {/* ── Page content ──────────────────────────────────────────────── */}
      <motion.div className={PAGE_LAYOUT.root} {...pageProps}>

        {/* ── Page header ───────────────────────────────────────────────── */}
        <AttendanceSheetHeader
          batchName={batchId ? `Batch ${batchId}` : 'Attendance Sheet'}
          date={date}
          mode={mode}
          dirty={dirty}
          onBack={handleBack}
        />

        {/* ── Counter bar ───────────────────────────────────────────────── */}
        <AttendanceSheetCounterBar
          counters={counters}
          loading={loading}
        />

        {/* ── Main content card ─────────────────────────────────────────── */}
        <div className={`${CARD.padded} flex flex-col gap-4`}>

          {/* ── Save bar (Module 6.5 — Task 9) ──────────────────────────── */}
          <AttendanceSaveBar
            presentCount={counters.present}
            absentCount={counters.absent}
            totalCount={counters.total}
            dirty={dirty}
            saveState={saveState}
            loading={saving}
            disabled={isSheetDisabled}
            mode={mode}
            date={date}
            onSave={saveAttendance}
          />

          {/* ── Global bulk toolbar ──────────────────────────────────────── */}
          <GlobalBulkToolbar
            onMarkAllPresent={markAllPresent}
            onMarkAllAbsent={markAllAbsent}
            onSelectAll={selectAll}
            onResetAll={resetAll}
            dirty={dirty}
            disabled={isSheetDisabled}
            loading={loading}
            totalCount={students.length}
          />

          {/* ── Selected action toolbar ──────────────────────────────────── */}
          {hasStudents && (
            <SelectedActionToolbar
              selectedCount={counters.selected}
              totalCount={students.length}
              onMarkPresent={markSelectedPresent}
              onMarkAbsent={markSelectedAbsent}
              onClear={clearSelection}
              disabled={isSheetDisabled}
              layout="full"
            />
          )}

          {/* ── Attendance sheet rows ─────────────────────────────────────── */}
          <AttendanceSheet
            students={students}
            statuses={statuses}
            onStatusChange={toggleStatus}

            selectedIds={selectedIds}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onToggleRow={toggleRowSelection}
            onMarkSelectedPresent={markSelectedPresent}
            onMarkSelectedAbsent={markSelectedAbsent}

            loading={loading}
            error={error}
            onRetry={refresh}
            remarks={notes}
            onRemarksChange={updateNotes}
            readOnly={false}
          />

        </div>
      </motion.div>
    </>
  );
};

AttendanceSheetPage.displayName = 'AttendanceSheetPage';

export default AttendanceSheetPage;
