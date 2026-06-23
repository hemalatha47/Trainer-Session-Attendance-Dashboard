/**
 * ReportsOverviewPanels.jsx
 * Three lightweight overview panels for the Reports Dashboard.
 * Module 7.1 — Task 7
 *
 * Panels:
 *  1. Attendance Overview  — average %, absent ratio, recent session date
 *  2. Batch Overview       — active / low-performing / completed batches
 *  3. Student Overview     — total / at-risk / excellent students
 *
 * These are informational summaries only — no deep report tables.
 * Loading state uses Skeleton components.
 */

import { TrendingUp, Layers, Users, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@components/feedback/Skeleton';
import { cn }       from '@utils/componentUtils';

// ── Panel Card wrapper ────────────────────────────────────────────────────────

const PanelCard = ({ title, icon, children, className }) => (
  <div
    className={cn(
      'bg-surface rounded-xl border border-border p-5 flex flex-col gap-4',
      className
    )}
  >
    <div className="flex items-center gap-2">
      <div className="text-accent-500" aria-hidden="true">{icon}</div>
      <h3 className="text-sm font-semibold text-textPrimary">{title}</h3>
    </div>
    {children}
  </div>
);

// ── Metric row inside a panel ─────────────────────────────────────────────────

const MetricRow = ({ label, value, valueClass }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-xs text-textMuted">{label}</span>
    <span className={cn('text-sm font-semibold', valueClass ?? 'text-textPrimary')}>{value}</span>
  </div>
);

// ── Attendance overview panel ─────────────────────────────────────────────────

const AttendancePanel = ({ data, loading }) => {
  if (loading) {
    return (
      <PanelCard title="Attendance Overview" icon={<TrendingUp size={18} />}>
        <Skeleton height="h-4" className="w-3/4" />
        <Skeleton height="h-4" className="w-1/2" />
        <Skeleton height="h-4" className="w-2/3" />
      </PanelCard>
    );
  }

  const {
    averageAttendance = 0,
    absentRatio       = 0,
    recentSessionDate = null,
  } = data ?? {};

  const attendanceColor =
    averageAttendance >= 85 ? 'text-success-DEFAULT'
    : averageAttendance >= 75 ? 'text-accent-600'
    : averageAttendance >= 60 ? 'text-warning-text'
    : 'text-danger-DEFAULT';

  return (
    <PanelCard title="Attendance Overview" icon={<TrendingUp size={18} />}>
      {/* Progress bar */}
      <div aria-label={`Average attendance ${averageAttendance}%`}>
        <div className="flex justify-between mb-1">
          <span className="text-xs text-textMuted">Present rate</span>
          <span className={cn('text-xs font-bold', attendanceColor)}>{averageAttendance}%</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              averageAttendance >= 75 ? 'bg-success-DEFAULT' : 'bg-danger-DEFAULT'
            )}
            style={{ width: `${Math.min(averageAttendance, 100)}%` }}
            role="progressbar"
            aria-valuenow={averageAttendance}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <MetricRow
          label="Absent ratio"
          value={`${absentRatio}%`}
          valueClass={absentRatio > 25 ? 'text-danger-DEFAULT' : 'text-textPrimary'}
        />
        <MetricRow
          label="Latest session"
          value={recentSessionDate ?? 'No data'}
          valueClass="text-textMuted font-normal"
        />
      </div>
    </PanelCard>
  );
};

// ── Batch overview panel ──────────────────────────────────────────────────────

const BatchPanel = ({ data, loading }) => {
  if (loading) {
    return (
      <PanelCard title="Batch Overview" icon={<Layers size={18} />}>
        <Skeleton height="h-4" className="w-3/4" />
        <Skeleton height="h-4" className="w-1/2" />
        <Skeleton height="h-4" className="w-2/3" />
      </PanelCard>
    );
  }

  const {
    activeBatches        = 0,
    completedBatches     = 0,
    lowPerformingBatches = 0,
  } = data ?? {};

  return (
    <PanelCard title="Batch Overview" icon={<Layers size={18} />}>
      <div className="flex flex-col gap-2">
        <MetricRow
          label="Active batches"
          value={activeBatches}
          valueClass="text-accent-600"
        />
        <MetricRow
          label="Completed batches"
          value={completedBatches}
          valueClass="text-textPrimary"
        />
        <MetricRow
          label="Low performing"
          value={lowPerformingBatches}
          valueClass={lowPerformingBatches > 0 ? 'text-danger-DEFAULT' : 'text-success-DEFAULT'}
        />
      </div>

      {lowPerformingBatches > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-warning-text bg-warning-bg rounded-lg px-3 py-2">
          <AlertTriangle size={13} aria-hidden="true" />
          <span>{lowPerformingBatches} batch{lowPerformingBatches > 1 ? 'es' : ''} below threshold</span>
        </div>
      )}
    </PanelCard>
  );
};

// ── Student overview panel ────────────────────────────────────────────────────

const StudentPanel = ({ data, loading }) => {
  if (loading) {
    return (
      <PanelCard title="Student Overview" icon={<Users size={18} />}>
        <Skeleton height="h-4" className="w-3/4" />
        <Skeleton height="h-4" className="w-1/2" />
        <Skeleton height="h-4" className="w-2/3" />
      </PanelCard>
    );
  }

  const {
    totalStudents     = 0,
    atRiskStudents    = 0,
    excellentStudents = 0,
  } = data ?? {};

  return (
    <PanelCard title="Student Overview" icon={<Users size={18} />}>
      <div className="flex flex-col gap-2">
        <MetricRow
          label="Total students"
          value={totalStudents}
          valueClass="text-textPrimary"
        />
        <MetricRow
          label="Excellent (≥ 90%)"
          value={excellentStudents}
          valueClass="text-success-DEFAULT"
        />
        <MetricRow
          label="At risk (below threshold)"
          value={atRiskStudents}
          valueClass={atRiskStudents > 0 ? 'text-danger-DEFAULT' : 'text-success-DEFAULT'}
        />
      </div>

      {atRiskStudents === 0 && totalStudents > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-success-DEFAULT bg-success-bg rounded-lg px-3 py-2">
          <CheckCircle2 size={13} aria-hidden="true" />
          <span>All students above threshold</span>
        </div>
      )}
    </PanelCard>
  );
};

// ── Composed export ───────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.overviewPanels    — from useReportsDashboard().overviewPanels
 * @param {boolean} [props.loading=false]
 * @param {string}  [props.className]
 */
const ReportsOverviewPanels = ({ overviewPanels, loading = false, className }) => {
  const {
    attendancePanel = {},
    batchPanel      = {},
    studentPanel    = {},
  } = overviewPanels ?? {};

  return (
    <div
      className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}
      aria-label="Reports overview panels"
    >
      <AttendancePanel data={attendancePanel} loading={loading} />
      <BatchPanel      data={batchPanel}      loading={loading} />
      <StudentPanel    data={studentPanel}    loading={loading} />
    </div>
  );
};

export default ReportsOverviewPanels;
