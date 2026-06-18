/**
 * theme.js
 * Design token aggregator (Blueprint Section 16.6, Phase 3 Module 3.1).
 *
 * Re-exports every design-token module under a single `THEME` object so
 * components can do either:
 *   import { COLORS } from '@constants/colors'        (granular)
 *   import { THEME } from '@constants/theme'          (aggregate)
 *
 * This file performs NO redefinition — it only imports and re-exports,
 * preventing drift between token files.
 */

import { COLORS, CHART_PALETTE } from './colors';
import { TYPOGRAPHY, FONT_SIZE_PX, FONT_WEIGHT } from './typography';
import { SPACING_PX, SPACING_SCALE, LAYOUT_SPACING } from './spacing';
import { RADIUS, RADIUS_MAP, SHADOWS, SHADOW_MAP } from './shadows';
import animations from './animations';
import { ICONS, ICON_STROKE_WIDTH, ICON_SIZES } from './icons';
import responsive from './responsive';
import accessibility from './accessibility';

export const THEME = {
  colors: COLORS,
  chartPalette: CHART_PALETTE,
  typography: TYPOGRAPHY,
  fontSize: FONT_SIZE_PX,
  fontWeight: FONT_WEIGHT,
  spacing: SPACING_PX,
  spacingScale: SPACING_SCALE,
  layoutSpacing: LAYOUT_SPACING,
  radius: RADIUS,
  radiusMap: RADIUS_MAP,
  shadows: SHADOWS,
  shadowMap: SHADOW_MAP,
  animations,
  icons: ICONS,
  iconStrokeWidth: ICON_STROKE_WIDTH,
  iconSizes: ICON_SIZES,
  responsive,
  accessibility,
};

export default THEME;
