/**
 * typography.js
 * Centralized typography scale (Phase 3, Module 3.1).
 *
 * Maps semantic text roles to Tailwind utility class strings so every
 * future component pulls from one source instead of repeating
 * `text-xl font-semibold` combinations ad hoc.
 *
 * Usage: <h1 className={TYPOGRAPHY.h1}>...</h1>
 *        <p className={TYPOGRAPHY.bodySmall}>...</p>
 *
 * Font family is set globally via tailwind.config.js (Inter); no need to
 * repeat font-sans per element.
 */

export const TYPOGRAPHY = {
  // Page-level hero text (rare — landing/empty states)
  display:    'text-3xl font-bold tracking-tight text-textPrimary',

  // Section/page headings
  h1:         'text-2xl font-semibold tracking-tight text-textPrimary',
  h2:         'text-xl font-semibold text-textPrimary',
  h3:         'text-lg font-semibold text-textPrimary',
  h4:         'text-md font-semibold text-textPrimary',

  // Body copy
  bodyLarge:  'text-md font-normal text-textPrimary',
  bodyMedium: 'text-base font-normal text-textPrimary',
  bodySmall:  'text-sm font-normal text-textMuted',

  // Supporting text
  caption:    'text-xs font-normal text-textMuted',
  label:      'text-sm font-medium text-textPrimary',

  // Interactive elements
  button:     'text-sm font-medium',
  navItem:    'text-sm font-medium',

  // Tabular data
  tableHeader: 'text-xs font-semibold uppercase tracking-wide text-textMuted',
  tableCell:   'text-sm font-normal text-textPrimary',
};

/**
 * Raw scale (px) for reference / non-Tailwind contexts (e.g. chart axis labels).
 * Mirrors tailwind.config.js theme.extend.fontSize — keep in sync.
 */
export const FONT_SIZE_PX = {
  xs: 12,
  sm: 13,
  base: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 36,
};

export const FONT_WEIGHT = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export default TYPOGRAPHY;
