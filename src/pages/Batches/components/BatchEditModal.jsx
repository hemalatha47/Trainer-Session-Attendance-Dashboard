/**
 * BatchEditModal.jsx
 * Modal dialog for editing an existing batch.
 *
 * Blueprint: Sections 4.1, 6.3, 7.3, 11.3 (Modal component)
 * Module: 4.3
 *
 * Architecture:
 *   BatchListPage / BatchDetailsPage
 *     → BatchEditModal
 *       → Modal (overlay component)
 *       → BatchForm (presentational form)
 *       → useBatchForm (form logic hook — edit mode, loads existing data)
 *
 * On success:
 *   1. Calls props.onSuccess(updatedBatch) so parent can refresh the batch display.
 *   2. Modal closes.
 */

import { useCallback }                  from 'react';
import { Save, Loader2, AlertTriangle } from 'lucide-react';
import { Modal }                        from '@components/overlay/Modal';
import { Button }                       from '@components/ui/Button';
import { Skeleton }                     from '@components/feedback/Skeleton';
import { BatchForm }                    from './BatchForm';
import { useBatchForm }                 from '@hooks/useBatchForm';
import { cn }                           from '@utils/componentUtils';

/**
 * @param {object}   props
 * @param {boolean}  props.isOpen       — controlled open state
 * @param {function} props.onClose      — called to close the modal
 * @param {string}   props.batchId      — ID of the batch to edit
 * @param {function} [props.onSuccess]  — called with the updated batch
 */
const BatchEditModal = ({ isOpen, onClose, batchId, onSuccess }) => {

  // ── Form hook wired to edit mode ──────────────────────────────────────────
  const {
    fields,
    errors,
    touched,
    submitting,
    submitError,
    loadError,
    initializing,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useBatchForm({
    batchId,
    onSuccess: useCallback((batch) => {
      onSuccess?.(batch);
      onClose?.();
    }, [onSuccess, onClose]),
    onClose,
  });

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    resetForm();
    onClose?.();
  }, [resetForm, onClose]);

  // ── Footer ────────────────────────────────────────────────────────────────
  const footer = (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        disabled={submitting}
        aria-label="Cancel editing"
      >
        Cancel
      </Button>

      <Button
        variant="primary"
        size="sm"
        iconLeft={
          submitting
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            : <Save className="w-3.5 h-3.5" aria-hidden="true" />
        }
        onClick={handleSubmit}
        disabled={submitting || initializing || Boolean(loadError)}
        aria-label={submitting ? 'Saving changes…' : 'Save changes'}
      >
        {submitting ? 'Saving…' : 'Save Changes'}
      </Button>
    </>
  );

  // ── Loading skeleton while the existing data loads ────────────────────────
  const bodyContent = (() => {
    if (initializing) {
      return (
        <div className="flex flex-col gap-5" aria-label="Loading batch data">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-32 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-9 rounded-md" />
              <Skeleton className="h-9 rounded-md" />
            </div>
            <Skeleton className="h-9 rounded-md" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-9 rounded-md" />
              <Skeleton className="h-9 rounded-md" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-9 rounded-md w-1/2" />
          </div>
        </div>
      );
    }

    if (loadError) {
      return (
        <div
          role="alert"
          className={cn(
            'flex items-start gap-3 px-4 py-5 rounded-lg',
            'bg-danger-bg border border-danger-DEFAULT/30 text-sm text-danger-DEFAULT'
          )}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Failed to load batch</span>
            <span className="text-xs">{loadError}</span>
          </div>
        </div>
      );
    }

    return (
      <BatchForm
        fields={fields}
        errors={errors}
        touched={touched}
        submitting={submitting}
        submitError={submitError}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );
  })();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Edit Batch"
      size="lg"
      footer={footer}
      closeOnBackdropClick={!submitting}
      closeOnEscape={!submitting}
    >
      {bodyContent}
    </Modal>
  );
};

BatchEditModal.displayName = 'BatchEditModal';

export { BatchEditModal };
export default BatchEditModal;
