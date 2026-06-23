/**
 * batchStatus.js
 * Batch lifecycle status enum, labels, colors, and badge variant map.
 * Blueprint Section 16.3 — single source of truth for all batch status values.
 *
 * V1 statuses: ACTIVE, UPCOMING, COMPLETED
 * Extended statuses: CANCELLED, ON_HOLD (defined now, inert until UI uses them)
 *
 * All batch-related components import from here; never from hardcoded strings.
 */

// ── Core enum ─────────────────────────────────────────────────────────────────
export const BATCH_STATUS = Object.freeze({
  ACTIVE:    'active',
  UPCOMING:  'upcoming',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ON_HOLD:   'onHold',
});

// ── Human-readable labels ──────────────────────────────────────────────────────
export const BATCH_STATUS_LABELS = Object.freeze({
  [BATCH_STATUS.ACTIVE]:    'Active',
  [BATCH_STATUS.UPCOMING]:  'Upcoming',
  [BATCH_STATUS.COMPLETED]: 'Completed',
  [BATCH_STATUS.CANCELLED]: 'Cancelled',
  [BATCH_STATUS.ON_HOLD]:   'On Hold',
});

// ── Tailwind color classes (bg + text) for each status ───────────────────────
// Mirrors Blueprint Section 7.2 / colors.js tokens.
export const BATCH_STATUS_COLORS = Object.freeze({
  [BATCH_STATUS.ACTIVE]:    { bg: 'bg-accent-50',  text: 'text-accent-700', border: 'border-accent-200' },
  [BATCH_STATUS.UPCOMING]:  { bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-200'},
  [BATCH_STATUS.COMPLETED]: { bg: 'bg-neutral-100', text: 'text-neutral-600', border: 'border-neutral-200'},
  [BATCH_STATUS.CANCELLED]: { bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200'   },
  [BATCH_STATUS.ON_HOLD]:   { bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200'},
});

// ── Dot / indicator hex colors (for non-Tailwind contexts, e.g., Recharts) ───
export const BATCH_STATUS_DOT_COLORS = Object.freeze({
  [BATCH_STATUS.ACTIVE]:    '#2563EB',
  [BATCH_STATUS.UPCOMING]:  '#D97706',
  [BATCH_STATUS.COMPLETED]: '#64748B',
  [BATCH_STATUS.CANCELLED]: '#DC2626',
  [BATCH_STATUS.ON_HOLD]:   '#EA580C',
});

// ── Badge variant keys — consumed by <Badge> / <StatusBadge> components ───────
// Maps each status to the variant string the Badge component accepts.
export const BATCH_STATUS_BADGE_VARIANTS = Object.freeze({
  [BATCH_STATUS.ACTIVE]:    'active',
  [BATCH_STATUS.UPCOMING]:  'upcoming',
  [BATCH_STATUS.COMPLETED]: 'completed',
  [BATCH_STATUS.CANCELLED]: 'danger',
  [BATCH_STATUS.ON_HOLD]:   'warning',
});

// ── Lucide icon name per status (for status columns, filter chips) ─────────────
export const BATCH_STATUS_ICONS = Object.freeze({
  [BATCH_STATUS.ACTIVE]:    'PlayCircle',
  [BATCH_STATUS.UPCOMING]:  'Clock',
  [BATCH_STATUS.COMPLETED]: 'CheckCircle2',
  [BATCH_STATUS.CANCELLED]: 'XCircle',
  [BATCH_STATUS.ON_HOLD]:   'PauseCircle',
});

// ── Ordered list for filter dropdowns and select menus ────────────────────────
// V1 statuses first; extended statuses appended.
export const BATCH_STATUS_LIST = [
  BATCH_STATUS.ACTIVE,
  BATCH_STATUS.UPCOMING,
  BATCH_STATUS.COMPLETED,
  BATCH_STATUS.CANCELLED,
  BATCH_STATUS.ON_HOLD,
];

// ── V1 active statuses (only these appear in V1 filter bars) ──────────────────
export const V1_BATCH_STATUSES = [
  BATCH_STATUS.ACTIVE,
  BATCH_STATUS.UPCOMING,
  BATCH_STATUS.COMPLETED,
];

// ── Filter options array (label + value) for dropdowns ────────────────────────
export const BATCH_STATUS_OPTIONS = BATCH_STATUS_LIST.map((status) => ({
  value: status,
  label: BATCH_STATUS_LABELS[status],
}));

// ── V1 filter options only ────────────────────────────────────────────────────
export const V1_BATCH_STATUS_OPTIONS = V1_BATCH_STATUSES.map((status) => ({
  value: status,
  label: BATCH_STATUS_LABELS[status],
}));

export default BATCH_STATUS;
