/**
 * ReportsSummaryCards.jsx
 * Four KPI summary cards for the Reports Dashboard landing page.
 * Module 7.1 — Task 5
 *
 * Cards:
 *  1. Total Sessions       — distinct session dates across all reporting batches
 *  2. Total Batches        — active + completed batches available for reporting
 *  3. Average Attendance   — overall present % across all records
 *  4. At-Risk Students     — students below the configured threshold
 *
 * Reuses StatCard from @components/data/StatCard.
 * Loading state delegates to StatCard's own loading prop (CardSkeleton).
 */

import { useMemo } from 'react';
import { Calendar, Layers, TrendingUp, AlertTriangle } from 'lucide-react';
import { StatCard } from '@components/data/StatCard';
import { cn }      from '@utils/componentUtils';

// ── Status resolver ────────────────────────────────────────────────────────────

const _attendanceStatus = (pct, threshold) => {
  if (pct >= 85)        return 'success';
  if (pct >= threshold) return 'info';
  if (pct >= 60)        return 'warning';
  return 'danger';
};

const _riskStatus = (count) => {
  if (count === 0) return 'success';
  if (count <= 3)  return 'warning';
  return 'danger';
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.summary          — from useReportsDashboard().summary
 * @param {number}  [props.threshold=75]
 * @param {boolean} [props.loading=false]
 * @param {string}  [props.className]
 */
const ReportsSummaryCards = ({ summary, threshold = 75, loading = false, className }) => {
  const {
    totalSessions     = 0,
    totalBatches      = 0,
    averageAttendance = 0,
    atRiskStudents    = 0,
  } = summary ?? {};

  const cards = useMemo(
    () => [
      {
        label:       'Total Sessions',
        value:       loading ? '—' : totalSessions,
        icon:        <Calendar size={20} aria-hidden="true" />,
        description: 'Distinct session dates across all batches',
        status:      'default',
      },
      {
        label:       'Total Batches',
        value:       loading ? '—' : totalBatches,
        icon:        <Layers size={20} aria-hidden="true" />,
        description: 'Active and completed batches available for reports',
        status:      'info',
      },
      {
        label:       'Average Attendance',
        value:       loading ? '—' : `${averageAttendance}%`,
        icon:        <TrendingUp size={20} aria-hidden="true" />,
        description: 'Overall present rate across all records',
        status:      _attendanceStatus(averageAttendance, threshold),
      },
      {
        label:       'At-Risk Students',
        value:       loading ? '—' : atRiskStudents,
        icon:        <AlertTriangle size={20} aria-hidden="true" />,
        description: `Students below ${threshold}% in active batches`,
        status:      _riskStatus(atRiskStudents),
      },
    ],
    [loading, totalSessions, totalBatches, averageAttendance, atRiskStudents, threshold]
  );

  return (
    <div
      className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}
      aria-label="Reports summary metrics"
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

export default ReportsSummaryCards;
