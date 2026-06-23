/**
 * useStudentForm.js
 * Reusable form hook for Create Student and Edit Student (Module 5.3).
 *
 * Architecture mirrors useBatchForm.js:
 *   StudentCreateModal / StudentEditModal
 *     → useStudentForm (this)
 *       → studentService.createStudent() / updateStudent()
 *
 * Callback stability: onSuccess is stored in a ref so handleSubmit's
 * useCallback dep array stays stable and never creates stale closures.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createStudent, updateStudent, getStudentById } from '@services/studentService';
import { getBatchesByStatuses }                          from '@services/batchService';
import { BATCH_STATUS }                                  from '@constants/batchStatus';
import {
  EMAIL_REGEX,
  PHONE_REGEX,
  MIN_STUDENT_NAME_LENGTH,
  MAX_STUDENT_NAME_LENGTH,
  MIN_STUDENT_CODE_LENGTH,
  MAX_STUDENT_CODE_LENGTH,
  MAX_PHONE_LENGTH,
  DATE_REGEX,
} from '@constants/validation';

// ── Empty form ────────────────────────────────────────────────────────────────
const EMPTY_FORM = Object.freeze({
  firstName:      '',
  lastName:       '',
  studentCode:    '',
  email:          '',
  phone:          '',
  batchId:        '',
  enrollmentDate: '',
  status:         'active',
  notes:          '',
});

// ── Validator ─────────────────────────────────────────────────────────────────
const validateFields = (fields, requireBatch) => {
  const errors = {};
  const { firstName, lastName, studentCode, email, phone, batchId, enrollmentDate, status } = fields;

  if (!firstName?.trim())
    errors.firstName = 'First name is required';
  else if (firstName.trim().length < MIN_STUDENT_NAME_LENGTH)
    errors.firstName = `Min ${MIN_STUDENT_NAME_LENGTH} characters`;
  else if (firstName.trim().length > MAX_STUDENT_NAME_LENGTH)
    errors.firstName = `Max ${MAX_STUDENT_NAME_LENGTH} characters`;

  if (!lastName?.trim())
    errors.lastName = 'Last name is required';
  else if (lastName.trim().length < MIN_STUDENT_NAME_LENGTH)
    errors.lastName = `Min ${MIN_STUDENT_NAME_LENGTH} characters`;
  else if (lastName.trim().length > MAX_STUDENT_NAME_LENGTH)
    errors.lastName = `Max ${MAX_STUDENT_NAME_LENGTH} characters`;

  if (!studentCode?.trim())
    errors.studentCode = 'Student code is required';
  else if (studentCode.trim().length < MIN_STUDENT_CODE_LENGTH)
    errors.studentCode = `Min ${MIN_STUDENT_CODE_LENGTH} characters`;
  else if (studentCode.trim().length > MAX_STUDENT_CODE_LENGTH)
    errors.studentCode = `Max ${MAX_STUDENT_CODE_LENGTH} characters`;

  if (!email?.trim())
    errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(email.trim()))
    errors.email = 'Enter a valid email address';

  if (!phone?.trim())
    errors.phone = 'Phone number is required';
  else if (!PHONE_REGEX.test(phone.trim()))
    errors.phone = 'Enter a valid phone number';
  else if (phone.trim().length > MAX_PHONE_LENGTH)
    errors.phone = `Max ${MAX_PHONE_LENGTH} digits`;

  if (requireBatch && !batchId?.trim())
    errors.batchId = 'Please select a batch';

  if (!enrollmentDate)
    errors.enrollmentDate = 'Enrollment date is required';
  else if (!DATE_REGEX.test(enrollmentDate))
    errors.enrollmentDate = 'Use format YYYY-MM-DD';

  if (!['active', 'inactive'].includes(status))
    errors.status = 'Invalid status';

  return errors;
};

// ── Hook ──────────────────────────────────────────────────────────────────────
const useStudentForm = ({ studentId, onSuccess } = {}) => {
  const isEditMode = Boolean(studentId);

  // Store onSuccess in a ref — avoids stale closure without listing it in deps
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);

  const [fields,        setFields]        = useState({ ...EMPTY_FORM });
  const [initialData,   setInitialData]   = useState({ ...EMPTY_FORM });
  const [errors,        setErrors]        = useState({});
  const [touched,       setTouched]       = useState({});
  const [submitting,    setSubmitting]    = useState(false);
  const [submitError,   setSubmitError]   = useState(null);
  const [loadError,     setLoadError]     = useState(null);
  const [initializing,  setInitializing]  = useState(isEditMode);
  const [batches,       setBatches]       = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);

  // ── Load assignable batches ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setBatchesLoading(true);
      const res = await getBatchesByStatuses([BATCH_STATUS.ACTIVE, BATCH_STATUS.UPCOMING]);
      if (!cancelled) {
        if (res.success) setBatches(res.data ?? []);
        setBatchesLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Load student in edit mode ─────────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;

    const load = async () => {
      setInitializing(true);
      setLoadError(null);
      const res = await getStudentById(studentId);
      if (cancelled) return;

      if (res.success && res.data) {
        const d = res.data;
        const populated = {
          firstName:      d.firstName      ?? '',
          lastName:       d.lastName       ?? '',
          studentCode:    d.studentCode    ?? '',
          email:          d.email          ?? '',
          phone:          d.phone          ?? '',
          batchId:        d.batchId        ?? '',
          enrollmentDate: d.enrollmentDate ?? '',
          status:         d.status         ?? 'active',
          notes:          d.notes          ?? '',
        };
        setFields(populated);
        setInitialData(populated);
      } else {
        setLoadError(res.error?.message ?? 'Failed to load student');
      }
      setInitializing(false);
    };

    load();
    return () => { cancelled = true; };
  }, [studentId, isEditMode]);

  // ── Field handlers ────────────────────────────────────────────────────────
  const handleChange = useCallback((name, value) => {
    setFields((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleBlur = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  // ── isDirty ───────────────────────────────────────────────────────────────
  const isDirty = Object.keys(EMPTY_FORM).some(
    (k) => String(fields[k] ?? '') !== String(initialData[k] ?? '')
  );

  // ── Submit — uses onSuccessRef so this useCallback is perfectly stable ────
  const handleSubmit = useCallback(async () => {
    const allTouched = Object.keys(EMPTY_FORM).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);

    // Read fields via functional updater to get latest value
    let latestFields;
    setFields((prev) => { latestFields = prev; return prev; });

    const fieldErrors = validateFields(latestFields, !isEditMode);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      firstName:      latestFields.firstName.trim(),
      lastName:       latestFields.lastName.trim(),
      studentCode:    latestFields.studentCode.trim().toUpperCase(),
      email:          latestFields.email.trim(),
      phone:          latestFields.phone.trim(),
      batchId:        latestFields.batchId,
      enrollmentDate: latestFields.enrollmentDate,
      status:         latestFields.status,
      notes:          latestFields.notes?.trim() || '',
    };

    const res = isEditMode
      ? await updateStudent(studentId, payload)
      : await createStudent(payload);

    setSubmitting(false);

    if (res.success) {
      onSuccessRef.current?.(res.data);
    } else {
      setSubmitError(res.error?.message ?? 'An unexpected error occurred. Please try again.');
    }
  }, [isEditMode, studentId]); // ← stable: no onSuccess, no fields in deps

  // ── Reset ─────────────────────────────────────────────────────────────────
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
    batches,
    batchesLoading,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
};

export { useStudentForm };
export default useStudentForm;
