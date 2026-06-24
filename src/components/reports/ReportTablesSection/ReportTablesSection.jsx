/**
 * ReportTablesSection.jsx
 * Module 7.3 — Report Tables & Summary Views
 *
 * Composed section that wires:
 *   - useReportsData hook
 *   - ReportSummaryCards
 *   - Dynamic table selection (Attendance / Batch / Student)
 *   - ReportTablePagination
 *   - Loading / Empty / Error states
 *
 * This is the section rendered below the filter bar on the Reports page.
 *
 * Blueprint Section 6.7
 */

import { useCallback }     from 'react';
import { motion }          from 'framer-motion';
import { fadeIn, usePrefersReducedMotion } from '@constants/animations';
import { safeMotion, cn }  from '@utils/componentUtils';
import { ErrorState }      from '@components/feedback/ErrorState';

import useReportsData          from '@hooks/useReportsData';
import ReportSummaryCards      from '@components/reports/ReportSummaryCards';
import AttendanceReportTable   from '@components/reports/AttendanceReportTable';
import BatchReportTable        from '@components/reports/BatchReportTable';
import StudentReportTable      from '@components/reports/StudentReportTable';
import ReportTablePagination   from '@components/reports/ReportTablePagination';
import { useAppContext }        from '@context/AppContext';

// ── Active table resolver ─────────────────────────────────────────────────────

const ActiveTable = ({ reportType, data, loading, error, onRetry }) => {
  if (reportType === 'batch') {
    return (
      <BatchReportTable
        data={data}
        loading={loading}
        error={error}
        onRetry={onRetry}
      />
    );
  }
  if (reportType === 'student') {
    return (
      <StudentReportTable
        data={data}
        loading={loading}
        error={error}
        onRetry={onRetry}
      />
    );
  }
  // Default: attendance
  return (
    <AttendanceReportTable
      data={data}
      loading={loading}
      error={error}
      onRetry={onRetry}
    />
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {object} props.filters  — from useReportFilters (must include reportType, dateRange, batchId, studentId)
 * @param {string} [props.className]
 */
const ReportTablesSection = ({ filters, className }) => {
  const reduced                 = usePrefersReducedMotion();
  const { attendanceThreshold } = useAppContext();

  const {
    reportData,
    summaryCards,
    loading,
    error,
    pagination,
    setPage,
    refresh,
  } = useReportsData(filters);

  const handleRetry = useCallback(() => refresh(), [refresh]);

  // Full-section error (service failure)
  if (error && !loading) {
    return (
      <ErrorState
        title="Could not load report data"
        description="There was a problem fetching the report. Please try again."
        errorDetail={error}
        onRetry={handleRetry}
        className="mt-8"
      />
    );
  }

  return (
    <motion.div
      {...safeMotion(reduced, { variants: fadeIn, initial: 'initial', animate: 'animate' })}
      className={cn('flex flex-col gap-6', className)}
    >
      {/* ── Summary Cards ───────────────────────────────────────────────────── */}
      <section aria-labelledby="report-tables-summary-heading">
        <h2 id="report-tables-summary-heading" className="sr-only">
          Report summary metrics
        </h2>
        <ReportSummaryCards
          summaryCards={summaryCards}
          threshold={attendanceThreshold}
          loading={loading}
        />
      </section>

      {/* ── Active Report Table ─────────────────────────────────────────────── */}
      <section aria-labelledby="report-table-heading">
        <h2 id="report-table-heading" className="sr-only">
          {filters?.reportType === 'batch'
            ? 'Batch report table'
            : filters?.reportType === 'student'
              ? 'Student report table'
              : 'Attendance report table'}
        </h2>

        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-card">
          <ActiveTable
            reportType={filters?.reportType}
            data={reportData}
            loading={loading}
            error={null /* surface separately via ErrorState above */}
            onRetry={handleRetry}
          />

          {/* Pagination */}
          <ReportTablePagination
            pagination={pagination}
            onPageChange={setPage}
          />
        </div>
      </section>
    </motion.div>
  );
};

export default ReportTablesSection;
