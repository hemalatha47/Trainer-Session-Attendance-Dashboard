/**
 * DashboardPage — Dashboard/index.jsx
 * Module 8.1 — Dashboard Home Page (audit & fix).
 *
 * Previously a stub rendering only a heading — now a full implementation.
 *
 * Page structure:
 *   Header (title + date + refresh)
 *   ↓
 *   Today KPI cards (4): Today's Rate, Marked Today, Present, Absent
 *   ↓
 *   Two-column row: Today Batch Status Panel | Recent Activity Feed
 *   ↓
 *   Quick Actions bar
 *
 * Data sources:
 *   - useAttendanceDashboard  → today metrics + recent sessions
 *   - useAnalyticsDashboard   → overall analytics summary (at-risk count)
 *
 * Architecture: pure composition — no inline business logic.
 */

import { useNavigate }                    from 'react-router-dom';
import { RefreshCw, LayoutDashboard, CalendarCheck, UserCheck, UserX, Clock, AlertTriangle, ClipboardList, Users, BarChart2, PlusCircle } from 'lucide-react';
import { motion }                          from 'framer-motion';
import { fadeIn, usePrefersReducedMotion } from '@constants/animations';
import { cn, safeMotion }                  from '@utils/componentUtils';
import { Button }                          from '@components/ui/Button';
import { StatCard }                        from '@components/data/StatCard';
import { CardSkeleton }                    from '@components/feedback/Skeleton';
import { ErrorState }                      from '@components/feedback/ErrorState';
import { EmptyState }                      from '@components/feedback/EmptyState';
import { StatusBadge }                     from '@components/data/StatusBadge';
import { useAppContext }                    from '@context/AppContext';
import { ROUTES, buildRoute }              from '@constants/routes';
import { formatDate }                      from '@utils/dateUtils';

import useAttendanceDashboard              from '@hooks/useAttendanceDashboard';
import useAnalyticsDashboard               from '@hooks/useAnalyticsDashboard';

// ── Today date banner ─────────────────────────────────────────────────────────

const TodayBanner = ({ date }) => (
  <div className="flex items-center gap-1.5 text-xs text-textMuted">
    <CalendarCheck size={13} aria-hidden="true" />
    <span>{formatDate(date) || new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
  </div>
);

// ── Batch status row ──────────────────────────────────────────────────────────

const BatchStatusRow = ({ batch }) => {
  const navigate = useNavigate();
  const statusColor = {
    completed:   'success',
    in_progress: 'warning',
    pending:     'default',
  };
  return (
    <li
      className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0 cursor-pointer hover:bg-background rounded transition-colors px-1"
      onClick={() => navigate(buildRoute(ROUTES.BATCH_DETAIL, { id: batch.batchId }))}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(buildRoute(ROUTES.BATCH_DETAIL, { id: batch.batchId }))}
      aria-label={`View batch ${batch.batchName}`}
    >
      <div className="min-w-0">
        <p className="text-xs font-medium text-textPrimary truncate">{batch.batchName}</p>
        <p className="text-xs text-textMuted">{batch.markedCount}/{batch.expectedCount} marked</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {batch.statusLabel === 'completed' && (
          <span className="text-xs text-textMuted tabular-nums">{batch.rate}%</span>
        )}
        <StatusBadge
          status={statusColor[batch.statusLabel] ?? 'default'}
          label={batch.statusLabel === 'in_progress' ? 'In Progress' : batch.statusLabel === 'completed' ? 'Done' : 'Pending'}
          size="sm"
        />
      </div>
    </li>
  );
};

// ── Recent session row ────────────────────────────────────────────────────────

const RecentSessionRow = ({ session }) => (
  <li className="flex items-start gap-3 py-2 border-b border-border last:border-0">
    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
      <ClipboardList size={12} aria-hidden="true" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-textPrimary truncate">{session.batchName}</p>
      <p className="text-xs text-textMuted">{formatDate(session.date)} · {session.presentCount}P / {session.absentCount}A</p>
    </div>
    <span className="shrink-0 text-xs font-semibold text-textPrimary tabular-nums">
      {session.attendanceRate}%
    </span>
  </li>
);

// ── Quick action button ───────────────────────────────────────────────────────

const QuickAction = ({ icon, label, onClick, variant = 'secondary' }) => (
  <Button
    variant={variant}
    size="sm"
    onClick={onClick}
    icon={icon}
    className="flex-1 min-w-[120px]"
  >
    {label}
  </Button>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const navigate = useNavigate();
  const reduced  = usePrefersReducedMotion();
  const { attendanceThreshold } = useAppContext();

  const {
    metrics,
    recentSessions,
    loading:  attLoading,
    error:    attError,
    refresh:  attRefresh,
  } = useAttendanceDashboard();

  const {
    summary,
    loading:  anaLoading,
    refresh:  anaRefresh,
  } = useAnalyticsDashboard({ threshold: attendanceThreshold });

  const loading = attLoading || anaLoading;
  const refresh = () => { attRefresh(); anaRefresh(); };

  if (attError && !loading) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        description="Could not load dashboard metrics. Please try again."
        errorDetail={attError}
        onRetry={refresh}
        className="mt-16"
      />
    );
  }

  const {
    todayRate         = 0,
    presentToday      = 0,
    absentToday       = 0,
    totalMarkedToday  = 0,
    pendingCount      = 0,
    activeBatchCount  = 0,
    todayBatchStatuses = [],
  } = metrics;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <motion.div
      {...safeMotion(reduced, { variants: fadeIn, initial: 'initial', animate: 'animate' })}
      className="flex flex-col gap-6"
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-textPrimary leading-tight flex items-center gap-2">
            <LayoutDashboard size={20} className="text-accent-500" aria-hidden="true" />
            Dashboard
          </h1>
          <TodayBanner date={today} />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh dashboard"
          icon={<RefreshCw size={14} className={cn(loading && 'animate-spin')} />}
        >
          Refresh
        </Button>
      </header>

      {/* ── Today KPI Cards ─────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        role="region"
        aria-label="Today's key metrics"
      >
        <StatCard
          label="Today's Attendance"
          value={loading ? '—' : `${todayRate}%`}
          icon={<CalendarCheck size={18} />}
          description="Present rate for today"
          status={todayRate >= 85 ? 'success' : todayRate >= attendanceThreshold ? 'info' : todayRate > 0 ? 'warning' : 'default'}
          loading={loading}
        />
        <StatCard
          label="Marked Today"
          value={loading ? '—' : totalMarkedToday}
          icon={<ClipboardList size={18} />}
          description={`${activeBatchCount} active batch${activeBatchCount !== 1 ? 'es' : ''}`}
          status="default"
          loading={loading}
        />
        <StatCard
          label="Present Today"
          value={loading ? '—' : presentToday}
          icon={<UserCheck size={18} />}
          description="Students marked present"
          status={presentToday > 0 ? 'success' : 'default'}
          loading={loading}
        />
        <StatCard
          label="Absent Today"
          value={loading ? '—' : absentToday}
          icon={<UserX size={18} />}
          description="Students marked absent"
          status={absentToday > 5 ? 'warning' : 'default'}
          loading={loading}
        />
      </div>

      {/* ── Analytics summary strip ─────────────────────────────────────── */}
      {!anaLoading && summary.totalStudents > 0 && (
        <div className="flex flex-wrap gap-3 items-center px-4 py-3 rounded-md bg-accent-50 border border-accent-100">
          <span className="text-xs text-accent-700 font-medium flex items-center gap-1.5">
            <BarChart2 size={13} aria-hidden="true" />
            Overall: <strong>{summary.avgAttendance}%</strong> avg attendance
          </span>
          <span className="h-3 w-px bg-accent-200 hidden sm:block" />
          <span className="text-xs text-accent-700">
            <strong>{summary.activeBatches}</strong> active batch{summary.activeBatches !== 1 ? 'es' : ''}
          </span>
          <span className="h-3 w-px bg-accent-200 hidden sm:block" />
          {summary.atRiskStudents > 0 && (
            <span className="text-xs text-warning-text flex items-center gap-1">
              <AlertTriangle size={12} aria-hidden="true" />
              <strong>{summary.atRiskStudents}</strong> at-risk student{summary.atRiskStudents !== 1 ? 's' : ''}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.ANALYTICS)}
            className="ml-auto"
            aria-label="Open analytics dashboard"
          >
            View Analytics →
          </Button>
        </div>
      )}

      {/* ── Main two-column section ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today Batch Status */}
        <section
          className="rounded-md border border-border bg-white p-5 shadow-card flex flex-col gap-3"
          aria-labelledby="today-batch-heading"
        >
          <div className="flex items-center justify-between gap-2">
            <h2
              id="today-batch-heading"
              className="text-sm font-semibold text-textPrimary flex items-center gap-1.5"
            >
              <Clock size={15} className="text-accent-500" aria-hidden="true" />
              Today's Batch Status
            </h2>
            {pendingCount > 0 && (
              <span className="text-xs text-warning-text font-medium">
                {pendingCount} pending
              </span>
            )}
          </div>

          {loading ? (
            <CardSkeleton />
          ) : todayBatchStatuses.length === 0 ? (
            <EmptyState
              icon={<Clock size={24} />}
              title="No active batches today"
              description="Active batches will appear here once created."
              className="py-4"
            />
          ) : (
            <ul aria-label="Batch attendance status for today" className="divide-y-0">
              {todayBatchStatuses.map((batch) => (
                <BatchStatusRow key={batch.batchId} batch={batch} />
              ))}
            </ul>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(ROUTES.MARK_ATTENDANCE)}
            icon={<ClipboardList size={14} />}
            className="self-start mt-auto"
            aria-label="Go to mark attendance"
          >
            Mark Attendance
          </Button>
        </section>

        {/* Recent Activity Feed */}
        <section
          className="rounded-md border border-border bg-white p-5 shadow-card flex flex-col gap-3"
          aria-labelledby="recent-activity-heading"
        >
          <h2
            id="recent-activity-heading"
            className="text-sm font-semibold text-textPrimary flex items-center gap-1.5"
          >
            <Clock size={15} className="text-accent-500" aria-hidden="true" />
            Recent Sessions
          </h2>

          {loading ? (
            <CardSkeleton />
          ) : recentSessions.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={24} />}
              title="No recent sessions"
              description="Attendance sessions will appear here after marking."
              className="py-4"
            />
          ) : (
            <ul aria-label="Recent attendance sessions">
              {recentSessions.map((session) => (
                <RecentSessionRow key={session.key} session={session} />
              ))}
            </ul>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.ATTENDANCE_HISTORY)}
            className="self-start mt-auto"
            aria-label="View attendance history"
          >
            View History →
          </Button>
        </section>
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────────── */}
      <section
        className="rounded-md border border-border bg-white p-5 shadow-card"
        aria-labelledby="quick-actions-heading"
      >
        <h2
          id="quick-actions-heading"
          className="text-sm font-semibold text-textPrimary mb-3"
        >
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-2">
          <QuickAction
            icon={<ClipboardList size={14} />}
            label="Mark Attendance"
            onClick={() => navigate(ROUTES.MARK_ATTENDANCE)}
            variant="primary"
          />
          <QuickAction
            icon={<PlusCircle size={14} />}
            label="Add Student"
            onClick={() => navigate(ROUTES.STUDENTS)}
          />
          <QuickAction
            icon={<BarChart2 size={14} />}
            label="View Reports"
            onClick={() => navigate(ROUTES.REPORTS)}
          />
          <QuickAction
            icon={<Users size={14} />}
            label="View Batches"
            onClick={() => navigate(ROUTES.BATCHES)}
          />
        </div>
      </section>
    </motion.div>
  );
};

export default DashboardPage;
