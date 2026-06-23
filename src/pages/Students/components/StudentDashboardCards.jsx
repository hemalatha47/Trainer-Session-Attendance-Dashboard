/**
 * StudentDashboardCards.jsx
 * Student Dashboard KPI Cards section (Module 5.5, Tasks 5–13).
 *
 * Placement in StudentListPage:
 *   Page Header → [Dashboard Cards] → Filters → Student Table
 *
 * Cards:
 *   1. Total Students      — StatCard   (default)
 *   2. Active Students     — StatCard   (success)
 *   3. Average Attendance  — KPIWidget  (auto status, CircularProgress)
 *   4. Low Attendance      — KPIWidget  (warning/danger)
 *   5. Absent Today        — StatCard   (warning/success)
 *   6. High Performers     — StatCard   (success)
 *
 * Layout:
 *   Mobile:  1 column
 *   Tablet:  2 columns
 *   Laptop:  3 columns
 *   Desktop: 6 columns
 *
 * Architecture Decision (Task 14):
 *   Cards reflect the GLOBAL dataset — not the active filter selection.
 *   Rationale: KPI rows represent total scope; filters narrow the table only.
 *
 * Props:
 *   loading  {boolean}         — show skeleton cards
 *   error    {string|null}     — show error state
 *   metrics  {object}          — KPI data from useStudentDashboard
 *   onRetry  {function}        — retry callback for error state
 */

import {
  Users, UserCheck, TrendingUp, AlertTriangle,
  UserX, Award, RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { StatCard }         from '@components/data/StatCard';
import { KPIWidget }        from '@components/data/KPIWidget';
import { CircularProgress } from '@components/data/CircularProgress';
import { CardSkeleton }     from '@components/feedback/Skeleton';
import { cn }               from '@utils/componentUtils';
import { fadeIn }           from '@constants/animations';

// ── Constants ─────────────────────────────────────────────────────────────────

const HIGH_PERFORMER_THRESHOLD = 90;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Derives StatCard status from attendance percentage and threshold. */
const attendanceStatus = (pct, threshold) => {
  if (pct >= threshold) return 'success';
  if (pct >= 50)        return 'warning';
  return 'danger';
};

// ── Skeleton grid (Task 15) ───────────────────────────────────────────────────

/**
 * Skeleton loading state: 6 shimmer cards in the same grid.
 * Uses professional CardSkeleton from the feedback library.
 */
const DashboardSkeletons = () => (
  <div
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
    aria-label="Loading student metrics"
    aria-busy="true"
  >
    {Array.from({ length: 6 }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// ── Error state (Task 17) ─────────────────────────────────────────────────────

/**
 * Inline error state shown when metric computation fails.
 * Provides a retry action without replacing the full page.
 */
const DashboardError = ({ error, onRetry }) => (
  <div
    role="alert"
    aria-live="assertive"
    className={cn(
      'flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-md',
      'border border-danger-border bg-danger-bg px-4 py-3 text-sm'
    )}
  >
    <AlertTriangle
      className="w-4 h-4 text-danger-DEFAULT shrink-0 mt-0.5 sm:mt-0"
      aria-hidden="true"
    />
    <span className="text-danger-DEFAULT flex-1">
      {error ?? 'Failed to load student metrics.'}
    </span>
    {onRetry && (
      <button
        onClick={onRetry}
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-medium',
          'text-danger-DEFAULT hover:text-danger-hover underline underline-offset-2',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-DEFAULT rounded'
        )}
        aria-label="Retry loading student metrics"
      >
        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
        Retry
      </button>
    )}
  </div>
);

// ── Empty state (Task 16) ─────────────────────────────────────────────────────

/**
 * Shown when there are no students in the system at all.
 */
const DashboardEmpty = () => (
  <div
    className={cn(
      'flex items-center gap-3 rounded-md border border-border bg-neutral-50',
      'px-4 py-3 text-sm text-textMuted'
    )}
    role="status"
    aria-live="polite"
  >
    <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
    <span>No student data available. Add students to see KPI metrics.</span>
  </div>
);

// ── Average Attendance Card (Task 8) — KPIWidget + CircularProgress ───────────

const AvgAttendanceCard = ({ avgAttendance, threshold, loading }) => {
  if (loading) return <CardSkeleton />;

  const status = attendanceStatus(avgAttendance, threshold);

  return (
    <KPIWidget
      title="Avg Attendance"
      value={`${avgAttendance}%`}
      icon={
        <CircularProgress
          value={avgAttendance}
          size={40}
          strokeWidth={4}
          color="auto"
          threshold={threshold}
          showValue={false}
          label={`Average attendance: ${avgAttendance}%`}
        />
      }
      status={status}
      comparisonValue={`Threshold: ${threshold}%`}
      aria-label={`Average attendance: ${avgAttendance}%`}
    />
  );
};

// ── Low Attendance Card (Task 9) ──────────────────────────────────────────────

const LowAttendanceCard = ({ count, threshold, loading }) => {
  if (loading) return <CardSkeleton />;

  const status = count > 0 ? 'danger' : 'success';

  return (
    <KPIWidget
      title="Low Attendance"
      value={count}
      icon={<AlertTriangle className="w-5 h-5" aria-hidden="true" />}
      status={status}
      comparisonValue={`Below ${threshold}%`}
      aria-label={`${count} students with low attendance below ${threshold}%`}
    />
  );
};

// ── Main component ────────────────────────────────────────────────────────────

/**
 * StudentDashboardCards
 *
 * @param {object}   props
 * @param {boolean}  props.loading
 * @param {string|null} props.error
 * @param {object}   props.metrics        — from useStudentDashboard
 * @param {function} [props.onRetry]      — retry callback
 * @param {string}   [props.className]
 */
const StudentDashboardCards = ({ loading, error, metrics, onRetry, className }) => {
  // ── Loading state (Task 15) ──────────────────────────────────────────────
  if (loading) {
    return (
      <section aria-label="Student KPI metrics" className={className}>
        <DashboardSkeletons />
      </section>
    );
  }

  // ── Error state (Task 17) ────────────────────────────────────────────────
  if (error) {
    return (
      <section aria-label="Student KPI metrics" className={className}>
        <DashboardError error={error} onRetry={onRetry} />
      </section>
    );
  }

  // ── Empty state (Task 16) ────────────────────────────────────────────────
  if (!metrics || metrics.totalStudents === 0) {
    return (
      <section aria-label="Student KPI metrics" className={className}>
        <DashboardEmpty />
      </section>
    );
  }

  const {
    totalStudents,
    activeStudents,
    avgAttendance,
    lowAttendanceCount,
    absentToday,
    highPerformers,
    threshold,
  } = metrics;

  // ── Trend placeholders (Task 12) ─────────────────────────────────────────
  // Historical comparison data is not yet available in V1 mock data.
  // Trend values are null — TrendIndicator renders '—' in neutral style.
  // Future: compute from batch-date-ordered records to derive period-on-period delta.
  const TREND_PLACEHOLDER = null;

  return (
    <section
      aria-label="Student KPI metrics"
      className={className}
    >
      {/* ── Responsive grid: 1 → 2 → 3 → 6 columns (Task 5) ────────────── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
        initial="initial"
        animate="animate"
        variants={{
          initial: {},
          animate: { transition: { staggerChildren: 0.06 } },
        }}
        aria-label="Student performance metrics grid"
      >
        {/* ── Card 1: Total Students (Task 6) ─────────────────────────── */}
        <motion.div
          variants={fadeIn}
          className="xl:col-span-1"
        >
          <StatCard
            label="Total Students"
            value={totalStudents}
            icon={<Users className="w-5 h-5" aria-hidden="true" />}
            status="default"
            trend={TREND_PLACEHOLDER}
            trendLabel="vs last batch"
            description={`${activeStudents} active, ${metrics.inactiveStudents} inactive`}
            aria-label={`Total students: ${totalStudents}`}
          />
        </motion.div>

        {/* ── Card 2: Active Students (Task 7) ────────────────────────── */}
        <motion.div
          variants={fadeIn}
          className="xl:col-span-1"
        >
          <StatCard
            label="Active Students"
            value={activeStudents}
            icon={<UserCheck className="w-5 h-5" aria-hidden="true" />}
            status="success"
            trend={TREND_PLACEHOLDER}
            trendLabel="vs last batch"
            description={
              totalStudents > 0
                ? `${Math.round((activeStudents / totalStudents) * 100)}% of total`
                : undefined
            }
            aria-label={`Active students: ${activeStudents}`}
          />
        </motion.div>

        {/* ── Card 3: Average Attendance (Task 8) ─────────────────────── */}
        <motion.div
          variants={fadeIn}
          className="xl:col-span-1"
        >
          <AvgAttendanceCard
            avgAttendance={avgAttendance}
            threshold={threshold}
            loading={false}
          />
        </motion.div>

        {/* ── Card 4: Low Attendance (Task 9) ─────────────────────────── */}
        <motion.div
          variants={fadeIn}
          className="xl:col-span-1"
        >
          <LowAttendanceCard
            count={lowAttendanceCount}
            threshold={threshold}
            loading={false}
          />
        </motion.div>

        {/* ── Card 5: Absent Today (Task 10) ──────────────────────────── */}
        <motion.div
          variants={fadeIn}
          className="xl:col-span-1"
        >
          <StatCard
            label="Absent Today"
            value={absentToday}
            icon={<UserX className="w-5 h-5" aria-hidden="true" />}
            status={absentToday > 0 ? 'warning' : 'success'}
            trend={TREND_PLACEHOLDER}
            trendLabel="vs yesterday"
            description={absentToday === 0 ? 'Full attendance today' : 'Students absent today'}
            aria-label={`Students absent today: ${absentToday}`}
          />
        </motion.div>

        {/* ── Card 6: High Performers (Task 11) ───────────────────────── */}
        <motion.div
          variants={fadeIn}
          className="xl:col-span-1"
        >
          <StatCard
            label="High Performers"
            value={highPerformers}
            icon={<Award className="w-5 h-5" aria-hidden="true" />}
            status="success"
            trend={TREND_PLACEHOLDER}
            trendLabel="vs last batch"
            description={`Attendance ≥ ${HIGH_PERFORMER_THRESHOLD}%`}
            aria-label={`High performers: ${highPerformers} students with attendance at or above ${HIGH_PERFORMER_THRESHOLD}%`}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

StudentDashboardCards.displayName = 'StudentDashboardCards';

export default StudentDashboardCards;
export { StudentDashboardCards };
