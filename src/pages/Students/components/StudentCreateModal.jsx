/**
 * StudentCreateModal.jsx — Module 5.3
 *
 * Open modal → empty form → submit → createStudent → toast → reset → close → refresh
 */

import { useCallback, useEffect } from 'react';
import { PlusCircle, Loader2 }    from 'lucide-react';
import { Modal }                  from '@components/overlay/Modal';
import { Button }                 from '@components/ui/Button';
import { StudentForm }            from '../components/StudentForm';
import { useStudentForm }         from '@hooks/useStudentForm';
import { useToast }               from '@hooks/useToast';

const StudentCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();

  const {
    fields, errors, touched, submitting, submitError,
    batches, batchesLoading,
    handleChange, handleBlur, handleSubmit, resetForm,
  } = useStudentForm({
    onSuccess: (student) => {
      toast.success(`"${student.firstName} ${student.lastName}" added successfully`);
      onSuccess?.(student);
      onClose?.();
    },
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]); // resetForm is stable (useCallback with no deps that change)

  const handleCancel = useCallback(() => {
    resetForm();
    onClose?.();
  }, [resetForm, onClose]);

  const footer = (
    <>
      <Button variant="ghost" size="sm" onClick={handleCancel} disabled={submitting}>
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
        aria-label={submitting ? 'Creating student…' : 'Add student'}
      >
        {submitting ? 'Creating…' : 'Add Student'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Add New Student"
      size="lg"
      footer={footer}
      closeOnBackdropClick={!submitting}
      closeOnEscape={!submitting}
    >
      <StudentForm
        fields={fields}
        errors={errors}
        touched={touched}
        submitting={submitting}
        submitError={submitError}
        batches={batches}
        batchesLoading={batchesLoading}
        isEditMode={false}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </Modal>
  );
};

StudentCreateModal.displayName = 'StudentCreateModal';
export { StudentCreateModal };
export default StudentCreateModal;
