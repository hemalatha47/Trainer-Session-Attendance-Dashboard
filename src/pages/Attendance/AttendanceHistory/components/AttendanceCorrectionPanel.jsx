/**
 * AttendanceCorrectionPanel.jsx
 * Correction mode panel for historical attendance sessions.
 * Module: 6.8 — Task 5
 *
 * Renders as a full-width panel below the history list when correction
 * mode is active. Shows editable status toggles for each student in the
 * selected session.
 *
 * Props:
 *  sessionBeingCorrected — { batchId, date, batchName }
 *  correctionRows        — { [studentId]: { status, remarks } }
 *  correcting            — boolean (save in progress)
 *  loadingSession        — boolean
 *  students              — object[] from mock / service (for name display)
 *  onUpdateRow           — (studentId, field, value) => void
 *  onSave                — () => void
 *  onCancel              — () => void
 */

import { Loader2, Save, X, CheckCircle2, XCircle }  from 'lucide-react';
import { motion }                                     from 'framer-motion';
import { fadeIn, usePrefersReducedMotion }            from '@constants/animations';
import { safeMotion }                                 from '@utils/componentUtils';
import { Button }                                     from '@components/ui/Button';
import { Textarea }                                   from '@components/ui/Textarea';
import { cn }                                         from '@utils/componentUtils';
import { ATTENDANCE_STATUS, ATTENDANCE_CHIP_CLASSES } from '@constants/attendanceStatus';

// ── Status toggle row ─────────────────────────────────────────────────────────

const StatusToggle = ({ status, onChange }) => {
  const isPresent = status === ATTENDANCE_STATUS.PRESENT;

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Attendance status">
      <button
        type="button"
        onClick={() => onChange(ATTENDANCE_STATUS.PRESENT)}
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all',
          isPresent
            ? 'bg-success-bg text-success-text border-success-border shadow-sm'
            : 'bg-white text-textMuted border-border hover:border-success-border hover:text-success-DEFAULT'
        )}
        aria-pressed={isPresent}
      >
        <CheckCircle2 size={12} />
        Present
      </button>
      <button
        type="button"
        onClick={() => onChange(ATTENDANCE_STATUS.ABSENT)}
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all',
          !isPresent
            ? 'bg-danger-bg text-danger-text border-danger-border shadow-sm'
            : 'bg-white text-textMuted border-border hover:border-danger-border hover:text-danger-DEFAULT'
        )}
        aria-pressed={!isPresent}
      >
        <XCircle size={12} />
        Absent
      </button>
    </div>
  );
};

// ── Correction row ────────────────────────────────────────────────────────────

const CorrectionRow = ({ studentId, studentName, studentCode, row, onUpdate }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-3 py-3 border-b border-border last:border-b-0">
    {/* Student info */}
    <div className="sm:w-48 shrink-0">
      <p className="text-sm font-medium text-textPrimary leading-tight">{studentName}</p>
      <p className="text-xs text-textMuted">{studentCode}</p>
    </div>

    {/* Status toggle */}
    <div className="shrink-0">
      <StatusToggle
        status={row?.status ?? ATTENDANCE_STATUS.ABSENT}
        onChange={(val) => onUpdate(studentId, 'status', val)}
      />
    </div>

    {/* Remarks */}
    <div className="flex-1">
      <Textarea
        placeholder="Add correction notes (optional)"
        value={row?.remarks ?? ''}
        onChange={(e) => onUpdate(studentId, 'remarks', e.target.value)}
        rows={1}
        className="text-xs py-1.5 resize-none"
        aria-label={`Remarks for ${studentName}`}
      />
    </div>
  </div>
);

// ── Panel ─────────────────────────────────────────────────────────────────────

const AttendanceCorrectionPanel = ({
  sessionBeingCorrected,
  correctionRows   = {},
  correcting       = false,
  loadingSession   = false,
  students         = [],
  onUpdateRow,
  onSave,
  onCancel,
}) => {
  const reduced    = usePrefersReducedMotion();
  const panelMotion = safeMotion(reduced, {
    variants: fadeIn,
    initial: 'initial',
    animate: 'animate',
  });

  if (!sessionBeingCorrected) return null;

  const { batchName, date } = sessionBeingCorrected;
  const studentIds          = Object.keys(correctionRows);

  return (
    <motion.div
      {...panelMotion}
      className="rounded-xl border border-warning-border bg-warning-bg/30 shadow-sm overflow-hidden"
      role="region"
      aria-label="Attendance Correction Mode"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-warning-border bg-warning-bg/60">
        <div>
          <p className="text-sm font-semibold text-warning-text">
            Correction Mode — {batchName}
          </p>
          <p className="text-xs text-warning-text/80 mt-0.5">
            Session: {date} · Edit statuses and save to apply corrections
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          aria-label="Exit correction mode"
          className="text-warning-text hover:bg-warning-bg"
        >
          <X size={14} />
        </Button>
      </div>

      {/* Body */}
      <div className="px-4 py-2 bg-white">
        {loadingSession ? (
          <div className="flex items-center justify-center gap-2 py-8 text-textMuted">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Loading session data…</span>
          </div>
        ) : studentIds.length === 0 ? (
          <p className="py-6 text-center text-sm text-textMuted">
            No records found for this session.
          </p>
        ) : (
          <div>
            {/* Column headings */}
            <div className="hidden sm:flex items-center gap-3 py-2 border-b border-border text-xs font-medium text-textMuted uppercase tracking-wide">
              <span className="w-48 shrink-0">Student</span>
              <span className="shrink-0 w-32">Status</span>
              <span className="flex-1">Correction Notes</span>
            </div>

            {studentIds.map((studentId) => {
              const student = students.find((s) => s.id === studentId);
              return (
                <CorrectionRow
                  key={studentId}
                  studentId={studentId}
                  studentName={student?.name ?? studentId}
                  studentCode={student?.studentCode ?? ''}
                  row={correctionRows[studentId]}
                  onUpdate={onUpdateRow}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-warning-border bg-warning-bg/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={correcting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          disabled={correcting || loadingSession || studentIds.length === 0}
          aria-busy={correcting}
        >
          {correcting ? (
            <>
              <Loader2 size={13} className="animate-spin mr-1.5" />
              Saving…
            </>
          ) : (
            <>
              <Save size={13} className="mr-1.5" />
              Save Corrections
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default AttendanceCorrectionPanel;
