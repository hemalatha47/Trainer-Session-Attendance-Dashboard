/**
 * Loader.jsx
 * Reusable loading indicator components (Module 3.3, Task 4).
 *
 * Exports:
 *   Spinner      — animated circular spinner (inline / button use)
 *   PageLoader   — full-screen loading overlay
 *   SectionLoader — centered loader for a card/panel area
 *   InlineLoader — single-line horizontal loader with label
 *   CardLoader   — card-height loading placeholder
 *   TableLoader  — table-area loading placeholder
 *
 * All use framer-motion and honor prefers-reduced-motion.
 */

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { usePrefersReducedMotion, fadeIn } from '@constants/animations';
import { cn, safeMotion } from '@utils/componentUtils';

// ── Spinner ──────────────────────────────────────────────────────────────────

/**
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {string} [props.className]
 * @param {string} [props.label='Loading']
 */
const Spinner = ({ size = 'md', className, label = 'Loading' }) => {
  const SIZE_MAP = { xs: 'h-3 w-3', sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7', xl: 'h-9 w-9' };
  const szCls = SIZE_MAP[size] ?? SIZE_MAP.md;

  return (
    <span role="status" aria-label={label} className={cn('inline-flex items-center', className)}>
      <Loader2 className={cn(szCls, 'animate-spin text-accent-600')} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
};

Spinner.displayName = 'Spinner';

// ── PageLoader ───────────────────────────────────────────────────────────────

/**
 * Full-screen centered loading state.
 * @param {string} [props.label='Loading…']
 */
const PageLoader = ({ label = 'Loading…' }) => {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background"
      {...safeMotion(reduced, fadeIn)}
    >
      <div className="relative">
        {/* Outer ring */}
        <div className="h-14 w-14 rounded-full border-4 border-accent-100" aria-hidden="true" />
        {/* Spinning arc */}
        <div
          className="absolute inset-0 h-14 w-14 animate-spin rounded-full border-4 border-transparent border-t-accent-600"
          aria-hidden="true"
        />
      </div>
      <p className="text-sm font-medium text-textMuted">{label}</p>
      <span className="sr-only">{label}</span>
    </motion.div>
  );
};

PageLoader.displayName = 'PageLoader';

// ── SectionLoader ────────────────────────────────────────────────────────────

/**
 * Centered loader for a card or panel area.
 * @param {string} [props.label='Loading…']
 * @param {string} [props.className]
 * @param {string} [props.minHeight='min-h-48']
 */
const SectionLoader = ({ label = 'Loading…', className, minHeight = 'min-h-48' }) => (
  <div
    role="status"
    aria-label={label}
    className={cn(
      'flex flex-col items-center justify-center gap-3 w-full',
      minHeight,
      className
    )}
  >
    <Spinner size="lg" label={label} />
    <p className="text-sm text-textMuted" aria-hidden="true">{label}</p>
  </div>
);

SectionLoader.displayName = 'SectionLoader';

// ── InlineLoader ─────────────────────────────────────────────────────────────

/**
 * Inline horizontal loader with optional label.
 * @param {string} [props.label='Loading…']
 * @param {string} [props.className]
 */
const InlineLoader = ({ label = 'Loading…', className }) => (
  <span
    role="status"
    aria-label={label}
    className={cn('inline-flex items-center gap-2 text-sm text-textMuted', className)}
  >
    <Spinner size="sm" label={label} />
    <span aria-hidden="true">{label}</span>
  </span>
);

InlineLoader.displayName = 'InlineLoader';

// ── CardLoader ───────────────────────────────────────────────────────────────

/**
 * Card-height loading state; used while fetching card data.
 * @param {string} [props.className]
 */
const CardLoader = ({ className }) => (
  <div
    className={cn(
      'flex items-center justify-center rounded-md border border-border bg-white',
      'shadow-card min-h-32',
      className
    )}
  >
    <SectionLoader minHeight="min-h-0" />
  </div>
);

CardLoader.displayName = 'CardLoader';

// ── TableLoader ───────────────────────────────────────────────────────────────

/**
 * Table-area loading state.
 * @param {number} [props.rows=5]
 * @param {number} [props.cols=5]
 * @param {string} [props.className]
 */
const TableLoader = ({ rows = 5, cols = 5, className }) => (
  <div
    role="status"
    aria-label="Loading table data"
    className={cn('w-full overflow-hidden rounded-md border border-border bg-white', className)}
  >
    {/* Header row */}
    <div className="flex gap-3 border-b border-border bg-neutral-50 px-4 py-3">
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-neutral-200 animate-pulse"
          style={{ width: i === 0 ? '30%' : `${Math.max(10, 20 - i * 2)}%` }}
          aria-hidden="true"
        />
      ))}
    </div>
    {/* Data rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div
        key={rowIdx}
        className={cn(
          'flex gap-3 px-4 py-3 border-b border-border last:border-b-0',
          rowIdx % 2 === 1 && 'bg-neutral-50/50'
        )}
      >
        {Array.from({ length: cols }).map((_, colIdx) => (
          <div
            key={colIdx}
            className="h-3 rounded-full bg-neutral-100 animate-pulse"
            style={{
              width: colIdx === 0 ? '30%' : `${Math.max(8, 18 - colIdx * 2)}%`,
              animationDelay: `${rowIdx * 0.05 + colIdx * 0.02}s`,
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    ))}
    <span className="sr-only">Loading table data, please wait.</span>
  </div>
);

TableLoader.displayName = 'TableLoader';

export { Spinner, PageLoader, SectionLoader, InlineLoader, CardLoader, TableLoader };
export default Spinner;
