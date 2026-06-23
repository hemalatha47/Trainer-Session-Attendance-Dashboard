/**
 * AttendanceKPICards.jsx
 * Four KPI cards for Module 6.7 — Attendance Analytics & Alerts.
 *
 * Cards:
 *  1. Overall Attendance % (present / total × 100)
 *  2. Absent Ratio         (absent / total × 100)
 *  3. At-Risk Students     (below threshold count)
 *  4. Critical Alerts      (below 60%)
 *
 * Reuses StatCard from the existing data component library.
 * Loading state uses CardSkeleton via StatCard's loading prop.
 */

import { useMemo }           from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, AlertOctagon, Users, BookOpen } from 'lucide-react';
import { StatCard }          from '@components/data/StatCard';
import { cn }                from '@utils/componentUtils';

// ── Internal helper ───────────────────────────────────────────────────────────

const _status = (pct, threshold) => {
  if (pct >= 85)        return 'success';
  if (pct >= threshold) return 'info';
  if (pct >= 60)        return 'warning';
  return 'danger';
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.kpis           — from useAttendanceAnalytics().kpis
 * @param {number}  [props.threshold=75]
 * @param {boolean} [props.loading=false]
 * @param {string}  [props.className]
 */
const AttendanceKPICards = ({ kpis, threshold = 75, loading = false, className }) => {
  const {
    overallRate      = 0,
    absentRatio      = 0,
    atRiskCount      = 0,
    criticalCount    = 0,
    totalStudents    = 0,
    activeBatchCount = 0,
  } = kpis ?? {};

  const cards = useMemo(
    () => [
      {
        label:       'Overall Attendance',
        value:       loading ? '—' : `${overallRate}%`,
        icon:        <TrendingUp size={20} />,
        description: 'Present rate across all tracked batches',
        status:      _status(overallRate, threshold),
      },
      {
        label:       'Absent Ratio',
        value:       loading ? '—' : `${absentRatio}%`,
        icon:        <TrendingDown size={20} />,
        description: 'Absent rate across all tracked batches',
        status:      absentRatio <= 15 ? 'success' : absentRatio <= 30 ? 'warning' : 'danger',
      },
      {
        label:       'At-Risk Students',
        value:       loading ? '—' : atRiskCount,
        icon:        <AlertTriangle size={20} />,
        description: `${totalStudents} total students · below ${threshold}% threshold`,
        status:      atRiskCount === 0 ? 'success' : atRiskCount <= 3 ? 'warning' : 'danger',
      },
      {
        label:       'Critical Alerts',
        value:       loading ? '—' : criticalCount,
        icon:        <AlertOctagon size={20} />,
        description: `${activeBatchCount} active batch${activeBatchCount !== 1 ? 'es' : ''} monitored`,
        status:      criticalCount === 0 ? 'success' : 'danger',
      },
    ],
    [overallRate, absentRatio, atRiskCount, criticalCount, totalStudents, activeBatchCount, threshold, loading]
  );

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4',
        className
      )}
      role="region"
      aria-label="Attendance KPI metrics"
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

export default AttendanceKPICards;
