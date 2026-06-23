/**
 * typography.js
 * Centralized typography scale — Design System Part 2.1 (LOCKED).
 *
 * SINGLE SOURCE OF TRUTH for every text role in the application.
 * All future pages, cards, tables, modals, forms, and components
 * must consume these tokens. Never repeat raw Tailwind size+weight
 * combinations ad-hoc in component files.
 *
 * Font family: Inter (set globally in tailwind.config.js — no need
 *              to repeat font-sans per element).
 *
 * Font size scale (3 dominant sizes govern all normal UI):
 *   xs   (12px) — captions, badges, table headers, meta
 *   sm   (13px) — table cells, helper text, secondary body
 *   base (14px) — primary body, labels, nav items, form fields
 *   md   (16px) — card values, section titles
 *   xl   (24px) — page titles
 *   2xl  (30px) — KPI/hero card values (dashboard widgets only)
 *
 * Usage:
 *   import { TYPOGRAPHY } from '@constants/typography';
 *   <h1 className={TYPOGRAPHY.pageTitle}>...</h1>
 */

// ── Semantic text role tokens ───────────────────────────────────────────────

export const TYPOGRAPHY = {

  // ── Page level ───────────────────────────────────────────────────────────
  /**
   * PAGE_TITLE — top-level page heading (one per page).
   * Used in: page <header> → <h1> or <h2> stub pages.
   * Size: text-xl (24px) | Weight: semibold | Color: textPrimary
   */
  pageTitle: 'text-xl font-semibold text-textPrimary leading-tight',

  /**
   * PAGE_SUBTITLE — descriptive line below page title.
   * Size: text-sm (13px) | Weight: normal | Color: textMuted
   */
  pageSubtitle: 'text-sm text-textMuted leading-snug',

  // ── Section level ────────────────────────────────────────────────────────
  /**
   * SECTION_TITLE — heading for a major content block within a page.
   * Used in: card headers, tab labels, panel headings.
   * Size: text-base (14px) | Weight: semibold | Color: textPrimary
   */
  sectionTitle: 'text-base font-semibold text-textPrimary leading-snug',

  /**
   * SECTION_SUBTITLE — secondary text below a section title.
   * Size: text-sm (13px) | Weight: normal | Color: textMuted
   */
  sectionSubtitle: 'text-sm text-textMuted leading-relaxed',

  // ── Card level ───────────────────────────────────────────────────────────
  /**
   * CARD_TITLE — title inside a content card (StatCard, InfoCard, etc.).
   * Size: text-sm (13px) | Weight: medium | Color: textMuted
   * Intentionally lighter than sectionTitle to not compete with page hierarchy.
   */
  cardTitle: 'text-sm font-medium text-textMuted leading-snug',

  /**
   * CARD_VALUE — primary numeric or text value displayed in a card.
   * Used in: StatCard value, summary numbers.
   * Size: text-2xl (30px) | Weight: bold | Color: textPrimary
   */
  cardValue: 'text-2xl font-bold text-textPrimary tabular-nums leading-none',

  /**
   * KPI_VALUE — hero numeric value in dedicated KPI widgets.
   * Used in: KPIWidget, MetricCard (Analytics/Dashboard prominence).
   * Size: text-2xl (30px) | Weight: bold | Color: textPrimary
   * Note: Consolidated from text-3xl/text-4xl — enterprise SaaS standard.
   */
  kpiValue: 'text-2xl font-bold text-textPrimary tabular-nums leading-none',

  /**
   * KPI_UNIT — appended unit label next to a KPI value (e.g. "%").
   * Size: text-base (14px) | Weight: medium | Color: textMuted
   */
  kpiUnit: 'text-base font-medium text-textMuted',

  // ── Table level ──────────────────────────────────────────────────────────
  /**
   * TABLE_HEADER — column header cell text.
   * Size: text-xs (12px) | Weight: semibold | Color: textMuted
   * Always: uppercase + tracking-wide.
   */
  tableHeader: 'text-xs font-semibold uppercase tracking-wide text-textMuted',

  /**
   * TABLE_CELL — data cell body text.
   * Size: text-sm (13px) | Weight: normal | Color: textPrimary
   */
  tableCell: 'text-sm text-textPrimary',

  /**
   * TABLE_META — secondary/supporting text within a table cell.
   * Size: text-xs (12px) | Weight: normal | Color: textMuted
   */
  tableMeta: 'text-xs text-textMuted',

  /**
   * TABLE_ACTION — action link/button text in table rows.
   * Size: text-xs (12px) | Weight: medium | Color: textMuted (styled by button variant)
   */
  tableAction: 'text-xs font-medium',

  // ── Body text ─────────────────────────────────────────────────────────────
  /**
   * BODY — standard paragraph / description text.
   * Size: text-sm (13px) | Weight: normal | Color: textPrimary
   */
  body: 'text-sm text-textPrimary leading-relaxed',

  /**
   * BODY_MUTED — secondary/supporting body text, descriptions, timestamps.
   * Size: text-sm (13px) | Weight: normal | Color: textMuted
   */
  bodyMuted: 'text-sm text-textMuted leading-relaxed',

  // ── Form / input level ────────────────────────────────────────────────────
  /**
   * LABEL — form field label.
   * Size: text-sm (13px) | Weight: medium | Color: secondary-700
   * Intentionally uses secondary-700 to match existing Input.jsx convention.
   */
  label: 'text-sm font-medium text-secondary-700',

  /**
   * HELPER — form field helper / hint text below an input.
   * Size: text-xs (12px) | Weight: normal | Color: textMuted
   */
  helper: 'text-xs text-textMuted leading-relaxed',

  /**
   * VALIDATION_ERROR — form field error message.
   * Size: text-xs (12px) | Weight: normal | Color: danger-DEFAULT
   */
  validationError: 'text-xs text-danger-DEFAULT leading-relaxed',

  // ── Status / badge level ──────────────────────────────────────────────────
  /**
   * STATUS_SM — text inside sm-size badges.
   * Size: text-xs (12px) | Weight: medium
   */
  statusSm: 'text-xs font-medium',

  /**
   * STATUS_MD — text inside md-size badges.
   * Size: text-xs (12px) | Weight: semibold
   * Note: using xs for both sm/md badges keeps UI compact.
   */
  statusMd: 'text-xs font-semibold',

  // ── Navigation ────────────────────────────────────────────────────────────
  /**
   * NAV_ITEM — sidebar and top navigation link text.
   * Size: text-sm (13px) | Weight: medium
   */
  navItem: 'text-sm font-medium',

  /**
   * BREADCRUMB — breadcrumb trail text.
   * Size: text-xs (12px) | Weight: normal | Color: textMuted
   */
  breadcrumb: 'text-xs text-textMuted',

  // ── Overlay / modal ───────────────────────────────────────────────────────
  /**
   * MODAL_TITLE — modal dialog heading.
   * Size: text-base (14px) | Weight: semibold | Color: textPrimary
   * Aligns with sectionTitle; modals are content panels, not page headings.
   */
  modalTitle: 'text-base font-semibold text-textPrimary leading-snug',

  /**
   * MODAL_DESCRIPTION — descriptive text inside a modal body.
   * Size: text-sm (13px) | Weight: normal | Color: textMuted
   */
  modalDescription: 'text-sm text-textMuted leading-relaxed',

  /**
   * TOAST_MESSAGE — notification toast text.
   * Size: text-sm (13px) | Weight: semibold | Color: textPrimary
   */
  toastMessage: 'text-sm font-semibold text-textPrimary leading-snug',

  /**
   * TOAST_DESCRIPTION — secondary text in a toast.
   * Size: text-sm (13px) | Weight: normal | Color: textMuted
   */
  toastDescription: 'text-sm text-textMuted leading-relaxed',

  // ── Misc / utility ────────────────────────────────────────────────────────
  /**
   * CAPTION — smallest informational text (timestamps, footnotes).
   * Size: text-xs (12px) | Weight: normal | Color: textMuted
   */
  caption: 'text-xs text-textMuted',

  /**
   * CODE — monospace inline code or identifiers (batch codes, IDs).
   * Size: text-xs (12px) | Weight: normal
   */
  code: 'font-mono text-xs',

  /**
   * BUTTON_TEXT — text inside buttons (consumed by Button component).
   * Size: text-sm (13px) | Weight: medium
   */
  buttonText: 'text-sm font-medium',

  // ── Legacy aliases (backward-compat — do not use in new code) ────────────
  /** @deprecated Use pageTitle */
  h1: 'text-xl font-semibold text-textPrimary leading-tight',
  /** @deprecated Use sectionTitle */
  h2: 'text-base font-semibold text-textPrimary leading-snug',
  /** @deprecated Use cardTitle */
  h3: 'text-sm font-semibold text-textPrimary',
  /** @deprecated Use cardTitle */
  h4: 'text-sm font-medium text-textMuted',
  /** @deprecated Use body */
  bodyLarge: 'text-base font-normal text-textPrimary',
  /** @deprecated Use body */
  bodyMedium: 'text-sm font-normal text-textPrimary',
  /** @deprecated Use bodyMuted */
  bodySmall: 'text-sm font-normal text-textMuted',
  /** @deprecated Use caption */
  display: 'text-xl font-bold text-textPrimary tracking-tight',
};

/**
 * Raw pixel scale — for Recharts axis labels, canvas/SVG, non-Tailwind contexts.
 * Mirrors tailwind.config.js theme.extend.fontSize — keep in sync.
 */
export const FONT_SIZE_PX = {
  xs:    12,
  sm:    13,
  base:  14,
  md:    16,
  lg:    20,
  xl:    24,
  '2xl': 30,
  '3xl': 36,
};

export const FONT_WEIGHT = {
  normal:   400,
  medium:   500,
  semibold: 600,
  bold:     700,
};

/**
 * TYPOGRAPHY_STANDARDS — rules document for AI assistants and developers.
 * Describes when to use each token.
 */
export const TYPOGRAPHY_STANDARDS = {
  DOMINANT_SIZES: ['xs (12px)', 'sm (13px)', 'base (14px)'],
  KPI_SIZE: '2xl (30px) — hero widgets only',
  PAGE_TITLE_SIZE: 'xl (24px) — one per page',
  SECTION_TITLE_SIZE: 'base (14px) — section headings',
  BANNED_SIZES: ['text-3xl', 'text-4xl', 'text-5xl', 'text-6xl'],
  BANNED_WEIGHTS: ['font-extrabold', 'font-black'],
  RULE_PAGE_TITLE: 'One pageTitle (text-xl font-semibold) per page. Use <h1> or <h2>.',
  RULE_SECTION: 'sectionTitle (text-base font-semibold) for cards, panels, tab groups.',
  RULE_CARD: 'cardTitle (text-sm font-medium text-textMuted) above card values.',
  RULE_TABLE: 'tableHeader (text-xs uppercase tracking-wide). tableCell (text-sm).',
  RULE_MUTED: 'bodyMuted / caption / tableMeta for all secondary/supporting text.',
  RULE_LABELS: 'label token for all form labels. helper for all hint text.',
  RULE_STATUS: 'statusSm / statusMd inside Badge; always include text + color.',
};

export default TYPOGRAPHY;
