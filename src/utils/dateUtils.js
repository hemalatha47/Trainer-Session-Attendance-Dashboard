/**
 * dateUtils.js
 * Pure, stateless date utility functions.
 * Blueprint Section 9.3, 13 — all date logic must be local-timezone-safe.
 *
 * RULES:
 *  - Never use Date.prototype.toISOString() for session/attendance dates —
 *    it outputs UTC which may shift the calendar date in non-UTC timezones.
 *  - Always extract year/month/day from the local Date components.
 *  - All functions are pure (no side effects, no external dependencies).
 *  - All YYYY-MM-DD strings use zero-padded month and day.
 */

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Zero-pads a number to 2 digits.
 * @param {number} n
 * @returns {string}
 */
const pad2 = (n) => String(n).padStart(2, '0');

/**
 * Safely coerces input to a Date object.
 * Accepts: Date, YYYY-MM-DD string, or timestamp number.
 * @param {Date|string|number} input
 * @returns {Date}
 */
const toDate = (input) => {
  if (input instanceof Date) return input;
  if (typeof input === 'string') {
    // YYYY-MM-DD — parse as local midnight to avoid UTC shift
    const [year, month, day] = input.split('-').map(Number);
    if (year && month && day) return new Date(year, month - 1, day);
  }
  return new Date(input);
};

// ── Core date string helpers ──────────────────────────────────────────────────

/**
 * Returns today's date as a YYYY-MM-DD string in local time.
 * Use this everywhere a "today" date is needed — never `new Date().toISOString()`.
 * @returns {string}  e.g. "2026-06-16"
 */
export const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

/**
 * Converts a Date object (or anything toDate() accepts) to a YYYY-MM-DD string
 * in local time. This is the canonical attendance date format.
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export const toLocalDateString = (dateInput) => {
  const d = toDate(dateInput);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

// ── Display formatting ────────────────────────────────────────────────────────

/**
 * Formats a date for display (e.g., "Jun 16, 2026").
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const d = toDate(dateInput);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats a date + time for display (e.g., "Jun 16, 2026, 09:30 AM").
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export const formatDateTime = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput); // ISO timestamps are fine for display formatting
  return d.toLocaleString('en-IN', {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats a date as "Month YYYY" (e.g., "June 2026").
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export const formatMonthYear = (dateInput) => {
  if (!dateInput) return '';
  const d = toDate(dateInput);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
};

/**
 * Formats a date as "DD/MM/YYYY" (Indian locale short format).
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export const formatShortDate = (dateInput) => {
  if (!dateInput) return '';
  const d = toDate(dateInput);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
};

// ── Comparison helpers ────────────────────────────────────────────────────────

/**
 * Returns true if two dates represent the same calendar day (local time).
 * @param {Date|string|number} a
 * @param {Date|string|number} b
 * @returns {boolean}
 */
export const isSameDay = (a, b) =>
  toLocalDateString(a) === toLocalDateString(b);

/**
 * Returns true if the given date is today (local time).
 * @param {Date|string|number} dateInput
 * @returns {boolean}
 */
export const isToday = (dateInput) =>
  toLocalDateString(dateInput) === getToday();

/**
 * Returns true if the given date is strictly before today (local time).
 * @param {Date|string|number} dateInput
 * @returns {boolean}
 */
export const isPastDate = (dateInput) =>
  toLocalDateString(dateInput) < getToday();

/**
 * Returns true if the given date is strictly after today (local time).
 * @param {Date|string|number} dateInput
 * @returns {boolean}
 */
export const isFutureDate = (dateInput) =>
  toLocalDateString(dateInput) > getToday();

/**
 * Returns true if the given date is today or in the past.
 * @param {Date|string|number} dateInput
 * @returns {boolean}
 */
export const isTodayOrPast = (dateInput) =>
  toLocalDateString(dateInput) <= getToday();

// ── Arithmetic helpers ────────────────────────────────────────────────────────

/**
 * Returns a new Date that is `n` calendar days after `dateInput`.
 * @param {Date|string|number} dateInput
 * @param {number} n
 * @returns {Date}
 */
export const addDays = (dateInput, n) => {
  const d = toDate(dateInput);
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
};

/**
 * Returns a new Date that is `n` calendar days before `dateInput`.
 * @param {Date|string|number} dateInput
 * @param {number} n
 * @returns {Date}
 */
export const subtractDays = (dateInput, n) => addDays(dateInput, -n);

/**
 * Returns the difference in whole calendar days between two dates.
 * Positive if b is after a; negative if b is before a.
 * @param {Date|string|number} a
 * @param {Date|string|number} b
 * @returns {number}
 */
export const daysBetween = (a, b) => {
  const msA = toDate(a).setHours(0, 0, 0, 0);
  const msB = toDate(b).setHours(0, 0, 0, 0);
  return Math.round((msB - msA) / 86_400_000);
};

// ── Month boundary helpers ────────────────────────────────────────────────────

/**
 * Returns the first day of the month containing `dateInput` as a Date.
 * @param {Date|string|number} dateInput
 * @returns {Date}
 */
export const getStartOfMonth = (dateInput) => {
  const d = toDate(dateInput);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Returns the last day of the month containing `dateInput` as a Date.
 * @param {Date|string|number} dateInput
 * @returns {Date}
 */
export const getEndOfMonth = (dateInput) => {
  const d = toDate(dateInput);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

// ── Attendance-specific helpers ───────────────────────────────────────────────

/**
 * Normalizes an attendance date value to a canonical YYYY-MM-DD string.
 * Accepts Date objects, ISO strings, or YYYY-MM-DD strings.
 * This is the single point of normalization for all attendance date writes.
 *
 * @param {Date|string|number} dateInput
 * @returns {string}  YYYY-MM-DD in local time
 */
export const normalizeAttendanceDate = (dateInput) => {
  if (!dateInput) throw new Error('normalizeAttendanceDate: date is required');
  return toLocalDateString(dateInput);
};

/**
 * Compares two attendance date strings (YYYY-MM-DD) for sorting.
 * Returns negative if a < b, 0 if equal, positive if a > b.
 * Safe for use in Array.prototype.sort().
 *
 * @param {string} a  YYYY-MM-DD
 * @param {string} b  YYYY-MM-DD
 * @returns {number}
 */
export const compareAttendanceDates = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

/**
 * Returns a sorted (ascending) array of distinct YYYY-MM-DD date strings
 * from an array of attendance records.
 * @param {Array<{date: string}>} records
 * @returns {string[]}
 */
export const getDistinctAttendanceDates = (records) => {
  if (!Array.isArray(records) || records.length === 0) return [];
  const unique = [...new Set(records.map((r) => r.date).filter(Boolean))];
  return unique.sort(compareAttendanceDates);
};

/**
 * Filters an array of attendance records (each with a `.date` YYYY-MM-DD field)
 * to only those within the inclusive [from, to] date range.
 * @param {Array<{date: string}>} records
 * @param {string} from  YYYY-MM-DD
 * @param {string} to    YYYY-MM-DD
 * @returns {Array}
 */
export const filterByDateRange = (records, from, to) => {
  if (!Array.isArray(records)) return [];
  return records.filter((r) => r.date >= from && r.date <= to);
};

/**
 * Returns true if a YYYY-MM-DD string is a valid calendar date.
 * @param {string} str
 * @returns {boolean}
 */
export const isValidDateString = (str) => {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str + 'T00:00:00'); // Force local noon to avoid DST edge
  return (
    !isNaN(d.getTime()) &&
    toLocalDateString(d) === str
  );
};
