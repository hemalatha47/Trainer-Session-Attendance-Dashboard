/**
 * batchFilters.js
 * Centralized filter configuration for the Batch Management module.
 * Module 4.4 — Batch Filters
 *
 * Exports:
 *   - DEFAULT_BATCH_FILTERS  — initial/reset filter state shape
 *   - QUICK_FILTERS          — one-click preset filter configurations
 *   - CAPACITY_PRESETS       — capacity range presets
 *   - BATCH_SEARCH_FIELDS    — fields included in the text search
 *
 * Architecture rule: all filter option lists that depend on live data
 * (trainers, courses) are derived dynamically in useBatchFilters — only
 * static config lives here.
 */

import { getToday } from '@utils/dateUtils';

// ── Default / reset filter state ──────────────────────────────────────────────

/**
 * The canonical shape and default values for batch filters.
 * All filter-state consumers should initialise from this object.
 */
export const DEFAULT_BATCH_FILTERS = Object.freeze({
  search:      '',       // free-text search across name, code, trainer, course
  status:      'all',   // 'all' | batch status enum value
  trainer:     'all',   // 'all' | trainerName string
  course:      'all',   // 'all' | derived course key from batchCode prefix
  capacityMin: '',      // numeric string or ''
  capacityMax: '',      // numeric string or ''
  startDate:   '',      // YYYY-MM-DD or ''
  endDate:     '',      // YYYY-MM-DD or ''
  activeOnly:  false,   // boolean — when true, only isActive/non-archived batches
  quickFilter: null,    // null | quickFilter key string
});

// ── Search fields ─────────────────────────────────────────────────────────────

/**
 * Fields the search utility will check for partial-string matching.
 * Order matters: earlier fields are checked first.
 */
export const BATCH_SEARCH_FIELDS = [
  'batchName',
  'batchCode',
  'trainerName',
  'description',
];

// ── Quick filter presets ──────────────────────────────────────────────────────

/**
 * Quick filter definitions.
 * Each entry has:
 *   key     — unique identifier matched against filters.quickFilter
 *   label   — display text for the chip
 *   icon    — lucide-react icon name (resolved by the UI)
 *   color   — Tailwind accent color class prefix used for chip styling
 *   filter  — partial filter state to MERGE onto DEFAULT_BATCH_FILTERS
 *             (function form receives today's date for dynamic presets)
 */
export const QUICK_FILTERS = [
  {
    key:    'active_now',
    label:  'Active Now',
    icon:   'PlayCircle',
    color:  'accent',
    filter: { status: 'active', activeOnly: true },
  },
  {
    key:    'starting_soon',
    label:  'Starting Soon',
    icon:   'CalendarClock',
    color:  'yellow',
    filter: () => {
      const today = getToday();
      // Upcoming batches that start within the next 30 days
      const future = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      })();
      return { status: 'upcoming', startDate: today, endDate: future };
    },
  },
  {
    key:    'full_capacity',
    label:  'Full / Near Full',
    icon:   'Users',
    color:  'orange',
    filter: { capacityMin: '90' }, // >= 90% capacity — computed in filter util
  },
  {
    key:    'recently_created',
    label:  'Recently Created',
    icon:   'Sparkles',
    color:  'purple',
    filter: () => {
      const d = new Date();
      d.setDate(d.getDate() - 14);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return { startDate: `${y}-${m}-${day}` };
    },
  },
  {
    key:    'completed',
    label:  'Completed',
    icon:   'CheckCircle2',
    color:  'neutral',
    filter: { status: 'completed' },
  },
];

// ── Capacity presets ──────────────────────────────────────────────────────────

export const CAPACITY_PRESETS = [
  { label: 'Any',      min: '',   max: '' },
  { label: '≤ 20',     min: '',   max: '20' },
  { label: '21 – 30',  min: '21', max: '30' },
  { label: '31 – 50',  min: '31', max: '50' },
  { label: '> 50',     min: '51', max: '' },
];

// ── Course derivation helper ──────────────────────────────────────────────────

/**
 * Derives a human-readable course label from a batchCode string.
 * The NM batch code format is: NM-{COURSE}-{YEAR}-{SEQ}
 * e.g. "NM-REACT-2026-01" → "React"
 *
 * @param {string} batchCode
 * @returns {string}  Course label, or the raw middle segment if unknown
 */
export const deriveCourseFromCode = (batchCode) => {
  if (!batchCode || typeof batchCode !== 'string') return 'Unknown';
  const parts = batchCode.split('-');
  if (parts.length < 2) return batchCode;
  const courseKey = parts[1].toUpperCase();
  return COURSE_LABEL_MAP[courseKey] ?? courseKey;
};

/**
 * Derives a sort key from a batchCode for consistent ordering.
 * @param {string} batchCode
 * @returns {string}
 */
export const deriveCourseKey = (batchCode) => {
  if (!batchCode || typeof batchCode !== 'string') return '';
  const parts = batchCode.split('-');
  return parts.length >= 2 ? parts[1].toUpperCase() : batchCode;
};

/**
 * Static mapping of course code to display label.
 * Extend when new course codes are added to the system.
 */
export const COURSE_LABEL_MAP = Object.freeze({
  REACT:  'React Development',
  JAVA:   'Full Stack Java',
  PY:     'Python Programming',
  DA:     'Data Analytics',
  CLOUD:  'Cloud Fundamentals',
  UIUX:   'UI/UX Design',
  DEVOPS: 'DevOps & Cloud',
  NODE:   'Node.js Backend',
  ML:     'Machine Learning',
  ORACLE: 'Oracle Database',
  GST:    'GST & Tax Filing',
});
