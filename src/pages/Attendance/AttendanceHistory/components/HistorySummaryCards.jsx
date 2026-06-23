/**
 * HistorySummaryCards.jsx
 * KPI summary row for the Attendance History page.
 * Module: 6.6 — Task 7
 *
 * Metrics displayed:
 *  - Total Sessions
 *  - Average Attendance %
 *  - Sessions Marked
 *  - Low Attendance Sessions
 */

import { CalendarDays, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { StatCard } from '@components/data/StatCard';

const HistorySummaryCards = ({ summary, loading }) => {
  const cards = [
    {
      label:       'Total Sessions',
      value:       loading ? '…' : (summary?.totalSessions ?? 0),
      icon:        <CalendarDays size={20} />,
      status:      'default',
      description: 'Sessions recorded in view',
    },
    {
      label:       'Avg. Attendance',
      value:       loading ? '…' : `${summary?.averageAttendance ?? 0}%`,
      icon:        <TrendingUp size={20} />,
      status:      (summary?.averageAttendance ?? 0) >= 75 ? 'success'
                  : (summary?.averageAttendance ?? 0) >= 50 ? 'warning' : 'danger',
      description: 'Across all filtered sessions',
    },
    {
      label:       'Sessions Marked',
      value:       loading ? '…' : (summary?.updatedSessions ?? 0),
      icon:        <CheckCircle2 size={20} />,
      status:      'success',
      description: 'Sessions with recorded data',
    },
    {
      label:       'Low Attendance',
      value:       loading ? '…' : (summary?.lowAttendanceCount ?? 0),
      icon:        <AlertTriangle size={20} />,
      status:      (summary?.lowAttendanceCount ?? 0) > 0 ? 'danger' : 'default',
      description: 'Sessions below threshold',
    },
  ];

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      aria-label="History summary"
    >
      {cards.map((c) => (
        <StatCard
          key={c.label}
          label={c.label}
          value={c.value}
          icon={c.icon}
          status={c.status}
          description={c.description}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default HistorySummaryCards;
