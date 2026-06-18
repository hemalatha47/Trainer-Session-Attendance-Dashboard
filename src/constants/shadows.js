/**
 * shadows.js
 * Centralized radius + shadow token systems (Phase 3, Module 3.1).
 *
 * Mirrors tailwind.config.js theme.extend.borderRadius / boxShadow.
 * Components should use the Tailwind class names below (`rounded-{key}`,
 * `shadow-{key}`) rather than raw values.
 */

// ── Radius ──────────────────────────────────────────────────────────────
export const RADIUS = {
  xs: '2px',
  sm: '4px',
  md: '8px',     // DEFAULT — cards, inputs, buttons (Section 7.3)
  lg: '12px',    // modals, large cards
  xl: '16px',    // hero/login panels
  '2xl': '24px', // rare — large illustrative containers
  full: '9999px',// pills, avatars, badges
};

/** Component → radius mapping, for consistency across Module 3.2+ */
export const RADIUS_MAP = {
  button: RADIUS.md,
  input: RADIUS.md,
  card: RADIUS.md,
  badge: RADIUS.full,
  avatar: RADIUS.full,
  modal: RADIUS.lg,
  dropdown: RADIUS.md,
  toast: RADIUS.md,
};

// ── Shadows ─────────────────────────────────────────────────────────────
export const SHADOWS = {
  // Static surfaces — cards, panels at rest
  card: '0 1px 3px rgba(0,0,0,0.08)',

  // Elevated on interaction — hover/active card states
  hover: '0 4px 12px rgba(0,0,0,0.10)',

  // Dropdown / popover menus
  dropdown: '0 4px 12px rgba(0,0,0,0.10)',

  // Modals / dialogs — highest static elevation
  modal: '0 8px 24px rgba(0,0,0,0.12)',

  // Floating elements — toasts, FABs
  floating: '0 8px 24px rgba(0,0,0,0.12)',

  // Focus ring shadow (paired with focus-visible outline utilities)
  focus: '0 0 0 3px rgba(37,99,235,0.35)', // accent-600 @ 35%
};

/** Component → shadow mapping */
export const SHADOW_MAP = {
  card: SHADOWS.card,
  cardHover: SHADOWS.hover,
  dropdown: SHADOWS.dropdown,
  modal: SHADOWS.modal,
  toast: SHADOWS.floating,
  focusRing: SHADOWS.focus,
};

export default { RADIUS, RADIUS_MAP, SHADOWS, SHADOW_MAP };
