/**
<<<<<<< HEAD
 * AttendanceDashboardPage
 * Attendance management landing page — control center for training managers.
 * Module: 6.1
 *
 * Page structure:
 *   Header (title + date + refresh)
 *   ↓
 *   KPI Cards (4 metrics)
 *   ↓
 *   Quick Actions (4 action cards)
 *   ↓
 *   Two-column panel row:
 *     Left  — Recent Sessions (last 5 submissions)
 *     Right — Today's Status (per-batch completion)
 *
 * State management: useAttendanceDashboard hook.
 * No direct service or mock data imports.
 */

import { RefreshCw }     from 'lucide-react';
import { motion }        from 'framer-motion';
import { fadeIn, usePrefersReducedMotion } from '@constants/animations';
import { safeMotion }    from '@utils/componentUtils';
import { Button }        from '@components/ui/Button';
import { ErrorState }    from '@components/feedback/ErrorState';

import useAttendanceDashboard        from '@hooks/useAttendanceDashboard';
import AttendanceKPISection          from './components/AttendanceKPISection';
import AttendanceQuickActions        from './components/AttendanceQuickActions';
import RecentAttendanceSessions      from './components/RecentAttendanceSessions';
import AttendanceTodayStatusPanel    from './components/AttendanceTodayStatusPanel';

// ── Page ──────────────────────────────────────────────────────────────────────

const AttendanceDashboardPage = () => {
  const reduced = usePrefersReducedMotion();

  const {
    metrics,
    recentSessions,
    loading,
    error,
    refresh,
  } = useAttendanceDashboard();

  const today       = new Date();
  const todayLabel  = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });

  const pageProps = safeMotion(reduced, {
    variants: fadeIn,
    initial:  'initial',
    animate:  'animate',
  });

  // ── Full error state ───────────────────────────────────────────────────────
  if (!loading && error) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-xl font-semibold text-textPrimary leading-tight">
            Attendance
          </h1>
        </header>
        <ErrorState
          title="Failed to load attendance data"
          description={error}
          retryLabel="Retry"
          onRetry={refresh}
        />
      </div>
    );
  }

  return (
    <motion.div className="flex flex-col gap-6" {...pageProps}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-textPrimary leading-tight">
            Attendance
          </h1>
          <p className="text-sm text-textMuted mt-0.5">{todayLabel}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh attendance data"
          iconLeft={
            <RefreshCw
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
          }
        >
          Refresh
        </Button>
      </header>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <AttendanceKPISection
        metrics={metrics}
        loading={loading}
      />

      {/* ── Quick Actions ────────────────────────────────────────────────── */}
      <AttendanceQuickActions />

      {/* ── Two-column panel row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentAttendanceSessions
          recentSessions={recentSessions}
          loading={loading}
        />
        <AttendanceTodayStatusPanel
          todayBatchStatuses={metrics.todayBatchStatuses}
          loading={loading}
        />
      </div>

    </motion.div>
  );
};

export default AttendanceDashboardPage;
=======
 * MarkAttendancePage — Module 2.3 compile-safety stub.
 * Full attendance marking workflow arrives in Phase 6.
 */

const MarkAttendancePage = () => (
  <div>
    <h2 className="text-lg font-semibold text-primary mb-2">Mark Attendance</h2>
    <p className="text-sm text-textMuted">
      Batch selector, date picker, and student toggle grid will appear here.
    </p>
  </div>
);

export default MarkAttendancePage;
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
