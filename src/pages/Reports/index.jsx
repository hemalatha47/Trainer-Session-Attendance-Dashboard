/**
<<<<<<< HEAD
 * ReportsDashboardPage — Module 7.1
 * Reports Dashboard landing page.
 *
 * Layout:
 *   Page Header  (title + subtitle + refresh)
 *   Summary Cards (4 KPI metrics)
 *   Report Type Selector (3 cards — Attendance / Batch / Student)
 *   Overview Panels (3 lightweight panels)
 *
 * All business logic lives in useReportsDashboard + reportsDashboardService.
 * This page is pure composition — no inline calculations.
 *
 * Blueprint Section 6.7 — Reports page shell.
 * Module scope: shell only. Filters, detail tables, and export belong to 7.2+.
 */

import { useState, useCallback }   from 'react';
import { motion }                  from 'framer-motion';
import { FileText, RefreshCw }     from 'lucide-react';
import { fadeIn, usePrefersReducedMotion } from '@constants/animations';
import { cn, safeMotion }          from '@utils/componentUtils';
import { Button }                  from '@components/ui/Button';
import { ErrorState }              from '@components/feedback/ErrorState';
import { EmptyState }              from '@components/feedback/EmptyState';
import { useAppContext }           from '@context/AppContext';

import useReportsDashboard         from '@hooks/useReportsDashboard';
import ReportsSummaryCards         from './components/ReportsSummaryCards';
import ReportTypeSelector          from './components/ReportTypeSelector';
import ReportsOverviewPanels       from './components/ReportsOverviewPanels';

// ── Page ──────────────────────────────────────────────────────────────────────

const ReportsDashboardPage = () => {
  const reduced                 = usePrefersReducedMotion();
  const { attendanceThreshold } = useAppContext();

  const {
    summary,
    reportTypes,
    overviewPanels,
    loading,
    error,
    refresh,
    hasData,
  } = useReportsDashboard();

  // Local UI state: which report type card is selected
  const [selectedType, setSelectedType] = useState('attendance');

  const handleSelectType = useCallback((id) => {
    setSelectedType(id);
  }, []);

  // ── Full-page error fallback ───────────────────────────────────────────────
  if (error && !loading) {
    return (
      <ErrorState
        title="Reports unavailable"
        description="Could not load the reports dashboard. Please try again."
        errorDetail={error}
        onRetry={refresh}
        className="mt-16"
      />
    );
  }

  // ── Empty state (no batches / sessions at all) ─────────────────────────────
  if (!loading && !hasData) {
    return (
      <EmptyState
        icon={<FileText size={40} />}
        title="No reporting data available"
        description="Mark attendance for at least one batch to generate reports."
        className="mt-16"
      />
    );
  }

  // ── Main page ──────────────────────────────────────────────────────────────
  return (
    <motion.div
      {...safeMotion(reduced, { variants: fadeIn, initial: 'initial', animate: 'animate' })}
      className="flex flex-col gap-6"
    >
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-xl font-semibold text-textPrimary leading-tight flex items-center gap-2"
            id="reports-page-title"
          >
            <FileText size={20} className="text-accent-500" aria-hidden="true" />
            Reports Dashboard
          </h1>
          <p className="text-sm text-textMuted mt-0.5">
            View attendance, batch, and student reports.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh reports dashboard"
          iconLeft={
            <RefreshCw
              size={14}
              className={cn(loading && 'animate-spin')}
              aria-hidden="true"
            />
          }
        >
          Refresh
        </Button>
      </header>

      {/* ── KPI Summary Cards ──────────────────────────────────────────────── */}
      <section aria-labelledby="reports-summary-heading">
        <h2 id="reports-summary-heading" className="sr-only">
          Summary metrics
        </h2>
        <ReportsSummaryCards
          summary={summary}
          threshold={attendanceThreshold}
          loading={loading}
        />
      </section>

      {/* ── Report Type Selector ───────────────────────────────────────────── */}
      <section aria-labelledby="report-type-heading">
        <div className="mb-3">
          <h2
            id="report-type-heading"
            className="text-sm font-semibold text-textPrimary"
          >
            Select Report Type
          </h2>
          <p className="text-xs text-textMuted mt-0.5">
            Choose the type of report you want to view.
          </p>
        </div>
        <ReportTypeSelector
          reportTypes={reportTypes}
          selectedType={selectedType}
          onSelectType={handleSelectType}
          loading={loading}
        />
      </section>

      {/* ── Overview Panels ────────────────────────────────────────────────── */}
      <section aria-labelledby="reports-overview-heading">
        <div className="mb-3">
          <h2
            id="reports-overview-heading"
            className="text-sm font-semibold text-textPrimary"
          >
            Overview
          </h2>
          <p className="text-xs text-textMuted mt-0.5">
            Summary across all batches and students.
          </p>
        </div>
        <ReportsOverviewPanels
          overviewPanels={overviewPanels}
          loading={loading}
        />
      </section>
    </motion.div>
  );
};

export default ReportsDashboardPage;
=======
 * ReportsPage — Module 2.3 compile-safety stub.
 * Full batch-wise report table and CSV export arrives in Phase 7.
 */

const ReportsPage = () => (
  <div>
    <h2 className="text-lg font-semibold text-primary mb-2">Reports</h2>
    <p className="text-sm text-textMuted">
      Batch + date range selector and color-coded report table will appear here.
    </p>
  </div>
);

export default ReportsPage;
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
