/**
 * useAttendanceSession.js
 * Custom hook for the Attendance Session Setup workflow (Module 6.2).
 *
 * Blueprint Section 11.2 — hooks encapsulate data-fetching and business
 * workflow logic; pages call hooks, hooks call services.
 *
 * API:
 *  {
 *    session,         // { batchId, date, mode, existingCount, batch, trainerInfo }
 *    validation,      // { isValid, error: string|null, checking: boolean }
 *    availableBatches,// Batch[] for the selector
 *    loading,         // true while fetching batch list
 *    error,           // string | null — batch list load error
 *    setBatch,        // (batchId: string) => void
 *    setDate,         // (date: string)    => void
 *    validate,        // () => Promise<boolean> — triggers validation
 *    refresh,         // () => void — reload batch list
 *  }
 */

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  getAvailableBatches,
  validateSession,
  checkExistingSession,
  getTrainerInfo,
} from '@services/attendanceSessionService';
import { getBatchById }    from '@services/batchService';
import { useAuthContext }  from '@context/AuthContext';
import { useAppContext }   from '@context/AppContext';
import { getToday }        from '@utils/dateUtils';

// ── Default state shapes ──────────────────────────────────────────────────────

const DEFAULT_SESSION = {
  batchId:       '',
  date:          '',
  mode:          'create',
  existingCount: 0,
  batch:         null,
  trainerInfo:   null,
};

const DEFAULT_VALIDATION = {
  isValid:  false,
  error:    null,
  checking: false,
};

// ── Hook ──────────────────────────────────────────────────────────────────────

const useAttendanceSession = () => {
  const { currentUser }   = useAuthContext();
  const { activeBatchId } = useAppContext();

  // ── Batch list ──────────────────────────────────────────────────────────────
  const [availableBatches, setAvailableBatches] = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error,   setError]                     = useState(null);
  const [tick,    setTick]                       = useState(0);

  // ── Session state ───────────────────────────────────────────────────────────
  const [session,    setSession]    = useState(() => ({
    ...DEFAULT_SESSION,
    // Pre-select activeBatchId from AppContext if present
    batchId: activeBatchId ?? '',
    date:    getToday(),
  }));
  const [validation, setValidation] = useState(DEFAULT_VALIDATION);

  // Ref to cancel async ops on unmount
  const cancelledRef = useRef(false);
  useEffect(() => {
    cancelledRef.current = false;
    return () => { cancelledRef.current = true; };
  }, []);

  // ── Fetch available batches ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const res = await getAvailableBatches();

      if (cancelled) return;

      if (res.success) {
        setAvailableBatches(res.data ?? []);
      } else {
        setError(res.error?.message ?? 'Failed to load batches');
        setAvailableBatches([]);
      }
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [tick]);

  // ── Resolve full batch object when batchId changes ─────────────────────────
  useEffect(() => {
    if (!session.batchId) {
      setSession((prev) => ({
        ...prev,
        batch:       null,
        trainerInfo: null,
        mode:        'create',
        existingCount: 0,
      }));
      setValidation(DEFAULT_VALIDATION);
      return;
    }

    let cancelled = false;

    const resolveBatch = async () => {
      const res = await getBatchById(session.batchId);
      if (cancelled) return;

      if (res.success && res.data) {
        const batch       = res.data;
        const trainerInfo = getTrainerInfo(batch, currentUser);
        setSession((prev) => ({ ...prev, batch, trainerInfo }));
      } else {
        setSession((prev) => ({ ...prev, batch: null, trainerInfo: null }));
      }
    };

    resolveBatch();
    return () => { cancelled = true; };
  }, [session.batchId, currentUser]);

  // ── Auto-validate when both batchId and date are present ──────────────────
  // Uses debounce pattern to avoid firing on every keystroke.
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!session.batchId || !session.date) {
      setValidation(DEFAULT_VALIDATION);
      return;
    }

    // Set checking = true immediately for responsive UI feedback
    setValidation((prev) => ({ ...prev, checking: true, error: null }));

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const res = await validateSession(session.batchId, session.date);

      if (cancelledRef.current) return;

      if (res.success && res.data) {
        const { mode, existingCount } = res.data;
        setSession((prev) => ({ ...prev, mode, existingCount }));
        setValidation({ isValid: true, error: null, checking: false });
      } else {
        setSession((prev) => ({ ...prev, mode: 'create', existingCount: 0 }));
        setValidation({
          isValid:  false,
          error:    res.error?.message ?? 'Session validation failed',
          checking: false,
        });
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [session.batchId, session.date]);

  // ── Setters ─────────────────────────────────────────────────────────────────

  const setBatch = useCallback((batchId) => {
    setSession((prev) => ({
      ...DEFAULT_SESSION,
      batchId,
      date: prev.date || getToday(),
    }));
    setValidation(DEFAULT_VALIDATION);
  }, []);

  const setDate = useCallback((date) => {
    setSession((prev) => ({ ...prev, date }));
    setValidation(DEFAULT_VALIDATION);
  }, []);

  // ── Explicit validate (for Continue button) ────────────────────────────────

  const validate = useCallback(async () => {
    if (!session.batchId || !session.date) {
      setValidation({
        isValid:  false,
        error:    !session.batchId
          ? 'Please select a batch'
          : 'Please select a date',
        checking: false,
      });
      return false;
    }

    setValidation((prev) => ({ ...prev, checking: true }));

    const res = await validateSession(session.batchId, session.date);

    if (cancelledRef.current) return false;

    if (res.success && res.data) {
      const { mode, existingCount } = res.data;
      setSession((prev) => ({ ...prev, mode, existingCount }));
      setValidation({ isValid: true, error: null, checking: false });
      return true;
    } else {
      setSession((prev) => ({ ...prev, mode: 'create', existingCount: 0 }));
      setValidation({
        isValid:  false,
        error:    res.error?.message ?? 'Validation failed',
        checking: false,
      });
      return false;
    }
  }, [session.batchId, session.date]);

  const refresh = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  // ── Batch options for Select component ────────────────────────────────────

  const batchOptions = useMemo(() =>
    availableBatches.map((b) => ({
      value: b.id,
      label: `${b.batchName} (${b.batchCode})`,
    })),
    [availableBatches]
  );

  return {
    session,
    validation,
    availableBatches,
    batchOptions,
    loading,
    error,
    setBatch,
    setDate,
    validate,
    refresh,
  };
};

export default useAttendanceSession;
