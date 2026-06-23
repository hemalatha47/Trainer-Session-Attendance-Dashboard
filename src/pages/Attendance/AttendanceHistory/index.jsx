/**
 * AttendanceHistoryPage
 * View, filter, and inspect historical attendance sessions.
 * Module: 6.6
 *
 * Page structure:
 *   Header (title + refresh)
 *   ↓
 *   Summary KPI cards (4 metrics)
 *   ↓
 *   Filter bar
 *   ↓
 *   Two-column layout:
 *     Left  (2/3) — Paginated history table
 *     Right (1/3) — Session timeline
 *   ↓
 *   Session detail panel (right-side drawer, opens on row click)
 *
 * State: useAttendanceHistory hook.
 * No direct service or mock data imports.
 */

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, History, Download }      from 'lucide-react';
import { motion }                            from 'framer-motion';
import { fadeIn, usePrefersReducedMotion }   from '@constants/animations';
import { safeMotion }                        from '@utils/componentUtils';
import { Button }                            from '@components/ui/Button';
import { ErrorState }                        from '@components/feedback/ErrorState';

import useAttendanceHistory    from '@hooks/useAttendanceHistory';
import useAttendanceExport     from '@hooks/useAttendanceExport';
import useAttendanceDelete     from '@hooks/useAttendanceDelete';
import useAttendanceCorrection from '@hooks/useAttendanceCorrection';
import { getBatches }          from '@services/batchService';
import { mockStudents }        from '@data/mockStudents';

import HistorySummaryCards          from './components/HistorySummaryCards';
import AttendanceHistoryList        from './components/AttendanceHistoryList';
import AttendanceTimelinePanel      from './components/AttendanceTimelinePanel';
import SessionDetailPanel           from './components/SessionDetailPanel';
import AttendanceDeleteDialog       from './components/AttendanceDeleteDialog';
import AttendanceCorrectionPanel    from './components/AttendanceCorrectionPanel';
import HistoryFilterBar             from '@components/attendance/HistoryFilterBar';

// ── Page ──────────────────────────────────────────────────────────────────────

const AttendanceHistoryPage = () => {
  const reduced = usePrefersReducedMotion();

  const {
    history,
    timeline,
    summary,
    filters,
    pagination,
    loading,
    summaryLoading,
    error,
    setFilters,
    setPage,
    refresh,
    openSession,
    closeSession,
    selectedSession,
    sessionLoading,
  } = useAttendanceHistory();

  // Load batch list for filter dropdown
  const [batches, setBatches] = useState([]);
  useEffect(() => {
    getBatches().then((res) => {
      if (res.success) setBatches(res.data ?? []);
    });
  }, []);

  // ── Module 6.8: Export hook ───────────────────────────────────────────────
  const { exporting, exportSession, exportHistory } = useAttendanceExport();

  // ── Module 6.8: Delete hook ───────────────────────────────────────────────
  const {
    deleting,
    confirmState,
    requestDeleteSession,
    confirmDelete,
    cancelDelete,
  } = useAttendanceDelete({ onSessionDeleted: () => refresh() });

  // ── Module 6.8: Correction hook ───────────────────────────────────────────
  const {
    correcting,
    correctionMode,
    sessionBeingCorrected,
    correctionRows,
    loadingSession: correctionLoading,
    enterCorrectionMode,
    exitCorrectionMode,
    updateCorrectionRow,
    saveCorrection,
  } = useAttendanceCorrection({ onCorrectionSaved: () => refresh() });

  // ── Session action handlers ───────────────────────────────────────────────
  const handleExportSession = useCallback((session) => {
    exportSession(session.batchId, session.date);
  }, [exportSession]);

  const handleDeleteSession = useCallback((session) => {
    requestDeleteSession(session.batchId, session.date);
  }, [requestDeleteSession]);

  const handleCorrectSession = useCallback((session) => {
    enterCorrectionMode(session);
  }, [enterCorrectionMode]);

  const handleExportAll = useCallback(() => {
    exportHistory(history, 'attendance-history');
  }, [exportHistory, history]);

  const pageMotion = safeMotion(reduced, {
    variants: fadeIn,
    initial:  'initial',
    animate:  'animate',
  });

  const handleResetFilters = () =>
    setFilters({ batchId: '', from: '', to: '', statusColor: '', search: '' });

  // Build session label for delete dialog
  const deleteSession = confirmState?.batchId
    ? history.find((h) => h.batchId === confirmState.batchId && h.date === confirmState.date)
    : null;
  const deleteSessionLabel = deleteSession
    ? `${deleteSession.batchName} · ${deleteSession.displayDate ?? deleteSession.date}`
    : '';

  // Full error state
  if (!loading && error) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-xl font-semibold text-textPrimary">Attendance History</h1>
        </header>
        <ErrorState
          title="Failed to load attendance history"
          description={error}
          retryLabel="Retry"
          onRetry={refresh}
        />
      </div>
    );
  }

  return (
    <motion.div
      {...pageMotion}
      className="flex flex-col gap-6"
    >
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg bg-accent-100 flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <History size={18} className="text-accent-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-textPrimary leading-tight">
              Attendance History
            </h1>
            <p className="text-sm text-textMuted mt-0.5">
              Browse and inspect past attendance sessions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAll}
            disabled={exporting || loading || history.length === 0}
            aria-label="Export all sessions as CSV"
          >
            <Download size={14} className="mr-1" />
            {exporting ? 'Exporting…' : 'Export All'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            aria-label="Refresh history"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin mr-1' : 'mr-1'} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── KPI cards ───────────────────────────────────────────────────── */}
      <HistorySummaryCards summary={summary} loading={summaryLoading} />

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <HistoryFilterBar
        filters={filters}
        batches={batches}
        onChange={setFilters}
        onReset={handleResetFilters}
        loading={loading}
      />

      {/* ── Main content: table + timeline ──────────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Left — history table */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-border rounded-lg p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-textPrimary">
                Session Records
              </h2>
              {pagination.totalSessions > 0 && (
                <span className="text-xs text-textMuted">
                  {pagination.totalSessions} sessions found
                </span>
              )}
            </div>

            <AttendanceHistoryList
              history={history}
              pagination={pagination}
              loading={loading}
              error={error}
              onRetry={refresh}
              onPageChange={setPage}
              onViewSession={openSession}
              onExportSession={handleExportSession}
              onDeleteSession={handleDeleteSession}
              onCorrectSession={handleCorrectSession}
            />
          </div>
        </div>

        {/* Right — timeline panel */}
        <div className="w-full xl:w-80 shrink-0">
          <AttendanceTimelinePanel timeline={timeline} loading={loading} />
        </div>
      </div>

      {/* ── Correction panel ─────────────────────────────────────────────── */}
      {correctionMode && (
        <AttendanceCorrectionPanel
          sessionBeingCorrected={sessionBeingCorrected}
          correctionRows={correctionRows}
          correcting={correcting}
          loadingSession={correctionLoading}
          students={mockStudents}
          onUpdateRow={updateCorrectionRow}
          onSave={saveCorrection}
          onCancel={exitCorrectionMode}
        />
      )}

      {/* ── Session detail drawer ────────────────────────────────────────── */}
      <SessionDetailPanel
        session={selectedSession}
        loading={sessionLoading}
        onClose={closeSession}
      />

      {/* ── Delete confirm dialog ─────────────────────────────────────────── */}
      <AttendanceDeleteDialog
        confirmState={confirmState}
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        sessionLabel={deleteSessionLabel}
      />
    </motion.div>
  );
};

export default AttendanceHistoryPage;
