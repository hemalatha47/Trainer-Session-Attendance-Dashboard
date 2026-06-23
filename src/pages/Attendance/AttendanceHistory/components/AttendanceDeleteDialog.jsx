/**
 * AttendanceDeleteDialog.jsx
 * Confirm dialog for attendance session and record deletion.
 * Module: 6.8 — Task 4
 *
 * Wraps ConfirmDialog with attendance-specific copy.
 *
 * Props:
 *  confirmState  — { isOpen, mode, batchId, date, recordId }
 *  deleting      — boolean (loading state during delete)
 *  onConfirm     — () => void
 *  onCancel      — () => void
 *  sessionLabel  — optional human-readable label (batchName + date)
 */

import { ConfirmDialog } from '@components/overlay';

const AttendanceDeleteDialog = ({
  confirmState,
  deleting     = false,
  onConfirm,
  onCancel,
  sessionLabel = '',
}) => {
  const { isOpen, mode } = confirmState ?? {};

  const isSession = mode === 'session';
  const title     = isSession ? 'Delete Attendance Session' : 'Delete Attendance Record';

  const message = isSession
    ? `Delete this attendance session${sessionLabel ? ` for ${sessionLabel}` : ''}?\n\nThis will remove all student records for this session. This action cannot be undone.`
    : 'Delete this attendance record? This action cannot be undone.';

  return (
    <ConfirmDialog
      isOpen={!!isOpen}
      onClose={onCancel}
      onConfirm={onConfirm}
      title={title}
      message={message}
      confirmText={deleting ? 'Deleting…' : 'Delete'}
      cancelText="Cancel"
      variant="danger"
    />
  );
};

export default AttendanceDeleteDialog;
