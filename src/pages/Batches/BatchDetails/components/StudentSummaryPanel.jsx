/**
 * StudentSummaryPanel.jsx
 * Student roster summary panel for Batch Details page.
 *
 * Displays: total/active/inactive student counts,
 *           recent 5 students preview list.
 *
 * Reuses: InfoCard, EmptyState, Skeleton, Badge
 *
 * Blueprint: Sections 4.2, 6.4, 8.3, 11.3
 * Module: 4.2 — Task 8
 */

import { motion }           from 'framer-motion';
import {
  Users,
  UserCheck,
  UserX,
  ChevronRight,
}                           from 'lucide-react';

import { InfoCard }         from '@components/data/InfoCard';
import { Badge }            from '@components/ui/Badge';
import { EmptyState }       from '@components/feedback/EmptyState';
import { CardSkeleton }     from '@components/feedback/Skeleton';
import { fadeIn }           from '@constants/animations';
import { cn }               from '@utils/componentUtils';

// ── Mini stat pill ────────────────────────────────────────────────────────────

const MiniStat = ({ icon: Icon, label, value, colorClass }) => (
  <div className="flex flex-col items-center gap-1 flex-1 py-3 px-2">
    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center mb-1', colorClass)}>
      <Icon size={15} aria-hidden="true" />
    </div>
    <span className="text-lg font-bold text-textPrimary tabular-nums leading-none">
      {value}
    </span>
    <span className="text-[10px] text-textMuted font-medium uppercase tracking-wide">
      {label}
    </span>
  </div>
);

// ── Student row ────────────────────────────────────────────────────────────────

const StudentRow = ({ student, rank }) => {
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ')
    || student.name
    || '—';

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center shrink-0 text-[10px] font-bold"
        aria-hidden="true"
      >
        {initials}
      </div>

      {/* Name + code */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-textPrimary truncate leading-tight">
          {fullName}
        </p>
        {student.studentCode && (
          <p className="text-[10px] text-textMuted font-mono">
            {student.studentCode}
          </p>
        )}
      </div>

      {/* Status */}
      <Badge
        variant={student.isActive === false ? 'neutral' : 'active'}
        size="sm"
      >
        {student.isActive === false ? 'Inactive' : 'Active'}
      </Badge>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {object[]} props.students   — student list from studentService
 * @param {boolean}  [props.loading]
 * @param {string}   [props.className]
 */
const StudentSummaryPanel = ({ students, loading, className }) => {
  if (loading) {
    return <CardSkeleton className={cn('h-64', className)} />;
  }

  const active   = students.filter((s) => s.isActive !== false);
  const inactive = students.filter((s) => s.isActive === false);
  const total    = students.length;

  // 5 most recently created active students
  const recentStudents = [...active]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 5);

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className={className}
    >
      <InfoCard
        title="Students"
        subtitle={`${total} enrolled`}
        headerRight={
          total > 0 ? (
            <span className="text-xs text-textMuted">
              {active.length} active
            </span>
          ) : null
        }
        className="h-full"
      >
        {/* Mini stats row */}
        <div className="flex divide-x divide-border border-b border-border">
          <MiniStat
            icon={Users}
            label="Total"
            value={total}
            colorClass="bg-accent-50 text-accent-600"
          />
          <MiniStat
            icon={UserCheck}
            label="Active"
            value={active.length}
            colorClass="bg-success-bg text-success-DEFAULT"
          />
          <MiniStat
            icon={UserX}
            label="Inactive"
            value={inactive.length}
            colorClass="bg-neutral-100 text-neutral-500"
          />
        </div>

        {/* Student preview list */}
        <div className="px-4 pb-3 pt-1">
          {recentStudents.length === 0 ? (
            <EmptyState
              icon={<Users size={28} />}
              title="No students yet"
              description="Students will appear here once added to this batch."
              className="py-6"
            />
          ) : (
            <>
              <p className="text-[10px] text-textMuted font-medium uppercase tracking-wide py-2">
                Recent Students
              </p>
              {recentStudents.map((s, i) => (
                <StudentRow key={s.id} student={s} rank={i + 1} />
              ))}
              {active.length > 5 && (
                <p className="text-xs text-accent-600 font-medium pt-2 text-center">
                  +{active.length - 5} more students
                </p>
              )}
            </>
          )}
        </div>
      </InfoCard>
    </motion.div>
  );
};

export default StudentSummaryPanel;
