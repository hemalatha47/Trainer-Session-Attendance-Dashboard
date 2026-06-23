/**
 * StudentHeaderSection.jsx
 * Module 5.3 update — Edit button wired to onEdit prop
 *
 * Changes from Module 5.2:
 *   - Edit button now calls props.onEdit() instead of being disabled
 *   - Module 5.3 placeholder comment removed
 */

import { ArrowLeft, GraduationCap, Phone, Calendar, Edit } from 'lucide-react';
import { motion }          from 'framer-motion';
import { fadeIn }          from '@constants/animations';
import { cn }              from '@utils/componentUtils';
import { Button }          from '@components/ui/Button';
import { Badge }           from '@components/ui/Badge';
import { StatusBadge }     from '@components/data/StatusBadge';
import { CircularProgress } from '@components/data/CircularProgress';

// ── Attendance badge variant resolver ─────────────────────────────────────────
const attendanceBadgeVariant = (pct) => {
  if (pct >= 75) return 'success';
  if (pct >= 50) return 'warning';
  return 'danger';
};

// ── Avatar initials ───────────────────────────────────────────────────────────
const getInitials = (firstName = '', lastName = '') =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

// ── Avatar color by first char ────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-accent-100 text-accent-700',
  'bg-success-DEFAULT/10 text-success-DEFAULT',
  'bg-yellow-100 text-yellow-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
];
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {object}   props.student            — student record
 * @param {object}   [props.batch]            — batch record (may be null)
 * @param {object}   [props.attendanceSummary] — { percentage, statusColor, riskLevel }
 * @param {function} props.onBack             — navigate back to list
 * @param {function} [props.onEdit]           — open edit modal (Module 5.3)
 */
const StudentHeaderSection = ({
  student,
  batch,
  attendanceSummary,
  onBack,
  onEdit,
}) => {
  if (!student) return null;

  const fullName    = `${student.firstName} ${student.lastName}`;
  const initials    = getInitials(student.firstName, student.lastName);
  const pct         = attendanceSummary?.percentage ?? student.attendancePercentage ?? 0;
  const statusColor = attendanceSummary?.statusColor ?? 'default';

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden"
    >
      {/* Top bar: back navigation + edit action */}
      <div className="px-6 pt-5 pb-0 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          iconLeft={<ArrowLeft className="w-4 h-4" />}
          aria-label="Back to students list"
        >
          Back to Students
        </Button>

        {/* Edit button — Module 5.3: wired to onEdit */}
        <Button
          variant="secondary"
          size="sm"
          iconLeft={<Edit className="w-4 h-4" />}
          onClick={onEdit}
          aria-label={`Edit ${fullName}`}
        >
          Edit
        </Button>
      </div>

      {/* Main header content */}
      <div className="px-6 py-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        {/* Avatar + circular progress ring */}
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center',
              'text-2xl font-bold',
              avatarColor(student.firstName)
            )}
            aria-hidden="true"
          >
            {initials}
          </div>
          {/* Attendance ring overlaid at bottom-right */}
          <div className="absolute -bottom-1 -right-1">
            <CircularProgress
              value={pct}
              size={36}
              strokeWidth={4}
              color={statusColor}
              threshold={75}
              showValue={false}
              label={`${pct}% attendance`}
            />
          </div>
        </div>

        {/* Name, ID, badges, meta */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h1 className="text-xl font-bold text-textPrimary truncate">
            {fullName}
          </h1>

          {/* Student code */}
          <p className="text-sm font-mono text-textMuted mt-0.5">
            {student.studentCode}
          </p>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <StatusBadge type="student" status={student.status ?? 'active'} />

            {batch && (
              <Badge variant="info" size="sm">
                <GraduationCap className="w-3 h-3 mr-1 inline" aria-hidden="true" />
                {batch.name}
              </Badge>
            )}

            <Badge variant={attendanceBadgeVariant(pct)} size="sm">
              {pct}% attendance
            </Badge>

            {attendanceSummary?.riskLevel && (
              <Badge variant={attendanceSummary.riskLevel.status} size="sm">
                {attendanceSummary.riskLevel.label}
              </Badge>
            )}
          </div>

          {/* Meta: enrollment date + phone */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-textMuted">
            {student.enrollmentDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                Enrolled {student.enrollmentDate}
              </span>
            )}
            {student.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                {student.phone}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentHeaderSection;
