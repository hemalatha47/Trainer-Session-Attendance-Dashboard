/**
 * spacing.js
 * Centralized spacing scale (Phase 3, Module 3.1).
 *
 * Mirrors tailwind.config.js theme.extend.spacing (px values) plus the
 * extended scale (80px, 96px) requested for Module 3.1. Tailwind config
 * is the enforcement layer (`p-6`, `gap-4`, etc.); this file exists for
 * non-Tailwind contexts (chart margins, inline calculations) and as
 * documentation of the canonical scale.
 *
 * Rule: never hardcode px spacing values in components — use the
 * matching Tailwind class (`p-{key}`, `gap-{key}`, `m-{key}`) so values
 * stay centrally controlled.
 */

export const SPACING_PX = {
  0:  0,
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  6:  24,
  8:  32,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

/**
 * Tailwind class scale reference — the keys above map 1:1 to Tailwind's
 * spacing utilities (p-, m-, gap-, space-x-, space-y-, w-, h-) once
 * registered in tailwind.config.js theme.extend.spacing.
 */
export const SPACING_SCALE = Object.keys(SPACING_PX);

/**
 * Common layout spacing presets — semantic names for frequently reused
 * combinations, to avoid re-deriving "page padding" etc. in every page.
 */
export const LAYOUT_SPACING = {
  pageGutterMobile: SPACING_PX[4],   // 16px
  pageGutterDesktop: SPACING_PX[6],  // 24px
  cardPadding: SPACING_PX[4],        // 16px
  sectionGap: SPACING_PX[6],         // 24px
  formFieldGap: SPACING_PX[4],       // 16px
};

export default SPACING_PX;
