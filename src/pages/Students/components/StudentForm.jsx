/**
 * StudentForm.jsx — Module 5.3
 *
 * Purely presentational 4-section form for create and edit.
 * All state/logic comes from useStudentForm via parent modals.
 *
 * Sections:
 *   1. Basic Information  (firstName, lastName, studentCode)
 *   2. Contact Details    (email, phone)
 *   3. Batch Assignment   (batchId in create; read-only in edit, enrollmentDate)
 *   4. Additional         (status, notes)
 */

import { User, Mail, BookOpen, FileText, AlertCircle } from 'lucide-react';
import { Input }    from '@components/ui/Input';
import { Select }   from '@components/ui/Select';
import { Textarea } from '@components/ui/Textarea';
import { cn }       from '@utils/componentUtils';
import { BATCH_STATUS_LABELS } from '@constants/batchStatus';

// ── Section header ────────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, children }) => (
  <section className="flex flex-col gap-4">
    <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
      <Icon className="w-4 h-4 text-accent-600 shrink-0" aria-hidden="true" />
      <h3 className="text-sm font-semibold text-textPrimary">{title}</h3>
    </div>
    {children}
  </section>
);

// ── Two-col grid ──────────────────────────────────────────────────────────────
const Row = ({ children }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
);

// ── Error banner ──────────────────────────────────────────────────────────────
const ErrorBanner = ({ message }) =>
  message ? (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
    >
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span>{message}</span>
    </div>
  ) : null;

// ── Status options ────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'active',   label: 'Active'   },
  { value: 'inactive', label: 'Inactive' },
];

// ── Helper: show error only after field touched ───────────────────────────────
const fe = (touched, errors, name) => (touched[name] ? errors[name] : undefined);

// ── Component ─────────────────────────────────────────────────────────────────
const StudentForm = ({
  fields,
  errors,
  touched,
  submitting,
  submitError,
  batches = [],
  batchesLoading = false,
  isEditMode = false,
  onChange,
  onBlur,
}) => {
  const batchOptions = batches.map((b) => ({
    value: b.id,
    label: `${b.batchName}${BATCH_STATUS_LABELS[b.status] ? ` (${BATCH_STATUS_LABELS[b.status]})` : ''}`,
  }));

  return (
    <div className="flex flex-col gap-6">
      <ErrorBanner message={submitError} />

      {/* 1 — Basic Information */}
      <Section icon={User} title="Basic Information">
        <Row>
          <Input
            label="First Name"
            placeholder="e.g. Arun"
            required
            value={fields.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            onBlur={() => onBlur('firstName')}
            errorMessage={fe(touched, errors, 'firstName')}
            disabled={submitting}
          />
          <Input
            label="Last Name"
            placeholder="e.g. Kumar"
            required
            value={fields.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            onBlur={() => onBlur('lastName')}
            errorMessage={fe(touched, errors, 'lastName')}
            disabled={submitting}
          />
        </Row>
        <Input
          label="Student Code"
          placeholder="e.g. NM2026001"
          required
          value={fields.studentCode}
          onChange={(e) => onChange('studentCode', e.target.value.toUpperCase())}
          onBlur={() => onBlur('studentCode')}
          errorMessage={fe(touched, errors, 'studentCode')}
          helperText="Globally unique — letters, digits, hyphens"
          disabled={submitting}
        />
      </Section>

      {/* 2 — Contact Details */}
      <Section icon={Mail} title="Contact Details">
        <Input
          type="email"
          label="Email Address"
          placeholder="e.g. arun.kumar@mail.com"
          required
          value={fields.email}
          onChange={(e) => onChange('email', e.target.value)}
          onBlur={() => onBlur('email')}
          errorMessage={fe(touched, errors, 'email')}
          disabled={submitting}
        />
        <Input
          type="tel"
          label="Phone Number"
          placeholder="e.g. 9876500001"
          required
          value={fields.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          onBlur={() => onBlur('phone')}
          errorMessage={fe(touched, errors, 'phone')}
          helperText="Min 7 digits"
          disabled={submitting}
        />
      </Section>

      {/* 3 — Batch Assignment */}
      <Section icon={BookOpen} title="Batch Assignment">
        {isEditMode ? (
          <div>
            <p className="text-xs font-medium text-textMuted uppercase tracking-wide mb-1">Batch</p>
            <p className="text-sm font-medium text-textPrimary">
              {batches.find((b) => b.id === fields.batchId)?.batchName ?? fields.batchId ?? '—'}
            </p>
            <p className={cn('text-xs text-textMuted mt-1')}>
              Batch reassignment is handled by an administrator.
            </p>
          </div>
        ) : (
          <Select
            label="Assign to Batch"
            placeholder="Select a batch…"
            required
            options={batchOptions}
            value={fields.batchId}
            onChange={(e) => onChange('batchId', e.target.value)}
            onBlur={() => onBlur('batchId')}
            errorMessage={fe(touched, errors, 'batchId')}
            loading={batchesLoading}
            disabled={submitting || batchesLoading}
            helperText="Only active and upcoming batches shown"
          />
        )}
        <Input
          type="date"
          label="Enrollment Date"
          required
          value={fields.enrollmentDate}
          onChange={(e) => onChange('enrollmentDate', e.target.value)}
          onBlur={() => onBlur('enrollmentDate')}
          errorMessage={fe(touched, errors, 'enrollmentDate')}
          helperText="The date this student joined the batch"
          disabled={submitting}
        />
      </Section>

      {/* 4 — Additional */}
      <Section icon={FileText} title="Additional">
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={fields.status}
          onChange={(e) => onChange('status', e.target.value)}
          onBlur={() => onBlur('status')}
          errorMessage={fe(touched, errors, 'status')}
          disabled={submitting}
        />
        <Textarea
          label="Notes"
          placeholder="Optional notes about this student…"
          value={fields.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={3}
          disabled={submitting}
        />
      </Section>
    </div>
  );
};

export { StudentForm };
export default StudentForm;
