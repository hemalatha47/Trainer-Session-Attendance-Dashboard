/**
 * AnalyticsPage
 * Module 6.7 — Attendance Analytics & Alerts.
 *
 * Page structure:
 *   Header (title + refresh button)
 *   ↓
 *   KPI Cards (4 metrics)
 *   ↓
 *   Risk Alerts Panel
 *   ↓
 *   Trend Chart | Batch Comparison Chart (two-column on lg+)
 *
 * All heavy computation is in useAttendanceAnalytics + service layer.
 * This page is pure composition — no inline business logic.
 */

import { RefreshCw, BarChart2 }  from 'lucide-react';
import { motion }                from 'framer-motion';
import { fadeIn, usePrefersReducedMotion } from '@constants/animations';
import { cn, safeMotion }        from '@utils/componentUtils';
import { Button }                from '@components/ui/Button';
import { ErrorState }            from '@components/feedback/ErrorState';
import { useAppContext }         from '@context/AppContext';

import useAttendanceAnalytics    from '@hooks/useAttendanceAnalytics';
import AttendanceKPICards        from '@components/analytics/AttendanceKPICards';
import AttendanceTrendChart      from '@components/analytics/AttendanceTrendChart';
import BatchComparisonChart      from '@components/analytics/BatchComparisonChart';
import AttendanceRiskAlertsPanel from '@components/analytics/AttendanceRiskAlertsPanel';

// ── Page ──────────────────────────────────────────────────────────────────────

const AnalyticsPage = () => {
  const reduced = usePrefersReducedMotion();
  const { attendanceThreshold } = useAppContext();

  const {
    kpis,
    trendData,
    batchComparison,
    alerts,
    loading,
    error,
    refresh,
    availableBatches,
    selectedBatchId,
    setSelectedBatchId,
  } = useAttendanceAnalytics({ threshold: attendanceThreshold });

  // Full-page error fallback
  if (error && !loading && !kpis.totalStudents) {
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

  return (
    <motion.div
      {...safeMotion(reduced, { variants: fadeIn, initial: 'initial', animate: 'animate' })}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-textPrimary leading-tight flex items-center gap-2">
            <BarChart2 size={20} className="text-accent-500" aria-hidden="true" />
            Analytics
          </h1>
          <p className="text-sm text-textMuted mt-0.5">
            Attendance trends, batch comparisons, and student risk alerts.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh analytics"
          icon={<RefreshCw size={14} className={cn(loading && 'animate-spin')} />}
        >
          Refresh
        </Button>
      </header>

      {/* KPI Cards */}
      <AttendanceKPICards
        kpis={kpis}
        threshold={attendanceThreshold}
        loading={loading}
      />

      {/* Risk Alerts */}
      <AttendanceRiskAlertsPanel
        alerts={alerts}
        loading={loading}
        error={error ?? undefined}
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AttendanceTrendChart
          data={trendData}
          threshold={attendanceThreshold}
          loading={loading}
          error={error ?? undefined}
          batches={availableBatches}
          selectedBatchId={selectedBatchId}
          onBatchChange={setSelectedBatchId}
        />
        <BatchComparisonChart
          data={batchComparison}
          threshold={attendanceThreshold}
          loading={loading}
          error={error ?? undefined}
        />
      </div>
    </motion.div>
  );
};

export default AnalyticsPage;
