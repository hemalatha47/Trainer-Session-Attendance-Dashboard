/**
 * ReportsDashboardPage — Module 7.1 + 7.2 + 7.3 + 7.4
 * Reports Dashboard landing page with full report tables, export, and print.
 *
 * Layout:
 *   Page Header         (title + subtitle + refresh)
 *   Summary Cards       (4 KPI metrics — dashboard-level)
 *   Report Type Selector (3 cards — Attendance / Batch / Student)
 *   Filter Bar          (date range, batch, student, report type, reset)
 *   Actions Toolbar     (Export CSV, Print, Refresh)  ← Module 7.4
 *   Report Tables Section (summary cards + active report table + pagination)
 *   Overview Panels     (3 lightweight panels)
 *
 * Blueprint Section 6.7
 */

import { useCallback }             from 'react';
import { motion }                  from 'framer-motion';
import { FileText, RefreshCw }     from 'lucide-react';
import { fadeIn, usePrefersReducedMotion } from '@constants/animations';
import { cn, safeMotion }          from '@utils/componentUtils';
import { Button }                  from '@components/ui/Button';
import { ErrorState }              from '@components/feedback/ErrorState';
import { EmptyState }              from '@components/feedback/EmptyState';
import { useAppContext }           from '@context/AppContext';

import useReportsDashboard         from '@hooks/useReportsDashboard';
import useReportFilters            from '@hooks/useReportFilters';
import useReportsExport            from '@hooks/useReportsExport';

import ReportsSummaryCards         from './components/ReportsSummaryCards';
import ReportTypeSelector          from './components/ReportTypeSelector';
import ReportsOverviewPanels       from './components/ReportsOverviewPanels';
import ReportFiltersBar            from '@components/reports/ReportFiltersBar';
import ReportTablesSection         from '@components/reports/ReportTablesSection';
import ReportActionsToolbar        from '@components/reports/ReportActionsToolbar';

// ── Page ──────────────────────────────────────────────────────────────────────

const ReportsDashboardPage = () => {
  const reduced                 = usePrefersReducedMotion();
  const { attendanceThreshold } = useAppContext();

  // ── Dashboard data ────────────────────────────────────────────────────────
  const {
    summary,
    reportTypes,
    overviewPanels,
    loading,
    error,
    refresh,
    hasData,
  } = useReportsDashboard();

  // ── Filter state (Module 7.2) ─────────────────────────────────────────────
  const {
    filters,
    errors:        filterErrors,
    batchOptions,
    studentOptions,
    batchLoading,
    studentLoading,
    serviceError,
    updateFilter,
    updateDateRange,
    resetFilters,
  } = useReportFilters();

  // ── Export / print (Module 7.4) ───────────────────────────────────────────
  const { exporting, printing, exportCSV, printReport } = useReportsExport(
    filters,
    attendanceThreshold
  );

  // ── Sync ReportTypeSelector card with filters.reportType ─────────────────
  const handleSelectType = useCallback(
    (id) => updateFilter('reportType', id),
    [updateFilter]
  );

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
      id="print-report-area"
    >
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4 flex-wrap print:hidden">
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

      {/* ── KPI Summary Cards (dashboard-level) ───────────────────────────── */}
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
      <section aria-labelledby="report-type-heading" className="print:hidden">
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
          selectedType={filters.reportType}
          onSelectType={handleSelectType}
          loading={loading}
        />
      </section>

      {/* ── Filter Bar (Module 7.2) ─────────────────────────────────────────── */}
      <section aria-labelledby="reports-filters-heading" className="print:hidden">
        <div className="mb-3">
          <h2
            id="reports-filters-heading"
            className="text-sm font-semibold text-textPrimary"
          >
            Filter Reports
          </h2>
          <p className="text-xs text-textMuted mt-0.5">
            Narrow results by date range, batch, or student.
          </p>
        </div>

        {serviceError && (
          <p
            role="alert"
            className="mb-2 text-xs text-danger-DEFAULT bg-red-50 border border-red-200 rounded-md px-3 py-2"
          >
            {serviceError}
          </p>
        )}

        <ReportFiltersBar
          filters={filters}
          errors={filterErrors}
          batchOptions={batchOptions}
          studentOptions={studentOptions}
          batchLoading={batchLoading}
          studentLoading={studentLoading}
          onUpdateFilter={updateFilter}
          onUpdateDateRange={updateDateRange}
          onReset={resetFilters}
        />
      </section>

      {/* ── Actions Toolbar (Module 7.4) ───────────────────────────────────── */}
      <section aria-label="Report actions" className="print:hidden">
        <ReportActionsToolbar
          onExportCSV={exportCSV}
          onPrint={printReport}
          onRefresh={refresh}
          exporting={exporting}
          printing={printing}
          loading={loading}
          reportType={filters.reportType}
        />
      </section>

      {/* ── Report Tables Section (Module 7.3) ─────────────────────────────── */}
      <section aria-labelledby="report-tables-heading">
        <div className="mb-3 print:hidden">
          <h2
            id="report-tables-heading"
            className="text-sm font-semibold text-textPrimary"
          >
            Report Data
          </h2>
          <p className="text-xs text-textMuted mt-0.5">
            Detailed records for the selected report type and filters.
          </p>
        </div>
        <ReportTablesSection filters={filters} />
      </section>

      {/* ── Overview Panels ────────────────────────────────────────────────── */}
      <section aria-labelledby="reports-overview-heading" className="print:hidden">
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
