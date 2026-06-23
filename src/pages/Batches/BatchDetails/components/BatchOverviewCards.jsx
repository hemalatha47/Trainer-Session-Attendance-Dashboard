/**
 * BatchOverviewCards.jsx
 * Overview KPI card strip for Batch Details page.
 *
 * Displays: Total Students, Attendance %, Present Today, Absent Today,
 *           Duration (days), Completion %.
 *
 * Reuses: StatCard, CardSkeleton
 *
 * Blueprint: Sections 6.4, 9.4–9.5, 11.3
 * Module: 4.2 — Task 6
 */

import {
  Users,
  BarChart2,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
}                             from 'lucide-react';

import { StatCard }           from '@components/data/StatCard';
import {
  BATCH_STATUS,
}                             from '@constants/batchStatus';
import { cn }                 from '@utils/componentUtils';
import { daysBetween, getToday } from '@utils/dateUtils';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Calculates completion percentage of a batch based on today's date.
 * Returns null if batch has no date range.
 */
const calcCompletion = (startDate, endDate, status) => {
  if (!startDate || !endDate) return null;
  if (status === BATCH_STATUS.COMPLETED) return 100;
  if (status === BATCH_STATUS.UPCOMING)  return 0;

  const today = getToday();
  const total  = daysBetween(startDate, endDate);
  const elapsed = daysBetween(startDate, today);

  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

/**
 * Maps attendance percentage to StatCard status.
 * @param {number|null} pct
 * @param {number} threshold
 */
const pctToStatus = (pct, threshold = 75) => {
  if (pct === null || pct === undefined) return 'default';
  if (pct >= threshold) return 'success';
  if (pct >= threshold * 0.7) return 'warning';
  return 'danger';
};

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.batch               — batch entity
 * @param {object[]} props.students           — student list
 * @param {object}  props.attendanceSummary   — from getBatchAttendanceSummary
 * @param {object[]} props.todayAttendance    — today's attendance records
 * @param {boolean} props.batchLoading
 * @param {boolean} props.studentsLoading
 * @param {boolean} props.attendanceLoading
 * @param {number}  [props.threshold=75]
 * @param {string}  [props.className]
 */
const BatchOverviewCards = ({
  batch,
  students,
  attendanceSummary,
  todayAttendance,
  batchLoading,
  studentsLoading,
  attendanceLoading,
  threshold = 75,
  className,
}) => {
  // ── Derived values ──────────────────────────────────────────────────────────

  const activeStudents   = students.filter((s) => s.isActive !== false).length;
  const totalStudents    = students.length;

  const overallPct       = attendanceSummary?.averagePercentage ?? null;
  const pctDisplay       = overallPct !== null ? `${Math.round(overallPct)}%` : '—';

  // Today's counts from live attendance records
  const presentToday = todayAttendance.filter((r) => r.status === 'present').length;
  const absentToday  = todayAttendance.filter((r) => r.status === 'absent').length;
  const todayMarked  = todayAttendance.length > 0;

  // Duration
  const durationDays = batch?.startDate && batch?.endDate
    ? Math.max(0, daysBetween(batch.startDate, batch.endDate))
    : null;

  // Completion
  const completion = batch
    ? calcCompletion(batch.startDate, batch.endDate, batch.status)
    : null;

  // ── Card definitions ────────────────────────────────────────────────────────

  const cards = [
    {
      id:          'total-students',
      label:       'Total Students',
      value:       studentsLoading ? undefined : activeStudents,
      description: totalStudents !== activeStudents
        ? `${totalStudents - activeStudents} inactive`
        : undefined,
      icon:        <Users size={18} aria-hidden="true" />,
      loading:     studentsLoading,
      status:      'default',
    },
    {
      id:          'attendance-pct',
      label:       'Avg Attendance',
      value:       attendanceLoading ? undefined : pctDisplay,
      description: `Threshold: ${threshold}%`,
      icon:        <BarChart2 size={18} aria-hidden="true" />,
      loading:     attendanceLoading,
      status:      pctToStatus(overallPct, threshold),
    },
    {
      id:          'present-today',
      label:       'Present Today',
      value:       attendanceLoading ? undefined : (todayMarked ? presentToday : '—'),
      description: todayMarked ? 'attendance marked' : 'not yet marked',
      icon:        <CheckCircle2 size={18} aria-hidden="true" />,
      loading:     attendanceLoading,
      status:      todayMarked && presentToday > 0 ? 'success' : 'default',
    },
    {
      id:          'absent-today',
      label:       'Absent Today',
      value:       attendanceLoading ? undefined : (todayMarked ? absentToday : '—'),
      description: todayMarked ? 'attendance marked' : 'not yet marked',
      icon:        <XCircle size={18} aria-hidden="true" />,
      loading:     attendanceLoading,
      status:      todayMarked && absentToday > 0 ? (absentToday > 3 ? 'danger' : 'warning') : 'default',
    },
    {
      id:          'duration',
      label:       'Duration',
      value:       batchLoading ? undefined : (durationDays !== null ? `${durationDays}d` : '—'),
      description: batch?.startDate && batch?.endDate
        ? `${batch.startDate} to ${batch.endDate}`
        : undefined,
      icon:        <Clock size={18} aria-hidden="true" />,
      loading:     batchLoading,
      status:      'default',
    },
    {
      id:          'completion',
      label:       'Completion',
      value:       batchLoading ? undefined : (completion !== null ? `${completion}%` : '—'),
      description: batch?.status === BATCH_STATUS.COMPLETED
        ? 'Batch finished'
        : batch?.status === BATCH_STATUS.UPCOMING
        ? 'Not started'
        : 'In progress',
      icon:        <TrendingUp size={18} aria-hidden="true" />,
      loading:     batchLoading,
      status:      completion === 100 ? 'success' : 'default',
    },
  ];

  return (
    <section
      aria-label="Batch overview metrics"
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3',
        className
      )}
    >
      {cards.map(({ id, label, value, description, icon, loading, status }) => (
        <StatCard
          key={id}
          label={label}
          value={value}
          description={description}
          icon={icon}
          status={status}
          loading={loading}
        />
      ))}
    </section>
  );
};

export default BatchOverviewCards;
