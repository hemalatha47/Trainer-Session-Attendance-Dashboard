/**
 * AttendanceSessionHeader.jsx
 * Session summary card displayed after a valid batch + date selection.
 * Module: 6.2, Task 8.
 *
 * Shows:
 *  - Batch name + code
 *  - Trainer name
 *  - Session date (formatted)
 *  - Student count
 *  - Session mode: "New Session" | "Edit Existing Session"
 */

import { motion }       from 'framer-motion';
import {
  ClipboardCheck,
  Users,
  CalendarDays,
  Pencil,
  Plus,
} from 'lucide-react';
import { slideUp, usePrefersReducedMotion } from '@constants/animations';
import { safeMotion }   from '@utils/componentUtils';
import { formatDate }   from '@utils/dateUtils';

// ── Meta pill ─────────────────────────────────────────────────────────────────

const MetaPill = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-1.5 text-sm">
    <Icon className="w-4 h-4 text-textMuted shrink-0" aria-hidden="true" />
    <span className="text-textMuted">{label}:</span>
    <span className="font-medium text-textPrimary">{value}</span>
  </div>
);

// ── Mode badge ────────────────────────────────────────────────────────────────

const ModeBadge = ({ mode, existingCount }) => {
  const isEdit = mode === 'edit';

  return (
    <span
      className={
        isEdit
          ? 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-warning-bg text-warning-text border border-warning-text/20'
          : 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-success-bg text-success-DEFAULT border border-success-DEFAULT/20'
      }
    >
      {isEdit
        ? <><Pencil className="w-3 h-3" aria-hidden="true" /> Edit Existing Session</>
        : <><Plus   className="w-3 h-3" aria-hidden="true" /> New Session</>
      }
    </span>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {object} props.session  - From useAttendanceSession
 * @param {boolean} [props.show=false]
 */
const AttendanceSessionHeader = ({ session, show = false }) => {
  const reduced = usePrefersReducedMotion();

  if (!show || !session?.batch || !session?.date) return null;

  const { batch, date, mode, existingCount, trainerInfo } = session;

  const motionProps = safeMotion(reduced, {
    variants: slideUp,
    initial:  'initial',
    animate:  'animate',
  });

  return (
    <motion.div
      className="rounded-lg border border-accent-200 bg-accent-50 p-4 flex flex-col gap-4"
      {...motionProps}
      aria-label="Session summary"
    >
      {/* Top row: icon + title + mode badge */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-700"
            aria-hidden="true"
          >
            <ClipboardCheck className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-textPrimary leading-tight">
              {batch.batchName}
            </p>
            <p className="text-xs text-textMuted mt-0.5">{batch.batchCode}</p>
          </div>
        </div>

        <ModeBadge mode={mode} existingCount={existingCount} />
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <MetaPill
          icon={CalendarDays}
          label="Date"
          value={formatDate(date)}
        />
        <MetaPill
          icon={Users}
          label="Students"
          value={`${batch.currentStudentCount ?? 0} enrolled`}
        />
        <MetaPill
          icon={ClipboardCheck}
          label="Trainer"
          value={trainerInfo?.trainerName ?? batch.trainerName ?? '—'}
        />
      </div>

      {/* Edit mode notice */}
      {mode === 'edit' && existingCount > 0 && (
        <p className="text-xs text-warning-text bg-warning-bg/60 rounded px-3 py-2 border border-warning-text/20">
          Attendance has already been marked for this session ({existingCount} records found).
          Continuing will open <strong>edit mode</strong> — existing records will be pre-filled.
        </p>
      )}
    </motion.div>
  );
};

AttendanceSessionHeader.displayName = 'AttendanceSessionHeader';

export default AttendanceSessionHeader;
