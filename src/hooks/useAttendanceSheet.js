/**
 * useAttendanceSheet.js
 * Custom hook for the Attendance Sheet core workflow.
 *
 * Module 6.4 — Bulk Attendance Actions (EXTENDED)
 * Blueprint Sections: 4.3, 9.1–9.4, 11.2
 *
 * Module 6.3 responsibilities (preserved):
 *  - Load active students for the selected batch.
 *  - Pre-fill existing attendance statuses (edit mode) or default to 'present'.
 *  - Provide toggle, notes, and reset handlers.
 *  - Track dirty state (any unsaved change).
 *  - Expose live counters: present / absent / pending.
 *
 * Module 6.4 additions:
 *  - Row model extended with `selected: boolean`.
 *  - Centralized bulk action engine:
 *      selectAll()              — selects all students
 *      clearSelection()         — deselects all students
 *      toggleRowSelection(id)   — toggles one student's selection
 *      markAllPresent()         — marks every student present, sets dirty
 *      markAllAbsent()          — marks every student absent, sets dirty
 *      markSelectedPresent()    — marks selected students present, clears selection, sets dirty
 *      markSelectedAbsent()     — marks selected students absent, clears selection, sets dirty
 *      resetAll()               — reverts to initial values, clears selection
 *  - Selection counters in returned object:
 *      counters.selected        — number of selected rows
 *      counters.allSelected     — all filtered rows are selected
 *      counters.someSelected    — at least one row is selected
 *  - All bulk operations set dirty = true immediately.
 *  - Selection state is NOT cleared on status changes by default (spec: stable selection).
 *
 * API shape:
 *  {
 *    rows,                // { studentId, studentName, studentCode, avatar, status, notes, selected, modified, lastUpdated }[]
 *    counters,            // { present, absent, pending, total, selected, allSelected, someSelected }
 *    statuses,            // { [studentId]: string }
 *    notes,               // { [studentId]: string }
 *    selectedIds,         // Set<string>
 *    loading,
 *    error,
 *    dirty,
 *    mode,                // 'create' | 'edit'
 *    toggleStatus,        // (studentId, newStatus) => void
 *    updateNotes,         // (studentId, text) => void
 *    selectAll,           // () => void
 *    clearSelection,      // () => void
 *    toggleRowSelection,  // (studentId) => void
 *    markAllPresent,      // () => void
 *    markAllAbsent,       // () => void
 *    markSelectedPresent, // () => void
 *    markSelectedAbsent,  // () => void
 *    resetAll,            // () => void
 *    refresh,             // () => void
 *  }
 */

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { getStudentsByBatch }  from '@services/studentService';
import { getAttendanceByDate } from '@services/attendanceService';
import { ATTENDANCE_STATUS }   from '@constants/attendanceStatus';

// ── Default status for new sessions (Blueprint §9.1) ─────────────────────────
const DEFAULT_STATUS = ATTENDANCE_STATUS.PRESENT;

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} batchId — Required; the selected batch.
 * @param {string} date    — Required; YYYY-MM-DD local date string.
 */
const useAttendanceSheet = (batchId, date) => {

  // ── Internal state ─────────────────────────────────────────────────────────

  /** Raw student list from service */
  const [students,    setStudents]    = useState([]);
  /** Status map: { [studentId]: ATTENDANCE_STATUS } */
  const [statuses,    setStatuses]    = useState({});
  /** Notes map: { [studentId]: string } */
  const [notes,       setNotes]       = useState({});
  /** Set of studentIds that have been modified from their initial value */
  const [modifiedIds, setModifiedIds] = useState(new Set());
  /**
   * Set of studentIds that are currently selected (checkbox).
   * Module 6.4 addition — owned here so bulk operations are centralized.
   */
  const [selectedIds, setSelectedIds] = useState(new Set());
  /** Timestamp map: { [studentId]: ISO string } for lastUpdated */
  const [updatedAt,   setUpdatedAt]   = useState({});

  /** Initial status snapshot — used to determine dirty state per row */
  const initialStatuses = useRef({});

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [mode,    setMode]    = useState('create'); // 'create' | 'edit'
  const [tick,    setTick]    = useState(0);

  // ── Load students + existing attendance ────────────────────────────────────
  useEffect(() => {
    if (!batchId || !date) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        // 1. Fetch active students
        const studentsRes = await getStudentsByBatch(batchId, { includeInactive: false });
        if (cancelled) return;

        if (!studentsRes.success) {
          setError(studentsRes.error?.message ?? 'Failed to load students');
          setLoading(false);
          return;
        }

        const studentList = studentsRes.data ?? [];

        // 2. Fetch existing attendance records for this batch + date
        const attendanceRes = await getAttendanceByDate(batchId, date);
        if (cancelled) return;

        const existingRecords = (attendanceRes.success && Array.isArray(attendanceRes.data))
          ? attendanceRes.data
          : [];

        // Build lookup: studentId → { status, notes }
        const existingMap = {};
        existingRecords.forEach((r) => {
          existingMap[r.studentId] = {
            status: r.status,
            notes:  r.remarks ?? '',
          };
        });

        const hasExisting = existingRecords.length > 0;
        setMode(hasExisting ? 'edit' : 'create');

        // 3. Build initial status + notes maps
        const initStatuses = {};
        const initNotes    = {};
        studentList.forEach((s) => {
          initStatuses[s.id] = existingMap[s.id]?.status ?? DEFAULT_STATUS;
          initNotes[s.id]    = existingMap[s.id]?.notes  ?? '';
        });

        // Snapshot for dirty tracking
        initialStatuses.current = { ...initStatuses };

        setStudents(studentList);
        setStatuses(initStatuses);
        setNotes(initNotes);
        setModifiedIds(new Set());
        setSelectedIds(new Set());   // clear selection on reload
        setUpdatedAt({});
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message ?? 'Unexpected error loading attendance');
          setLoading(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [batchId, date, tick]);

  // ── Internal helpers ───────────────────────────────────────────────────────

  /** Mark a set of studentIds as modified and record timestamp */
  const _markModified = useCallback((ids) => {
    const now = new Date().toISOString();
    setModifiedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
    setUpdatedAt((prev) => {
      const next = { ...prev };
      ids.forEach((id) => { next[id] = now; });
      return next;
    });
  }, []);

  // ── Toggle a single student's status ──────────────────────────────────────
  const toggleStatus = useCallback((studentId, newStatus) => {
    setStatuses((prev) => ({ ...prev, [studentId]: newStatus }));
    setModifiedIds((prev) => {
      const next = new Set(prev);
      if (newStatus !== initialStatuses.current[studentId]) {
        next.add(studentId);
      } else {
        next.delete(studentId);
      }
      return next;
    });
    setUpdatedAt((prev) => ({ ...prev, [studentId]: new Date().toISOString() }));
  }, []);

  // ── Update notes for a single student ─────────────────────────────────────
  const updateNotes = useCallback((studentId, text) => {
    setNotes((prev) => ({ ...prev, [studentId]: text }));
    _markModified([studentId]);
  }, [_markModified]);

  // ── ──────────────────────────────────────────────────────────────────────
  // BULK ACTION ENGINE (Module 6.4)
  // ── ──────────────────────────────────────────────────────────────────────

  /**
   * selectAll — select every student currently in the list.
   * Blueprint Task 4: full selection state.
   */
  const selectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allIds = new Set(students.map((s) => s.id));
      return allIds;
    });
  }, [students]);

  /**
   * clearSelection — deselect all students.
   * Blueprint Task 4: clear selection state.
   */
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * toggleRowSelection — toggle a single row's selected state.
   * Blueprint Task 4: row checkbox support.
   * Selection remains stable during bulk status operations (Task 4 spec).
   */
  const toggleRowSelection = useCallback((studentId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  }, []);

  /**
   * markAllPresent — sets every student to Present and sets dirty.
   * Blueprint Task 3 + Task 9 (dirty state integration).
   */
  const markAllPresent = useCallback(() => {
    const allIds = students.map((s) => s.id);
    setStatuses((prev) => {
      const next = { ...prev };
      allIds.forEach((id) => { next[id] = ATTENDANCE_STATUS.PRESENT; });
      return next;
    });
    // Mark as modified any student not already Present in initial state
    const changedIds = allIds.filter(
      (id) => initialStatuses.current[id] !== ATTENDANCE_STATUS.PRESENT
    );
    if (changedIds.length > 0) {
      _markModified(changedIds);
    }
  }, [students, _markModified]);

  /**
   * markAllAbsent — sets every student to Absent and sets dirty.
   * Blueprint Task 3 + Task 9.
   */
  const markAllAbsent = useCallback(() => {
    const allIds = students.map((s) => s.id);
    setStatuses((prev) => {
      const next = { ...prev };
      allIds.forEach((id) => { next[id] = ATTENDANCE_STATUS.ABSENT; });
      return next;
    });
    const changedIds = allIds.filter(
      (id) => initialStatuses.current[id] !== ATTENDANCE_STATUS.ABSENT
    );
    if (changedIds.length > 0) {
      _markModified(changedIds);
    }
  }, [students, _markModified]);

  /**
   * markSelectedPresent — marks only selected students as Present.
   * Clears selection after operation (UX: selection indicates intent).
   * Blueprint Task 3 + Task 9.
   */
  const markSelectedPresent = useCallback(() => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    setStatuses((prev) => {
      const next = { ...prev };
      ids.forEach((id) => { next[id] = ATTENDANCE_STATUS.PRESENT; });
      return next;
    });
    const changedIds = ids.filter(
      (id) => initialStatuses.current[id] !== ATTENDANCE_STATUS.PRESENT
    );
    if (changedIds.length > 0) {
      _markModified(changedIds);
    }
    setSelectedIds(new Set());   // clear selection after action
  }, [selectedIds, _markModified]);

  /**
   * markSelectedAbsent — marks only selected students as Absent.
   * Clears selection after operation.
   * Blueprint Task 3 + Task 9.
   */
  const markSelectedAbsent = useCallback(() => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    setStatuses((prev) => {
      const next = { ...prev };
      ids.forEach((id) => { next[id] = ATTENDANCE_STATUS.ABSENT; });
      return next;
    });
    const changedIds = ids.filter(
      (id) => initialStatuses.current[id] !== ATTENDANCE_STATUS.ABSENT
    );
    if (changedIds.length > 0) {
      _markModified(changedIds);
    }
    setSelectedIds(new Set());   // clear selection after action
  }, [selectedIds, _markModified]);

  /**
   * resetAll — reverts all statuses to initial snapshot, clears notes additions,
   * clears selection, clears dirty state.
   * Blueprint Task 3.
   */
  const resetAll = useCallback(() => {
    setStatuses({ ...initialStatuses.current });
    setModifiedIds(new Set());
    setSelectedIds(new Set());
    setUpdatedAt({});
  }, []);

  /** refresh — re-fetch all data (bump tick) */
  const refresh = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  // ── Derived: rows (extended model for Module 6.4) ─────────────────────────
  const rows = useMemo(() =>
    students.map((s) => ({
      studentId:   s.id,
      studentName: s.name,
      studentCode: s.studentCode,
      avatar:      s.avatar ?? null,
      status:      statuses[s.id]  ?? DEFAULT_STATUS,
      notes:       notes[s.id]     ?? '',
      selected:    selectedIds.has(s.id),    // ← Module 6.4 addition
      modified:    modifiedIds.has(s.id),
      lastUpdated: updatedAt[s.id] ?? null,  // ← Module 6.4 addition
      // Full student object for AvatarSystem / display
      student:     s,
    })),
    [students, statuses, notes, selectedIds, modifiedIds, updatedAt]
  );

  // ── Derived: live counters (extended with selection for Module 6.4) ────────
  const counters = useMemo(() => {
    let present = 0;
    let absent  = 0;
    let pending = 0;

    students.forEach((s) => {
      const st = statuses[s.id];
      if (st === ATTENDANCE_STATUS.PRESENT) present++;
      else if (st === ATTENDANCE_STATUS.ABSENT) absent++;
      else pending++;
    });

    const selectedCount = selectedIds.size;
    const total         = students.length;
    const allSelected   = total > 0 && selectedCount === total;
    const someSelected  = selectedCount > 0 && !allSelected;

    return {
      present,
      absent,
      pending,
      total,
      selected:    selectedCount,   // ← Module 6.4 addition
      allSelected,                  // ← Module 6.4 addition
      someSelected,                 // ← Module 6.4 addition
    };
  }, [students, statuses, selectedIds]);

  // ── Derived: dirty flag ────────────────────────────────────────────────────
  const dirty = modifiedIds.size > 0;

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    // Data
    rows,
    counters,
    statuses,
    notes,
    students,
    selectedIds,

    // State flags
    loading,
    error,
    dirty,
    mode,

    // Single-row actions
    toggleStatus,
    updateNotes,

    // Selection actions (Module 6.4)
    selectAll,
    clearSelection,
    toggleRowSelection,

    // Bulk status actions (Module 6.4 — centralized)
    markAllPresent,
    markAllAbsent,
    markSelectedPresent,
    markSelectedAbsent,

    // Reset + refresh
    resetAll,
    refresh,
  };
};

export default useAttendanceSheet;
