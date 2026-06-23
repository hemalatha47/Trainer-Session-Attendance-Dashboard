/**
 * SessionDetailPanel.jsx
 * Read-only detail view for a single historical attendance session.
 * Module: 6.6 — Task 8
 *
 * Rendered as a right-side panel (Drawer) on desktop and full-screen on mobile.
 * Shows: batch info, date, present/absent counts, % badge, and per-student list.
 *
 * Props:
 *  session   — enriched session object from useAttendanceHistory.selectedSession
 *  loading   — boolean (sessionLoading)
 *  onClose   — () => void
 */

import { X, User, CheckCircle2, XCircle, CalendarDays, Users } from 'lucide-react';
import { motion, AnimatePresence }      from 'framer-motion';
import { Button }                        from '@components/ui/Button';
import { TextSkeleton }                  from '@components/feedback/Skeleton';
import { cn }                            from '@utils/componentUtils';
import { ATTENDANCE_STATUS, ATTENDANCE_CHIP_CLASSES } from '@constants/attendanceStatus';

// ── Helpers ───────────────────────────────────────────────────────────────────

const PctBadge = ({ pct, color }) => {
  const cls = {
    success: 'bg-success-bg text-success-text',
    warning: 'bg-warning-bg text-warning-text',
    danger:  'bg-danger-bg text-danger-text',
  }[color] ?? 'bg-neutral-100 text-neutral-700';

  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-bold', cls)}>
      {pct}%
    </span>
  );
};

const StatusChip = ({ status }) => {
  const s     = status?.toLowerCase() ?? ATTENDANCE_STATUS.ABSENT;
  const chips = ATTENDANCE_CHIP_CLASSES[s] ?? ATTENDANCE_CHIP_CLASSES[ATTENDANCE_STATUS.ABSENT];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        chips.bg, chips.text, chips.border
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', chips.dot)} />
      {s === 'present' ? 'Present' : 'Absent'}
    </span>
  );
};

// ── Panel ─────────────────────────────────────────────────────────────────────

const SessionDetailPanel = ({ session, loading, onClose }) => {
  const isOpen = !!session || loading;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={cn(
              'fixed top-0 right-0 h-full w-full sm:w-[480px] z-50',
              'bg-white shadow-2xl flex flex-col overflow-hidden'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Session details"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-accent-600" />
                <h2 className="text-base font-semibold text-textPrimary">
                  Session Details
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close session details"
                className="p-1"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              {loading ? (
                <div role="status" aria-label="Loading session details">
                  <TextSkeleton lines={4} />
                  <div className="mt-6"><TextSkeleton lines={8} /></div>
                  <span className="sr-only">Loading session details…</span>
                </div>
              ) : session ? (
                <>
                  {/* Meta section */}
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-xs text-textMuted uppercase tracking-wide mb-0.5">
                        Batch
                      </p>
                      <p className="text-sm font-semibold text-textPrimary">
                        {session.batchName}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-textMuted uppercase tracking-wide mb-0.5">Date</p>
                        <p className="text-sm font-medium text-textPrimary">
                          {session.displayDate ?? session.date}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-textMuted uppercase tracking-wide mb-0.5">Trainer</p>
                        <p className="text-sm font-medium text-textPrimary">
                          {session.trainerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-textMuted uppercase tracking-wide mb-0.5">Marked By</p>
                        <p className="text-sm font-medium text-textPrimary">
                          {session.markedByName ?? session.markedBy ?? '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-textMuted uppercase tracking-wide mb-0.5">Recorded</p>
                        <p className="text-sm font-medium text-textPrimary truncate">
                          {session.displayMarkedAt || '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Attendance summary bar */}
                  <div className="bg-background rounded-lg p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-success-DEFAULT">
                        <CheckCircle2 size={16} />
                        <span className="text-sm font-semibold">{session.presentCount}</span>
                        <span className="text-xs text-textMuted">Present</span>
                      </div>
                      <div className="w-px h-5 bg-border" />
                      <div className="flex items-center gap-1.5 text-danger-DEFAULT">
                        <XCircle size={16} />
                        <span className="text-sm font-semibold">{session.absentCount}</span>
                        <span className="text-xs text-textMuted">Absent</span>
                      </div>
                      <div className="w-px h-5 bg-border" />
                      <div className="flex items-center gap-1.5 text-textMuted">
                        <Users size={16} />
                        <span className="text-sm font-semibold">{session.totalCount}</span>
                        <span className="text-xs text-textMuted">Total</span>
                      </div>
                    </div>
                    <PctBadge pct={session.percentage} color={session.statusColor} />
                  </div>

                  {/* Per-student list */}
                  {Array.isArray(session.records) && session.records.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-textMuted uppercase tracking-wide mb-3">
                        Student Records
                      </p>
                      <ul className="flex flex-col gap-2" aria-label="Student attendance records">
                        {session.records.map((rec) => (
                          <li
                            key={rec.id}
                            className="flex items-center justify-between py-2 px-3 rounded-md
                              bg-background border border-border hover:bg-neutral-50 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <User size={14} className="text-textMuted shrink-0" />
                              <span className="text-sm text-textPrimary truncate">
                                {rec.studentId}
                              </span>
                            </div>
                            <StatusChip status={rec.status} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border shrink-0">
              <Button variant="outline" fullWidth onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default SessionDetailPanel;
