/**
 * BatchForm.jsx
 * Single reusable form for Create Batch and Edit Batch workflows.
 *
 * Blueprint: Sections 4.1, 7.2–7.3 (design spec), 8.2 (Batch entity), 11.3
 * Module: 4.3
 *
 * Used by:
 *   BatchCreateModal
 *   BatchEditModal
 *
 * Architecture:
 *   - Presentational — receives fields/errors/handlers via props from useBatchForm.
 *   - No data-fetching, no service calls.
 *   - Divided into clearly labeled sections for progressive disclosure.
 *
 * Sections:
 *   1. Basic Information   — Batch Name, Batch Code, Trainer Name
 *   2. Schedule            — Start Date, End Date, Status
 *   3. Capacity            — Maximum Students
 *   4. Description & Notes — Description, Notes
 */

import { CalendarDays, Info, Users, FileText, AlertCircle } from 'lucide-react';
import { Input }     from '@components/ui/Input';
import { Select }    from '@components/ui/Select';
import { Textarea }  from '@components/ui/Textarea';
import { cn }        from '@utils/componentUtils';
import {
  V1_BATCH_STATUS_OPTIONS,
  BATCH_STATUS_LABELS,
} from '@constants/batchStatus';
import {
  MAX_BATCH_DESCRIPTION_LENGTH,
} from '@constants/validation';

// ── Section wrapper ───────────────────────────────────────────────────────────

const FormSection = ({ icon: Icon, title, children }) => (
  <section className="flex flex-col gap-4">
    <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
      <Icon className="w-4 h-4 text-accent-600 shrink-0" aria-hidden="true" />
      <h3 className="text-sm font-semibold text-textPrimary leading-none">
        {title}
      </h3>
    </div>
    {children}
  </section>
);

// ── Two-column grid helper ────────────────────────────────────────────────────

const FieldRow = ({ children }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {children}
  </div>
);

// ── Inline field-level error (used for cross-field submit error) ──────────────

const SubmitErrorBanner = ({ message }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg',
        'bg-danger-bg border border-danger-DEFAULT/30',
        'text-sm text-danger-DEFAULT'
      )}
    >
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};

// ── BatchForm ─────────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {object}   props.fields        — form field values from useBatchForm
 * @param {object}   props.errors        — field error messages
 * @param {object}   props.touched       — touched flag per field
 * @param {boolean}  props.submitting    — disables form while submitting
 * @param {string}   [props.submitError] — top-level service / API error
 * @param {function} props.onChange      — (name, value) => void
 * @param {function} props.onBlur        — (name) => void
 */
const BatchForm = ({
  fields,
  errors,
  touched,
  submitting,
  submitError,
  onChange,
  onBlur,
}) => {
  /**
   * Helper: returns the errorMessage prop for a field only if it has been
   * touched — prevents showing errors before the user has interacted.
   */
  const fieldError = (name) =>
    touched[name] ? errors[name] : undefined;

  const handleInputChange = (name) => (e) => onChange(name, e.target.value);
  const handleSelectChange = (name) => (e) => onChange(name, e.target.value);
  const handleBlurField = (name) => () => onBlur(name);

  return (
    <div className="flex flex-col gap-6" aria-label="Batch form">

      {/* ── Submit Error Banner ────────────────────────────────────────────── */}
      <SubmitErrorBanner message={submitError} />

      {/* ── Section 1: Basic Information ──────────────────────────────────── */}
      <FormSection icon={Info} title="Basic Information">
        <FieldRow>
          <Input
            label="Batch Name"
            placeholder="e.g. Batch B – Apr 2026"
            value={fields.batchName}
            onChange={handleInputChange('batchName')}
            onBlur={handleBlurField('batchName')}
            errorMessage={fieldError('batchName')}
            required
            disabled={submitting}
            aria-required="true"
          />
          <Input
            label="Batch Code"
            placeholder="e.g. NM-B2-2026"
            value={fields.batchCode}
            onChange={handleInputChange('batchCode')}
            onBlur={handleBlurField('batchCode')}
            errorMessage={fieldError('batchCode')}
            helperText="Unique identifier — auto-uppercased on save"
            required
            disabled={submitting}
            aria-required="true"
          />
        </FieldRow>

        <Input
          label="Trainer Name"
          placeholder="e.g. Trainer One"
          value={fields.trainerName}
          onChange={handleInputChange('trainerName')}
          onBlur={handleBlurField('trainerName')}
          errorMessage={fieldError('trainerName')}
          required
          disabled={submitting}
          aria-required="true"
        />
      </FormSection>

      {/* ── Section 2: Schedule ───────────────────────────────────────────── */}
      <FormSection icon={CalendarDays} title="Schedule">
        <FieldRow>
          <Input
            type="date"
            label="Start Date"
            value={fields.startDate}
            onChange={handleInputChange('startDate')}
            onBlur={handleBlurField('startDate')}
            errorMessage={fieldError('startDate')}
            required
            disabled={submitting}
            aria-required="true"
            max={fields.endDate || undefined}
          />
          <Input
            type="date"
            label="End Date"
            value={fields.endDate}
            onChange={handleInputChange('endDate')}
            onBlur={handleBlurField('endDate')}
            errorMessage={fieldError('endDate')}
            required
            disabled={submitting}
            aria-required="true"
            min={fields.startDate || undefined}
          />
        </FieldRow>

        <Select
          label="Status"
          value={fields.status}
          onChange={handleSelectChange('status')}
          onBlur={handleBlurField('status')}
          errorMessage={fieldError('status')}
          options={V1_BATCH_STATUS_OPTIONS}
          placeholder="Select status…"
          required
          disabled={submitting}
          aria-required="true"
        />
      </FormSection>

      {/* ── Section 3: Capacity ───────────────────────────────────────────── */}
      <FormSection icon={Users} title="Capacity">
        <Input
          type="number"
          label="Maximum Students"
          placeholder="e.g. 30"
          value={String(fields.maxStudents)}
          onChange={(e) => {
            const val = e.target.value;
            onChange('maxStudents', val === '' ? '' : Number(val));
          }}
          onBlur={handleBlurField('maxStudents')}
          errorMessage={fieldError('maxStudents')}
          helperText="Maximum number of students allowed in this batch"
          disabled={submitting}
          inputClassName="w-full"
        />
      </FormSection>

      {/* ── Section 4: Description & Notes ───────────────────────────────── */}
      <FormSection icon={FileText} title="Description & Notes">
        <Textarea
          label="Description"
          placeholder="Brief summary of this batch — module coverage, goals, etc."
          value={fields.description}
          onChange={handleInputChange('description')}
          onBlur={handleBlurField('description')}
          errorMessage={fieldError('description')}
          maxLength={MAX_BATCH_DESCRIPTION_LENGTH}
          rows={3}
          disabled={submitting}
        />

        <Textarea
          label="Internal Notes"
          placeholder="Optional internal notes (not visible to students)"
          value={fields.notes}
          onChange={handleInputChange('notes')}
          onBlur={handleBlurField('notes')}
          rows={2}
          disabled={submitting}
          helperText="For admin reference only"
        />
      </FormSection>

    </div>
  );
};

BatchForm.displayName = 'BatchForm';

export { BatchForm };
export default BatchForm;
