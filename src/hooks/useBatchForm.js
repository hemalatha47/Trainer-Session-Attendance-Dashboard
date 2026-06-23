/**
 * useBatchForm.js
 * Reusable form hook for Create Batch and Edit Batch workflows.
 *
 * Blueprint: Sections 4.1, 8.2, 9.4 (validation), 11.2 (hooks), 13 (rules)
 * Module: 4.3
 *
 * Architecture:
 *   BatchCreateModal / BatchEditModal
 *     → useBatchForm (this hook)
 *       → batchService.createBatch() / batchService.updateBatch()
 *
 * Supports:
 *   - Create mode  (batchId = undefined)
 *   - Edit mode    (batchId = string)
 *
 * Returns a stable API so both modals share identical logic with no duplication.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  createBatch,
  updateBatch,
  getBatchById,
} from '@services/batchService';
import {
  MIN_BATCH_NAME_LENGTH,
  MAX_BATCH_NAME_LENGTH,
  MIN_BATCH_CODE_LENGTH,
  MAX_BATCH_CODE_LENGTH,
  MAX_BATCH_DESCRIPTION_LENGTH,
  DATE_REGEX,
} from '@constants/validation';
import { BATCH_STATUS, V1_BATCH_STATUSES } from '@constants/batchStatus';

// ── Empty form state ──────────────────────────────────────────────────────────

const EMPTY_FORM = {
  batchName:    '',
  batchCode:    '',
  trainerName:  '',
  description:  '',
  startDate:    '',
  endDate:      '',
  status:       BATCH_STATUS.ACTIVE,
  maxStudents:  30,
  notes:        '',
};

// ── Field-level validators ────────────────────────────────────────────────────

/**
 * Validates all form fields.
 * Returns an errors object; empty object = valid.
 *
 * @param {object} fields
 * @param {boolean} isCreate
 * @returns {Record<string, string>}
 */
const validateFields = (fields, isCreate) => {
  const errors = {};
  const {
    batchName,
    batchCode,
    trainerName,
    startDate,
    endDate,
    status,
    maxStudents,
  } = fields;

  // ── batchName ──────────────────────────────────────────────────────────────
  if (!batchName || !batchName.trim()) {
    errors.batchName = 'Batch name is required';
  } else if (batchName.trim().length < MIN_BATCH_NAME_LENGTH) {
    errors.batchName = `Batch name must be at least ${MIN_BATCH_NAME_LENGTH} characters`;
  } else if (batchName.trim().length > MAX_BATCH_NAME_LENGTH) {
    errors.batchName = `Batch name must not exceed ${MAX_BATCH_NAME_LENGTH} characters`;
  }

  // ── batchCode ──────────────────────────────────────────────────────────────
  if (!batchCode || !batchCode.trim()) {
    errors.batchCode = 'Batch code is required';
  } else if (batchCode.trim().length < MIN_BATCH_CODE_LENGTH) {
    errors.batchCode = `Batch code must be at least ${MIN_BATCH_CODE_LENGTH} characters`;
  } else if (batchCode.trim().length > MAX_BATCH_CODE_LENGTH) {
    errors.batchCode = `Batch code must not exceed ${MAX_BATCH_CODE_LENGTH} characters`;
  }

  // ── trainerName ────────────────────────────────────────────────────────────
  if (!trainerName || !trainerName.trim()) {
    errors.trainerName = 'Trainer name is required';
  }

  // ── startDate ──────────────────────────────────────────────────────────────
  if (!startDate) {
    errors.startDate = 'Start date is required';
  } else if (!DATE_REGEX.test(startDate)) {
    errors.startDate = 'Enter a valid date (YYYY-MM-DD)';
  }

  // ── endDate ────────────────────────────────────────────────────────────────
  if (!endDate) {
    errors.endDate = 'End date is required';
  } else if (!DATE_REGEX.test(endDate)) {
    errors.endDate = 'Enter a valid date (YYYY-MM-DD)';
  } else if (startDate && endDate < startDate) {
    errors.endDate = 'End date must be on or after start date';
  }

  // ── status ─────────────────────────────────────────────────────────────────
  if (!status || !V1_BATCH_STATUSES.includes(status)) {
    errors.status = 'Please select a valid status';
  }

  // ── maxStudents ────────────────────────────────────────────────────────────
  const cap = Number(maxStudents);
  if (isNaN(cap) || cap < 1) {
    errors.maxStudents = 'Capacity must be at least 1';
  } else if (cap > 1000) {
    errors.maxStudents = 'Capacity must not exceed 1,000';
  }

  return errors;
};

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @param {object}   options
 * @param {string}   [options.batchId]     — if provided, runs in EDIT mode
 * @param {function} [options.onSuccess]   — called with the saved batch object
 * @param {function} [options.onClose]     — called when form should close
 *
 * @returns {{
 *   fields:       object,
 *   errors:       Record<string, string>,
 *   touched:      Record<string, boolean>,
 *   submitting:   boolean,
 *   submitError:  string | null,
 *   loadError:    string | null,
 *   initializing: boolean,
 *   isDirty:      boolean,
 *   isEditMode:   boolean,
 *   handleChange: (name: string, value: string|number) => void,
 *   handleBlur:   (name: string) => void,
 *   handleSubmit: () => Promise<void>,
 *   resetForm:    () => void,
 * }}
 */
const useBatchForm = ({ batchId, onSuccess, onClose } = {}) => {
  const isEditMode = Boolean(batchId);

  const [fields,       setFields]       = useState({ ...EMPTY_FORM });
  const [initialData,  setInitialData]  = useState({ ...EMPTY_FORM });
  const [errors,       setErrors]       = useState({});
  const [touched,      setTouched]      = useState({});
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState(null);
  const [loadError,    setLoadError]    = useState(null);
  const [initializing, setInitializing] = useState(isEditMode); // true while loading existing data

  // ── Load existing batch data in edit mode ──────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;

    const load = async () => {
      setInitializing(true);
      setLoadError(null);

      const res = await getBatchById(batchId);

      if (cancelled) return;

      if (res.success && res.data) {
        const d = res.data;
        const populated = {
          batchName:   d.batchName   ?? '',
          batchCode:   d.batchCode   ?? '',
          trainerName: d.trainerName ?? '',
          description: d.description ?? '',
          startDate:   d.startDate   ?? '',
          endDate:     d.endDate     ?? '',
          status:      d.status      ?? BATCH_STATUS.ACTIVE,
          maxStudents: d.maxStudents  ?? 30,
          notes:       d.notes       ?? '',
        };
        setFields(populated);
        setInitialData(populated);
      } else {
        setLoadError(res.error?.message ?? 'Failed to load batch data');
      }

      setInitializing(false);
    };

    load();
    return () => { cancelled = true; };
  }, [batchId, isEditMode]);

  // ── Field change handler ───────────────────────────────────────────────────
  const handleChange = useCallback((name, value) => {
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field on change
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  // ── Field blur handler — validate on blur ──────────────────────────────────
  const handleBlur = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  // ── isDirty check ──────────────────────────────────────────────────────────
  const isDirty = Object.keys(EMPTY_FORM).some(
    (key) => String(fields[key] ?? '') !== String(initialData[key] ?? '')
  );

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    // Mark all fields touched so all errors become visible
    const allTouched = Object.keys(EMPTY_FORM).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {}
    );
    setTouched(allTouched);

    // Validate
    const fieldErrors = validateFields(fields, !isEditMode);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      batchName:   fields.batchName.trim(),
      batchCode:   fields.batchCode.trim(),
      trainerName: fields.trainerName.trim(),
      description: fields.description.trim(),
      startDate:   fields.startDate,
      endDate:     fields.endDate,
      status:      fields.status,
      maxStudents: Number(fields.maxStudents),
      notes:       fields.notes?.trim() || '',
    };

    const res = isEditMode
      ? await updateBatch(batchId, payload)
      : await createBatch(payload);

    setSubmitting(false);

    if (res.success) {
      onSuccess?.(res.data);
    } else {
      // Surface the service error (handles DUPLICATE_CODE etc.)
      setSubmitError(res.error?.message ?? 'An unexpected error occurred');
    }
  }, [fields, isEditMode, batchId, onSuccess]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setFields(isEditMode ? { ...initialData } : { ...EMPTY_FORM });
    setErrors({});
    setTouched({});
    setSubmitError(null);
  }, [isEditMode, initialData]);

  return {
    fields,
    errors,
    touched,
    submitting,
    submitError,
    loadError,
    initializing,
    isDirty,
    isEditMode,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
};

export { useBatchForm };
export default useBatchForm;
