/**
 * StudentAttendanceKPIRow.jsx
 * Attendance KPI row for Student Details Page (Module 5.6, Task 10).
 *
 * Displays four compact stat cards:
 *   1. Attendance %     — circular indicator + status color
 *   2. Present Streak   — current consecutive present sessions
 *   3. Absent Streak    — current consecutive absent sessions
 *   4. Risk Level       — colored badge from riskUtils
 *
 * Reuses StatCard from existing data component library.
 * Typography: follows TYPOGRAPHY constants (cardTitle, cardValue).
 *
 * Props:
 *   analytics  {object | null}  — from useStudentAttendance
 *   loading    {boolean}
 */

import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { StatCard }         from '@components/data/StatCard';
import { CircularProgress } from '@components/data/CircularProgress';
import { cn }               from '@utils/componentUtils';

// ── Percentage icon ───────────────────────────────────────────────────────────
const PctIcon = ({ value, statusColor }) => (
  <CircularProgress
    value={value}
    size={40}
    strokeWidth={5}
    color={statusColor}
    threshold={75}
    showValue={false}
    label={`${value}% attendance`}
  />
);

// ── Streak icon with flame for active streak ──────────────────────────────────
const StreakIcon = ({ count, type }) => {
  const isActive = count >= 3;
  if (type === 'present') {
    return isActive
      ? <Flame className="w-5 h-5 text-success-DEFAULT" aria-hidden="true" />
      : <CheckCircle2 className="w-5 h-5 text-success-DEFAULT" aria-hidden="true" />;
  }
  return <TrendingDown className="w-5 h-5 text-danger-DEFAULT" aria-hidden="true" />;
};

// ── Risk icon ─────────────────────────────────────────────────────────────────
const RiskIcon = ({ colorToken }) => {
  if (colorToken === 'success') return <TrendingUp className="w-5 h-5" aria-hidden="true" />;
  return <AlertTriangle className="w-5 h-5" aria-hidden="true" />;
};

// ── Component ─────────────────────────────────────────────────────────────────
const StudentAttendanceKPIRow = ({ analytics, loading = false }) => {
  const {
    percentage            = 0,
    totalSessions         = 0,
    presentCount          = 0,
    absentCount           = 0,
    statusColor           = 'default',
    risk                  = { label: '—', colorToken: 'default', severity: 4 },
    streaks: {
      currentPresentStreak = 0,
      currentAbsentStreak  = 0,
    } = {},
  } = analytics ?? {};

  // Map risk colorToken → StatCard status
  const riskStatus = {
    success: 'success',
    accent:  'success',
    warning: 'warning',
    danger:  'danger',
  }[risk.colorToken] ?? 'default';

  const cards = [
    {
      label:       'Attendance',
      value:       `${Math.round(percentage)}%`,
      description: `${presentCount} / ${totalSessions} sessions`,
      icon:        <PctIcon value={Math.round(percentage)} statusColor={statusColor} />,
      status:      statusColor === 'default' ? 'default'
                     : statusColor === 'success' ? 'success'
                     : statusColor === 'warning' ? 'warning'
                     : 'danger',
    },
    {
      label:       'Present Streak',
      value:       currentPresentStreak,
      description: currentPresentStreak >= 3
                     ? '🔥 Hot streak!'
                     : 'Consecutive sessions',
      icon:        <StreakIcon count={currentPresentStreak} type="present" />,
      status:      currentPresentStreak >= 3 ? 'success' : 'default',
    },
    {
      label:       'Absent Streak',
      value:       currentAbsentStreak,
      description: currentAbsentStreak >= 3
                     ? 'Needs attention'
                     : 'Consecutive absences',
      icon:        <StreakIcon count={currentAbsentStreak} type="absent" />,
      status:      currentAbsentStreak >= 3 ? 'danger'
                     : currentAbsentStreak > 0 ? 'warning'
                     : 'default',
    },
    {
      label:       'Risk Level',
      value:       risk.label,
      description: `Based on ${Math.round(percentage)}% attendance`,
      icon:        <RiskIcon colorToken={risk.colorToken} />,
      status:      riskStatus,
    },
  ];

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      aria-label="Attendance KPI summary"
    >
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

StudentAttendanceKPIRow.displayName = 'StudentAttendanceKPIRow';

export default StudentAttendanceKPIRow;
