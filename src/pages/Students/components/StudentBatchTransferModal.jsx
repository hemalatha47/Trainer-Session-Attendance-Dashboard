/**
 * StudentBatchTransferModal.jsx
 * Module 5.7 — Transfer selected students to another batch.
 *
 * Props:
 *   isOpen          {boolean}
 *   onClose         {function}
 *   selectedIds     {string[]}   — student IDs to transfer
 *   onSuccess       {function}   — called after successful transfer
 */

import { useState, useMemo } from 'react';
import { ArrowRightLeft, AlertCircle } from 'lucide-react';
import Modal from '@components/overlay/Modal';
import { Button } from '@components/ui/Button';
import { Alert } from '@components/feedback/Alert';
import { mockBatches } from '@data/mockBatches';
import { transferStudentBatch } from '@services/studentService';
import { useAppContext } from '@context/AppContext';
import { cn } from '@utils/componentUtils';

// Only offer active / upcoming / on_hold batches as transfer targets
const ALLOWED_STATUSES = ['active', 'upcoming', 'on_hold'];

const BATCH_STATUS_LABEL = {
  active:   'Active',
  upcoming: 'Upcoming',
  on_hold:  'On Hold',
};

const StudentBatchTransferModal = ({
  isOpen,
  onClose,
  selectedIds = [],
  onSuccess,
}) => {
  const { showToast } = useAppContext();

  const [targetBatchId, setTargetBatchId] = useState('');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [result,        setResult]        = useState(null);

  const transferableBatches = useMemo(() =>
    mockBatches.filter((b) => ALLOWED_STATUSES.includes(b.status)),
    []
  );

  const handleClose = () => {
    if (loading) return;
    setTargetBatchId('');
    setError(null);
    setResult(null);
    onClose();
  };

  const handleTransfer = async () => {
    if (!targetBatchId) {
      setError('Please select a target batch.');
      return;
    }
    if (selectedIds.length === 0) {
      setError('No students selected.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const succeeded = [];
    const failed    = [];

    for (const id of selectedIds) {
      const res = await transferStudentBatch(id, targetBatchId);
      if (res.success) succeeded.push(id);
      else failed.push({ id, error: res.error?.message || 'Failed' });
    }

    setLoading(false);

    const targetBatch = transferableBatches.find((b) => b.id === targetBatchId);
    const batchName   = targetBatch?.batchName || targetBatchId;

    if (succeeded.length > 0 && failed.length === 0) {
      showToast(`${succeeded.length} student${succeeded.length > 1 ? 's' : ''} transferred to ${batchName}.`, 'success');
      if (typeof onSuccess === 'function') onSuccess({ succeeded, failed });
      handleClose();
    } else if (succeeded.length > 0) {
      setResult({ succeeded, failed, batchName });
    } else {
      setError(`Transfer failed for all ${failed.length} students. ${failed[0]?.error || ''}`);
    }
  };

  const count = selectedIds.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Transfer Batch"
      size="sm"
      closeOnEscape={!loading}
      closeOnBackdropClick={!loading}
      footer={
        result ? (
          <Button variant="primary" size="sm" onClick={() => {
            if (typeof onSuccess === 'function') onSuccess(result);
            handleClose();
          }}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              iconLeft={<ArrowRightLeft className="w-4 h-4" aria-hidden="true" />}
              onClick={handleTransfer}
              loading={loading}
              disabled={!targetBatchId || loading}
            >
              {loading ? 'Transferring…' : `Transfer ${count} Student${count !== 1 ? 's' : ''}`}
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        {/* Summary */}
        <p className="text-sm text-textMuted">
          Move{' '}
          <span className="font-semibold text-textPrimary">
            {count} student{count !== 1 ? 's' : ''}
          </span>{' '}
          to a new batch. Attendance history from the original batch will be preserved.
        </p>

        {/* Batch selector */}
        {!result && (
          <div>
            <label
              htmlFor="transfer-batch-select"
              className="block text-sm font-medium text-textPrimary mb-1.5"
            >
              Select Target Batch <span className="text-danger-DEFAULT" aria-hidden="true">*</span>
            </label>
            <select
              id="transfer-batch-select"
              value={targetBatchId}
              onChange={(e) => { setTargetBatchId(e.target.value); setError(null); }}
              disabled={loading}
              aria-required="true"
              className={cn(
                'w-full text-sm rounded-md border px-3 py-2',
                'border-border bg-white text-textPrimary',
                'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <option value="">— Choose a batch —</option>
              {transferableBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batchName} ({BATCH_STATUS_LABEL[b.status] || b.status})
                </option>
              ))}
            </select>
            {transferableBatches.length === 0 && (
              <p className="mt-1 text-xs text-textMuted">No eligible batches available.</p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="danger" icon={<AlertCircle className="w-4 h-4" />}>
            {error}
          </Alert>
        )}

        {/* Partial result */}
        {result && (
          <div className="space-y-2">
            {result.succeeded.length > 0 && (
              <Alert variant="success">
                {result.succeeded.length} student{result.succeeded.length > 1 ? 's' : ''} transferred to{' '}
                <strong>{result.batchName}</strong>.
              </Alert>
            )}
            {result.failed.length > 0 && (
              <Alert variant="warning" icon={<AlertCircle className="w-4 h-4" />}>
                {result.failed.length} transfer{result.failed.length > 1 ? 's' : ''} failed:{' '}
                {result.failed.map((f) => f.error).join('; ')}
              </Alert>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

StudentBatchTransferModal.displayName = 'StudentBatchTransferModal';
export default StudentBatchTransferModal;
