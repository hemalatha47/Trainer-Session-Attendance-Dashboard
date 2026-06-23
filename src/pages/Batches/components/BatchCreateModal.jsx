/**
 * BatchCreateModal.jsx
 * Modal dialog for creating a new batch.
 *
 * Blueprint: Sections 4.1, 6.3, 7.3, 11.3 (Modal component)
 * Module: 4.3
 *
 * Architecture:
 *   BatchListPage
 *     → BatchCreateModal
 *       → Modal (overlay component)
 *       → BatchForm (presentational form)
 *       → useBatchForm (form logic hook — create mode)
 *
 * On success:
 *   1. Calls props.onSuccess(newBatch) so the parent can refresh/add the batch.
 *   2. Fires a toast notification (caller's responsibility via onSuccess).
 *   3. Closes the modal.
 */

import { useCallback }          from 'react';
import { PlusCircle, Loader2 }  from 'lucide-react';
import { Modal }                from '@components/overlay/Modal';
import { Button }               from '@components/ui/Button';
import { BatchForm }            from './BatchForm';
import { useBatchForm }         from '@hooks/useBatchForm';

/**
 * @param {object}   props
 * @param {boolean}  props.isOpen       — controlled open state
 * @param {function} props.onClose      — called to close the modal
 * @param {function} [props.onSuccess]  — called with the newly created batch
 */
const BatchCreateModal = ({ isOpen, onClose, onSuccess }) => {

  // ── Form hook wired to create mode ────────────────────────────────────────
  const {
    fields,
    errors,
    touched,
    submitting,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useBatchForm({
    onSuccess: useCallback((batch) => {
      onSuccess?.(batch);
      resetForm();
      onClose?.();
    }, [onSuccess, onClose]), // resetForm is stable from the hook
    onClose,
  });

  // ── Cancel — reset form state ─────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    resetForm();
    onClose?.();
  }, [resetForm, onClose]);

  // ── Footer actions ────────────────────────────────────────────────────────
  const footer = (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        disabled={submitting}
        aria-label="Cancel and close modal"
      >
        Cancel
      </Button>

      <Button
        variant="primary"
        size="sm"
        iconLeft={
          submitting
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            : <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
        }
        onClick={handleSubmit}
        disabled={submitting}
        aria-label={submitting ? 'Creating batch…' : 'Create batch'}
      >
        {submitting ? 'Creating…' : 'Create Batch'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Create New Batch"
      size="lg"
      footer={footer}
      closeOnBackdropClick={!submitting}
      closeOnEscape={!submitting}
    >
      <BatchForm
        fields={fields}
        errors={errors}
        touched={touched}
        submitting={submitting}
        submitError={submitError}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </Modal>
  );
};

BatchCreateModal.displayName = 'BatchCreateModal';

export { BatchCreateModal };
export default BatchCreateModal;
