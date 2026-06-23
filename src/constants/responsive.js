/**
 * responsive.js
 * Responsive system standards (Phase 3, Module 3.1).
 *
 * Mirrors tailwind.config.js theme.extend.screens. All future modules
 * must build mobile-first using these breakpoints — no custom
 * media queries or one-off breakpoint values.
 */

export const BREAKPOINTS_PX = {
  mobile: 375,   // sm
  tablet: 768,   // md
  laptop: 1024,  // lg
  desktop: 1280, // xl
  wide: 1536,    // 2xl
};

/** Tailwind prefixes matching BREAKPOINTS_PX, for reference in class strings. */
export const BREAKPOINT_PREFIXES = {
  mobile: 'sm',
  tablet: 'md',
  laptop: 'lg',
  desktop: 'xl',
  wide: '2xl',
};

/**
 * Max-width container per breakpoint — applied to page-level wrappers
 * so content doesn't stretch edge-to-edge on very large screens.
 */
export const CONTAINER_MAX_WIDTH = {
  mobile: '100%',
  tablet: '100%',
  laptop: '100%',
  desktop: '1440px',
  wide: '1600px',
};

/**
 * Sidebar widths (Module 2.2 PageWrapper/Sidebar) — referenced so future
 * layout math (e.g. content offset) stays in sync with the actual Sidebar.
 */
export const SIDEBAR_WIDTH = {
  expanded: 240,
  collapsed: 72,
};

export const TOPBAR_HEIGHT = 64;

/**
 * Grid column standards for card/stat grids (Dashboard, Reports, etc.)
 * Use as: `grid grid-cols-{mobile} md:grid-cols-{tablet} lg:grid-cols-{laptop}`
 */
export const GRID_COLUMNS = {
  statCards: { mobile: 1, tablet: 2, laptop: 4 },
  formFields: { mobile: 1, tablet: 2, laptop: 2 },
  cardGrid: { mobile: 1, tablet: 2, laptop: 3 },
};

/**
 * Navigation behavior per breakpoint (Sidebar — Section 7.1):
 *  - below `laptop` (1024px): Sidebar renders as a slide-in drawer overlay
 *  - `laptop` and above: Sidebar is persistent, togglable expanded/collapsed
 */
export const NAV_BEHAVIOR = {
  drawerBelow: BREAKPOINT_PREFIXES.laptop ?? 'lg',
  persistentFrom: 'lg',
};

export default {
  BREAKPOINTS_PX,
  BREAKPOINT_PREFIXES,
  CONTAINER_MAX_WIDTH,
  SIDEBAR_WIDTH,
  TOPBAR_HEIGHT,
  GRID_COLUMNS,
  NAV_BEHAVIOR,
};
