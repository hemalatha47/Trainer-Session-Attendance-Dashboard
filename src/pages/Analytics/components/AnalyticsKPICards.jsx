/**
 * AnalyticsKPICards.jsx
 * Module 8.1 — Analytics Dashboard Page.
 *
 * Four KPI cards for the analytics landing page:
 *  1. Average Attendance (overall % across all batches)
 *  2. Active Batches (currently running)
 *  3. At-Risk Students (below threshold)
 *  4. Total Sessions (distinct session dates summed)
 *
 * Reuses StatCard from the data component library.
 * Loading state handled via StatCard's loading prop (renders CardSkeleton).
 */

import { useMemo } from 'react';
import {
  TrendingUp,
  Layers,
  AlertTriangle,
  CalendarCheck,
} from 'lucide-react';
import { StatCard } from '@components/data/StatCard';
import { cn } from '@utils/componentUtils';

// ── Status resolver ───────────────────────────────────────────────────────────

const _attendanceStatus = (pct, threshold) => {
  if (pct >= 85)        return 'success';
  if (pct >= threshold) return 'info';
  if (pct >= 60)        return 'warning';
  return 'danger';
};

const _riskStatus = (count) => {
  if (count === 0)  return 'success';
  if (count <= 3)   return 'warning';
  return 'danger';
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.summary           — from useAnalyticsDashboard().summary
 * @param {number}  [props.threshold=75]
 * @param {boolean} [props.loading=false]
 * @param {string}  [props.className]
 */
const AnalyticsKPICards = ({
  summary,
  threshold = 75,
  loading = false,
  className,
}) => {
  const {
    avgAttendance    = 0,
    activeBatches    = 0,
    atRiskStudents   = 0,
    totalSessions    = 0,
  } = summary ?? {};

  const cards = useMemo(
    () => [
      {
        label:       'Average Attendance',
        value:       loading ? '—' : `${avgAttendance}%`,
        icon:        <TrendingUp size={18} aria-hidden="true" />,
        description: 'Present rate across all tracked batches',
        status:      _attendanceStatus(avgAttendance, threshold),
      },
      {
        label:       'Active Batches',
        value:       loading ? '—' : activeBatches,
        icon:        <Layers size={18} aria-hidden="true" />,
        description: 'Currently running training batches',
        status:      activeBatches > 0 ? 'info' : 'default',
      },
      {
        label:       'At-Risk Students',
        value:       loading ? '—' : atRiskStudents,
        icon:        <AlertTriangle size={18} aria-hidden="true" />,
        description: `Students below ${threshold}% attendance`,
        status:      _riskStatus(atRiskStudents),
      },
      {
        label:       'Total Sessions',
        value:       loading ? '—' : totalSessions,
        icon:        <CalendarCheck size={18} aria-hidden="true" />,
        description: 'Distinct session dates across all batches',
        status:      'default',
      },
    ],
    [avgAttendance, activeBatches, atRiskStudents, totalSessions, threshold, loading]
  );

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
      role="region"
      aria-label="Analytics key metrics"
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

AnalyticsKPICards.displayName = 'AnalyticsKPICards';

export default AnalyticsKPICards;
