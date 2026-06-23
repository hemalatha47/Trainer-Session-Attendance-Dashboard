/**
 * AttendanceSaveBar.jsx
 * Sticky save action bar for the Attendance Sheet.
 *
 * Module 6.5 — Attendance Save & Edit Workflow
 * Blueprint Sections: 4.3, 7.1, 7.2, 7.3
 *
 * DISPLAYS:
 *  - Present / Absent live counters
 *  - Dirty state indicator (unsaved changes badge)
 *  - Save button (disabled when no changes / saving / controls disabled)
 *  - Loading spinner inline on Save button during save operation
 *
 * SAVE BUTTON DISABLED WHEN:
 *  - !dirty (no unsaved changes)
 *  - loading (save in progress)
 *  - disabled prop (external control lockout)
 *
 * RESPONSIVE:
 *  - Mobile: stacked layout (counters top, button bottom)
 *  - Tablet+: single row
 *
 * ACCESSIBILITY:
 *  - aria-label on save button reflects current state
 *  - role="status" on counter region for screen readers
 *  - aria-live="polite" on status indicator
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@utils/componentUtils';
import { Button } from '@components/ui/Button';
import { SAVE_STATE } from '@hooks/useAttendanceSave';

// ── Sub-component: Counter pill ───────────────────────────────────────────────

const CounterPill = ({ label, count, colorClass }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
      colorClass
    )}
  >
    <span className="text-sm font-bold tabular-nums">{count}</span>
    <span className="opacity-80">{label}</span>
  </span>
);

// ── Sub-component: Status indicator ──────────────────────────────────────────

const StatusIndicator = ({ saveState, dirty }) => {
  const variants = {
    hidden:  { opacity: 0, y: -4 },
    visible: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: 4 },
  };

  let content = null;

  if (saveState === SAVE_STATE.SAVING) {
    content = (
      <motion.span
        key="saving"
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="inline-flex items-center gap-1.5 text-xs text-secondary-500"
        aria-live="polite"
      >
        <Loader2 size={12} className="animate-spin" aria-hidden="true" />
        Saving…
      </motion.span>
    );
  } else if (saveState === SAVE_STATE.SUCCESS) {
    content = (
      <motion.span
        key="success"
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="inline-flex items-center gap-1.5 text-xs text-success-text font-medium"
        aria-live="polite"
      >
        <CheckCircle2 size={12} aria-hidden="true" />
        Saved
      </motion.span>
    );
  } else if (dirty) {
    content = (
      <motion.span
        key="dirty"
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="inline-flex items-center gap-1.5 text-xs text-warning-text font-medium"
        aria-live="polite"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-warning-text animate-pulse" aria-hidden="true" />
        Unsaved changes
      </motion.span>
    );
  }

  return (
    <div className="h-5 flex items-center">
      <AnimatePresence mode="wait">{content}</AnimatePresence>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {number}           props.presentCount   — live present count
 * @param {number}           props.absentCount    — live absent count
 * @param {number}           props.totalCount     — total student count
 * @param {boolean}          props.dirty          — true when unsaved changes exist
 * @param {'idle'|'saving'|'success'|'error'} props.saveState
 * @param {boolean}          [props.loading]      — alias for saveState === 'saving'
 * @param {boolean}          [props.disabled]     — disables all controls
 * @param {string}           [props.mode]         — 'create' | 'edit'
 * @param {string}           [props.date]         — YYYY-MM-DD for aria-label
 * @param {function}         props.onSave         — triggered by Save button click
 * @param {string}           [props.className]
 */
const AttendanceSaveBar = ({
  presentCount  = 0,
  absentCount   = 0,
  totalCount    = 0,
  dirty         = false,
  saveState     = SAVE_STATE.IDLE,
  loading       = false,
  disabled      = false,
  mode          = 'create',
  date,
  onSave,
  className,
}) => {
  const isSaving    = loading || saveState === SAVE_STATE.SAVING;
  const saveDisabled = !dirty || isSaving || disabled;

  const buttonLabel = isSaving
    ? (mode === 'edit' ? 'Updating…' : 'Saving…')
    : (mode === 'edit' ? 'Update Session' : 'Save Attendance');

  const ariaLabel = saveDisabled
    ? (isSaving ? 'Save in progress' : 'No changes to save')
    : `${mode === 'edit' ? 'Update' : 'Save'} attendance${date ? ` for ${date}` : ''}`;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        'py-3 px-4 rounded-xl',
        'bg-white border border-secondary-200 shadow-sm',
        className
      )}
      role="region"
      aria-label="Attendance save controls"
    >
      {/* ── Left: counters + status ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2" role="status" aria-label="Attendance counters">
        <CounterPill
          label="Present"
          count={presentCount}
          colorClass="bg-success-bg text-success-text"
        />
        <CounterPill
          label="Absent"
          count={absentCount}
          colorClass="bg-danger-bg text-danger-DEFAULT"
        />
        {totalCount > 0 && (
          <span className="text-xs text-secondary-400 tabular-nums">
            of {totalCount}
          </span>
        )}

        <div className="ml-1">
          <StatusIndicator saveState={saveState} dirty={dirty} />
        </div>
      </div>

      {/* ── Right: Save button ──────────────────────────────────────────── */}
      <Button
        variant="primary"
        size="sm"
        onClick={onSave}
        disabled={saveDisabled}
        aria-label={ariaLabel}
        iconLeft={
          isSaving
            ? <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            : <Save size={14} aria-hidden="true" />
        }
      >
        {buttonLabel}
      </Button>
    </div>
  );
};

AttendanceSaveBar.displayName = 'AttendanceSaveBar';

export { AttendanceSaveBar };
export default AttendanceSaveBar;
