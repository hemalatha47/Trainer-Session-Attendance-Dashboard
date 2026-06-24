/**
 * AnalyticsSummaryCards.jsx
 * Module 8.3 — Analytics Charts & Summary Views
 *
 * Four summary metric cards:
 *  1. Average Attendance    — overall % (colored by risk)
 *  2. Best Performing Batch — top batch name + rate
 *  3. Worst Performing Batch — lowest batch name + rate (attention required)
 *  4. At-Risk Students       — count below threshold
 *
 * Reuses StatCard from the shared data component library.
 * Extends with batch-name subtitle slot not available on base StatCard
 * (renders inside a wrapper so StatCard API is unchanged).
 *
 * Blueprint Section 6.8
 */

import { useMemo }         from 'react';
import {
  TrendingUp,
  Award,
  ArrowDownCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn }              from '@utils/componentUtils';
import { CardSkeleton }    from '@components/feedback/Skeleton';
import { StatCard }        from '@components/data/StatCard';
import { ANALYTICS_RISK }  from '@services/attendanceAnalyticsService';
import { COLORS }          from '@constants/colors';

// ── Helpers ───────────────────────────────────────────────────────────────────

const _riskToStatus = (risk) => {
  const map = {
    [ANALYTICS_RISK.LOW]:      'success',
    [ANALYTICS_RISK.MEDIUM]:   'info',
    [ANALYTICS_RISK.HIGH]:     'warning',
    [ANALYTICS_RISK.CRITICAL]: 'danger',
  };
  return map[risk] ?? 'default';
};

const _atRiskStatus = (count) => {
  if (count === 0) return 'success';
  if (count <= 3)  return 'warning';
  return 'danger';
};

// ── Batch subtitle card wrapper ───────────────────────────────────────────────
// StatCard doesn't expose a subtitle slot, so we compose it here.

const BatchCard = ({ label, icon, batchName, rate, status, loading, className }) => {
  if (loading) return <CardSkeleton className={className} />;
  if (!batchName) {
    return (
      <StatCard
        label={label}
        value="—"
        icon={icon}
        description="No batch data available"
        status="default"
        loading={false}
        className={className}
      />
    );
  }
  return (
    <StatCard
      label={label}
      value={`${rate}%`}
      icon={icon}
      description={batchName}
      status={status}
      loading={false}
      className={className}
    />
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.summaryCards         — from useAnalyticsInsights().summaryCards
 * @param {number}  [props.threshold=75]
 * @param {boolean} [props.loading=false]
 * @param {string}  [props.className]
 */
const AnalyticsSummaryCards = ({
  summaryCards,
  threshold = 75,
  loading = false,
  className,
}) => {
  const {
    avgAttendance  = null,
    bestBatch      = null,
    worstBatch     = null,
    atRiskStudents = null,
  } = summaryCards ?? {};

  // Card configs derived from summaryCards
  const avgStatus = useMemo(
    () => _riskToStatus(avgAttendance?.risk ?? ANALYTICS_RISK.MEDIUM),
    [avgAttendance]
  );

  const atRiskCount = atRiskStudents?.count ?? 0;
  const criticalCount = atRiskStudents?.critical ?? 0;

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
      role="region"
      aria-label="Analytics summary metrics"
    >
      {/* Card 1 — Average Attendance */}
      <StatCard
        label="Average Attendance"
        value={loading ? '—' : (avgAttendance ? `${avgAttendance.value}%` : '—')}
        icon={<TrendingUp size={18} aria-hidden="true" />}
        description={
          avgAttendance
            ? avgAttendance.description
            : 'Across all batches'
        }
        status={loading ? 'default' : avgStatus}
        loading={loading}
      />

      {/* Card 2 — Best Performing Batch */}
      <BatchCard
        label="Best Performing Batch"
        icon={<Award size={18} aria-hidden="true" />}
        batchName={bestBatch?.name ?? null}
        rate={bestBatch?.rate ?? 0}
        status={_riskToStatus(bestBatch?.risk ?? ANALYTICS_RISK.LOW)}
        loading={loading}
      />

      {/* Card 3 — Worst Performing Batch */}
      <BatchCard
        label="Lowest Performing Batch"
        icon={<ArrowDownCircle size={18} aria-hidden="true" />}
        batchName={worstBatch?.name ?? null}
        rate={worstBatch?.rate ?? 0}
        status={_riskToStatus(worstBatch?.risk ?? ANALYTICS_RISK.HIGH)}
        loading={loading}
      />

      {/* Card 4 — At-Risk Students */}
      <StatCard
        label="At-Risk Students"
        value={loading ? '—' : atRiskCount}
        icon={<AlertTriangle size={18} aria-hidden="true" />}
        description={
          criticalCount > 0
            ? `${criticalCount} critical · below ${threshold}%`
            : `Students below ${threshold}% attendance`
        }
        status={loading ? 'default' : _atRiskStatus(atRiskCount)}
        loading={loading}
      />
    </div>
  );
};

AnalyticsSummaryCards.displayName = 'AnalyticsSummaryCards';

export default AnalyticsSummaryCards;
