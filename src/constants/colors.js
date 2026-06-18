/**
 * colors.js
 * Centralized color token system (Phase 3, Module 3.1).
 *
 * Single source of truth for every color used in the application.
 * Mirrors and extends tailwind.config.js theme.extend.colors so that
 * JS (charts, dynamic styles, badge logic) and Tailwind classes stay
 * in sync — no hex values should be hardcoded outside this file and
 * tailwind.config.js.
 *
 * Naming rule: <role>[.<shade>] — e.g. accent.600, present.text.
 * Usage rule: prefer Tailwind utility classes (bg-accent-600, text-present-text)
 * in JSX; import COLORS here only for non-Tailwind contexts (Recharts series
 * colors, canvas/SVG fills, inline style computations).
 *
 * Future dark theme: this object is structured as a flat "light" palette.
 * A future `colors.dark.js` can mirror these keys with dark-mode values;
 * consuming code should reference semantic keys (e.g. COLORS.background),
 * never raw hex, so swapping palettes requires no component changes.
 */

export const COLORS = {
  // ── Brand ──────────────────────────────────────────────────────────────
  primary: {
    DEFAULT: '#1E3A5F',
    50:  '#EEF2F8',
    100: '#D5E0EF',
    200: '#ABBFDF',
    300: '#7B9DCE',
    400: '#4F7BBE',
    500: '#2D5EA8',
    600: '#1E3A5F',
    700: '#162C47',
    800: '#0E1D2F',
    900: '#070F18',
  },

  accent: {
    DEFAULT: '#2563EB',
    50:  '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  secondary: {
    DEFAULT: '#475569',
    50:  '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // ── Semantic states ───────────────────────────────────────────────────
  success: {
    DEFAULT: '#15803D',
    bg: '#DCFCE7',
    text: '#15803D',
    border: '#86EFAC',
  },

  warning: {
    DEFAULT: '#92400E',
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#FDE68A',
  },

  danger: {
    DEFAULT: '#B91C1C',
    bg: '#FEE2E2',
    text: '#B91C1C',
    border: '#FCA5A5',
  },

  info: {
    DEFAULT: '#1D4ED8',
    bg: '#DBEAFE',
    text: '#1D4ED8',
    border: '#93C5FD',
  },

  // ── Neutral / surface ─────────────────────────────────────────────────
  neutral: {
    50:  '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#CBD5E1',
  textPrimary: '#1E293B',
  textMuted: '#64748B',

  // ── Attendance-specific (Section 7.2 / 16.2) ─────────────────────────
  present: {
    bg: '#DCFCE7',
    text: '#15803D',
    dot: '#22C55E',
  },
  absent: {
    bg: '#FEE2E2',
    text: '#B91C1C',
    dot: '#EF4444',
  },
  // Reserved for Section 14 "Leave/Late Status" — additive, inert until enum extends.
  late: {
    bg: '#FEF3C7',
    text: '#92400E',
    dot: '#F59E0B',
  },
  leave: {
    bg: '#E0E7FF',
    text: '#3730A3',
    dot: '#6366F1',
  },

  // ── Batch status (Section 16.3) ───────────────────────────────────────
  active: {
    bg: '#DBEAFE',
    text: '#1D4ED8',
  },
  completed: {
    bg: '#F1F5F9',
    text: '#475569',
  },
  upcoming: {
    bg: '#FEF3C7',
    text: '#92400E',
  },
};

/**
 * Ordered chart palette for Recharts series (Analytics page).
 * Chosen for sufficient contrast against `background` and against each other.
 */
export const CHART_PALETTE = [
  COLORS.accent[600],
  COLORS.present.dot,
  COLORS.absent.dot,
  COLORS.primary[400],
  COLORS.late.dot,
  COLORS.leave.dot,
  COLORS.secondary[400],
];

export default COLORS;
