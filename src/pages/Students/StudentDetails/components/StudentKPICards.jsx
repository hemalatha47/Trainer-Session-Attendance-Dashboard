/**
 * StudentKPICards.jsx
 * Module 5.2 — Student Details Page
 *
 * Four KPI cards summarising the student's attendance performance.
 * Reuses StatCard from the existing data component library.
 *
 * Cards:
 *   1. Attendance Percentage  (CircularProgress + status color)
 *   2. Present Sessions
 *   3. Absent Sessions
 *   4. Risk Level
 *
 * Props:
 *   attendanceSummary  {object}  — from useStudentDetails
 *   loading            {boolean}
 */

import { CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { StatCard }         from '@components/data/StatCard';
import { CircularProgress } from '@components/data/CircularProgress';

// ── Percentage card custom icon ───────────────────────────────────────────────
const PercentageIcon = ({ value, statusColor, threshold }) => (
  <CircularProgress
    value={value}
    size={40}
    strokeWidth={5}
    color={statusColor}
    threshold={threshold}
    showValue={false}
    label={`${value}% attendance`}
  />
);

// ── Component ─────────────────────────────────────────────────────────────────

const StudentKPICards = ({ attendanceSummary, loading = false }) => {
  const {
    percentage    = 0,
    presentCount  = 0,
    absentCount   = 0,
    totalSessions = 0,
    statusColor   = 'default',
    riskLevel     = { label: '—', status: 'default' },
  } = attendanceSummary ?? {};

  const cards = [
    {
      label:       'Attendance',
      value:       `${percentage}%`,
      description: `${totalSessions} total sessions`,
      icon:        <PercentageIcon value={percentage} statusColor={statusColor} threshold={75} />,
      status:      statusColor,
    },
    {
      label:       'Present',
      value:       presentCount,
      description: 'Sessions attended',
      icon:        <CheckCircle className="w-5 h-5" aria-hidden="true" />,
      status:      'success',
    },
    {
      label:       'Absent',
      value:       absentCount,
      description: 'Sessions missed',
      icon:        <XCircle className="w-5 h-5" aria-hidden="true" />,
      status:      absentCount > 0 ? 'danger' : 'default',
    },
    {
      label:       'Risk Level',
      value:       riskLevel.label,
      description: 'Based on attendance %',
      icon:        riskLevel.status === 'success'
                     ? <TrendingUp className="w-5 h-5" aria-hidden="true" />
                     : <AlertTriangle className="w-5 h-5" aria-hidden="true" />,
      status:      riskLevel.status,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          description={card.description}
          icon={card.icon}
          status={card.status}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default StudentKPICards;
