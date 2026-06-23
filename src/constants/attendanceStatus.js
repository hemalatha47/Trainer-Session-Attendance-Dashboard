/**
 * attendanceStatus.js
 * Attendance status enum, labels, colors, and icon helpers (Blueprint Section 16.2).
 *
 * Extends the color tokens already defined in colors.js — no re-definition.
 * All attendance components import from here; never from hardcoded strings.
 *
 * Future-compatible: ATTENDANCE_STATUS is an open object. Adding 'late', 'leave',
 * 'halfDay', 'excused' here is the ONLY change required to unlock new statuses
 * across the entire UI (StatusChip, Toggle, Selector, Badge, Calendar, Legend).
 */

// ── Core enum ─────────────────────────────────────────────────────────────────
export const ATTENDANCE_STATUS = {
  PRESENT:  'present',
  ABSENT:   'absent',
  // Future (Section 14) — defined now, inert until form/service uses them
  LATE:     'late',
  LEAVE:    'leave',
  HALF_DAY: 'halfDay',
  EXCUSED:  'excused',
};

// ── Human-readable labels ─────────────────────────────────────────────────────
export const ATTENDANCE_LABEL = {
  [ATTENDANCE_STATUS.PRESENT]:  'Present',
  [ATTENDANCE_STATUS.ABSENT]:   'Absent',
  [ATTENDANCE_STATUS.LATE]:     'Late',
  [ATTENDANCE_STATUS.LEAVE]:    'On Leave',
  [ATTENDANCE_STATUS.HALF_DAY]: 'Half Day',
  [ATTENDANCE_STATUS.EXCUSED]:  'Excused',
};

// ── Short labels (calendar cells, compact badges) ─────────────────────────────
export const ATTENDANCE_SHORT_LABEL = {
  [ATTENDANCE_STATUS.PRESENT]:  'P',
  [ATTENDANCE_STATUS.ABSENT]:   'A',
  [ATTENDANCE_STATUS.LATE]:     'L',
  [ATTENDANCE_STATUS.LEAVE]:    'LV',
  [ATTENDANCE_STATUS.HALF_DAY]: 'HD',
  [ATTENDANCE_STATUS.EXCUSED]:  'EX',
};

// ── Tailwind class map — consumed by Badge, StatusChip, etc. ─────────────────
// Mirrors Blueprint Section 7.2 / colors.js attendance tokens.
export const ATTENDANCE_BADGE_COLOR = {
  [ATTENDANCE_STATUS.PRESENT]:  'present',   // Badge variant key
  [ATTENDANCE_STATUS.ABSENT]:   'absent',
  [ATTENDANCE_STATUS.LATE]:     'late',
  [ATTENDANCE_STATUS.LEAVE]:    'leave',
  [ATTENDANCE_STATUS.HALF_DAY]: 'warning',
  [ATTENDANCE_STATUS.EXCUSED]:  'neutral',
};

// ── Dot / indicator colors (hex, for non-Tailwind contexts) ──────────────────
export const ATTENDANCE_DOT_COLOR = {
  [ATTENDANCE_STATUS.PRESENT]:  '#22C55E',
  [ATTENDANCE_STATUS.ABSENT]:   '#EF4444',
  [ATTENDANCE_STATUS.LATE]:     '#F59E0B',
  [ATTENDANCE_STATUS.LEAVE]:    '#6366F1',
  [ATTENDANCE_STATUS.HALF_DAY]: '#F59E0B',
  [ATTENDANCE_STATUS.EXCUSED]:  '#94A3B8',
};

// ── Tailwind bg/text for inline chip rendering ────────────────────────────────
export const ATTENDANCE_CHIP_CLASSES = {
  [ATTENDANCE_STATUS.PRESENT]:  {
    bg: 'bg-success-bg',
    text: 'text-success-text',
    border: 'border-success-border',
    dot: 'bg-green-500',
  },
  [ATTENDANCE_STATUS.ABSENT]:   {
    bg: 'bg-danger-bg',
    text: 'text-danger-text',
    border: 'border-danger-border',
    dot: 'bg-red-500',
  },
  [ATTENDANCE_STATUS.LATE]:     {
    bg: 'bg-warning-bg',
    text: 'text-warning-text',
    border: 'border-warning-border',
    dot: 'bg-yellow-500',
  },
  [ATTENDANCE_STATUS.LEAVE]:    {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  [ATTENDANCE_STATUS.HALF_DAY]: {
    bg: 'bg-warning-bg',
    text: 'text-warning-text',
    border: 'border-warning-border',
    dot: 'bg-yellow-400',
  },
  [ATTENDANCE_STATUS.EXCUSED]:  {
    bg: 'bg-neutral-100',
    text: 'text-neutral-600',
    border: 'border-neutral-200',
    dot: 'bg-neutral-400',
  },
};

// ── Lucide icon names per status ──────────────────────────────────────────────
export const ATTENDANCE_ICON = {
  [ATTENDANCE_STATUS.PRESENT]:  'CheckCircle',
  [ATTENDANCE_STATUS.ABSENT]:   'XCircle',
  [ATTENDANCE_STATUS.LATE]:     'Clock',
  [ATTENDANCE_STATUS.LEAVE]:    'Calendar',
  [ATTENDANCE_STATUS.HALF_DAY]: 'Circle',
  [ATTENDANCE_STATUS.EXCUSED]:  'MinusCircle',
};

// ── Ordered list for rendering (V1 first, future statuses appended) ───────────
export const ATTENDANCE_STATUS_LIST = [
  ATTENDANCE_STATUS.PRESENT,
  ATTENDANCE_STATUS.ABSENT,
  ATTENDANCE_STATUS.LATE,
  ATTENDANCE_STATUS.LEAVE,
  ATTENDANCE_STATUS.HALF_DAY,
  ATTENDANCE_STATUS.EXCUSED,
];

// ── V1 active statuses (only these are selectable in V1 forms) ────────────────
export const V1_ATTENDANCE_STATUSES = [
  ATTENDANCE_STATUS.PRESENT,
  ATTENDANCE_STATUS.ABSENT,
];

// ── Percentage calculation helpers ────────────────────────────────────────────
/**
 * Statuses that count as "present" in the attendance % formula.
 * Late + HalfDay might count — business decision. Present-only for V1.
 * Extend this array when Section 14 "Late" status is activated.
 */
export const PRESENT_STATUSES = [ATTENDANCE_STATUS.PRESENT];

/**
 * Returns true if a status contributes to the present count.
 * @param {string} status
 */
export const isPresentStatus = (status) =>
  PRESENT_STATUSES.includes(status);

/**
 * Returns the threshold color classification string.
 * @param {number} pct
 * @param {number} threshold  — default 75
 * @returns {'success'|'warning'|'danger'}
 */
export const getAttendanceColor = (pct, threshold = 75) => {
  if (pct >= threshold) return 'success';
  if (pct >= threshold * 0.67) return 'warning';
  return 'danger';
};

export default ATTENDANCE_STATUS;
