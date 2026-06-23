/**
 * uiStandards.js
 * Official UI Pattern Standards (Part 1.2 / Part 1.3 — Design Target Definition).
 *
 * This file is the LOCKED reference for all future page and component development.
 * Every page, card, table, form, modal, and state component must follow these patterns.
 *
 * Design Target: Clean SaaS · Soft Depth · Calm Colors · Clear Hierarchy
 *                Rounded Cards · Readable Tables · Professional Forms
 *                Consistent Actions · Consistent Modals · Responsive Layouts
 *
 * Usage: Import the constant objects for class-string reference.
 * Rule: Never override these patterns with one-off values in page files.
 */

// ── Page Layout ──────────────────────────────────────────────────────────────
/**
 * Standard page shell — applied to the root <div> of every protected page.
 * Provides consistent outer spacing and vertical gap between sections.
 *
 * @example
 *   <motion.div variants={fadeIn} initial="initial" animate="animate"
 *     className={PAGE_LAYOUT.root}>
 */
export const PAGE_LAYOUT = {
  /** Outermost wrapper — framer-motion target */
  root: 'flex flex-col gap-6',

  /** Page header zone — title + CTA row */
  header: 'flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between',
  headerLeft: 'flex flex-col gap-1',
  headerRight: 'flex items-center gap-2 mt-2 sm:mt-0 shrink-0',

  /** Title + icon row inside header */
  titleRow: 'flex items-center gap-2',
  title: 'text-xl font-semibold text-textPrimary',
  subtitle: 'text-sm text-textMuted',

  /** Stat card strip (2-col mobile, 4-col desktop) */
  statGrid: 'grid grid-cols-2 gap-3 sm:grid-cols-4',

  /** Filter / search bar card */
  filterBar: 'bg-white rounded-lg border border-border shadow-card p-4',

  /** Primary content area — table, list, or chart card */
  contentCard: 'bg-white rounded-lg border border-border shadow-card overflow-hidden',
};

// ── Section Gap Standard ──────────────────────────────────────────────────────
/**
 * Vertical gap between major sections within a page.
 * Used as `gap-{n}` on the PAGE_LAYOUT.root wrapper.
 *
 *   6  = 24px — standard section gap (page root)
 *   4  = 16px — between items inside a section (e.g., panel cols)
 *   3  = 12px — tight grouping (filter chips, meta row)
 */
export const SECTION_GAP = {
  page:    'gap-6',   // 24px — between page sections
  panel:   'gap-4',   // 16px — between panel columns / sub-sections
  tight:   'gap-3',   // 12px — between chips, inline meta
  compact: 'gap-2',   // 8px  — within a single element (icon+label)
};

// ── Card Standards ────────────────────────────────────────────────────────────
/**
 * Official card appearance pattern.
 * Cards use: white bg, subtle border, shadow-card, rounded-md (8px), p-5 padding.
 *
 * DO NOT use shadow-md, shadow-lg, or shadow-2xl on content cards.
 * Reserved exceptions: modal (shadow-modal), overlay drawer (shadow-2xl).
 */
export const CARD = {
  base:     'bg-white rounded-md border border-border shadow-card',
  padding:  'p-5',
  padded:   'bg-white rounded-md border border-border shadow-card p-5',
  /** For filter bars and secondary panels — slightly reduced padding */
  compact:  'bg-white rounded-lg border border-border shadow-card p-4',
  /** Interactive card — adds hover lift via framer-motion cardHover variant */
  interactive: 'bg-white rounded-md border border-border shadow-card cursor-pointer',
};

// ── Table Standards ───────────────────────────────────────────────────────────
/**
 * DataTable configuration constants.
 * Used by DataTable.jsx and any future table implementations.
 */
export const TABLE = {
  /** Thead background and border */
  header: 'bg-neutral-50 border-b border-border',
  /** Header cell — always use these classes */
  headerCell: 'px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wide whitespace-nowrap select-none',
  /** Body cell */
  bodyCell: 'px-4 py-3 text-sm text-textPrimary whitespace-nowrap',
  /** Alt-row tint */
  altRow: 'bg-neutral-50/40',
  /** Hover state for clickable rows */
  hoverRow: 'hover:bg-accent-50/50 cursor-pointer',
  /** Action cell — right-aligned, min-width */
  actionCell: 'px-4 py-3 text-right',
  /** Action button group wrapper */
  actionGroup: 'flex items-center justify-end gap-1',
};

// ── Form Standards ────────────────────────────────────────────────────────────
/**
 * Official form layout.
 * Forms are divided into named sections with icon+title header.
 * Each section uses gap-4 between fields. Two-col grids use sm:grid-cols-2.
 */
export const FORM = {
  /** Root wrapper — sections are children */
  root: 'flex flex-col gap-6',
  /** Section wrapper */
  section: 'flex flex-col gap-4',
  /** Section header — icon + title + bottom border */
  sectionHeader: 'flex items-center gap-2 pb-2 border-b border-neutral-100',
  sectionIcon: 'w-4 h-4 text-accent-600 shrink-0',
  sectionTitle: 'text-sm font-semibold text-textPrimary leading-none',
  /** Two-column field row */
  fieldRow: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
  /** Submit error banner */
  errorBanner: 'flex items-start gap-3 px-4 py-3 rounded-lg bg-danger-bg border border-danger-DEFAULT/30 text-sm text-danger-DEFAULT',
};

// ── Action Hierarchy ──────────────────────────────────────────────────────────
/**
 * Button variant usage rules.
 *
 * primary   — single primary CTA per page / modal (Add, Save, Create)
 * secondary — supporting actions (Refresh, Retry, secondary submit)
 * outline   — key secondary actions that need visual presence (Edit, Export)
 * ghost     — low-priority actions, table row icons, Cancel in modals
 * danger    — destructive actions (Delete, Remove, Archive)
 * success   — positive completion (Confirm, Mark All Present) — use sparingly
 *
 * Rules:
 *   - Max ONE primary button visible at a time in a given context area
 *   - Danger actions MUST be preceded by a ConfirmDialog
 *   - Icon-only buttons MUST have aria-label
 *   - Table row actions: ghost buttons, size="sm"
 *   - Modal footers: ghost Cancel (left) + primary/danger Save (right)
 */
export const ACTION_HIERARCHY = {
  pageCreate:   { variant: 'primary',   size: 'sm' },
  pageSecondary:{ variant: 'outline',   size: 'sm' },
  tablePrimary: { variant: 'ghost',     size: 'sm' },
  tableDanger:  { variant: 'ghost',     size: 'sm' },  // ghost; ConfirmDialog escalates
  modalCancel:  { variant: 'ghost',     size: 'sm' },
  modalSave:    { variant: 'primary',   size: 'sm' },
  modalDelete:  { variant: 'danger',    size: 'sm' },
};

// ── Modal Standards ───────────────────────────────────────────────────────────
/**
 * Modal sizing rules:
 *   sm   — confirmations, alerts, single-field forms (max-w-sm 384px)
 *   md   — standard forms up to 6 fields (max-w-md 448px) — DEFAULT
 *   lg   — complex multi-section forms (max-w-lg 512px)
 *   xl   — wide content, tables, dual-column forms (max-w-2xl 672px)
 *
 * Footer rule: justify-end, gap-3, Cancel (ghost) left, primary/danger right.
 * Body padding: px-6 py-5 (provided by Modal component — do not re-add).
 * Scrollable: body scrolls internally; header/footer are sticky (provided by Modal).
 */
export const MODAL = {
  formSize:    'lg',   // BatchForm, StudentForm — multi-section
  confirmSize: 'sm',   // ConfirmDialog
  alertSize:   'sm',   // Alert-type modals
  defaultSize: 'md',   // Fallback
  footerAlign: 'flex items-center justify-end gap-3',
};

// ── Loading State Standard ────────────────────────────────────────────────────
/**
 * Loading state hierarchy:
 *   Page-level initial load → PageSkeleton or section-specific skeleton
 *   Table loading → TableSkeleton (built into DataTable via loading prop)
 *   Card loading → CardSkeleton (built into StatCard / KPIWidget via loading prop)
 *   Button loading → loading prop on Button (shows spinner, dims label)
 *   Inline data → Skeleton component with appropriate width/height
 *
 * Rule: Never show a raw spinner for page-level loads — always use skeletons.
 * Rule: TableSkeleton rows should match expected content count (5 rows default).
 */
export const LOADING = {
  tableRows:  5,
  cardCols:   4,
  skeletonBg: 'bg-neutral-200 animate-pulse',
};

// ── Empty State Standard ──────────────────────────────────────────────────────
/**
 * Empty state rules:
 *   - Always provide title + description (never just a blank area)
 *   - Title: "No X yet" for first-time empty, "No matching X" for filtered empty
 *   - Description: context-specific guidance, direct and actionable
 *   - CTA: include actionLabel for first-time empty (Add X)
 *   - CTA for filtered: "Clear filters" or "Reset search"
 *   - py-14 for table empty states, py-20 for full-page empty states
 *   - Icon: 8x8 lucide icon, text-neutral-400
 */
export const EMPTY_STATE = {
  tablePadding:    'py-14',
  fullPagePadding: 'py-20',
  iconClass:       'w-8 h-8',
  iconContainer:   'flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400',
};

// ── Error State Standard ──────────────────────────────────────────────────────
/**
 * Error state rules:
 *   - Always provide title ("Failed to load X") + description (error message)
 *   - Always provide onRetry when possible
 *   - Use ErrorState component for data-fetch failures
 *   - Use Alert component for inline validation / form errors
 *   - Use danger Toast for action failures (delete, save)
 *   - Use ConfirmDialog for destructive action confirmation (not error — prevention)
 */
export const ERROR_STATE = {
  tablePadding: 'py-14',
  inlinePadding: 'py-8',
};

// ── Motion Standard ───────────────────────────────────────────────────────────
/**
 * Animation rules:
 *   Page entry → fadeIn variant from animations.js (always)
 *   Card hover → cardHover variant (StatCard, KPIWidget, MetricCard, InfoCard)
 *   Button tap → buttonPress variant (built into Button component)
 *   Modal open/close → modalOpen variant (built into Modal component)
 *   Toast enter/exit → toastEnter/toastExit (built into Toast component)
 *   List item enter → fadeIn or slideUp (use for dynamically added items)
 *   Conditional section (AnimatePresence) → fadeIn with height transition
 *
 * Rules:
 *   - Never animate layout properties (width, height directly — use max-h/opacity)
 *   - Always check usePrefersReducedMotion() before applying framer variants
 *   - Don't add animation to static content areas — motion draws attention
 *   - Max 1 animated entrance per page-level render cycle
 */
export const MOTION = {
  pageEntry: 'fadeIn',
  cardHover: 'cardHover',
  listItem:  'slideUp',
  maxAnimationsPerRender: 1,
};

// ── Responsive Standard ───────────────────────────────────────────────────────
/**
 * Responsive rules (mobile-first):
 *   Mobile   (375px) : single column, full-width cards, collapsed sidebar
 *   Tablet   (768px) : 2-col grids, sidebar overlay
 *   Laptop   (1024px): persistent sidebar, 4-col stat grids, 2-col form fields
 *   Desktop  (1280px): max-content-width container, no layout changes
 *   Wide     (1536px): optional wider container
 *
 * Touch targets: min 44×44px for all interactive elements
 * Tables: overflow-x-auto on mobile; sticky header always
 * Modals: mx-4 (16px gutters) on all viewport widths
 * Filters: column on mobile, row on sm+ (sm:flex-row)
 */
export const RESPONSIVE = {
  statGrid:    'grid-cols-2 sm:grid-cols-4',
  formFields:  'grid-cols-1 sm:grid-cols-2',
  filterBar:   'flex-col sm:flex-row',
  searchWidth: 'w-full sm:w-64',
  minTouch:    'min-h-[44px] min-w-[44px]',
};

export default {
  PAGE_LAYOUT,
  SECTION_GAP,
  CARD,
  TABLE,
  FORM,
  ACTION_HIERARCHY,
  MODAL,
  LOADING,
  EMPTY_STATE,
  ERROR_STATE,
  MOTION,
  RESPONSIVE,
};
