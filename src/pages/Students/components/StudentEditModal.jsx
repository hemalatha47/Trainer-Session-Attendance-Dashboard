/**
 * StudentEditModal.jsx — Module 5.3
 *
 * Open modal → load student → edit form → updateStudent → toast → close → refresh
 */

import { useCallback }                  from 'react';
import { Save, Loader2, AlertTriangle } from 'lucide-react';
import { Modal }                        from '@components/overlay/Modal';
import { Button }                       from '@components/ui/Button';
import { Skeleton }                     from '@components/feedback/Skeleton';
import { StudentForm }                  from '../components/StudentForm';
import { useStudentForm }               from '@hooks/useStudentForm';
import { useToast }                     from '@hooks/useToast';
import { cn }                           from '@utils/componentUtils';

const StudentEditModal = ({ isOpen, onClose, studentId, onSuccess }) => {
  const toast = useToast();

  const {
    fields, errors, touched, submitting, submitError, loadError,
    initializing, isDirty, batches, batchesLoading,
    handleChange, handleBlur, handleSubmit, resetForm,
  } = useStudentForm({
    studentId,
    onSuccess: (student) => {
      toast.success(`"${student.firstName} ${student.lastName}" updated successfully`);
      onSuccess?.(student);
      onClose?.();
    },
  });

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
            : <Save className="w-3.5 h-3.5" aria-hidden="true" />
        }
        onClick={handleSubmit}
        disabled={submitting || initializing || !isDirty}
        aria-label={submitting ? 'Saving…' : 'Save changes'}
      >
        {submitting ? 'Saving…' : 'Save Changes'}
      </Button>
    </>
  );

  const content = loadError ? (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 px-4 py-4 rounded-lg',
        'bg-red-50 border border-red-200 text-sm text-red-700'
      )}
    >
      <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{loadError}</span>
    </div>
  ) : initializing ? (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading student data">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton height="h-3" width="w-24" />
          <Skeleton height="h-9" />
        </div>
      ))}
    </div>
  ) : (
    <StudentForm
      fields={fields}
      errors={errors}
      touched={touched}
      submitting={submitting}
      submitError={submitError}
      batches={batches}
      batchesLoading={batchesLoading}
      isEditMode={true}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Edit Student"
      size="lg"
      footer={!loadError ? footer : undefined}
      closeOnBackdropClick={!submitting}
      closeOnEscape={!submitting}
    >
      {content}
    </Modal>
  );
};

StudentEditModal.displayName = 'StudentEditModal';
export { StudentEditModal };
export default StudentEditModal;
