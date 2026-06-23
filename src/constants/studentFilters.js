/**
 * studentFilters.js
 * Centralized filter configuration for the Student Management module.
 * Module 5.4 — Student Filters
 *
 * Exports:
 *   - DEFAULT_STUDENT_FILTERS  — initial/reset filter state shape
 *   - STUDENT_QUICK_FILTERS    — one-click preset configurations
 *   - ATTENDANCE_RANGE_OPTIONS — dropdown options for attendance ranges
 *   - STUDENT_STATUS_OPTIONS   — dropdown options for student status
 *   - RISK_LEVEL_OPTIONS       — dropdown options for risk classification
 *   - STUDENT_SEARCH_FIELDS    — fields included in text search
 *
 * Architecture rule: option lists that depend on live data (batches)
 * are derived dynamically in useStudentFilters — only static config lives here.
 */

import { getToday } from '@utils/dateUtils';

// ── Default / reset filter state ──────────────────────────────────────────────

/**
 * Canonical shape and default values for all student filters.
 * All filter-state consumers MUST initialise from this object.
 */
export const DEFAULT_STUDENT_FILTERS = Object.freeze({
  search:          '',      // free-text search across name, code, email, phone
  batch:           'all',  // 'all' | batchId string
  status:          'all',  // 'all' | 'active' | 'inactive'
  attendanceRange: 'all',  // 'all' | range key — see ATTENDANCE_RANGE_OPTIONS
  riskLevel:       'all',  // 'all' | 'excellent' | 'good' | 'warning' | 'critical'
  joinedFrom:      '',     // YYYY-MM-DD or ''
  joinedTo:        '',     // YYYY-MM-DD or ''
  quickFilter:     null,   // null | quickFilter key string
});

// ── Search fields ─────────────────────────────────────────────────────────────

/**
 * Fields checked during free-text search.
 * Order: most-specific first for fastest early exit.
 */
export const STUDENT_SEARCH_FIELDS = [
  'studentCode',
  'firstName',
  'lastName',
  'email',
  'phone',
];

// ── Attendance range options ──────────────────────────────────────────────────

/**
 * Each entry:
 *   value  — key stored in filter state
 *   label  — display text
 *   min    — inclusive lower bound (null = no bound)
 *   max    — inclusive upper bound (null = no bound)
 */
export const ATTENDANCE_RANGE_OPTIONS = [
  { value: 'all',    label: 'All Attendance',  min: null, max: null },
  { value: 'range_90_100', label: '90 – 100%', min: 90,  max: 100  },
  { value: 'range_75_89',  label: '75 – 89%',  min: 75,  max: 89   },
  { value: 'range_60_74',  label: '60 – 74%',  min: 60,  max: 74   },
  { value: 'range_0_59',   label: 'Below 60%', min: 0,   max: 59   },
];

// ── Student status options ────────────────────────────────────────────────────

export const STUDENT_STATUS_OPTIONS = [
  { value: 'all',      label: 'All Statuses' },
  { value: 'active',   label: 'Active'       },
  { value: 'inactive', label: 'Inactive'     },
];

// ── Risk level options ────────────────────────────────────────────────────────

export const RISK_LEVEL_OPTIONS = [
  { value: 'all',       label: 'All Risk Levels' },
  { value: 'excellent', label: 'Excellent (90–100%)' },
  { value: 'good',      label: 'Good (75–89%)'       },
  { value: 'warning',   label: 'Warning (60–74%)'    },
  { value: 'critical',  label: 'Critical (< 60%)'    },
];

// ── Quick filter presets ──────────────────────────────────────────────────────

/**
 * Quick filter definitions (one-click chips on the filter bar).
 * Each entry:
 *   key     — unique identifier
 *   label   — chip text
 *   icon    — lucide-react icon name (resolved by the UI)
 *   color   — chip color key (matches CHIP_COLORS map in the UI)
 *   filter  — partial DEFAULT_STUDENT_FILTERS to merge (or function returning same)
 */
export const STUDENT_QUICK_FILTERS = [
  {
    key:    'low_attendance',
    label:  'Low Attendance',
    icon:   'AlertTriangle',
    color:  'danger',
    filter: { attendanceRange: 'range_0_59' },
  },
  {
    key:    'at_risk',
    label:  'At Risk',
    icon:   'TrendingDown',
    color:  'warning',
    filter: { riskLevel: 'warning' },
  },
  {
    key:    'excellent',
    label:  'Excellent Students',
    icon:   'Star',
    color:  'success',
    filter: { riskLevel: 'excellent' },
  },
  {
    key:    'new_joiners',
    label:  'New Joiners',
    icon:   'UserPlus',
    color:  'accent',
    filter: () => {
      const today = getToday();
      // Students enrolled in the last 30 days
      const d = new Date();
      d.setDate(d.getDate() - 30);
      const y   = d.getFullYear();
      const m   = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return { joinedFrom: `${y}-${m}-${day}`, joinedTo: today };
    },
  },
  {
    key:    'active_only',
    label:  'Active Students',
    icon:   'UserCheck',
    color:  'neutral',
    filter: { status: 'active' },
  },
];
