/**
 * ReportSummaryCards.jsx
 * Module 7.3 — Report Tables & Summary Views
 *
 * Four KPI summary cards scoped to the active report filters.
 *   1. Total Sessions           — distinct session dates in scope
 *   2. Avg Attendance           — overall present % in scope
 *   3. Low Attendance Batches   — batches below threshold in scope
 *   4. At-Risk Students         — students below threshold in scope
 *
 * Reuses StatCard from @components/data/StatCard.
 * Blueprint Section 6.7, 9.4, 9.5
 */

import { useMemo } from 'react';
import { Calendar, TrendingUp, AlertTriangle, Layers } from 'lucide-react';
import { StatCard } from '@components/data/StatCard';
import { cn }      from '@utils/componentUtils';

// ── Helpers ───────────────────────────────────────────────────────────────────

const _attendanceStatus = (pct, threshold) => {
  if (pct >= 85)        return 'success';
  if (pct >= threshold) return 'info';
  if (pct >= 60)        return 'warning';
  return 'danger';
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.summaryCards        — from useReportsData().summaryCards
 * @param {number}  [props.threshold=75]
 * @param {boolean} [props.loading=false]
 * @param {string}  [props.className]
 */
const ReportSummaryCards = ({
  summaryCards,
  threshold = 75,
  loading   = false,
  className,
}) => {
  const {
    totalSessions        = 0,
    avgAttendance        = 0,
    lowAttendanceBatches = 0,
    atRiskStudents       = 0,
  } = summaryCards ?? {};

  const cards = useMemo(
    () => [
      {
        label:       'Total Sessions',
        value:       loading ? '—' : totalSessions,
        icon:        <Calendar size={20} aria-hidden="true" />,
        description: 'Distinct session dates in current scope',
        status:      'default',
      },
      {
        label:       'Avg Attendance',
        value:       loading ? '—' : `${avgAttendance}%`,
        icon:        <TrendingUp size={20} aria-hidden="true" />,
        description: 'Overall present rate across filtered records',
        status:      _attendanceStatus(avgAttendance, threshold),
      },
      {
        label:       'Low Attendance Batches',
        value:       loading ? '—' : lowAttendanceBatches,
        icon:        <Layers size={20} aria-hidden="true" />,
        description: `Batches with avg below ${threshold}%`,
        status:      lowAttendanceBatches === 0 ? 'success' : 'warning',
      },
      {
        label:       'At-Risk Students',
        value:       loading ? '—' : atRiskStudents,
        icon:        <AlertTriangle size={20} aria-hidden="true" />,
        description: `Students below ${threshold}% attendance`,
        status:      atRiskStudents === 0 ? 'success' : 'danger',
      },
    ],
    [loading, totalSessions, avgAttendance, lowAttendanceBatches, atRiskStudents, threshold]
  );

  return (
    <div
      className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}
      aria-label="Report summary metrics"
    >
      {cards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          description={card.description}
          status={card.status}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default ReportSummaryCards;
