/**
 * AnalyticsDashboardPage — Analytics/index.jsx
 * Module 8.4 — Analytics Export & Final Polish (updated)
 *
 * Complete analytics page with:
 *  - Header
 *  - AnalyticsFiltersBar  (Module 8.2)
 *  - AnalyticsSummaryCards (Module 8.3)
 *  - AnalyticsActionsToolbar (Module 8.4 — NEW)
 *  - AttendanceTrendChart  (Module 8.3)
 *  - BatchComparisonChart  (Module 8.3)
 *  - StudentRiskSummary    (Module 8.3)
 *  - AttendanceRiskAlertsPanel (Module 6.7)
 *
 * Architecture:
 *  useAnalyticsFilters (Module 8.2) → filter state
 *  useAnalyticsInsights (Module 8.3) → chart + card data
 *  useAttendanceAnalytics (Module 6.7) → risk alerts
 *  useAnalyticsExport (Module 8.4) → CSV export + print
 *
 * Blueprint Section 6.8
 */

import { useCallback }                               from 'react';
import { BarChart2 }                                 from 'lucide-react';
import { motion }                                    from 'framer-motion';
import { fadeIn, usePrefersReducedMotion }           from '@constants/animations';
import { safeMotion }                                from '@utils/componentUtils';
import { ErrorState }                                from '@components/feedback/ErrorState';
import { EmptyState }                                from '@components/feedback/EmptyState';
import { useAppContext }                             from '@context/AppContext';

// Filters — Module 8.2
import useAnalyticsFilters                           from '@hooks/useAnalyticsFilters';
import AnalyticsFiltersBar                           from '@components/analytics/AnalyticsFiltersBar';

// Insights — Module 8.3
import useAnalyticsInsights                          from '@hooks/useAnalyticsInsights';
import AnalyticsSummaryCards                         from '@components/analytics/AnalyticsSummaryCards';
import AttendanceTrendChart                          from '@components/analytics/AttendanceTrendChart';
import BatchComparisonChart                          from '@components/analytics/BatchComparisonChart';
import StudentRiskSummary                            from '@components/analytics/StudentRiskSummary';

// Risk alerts — Module 6.7 (unchanged)
import useAttendanceAnalytics                        from '@hooks/useAttendanceAnalytics';
import AttendanceRiskAlertsPanel                     from '@components/analytics/AttendanceRiskAlertsPanel';

// Actions toolbar + export — Module 8.4
import useAnalyticsExport                            from '@hooks/useAnalyticsExport';
import AnalyticsActionsToolbar                       from '@components/analytics/AnalyticsActionsToolbar';

// ── Page ───────────────────────────────────────────────────────────────────────

const AnalyticsDashboardPage = () => {
  const reduced                  = usePrefersReducedMotion();
  const { attendanceThreshold }  = useAppContext();

  // ── Module 8.2: filter state ───────────────────────────────────────────────
  const {
    filters,
    errors,
    batches,
    students,
    batchLoading,
    studentLoading,
    serviceError:   filterServiceError,
    isFiltered,
    updateFilter,
    updateDateRange,
    resetFilters,
    validateFilters,
  } = useAnalyticsFilters();

  // ── Module 8.3: insights data (filtered) ──────────────────────────────────
  const {
    trendData,
    trendMeta,
    batchComparison,
    riskSummary,
    summaryCards,
    loading:      insightsLoading,
    error:        insightsError,
    refresh:      insightsRefresh,
    hasData,
  } = useAnalyticsInsights({
    filters: {
      batchId:  filters.batchId  ?? null,
      dateFrom: filters.dateFrom ?? null,
      dateTo:   filters.dateTo   ?? null,
    },
    threshold: attendanceThreshold,
  });

  // ── Module 6.7: risk alerts panel (unchanged) ─────────────────────────────
  const {
    alerts,
    availableBatches,
    selectedBatchId,
    setSelectedBatchId,
    loading:      alertsLoading,
    error:        alertsError,
    refresh:      alertsRefresh,
  } = useAttendanceAnalytics({ threshold: attendanceThreshold });

  // ── Module 8.4: export + print ────────────────────────────────────────────
  const {
    exportTrend,
    exportBatch,
    exportRisk,
    print,
    exportingTrend,
    exportingBatch,
    exportingRisk,
    printing,
  } = useAnalyticsExport({
    batchId:   filters.batchId  ?? null,
    dateFrom:  filters.dateFrom ?? null,
    dateTo:    filters.dateTo   ?? null,
    threshold: attendanceThreshold,
  });

  // ── Combined loading / error state ────────────────────────────────────────
  const loading = insightsLoading;
  const error   = insightsError;

  // ── Refresh all data ──────────────────────────────────────────────────────
  const refresh = useCallback(() => {
    insightsRefresh();
    alertsRefresh();
  }, [insightsRefresh, alertsRefresh]);

  // ── Apply filters ─────────────────────────────────────────────────────────
  const handleApplyFilters = useCallback(async () => {
    const valid = await validateFilters();
    if (valid) {
      insightsRefresh();
      alertsRefresh();
    }
  }, [validateFilters, insightsRefresh, alertsRefresh]);

  // ── Full-page error fallback ───────────────────────────────────────────────
  if (error && !loading && !hasData) {
    return (
      <ErrorState
        title="Analytics unavailable"
        description="Could not load attendance analytics. Please try again."
        errorDetail={error}
        onRetry={refresh}
        className="mt-16"
      />
    );
  }

  // ── Full-page empty fallback ───────────────────────────────────────────────
  if (!loading && !hasData && !isFiltered) {
    return (
      <EmptyState
        icon={<BarChart2 size={40} />}
        title="No analytics data available"
        description="Mark attendance for at least one batch to see analytics."
        className="mt-16"
      />
    );
  }

  // ── Main page layout ───────────────────────────────────────────────────────
  return (
    <motion.div
      {...safeMotion(reduced, { variants: fadeIn, initial: 'initial', animate: 'animate' })}
      className="flex flex-col gap-6"
    >
      {/* ── Header (print-visible) ─────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-xl font-semibold text-textPrimary leading-tight flex items-center gap-2"
            id="analytics-page-title"
          >
            <BarChart2 size={20} className="text-accent-500" aria-hidden="true" />
            Analytics Dashboard
          </h1>
          <p className="text-sm text-textMuted mt-0.5">
            Monitor attendance trends, batch performance, and student risk across all training batches.
          </p>
        </div>
      </header>

      {/* ── Filters (Module 8.2) ─────────────────────────────────────────── */}
      <section aria-labelledby="analytics-filters-heading" className="print:hidden">
        <h2 id="analytics-filters-heading" className="sr-only">Analytics Filters</h2>
        {filterServiceError && (
          <p
            role="alert"
            className="mb-2 text-xs text-danger-DEFAULT bg-red-50 border border-red-200 rounded-md px-3 py-2"
          >
            {filterServiceError}
          </p>
        )}
        <AnalyticsFiltersBar
          filters={filters}
          errors={errors}
          batchOptions={batches}
          studentOptions={students}
          batchLoading={batchLoading}
          studentLoading={studentLoading}
          isFiltered={isFiltered}
          onUpdateFilter={updateFilter}
          onUpdateDateRange={updateDateRange}
          onReset={resetFilters}
          onApply={handleApplyFilters}
        />
      </section>

      {/* ── Summary Cards (Module 8.3) — print-visible ───────────────────── */}
      <section aria-labelledby="analytics-summary-heading">
        <div className="mb-3">
          <h2
            id="analytics-summary-heading"
            className="text-sm font-semibold text-textPrimary"
          >
            Summary
          </h2>
          <p className="text-xs text-textMuted mt-0.5">
            Key metrics
            {isFiltered ? ' for selected filters' : ' across all batches'}.
          </p>
        </div>
        <AnalyticsSummaryCards
          summaryCards={summaryCards}
          threshold={attendanceThreshold}
          loading={loading}
        />
      </section>

      {/* ── Actions Toolbar (Module 8.4) — print-hidden ──────────────────── */}
      <AnalyticsActionsToolbar
        onExportTrend={exportTrend}
        onExportBatch={exportBatch}
        onExportRisk={exportRisk}
        onPrint={print}
        onRefresh={refresh}
        exportingTrend={exportingTrend}
        exportingBatch={exportingBatch}
        exportingRisk={exportingRisk}
        printing={printing}
        loading={loading}
        aria-label="Analytics export and actions toolbar"
      />

      {/* ── Charts (Module 8.3) — 2-col on lg — print-visible ───────────── */}
      <section aria-labelledby="analytics-charts-heading">
        <div className="mb-3">
          <h2
            id="analytics-charts-heading"
            className="text-sm font-semibold text-textPrimary"
          >
            Attendance Trends &amp; Batch Comparison
          </h2>
          <p className="text-xs text-textMuted mt-0.5">
            Trend over time and side-by-side batch performance.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AttendanceTrendChart
            data={trendData}
            meta={trendMeta}
            threshold={attendanceThreshold}
            loading={loading}
            error={insightsError ?? undefined}
            batches={availableBatches}
            selectedBatchId={selectedBatchId}
            onBatchChange={setSelectedBatchId}
          />
          <BatchComparisonChart
            data={batchComparison}
            threshold={attendanceThreshold}
            loading={loading}
            error={insightsError ?? undefined}
          />
        </div>
      </section>

      {/* ── Student Risk Summary (Module 8.3) — print-visible ────────────── */}
      <section aria-labelledby="analytics-risk-heading">
        <div className="mb-3">
          <h2
            id="analytics-risk-heading"
            className="text-sm font-semibold text-textPrimary"
          >
            Student Risk Distribution
          </h2>
          <p className="text-xs text-textMuted mt-0.5">
            Students grouped by attendance risk level. Click a category to expand the student list.
          </p>
        </div>
        <StudentRiskSummary
          riskSummary={riskSummary}
          loading={loading}
          error={insightsError ?? undefined}
        />
      </section>

      {/* ── Risk Alerts Panel (Module 6.7 — unchanged) — print-visible ───── */}
      <section aria-labelledby="analytics-alerts-heading">
        <div className="mb-3">
          <h2
            id="analytics-alerts-heading"
            className="text-sm font-semibold text-textPrimary"
          >
            Risk Alerts
          </h2>
          <p className="text-xs text-textMuted mt-0.5">
            Students with critically low or high-risk attendance.
          </p>
        </div>
        <AttendanceRiskAlertsPanel
          alerts={alerts}
          loading={alertsLoading}
          error={alertsError ?? undefined}
        />
      </section>
    </motion.div>
  );
};

export default AnalyticsDashboardPage;
