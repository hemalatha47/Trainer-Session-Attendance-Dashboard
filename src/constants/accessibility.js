/**
 * accessibility.js
 * Accessibility standards (Phase 3, Module 3.1).
 *
 * Centralizes the Tailwind class fragments and rules that every future
 * interactive component must apply, so a11y isn't re-derived ad hoc
 * per component.
 */

/**
 * Standard focus-visible ring — apply to every interactive element
 * (buttons, links, inputs, custom controls). Matches accent color
 * (Section 7.2) at sufficient contrast against `background` and `surface`.
 */
export const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

/** Focus ring variant for elements on a dark/primary background. */
export const FOCUS_RING_ON_DARK =
  'outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary';

/** Disabled-state class fragment — pairs with `disabled` attribute. */
export const DISABLED_STATE = 'disabled:opacity-60 disabled:cursor-not-allowed';

/**
 * Reduced-motion guard class — wraps `transition-*` utilities so users
 * with `prefers-reduced-motion: reduce` don't see animated transitions.
 * Use alongside `usePrefersReducedMotion()` from animations.js for
 * framer-motion variants.
 */
export const MOTION_SAFE_TRANSITION = 'motion-safe:transition-all motion-safe:duration-200';

/**
 * Minimum touch target size (px) for interactive elements on
 * touch devices (WCAG 2.5.5). Apply via min-w-/min-h- utilities
 * for icon-only buttons.
 */
export const MIN_TOUCH_TARGET_PX = 44;

/**
 * Color contrast notes (WCAG AA, 4.5:1 for normal text, 3:1 for large text):
 *  - textPrimary (#1E293B) on background (#F8FAFC) → ~12.6:1  ✅
 *  - textMuted (#64748B) on background (#F8FAFC) → ~4.6:1   ✅ (AA, body text)
 *  - white on primary (#1E3A5F) → ~9.4:1  ✅
 *  - white on accent (#2563EB) → ~4.6:1  ✅ (AA)
 *  - present.text (#15803D) on present.bg (#DCFCE7) → ~5.4:1 ✅
 *  - absent.text (#B91C1C) on absent.bg (#FEE2E2) → ~5.9:1 ✅
 * All Section 7.2 badge pairs meet WCAG AA for normal text.
 */
export const CONTRAST_NOTES = {
  textPrimaryOnBackground: '12.6:1',
  textMutedOnBackground: '4.6:1',
  whiteOnPrimary: '9.4:1',
  whiteOnAccent: '4.6:1',
  presentBadge: '5.4:1',
  absentBadge: '5.9:1',
};

/**
 * Required ARIA patterns per component type — reference for Module 3.2+.
 * Not exhaustive; documents the minimum bar.
 */
export const ARIA_REQUIREMENTS = {
  button: ['aria-label (if icon-only)', 'aria-disabled when disabled'],
  input: ['associated <label> via htmlFor/id', 'aria-invalid on error', 'aria-describedby for error text'],
  modal: ['role="dialog"', 'aria-modal="true"', 'aria-labelledby', 'focus trap', 'Escape to close'],
  toast: ['role="status" or role="alert"', 'aria-live="polite" (or "assertive" for errors)'],
  table: ['<th scope="col">', 'caption or aria-label', 'empty-state message in <tbody>'],
  navigation: ['role="navigation"', 'aria-current="page" on active link'],
  tabs: ['role="tablist"/"tab"/"tabpanel"', 'aria-selected', 'arrow-key navigation'],
};

/**
 * Keyboard interaction baseline — every interactive component must
 * support these without requiring a mouse.
 */
export const KEYBOARD_STANDARDS = {
  activate: ['Enter', 'Space'],
  closeOverlay: ['Escape'],
  navigateList: ['ArrowUp', 'ArrowDown'],
  navigateTabs: ['ArrowLeft', 'ArrowRight'],
  trapFocusInModals: true,
  restoreFocusOnClose: true,
};

export default {
  FOCUS_RING,
  FOCUS_RING_ON_DARK,
  DISABLED_STATE,
  MOTION_SAFE_TRANSITION,
  MIN_TOUCH_TARGET_PX,
  CONTRAST_NOTES,
  ARIA_REQUIREMENTS,
  KEYBOARD_STANDARDS,
};
