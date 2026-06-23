/**
 * StudentProfilePanel.jsx
 * Module 5.2 — Student Details Page
 *
 * Displays the student's personal details in a clean key-value layout.
 *
 * Fields shown:
 *   Full Name, Student Code, Email, Phone, Enrolled Date, Status, Batch ID
 *
 * Props:
 *   student  {object}  — student record
 *   loading  {boolean}
 */

import { User, Hash, Mail, Phone, Calendar, Activity, BookOpen } from 'lucide-react';
import { motion }    from 'framer-motion';
import { fadeIn }    from '@constants/animations';
import { StatusBadge } from '@components/data/StatusBadge';
import { TextSkeleton } from '@components/feedback/Skeleton';

// ── Field row ─────────────────────────────────────────────────────────────────
const FieldRow = ({ icon: Icon, label, value, children }) => (
  <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
    <span className="mt-0.5 flex-shrink-0 text-textMuted">
      <Icon className="w-4 h-4" aria-hidden="true" />
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-textMuted font-medium uppercase tracking-wide mb-0.5">
        {label}
      </p>
      {children ?? (
        <p className="text-sm text-textPrimary font-medium truncate">
          {value || <span className="text-textMuted italic">Not provided</span>}
        </p>
      )}
    </div>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const StudentProfilePanel = ({ student, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
        <h2 className="text-sm font-semibold text-textPrimary mb-4">Profile</h2>
        <TextSkeleton lines={6} />
      </div>
    );
  }

  if (!student) return null;

  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="bg-surface rounded-xl border border-border shadow-sm p-5"
    >
      <h2 className="text-sm font-semibold text-textPrimary mb-1">
        Profile
      </h2>
      <p className="text-xs text-textMuted mb-4">Personal information</p>

      <div className="divide-y divide-border">
        <FieldRow icon={User}     label="Full Name"       value={fullName} />
        <FieldRow icon={Hash}     label="Student Code"    value={student.studentCode} />
        <FieldRow icon={Mail}     label="Email"           value={student.email} />
        <FieldRow icon={Phone}    label="Phone"           value={student.phone} />
        <FieldRow icon={Calendar} label="Enrolled"        value={student.enrollmentDate} />
        <FieldRow icon={BookOpen} label="Batch ID"        value={student.batchId} />
        <FieldRow icon={Activity} label="Status">
          <StatusBadge type="student" status={student.status ?? 'active'} />
        </FieldRow>
      </div>
    </motion.div>
  );
};

export default StudentProfilePanel;
