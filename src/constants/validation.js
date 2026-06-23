/**
 * validation.js
 * Centralized validation constants for all modules.
 * Blueprint Section 16 / Module 1.2 Task 15.
 *
 * CONSTANTS ONLY — no validation functions.
 * Functions belong in src/utils/validationUtils.js.
 *
 * All min/max constraints, regex patterns, and default thresholds are defined
 * here so that form components, service validators, and test suites share a
 * single source of truth.
 */

// ── Attendance thresholds ─────────────────────────────────────────────────────
/** Default low-attendance warning threshold (%). Blueprint Section 6.9. */
export const DEFAULT_ATTENDANCE_THRESHOLD = 75;

/** Minimum configurable threshold (prevents 0% being a valid "threshold"). */
export const MIN_ATTENDANCE_THRESHOLD = 10;

/** Maximum configurable threshold. */
export const MAX_ATTENDANCE_THRESHOLD = 100;

// ── Batch field constraints ───────────────────────────────────────────────────
export const MIN_BATCH_NAME_LENGTH   = 3;
export const MAX_BATCH_NAME_LENGTH   = 100;

export const MIN_BATCH_CODE_LENGTH   = 2;
export const MAX_BATCH_CODE_LENGTH   = 20;

/** Maximum characters for the optional batch description field. */
export const MAX_BATCH_DESCRIPTION_LENGTH = 500;

// ── Student field constraints ──────────────────────────────────────────────────
export const MIN_STUDENT_NAME_LENGTH = 2;
export const MAX_STUDENT_NAME_LENGTH = 100;

export const MIN_STUDENT_CODE_LENGTH = 3;
export const MAX_STUDENT_CODE_LENGTH = 20;

/** Maximum characters for a phone number string (incl. country code + spaces). */
export const MAX_PHONE_LENGTH = 15;

// ── Pagination ─────────────────────────────────────────────────────────────────
/** Default rows per page for DataTable and all paginated lists. */
export const DEFAULT_PAGE_SIZE = 10;

/** Hard upper limit for page size selectors. */
export const MAX_PAGE_SIZE = 100;

// ── Search ─────────────────────────────────────────────────────────────────────
/** Minimum characters required before a search query fires. */
export const MIN_SEARCH_LENGTH = 1;

/** Debounce delay (ms) for SearchBar inputs before triggering filter. */
export const SEARCH_DEBOUNCE_MS = 300;

// ── Regex patterns ─────────────────────────────────────────────────────────────
/**
 * Basic email pattern.
 * Accepts: local@domain.tld, plus-addressing, and subdomains.
 * Does NOT enforce TLD length — sufficient for form-level validation.
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number pattern.
 * Accepts: digits, spaces, hyphens, parentheses, optional leading +.
 * Min 7 digits; max enforced separately via MAX_PHONE_LENGTH.
 * Examples: +91 98765 00001 | (044) 2345-6789 | 9876500001
 */
export const PHONE_REGEX = /^\+?[\d\s\-().]{7,}$/;

/**
 * Student / Batch code pattern.
 * Accepts: alphanumeric with optional hyphens and underscores.
 * Examples: NM2026001 | BATCH-A | B_01
 */
export const CODE_REGEX = /^[A-Za-z0-9_-]+$/;

/**
 * Date string pattern (YYYY-MM-DD).
 * Used to validate date strings before feeding to dateUtils.
 */
export const DATE_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;

// ── Date range constraints ─────────────────────────────────────────────────────
/** Maximum selectable date range for report generation (days). */
export const MAX_REPORT_DATE_RANGE_DAYS = 365;

// ── Form submission ────────────────────────────────────────────────────────────
/** Minimum delay (ms) to show a loading spinner during form submission. */
export const MIN_SUBMIT_LOADING_MS = 200;
