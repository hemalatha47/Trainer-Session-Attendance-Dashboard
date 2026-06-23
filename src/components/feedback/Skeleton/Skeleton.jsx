/**
 * Skeleton.jsx
 * Shimmer skeleton loading components (Module 3.3, Task 5).
 *
 * Exports:
 *   Skeleton      — base shimmer element (configurable width/height/shape)
 *   TextSkeleton  — paragraph-of-text placeholder
 *   CardSkeleton  — stat/info card placeholder
 *   TableSkeleton — full table placeholder
 *   AvatarSkeleton — circular avatar placeholder
 *   FormSkeleton  — form fields placeholder
 *   PageSkeleton  — full page-level placeholder
 *
 * Shimmer: CSS animation `animate-pulse` (Tailwind) — GPU-friendly opacity pulse.
 * A custom shimmer sweep can replace this without changing component APIs.
 */

import { cn } from '@utils/componentUtils';

// ── Base skeleton element ────────────────────────────────────────────────────

/**
 * @param {string}  [props.className]
 * @param {'rect'|'circle'|'pill'} [props.shape='rect']
 * @param {string}  [props.width='w-full']
 * @param {string}  [props.height='h-4']
 */
const Skeleton = ({ className, shape = 'rect', width = 'w-full', height = 'h-4' }) => {
  const shapeClass = {
    rect:   'rounded',
    circle: 'rounded-full',
    pill:   'rounded-full',
  }[shape] ?? 'rounded';

  return (
    <div
      aria-hidden="true"
      className={cn('bg-neutral-200 animate-pulse', shapeClass, width, height, className)}
    />
  );
};

Skeleton.displayName = 'Skeleton';

// ── TextSkeleton ─────────────────────────────────────────────────────────────

/**
 * @param {number}  [props.lines=3]
 * @param {string}  [props.className]
 */
const TextSkeleton = ({ lines = 3, className }) => (
  <div role="status" aria-label="Loading content" className={cn('flex flex-col gap-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height="h-3"
        width={i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}
      />
    ))}
    <span className="sr-only">Loading content…</span>
  </div>
);

TextSkeleton.displayName = 'TextSkeleton';

// ── AvatarSkeleton ────────────────────────────────────────────────────────────

/**
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {string} [props.className]
 */
const AvatarSkeleton = ({ size = 'md', className }) => {
  const SIZE_MAP = { xs: 'h-6 w-6', sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-11 w-11', xl: 'h-14 w-14' };
  return (
    <Skeleton
      shape="circle"
      width={SIZE_MAP[size] ?? SIZE_MAP.md}
      height={SIZE_MAP[size] ?? SIZE_MAP.md}
      className={cn('shrink-0', className)}
    />
  );
};

AvatarSkeleton.displayName = 'AvatarSkeleton';

// ── CardSkeleton ─────────────────────────────────────────────────────────────

/**
 * Mimics a StatCard or info card.
 * @param {string} [props.className]
 */
const CardSkeleton = ({ className }) => (
  <div
    role="status"
    aria-label="Loading card"
    className={cn(
      'rounded-md border border-border bg-white p-5 shadow-card flex flex-col gap-3',
      className
    )}
  >
    {/* Icon + label row */}
    <div className="flex items-center gap-3">
      <Skeleton shape="circle" width="w-9" height="h-9" />
      <Skeleton height="h-3" width="w-1/3" />
    </div>
    {/* Value */}
    <Skeleton height="h-7" width="w-1/2" />
    {/* Sub-label */}
    <Skeleton height="h-2.5" width="w-2/3" />
    <span className="sr-only">Loading card…</span>
  </div>
);

CardSkeleton.displayName = 'CardSkeleton';

// ── TableSkeleton ─────────────────────────────────────────────────────────────

/**
 * @param {number} [props.rows=5]
 * @param {number} [props.cols=5]
 * @param {string} [props.className]
 */
const TableSkeleton = ({ rows = 5, cols = 5, className }) => (
  <div
    role="status"
    aria-label="Loading table"
    className={cn('w-full overflow-hidden rounded-md border border-border bg-white', className)}
  >
    {/* Header */}
    <div className="flex gap-3 border-b border-border bg-neutral-50 px-4 py-3">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          height="h-3"
          width={i === 0 ? 'w-1/4' : 'w-1/6'}
          className={i === 0 ? '' : 'hidden sm:block'}
        />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div
        key={rowIdx}
        className={cn(
          'flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-b-0',
          rowIdx % 2 === 1 && 'bg-neutral-50/40'
        )}
      >
        {/* Avatar + text combo for first col */}
        <div className="flex items-center gap-2 w-1/4">
          <AvatarSkeleton size="sm" />
          <Skeleton height="h-3" width="w-24" />
        </div>
        {Array.from({ length: cols - 1 }).map((_, colIdx) => (
          <Skeleton
            key={colIdx}
            height="h-3"
            width="w-1/6"
            className={colIdx > 1 ? 'hidden sm:block' : ''}
          />
        ))}
      </div>
    ))}
    <span className="sr-only">Loading table data…</span>
  </div>
);

TableSkeleton.displayName = 'TableSkeleton';

// ── FormSkeleton ──────────────────────────────────────────────────────────────

/**
 * @param {number} [props.fields=4]
 * @param {string} [props.className]
 */
const FormSkeleton = ({ fields = 4, className }) => (
  <div
    role="status"
    aria-label="Loading form"
    className={cn('flex flex-col gap-5', className)}
  >
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="flex flex-col gap-1.5">
        <Skeleton height="h-3" width="w-1/4" />
        <Skeleton height="h-9" />
      </div>
    ))}
    {/* Submit button placeholder */}
    <Skeleton height="h-9" width="w-32" className="mt-2" />
    <span className="sr-only">Loading form…</span>
  </div>
);

FormSkeleton.displayName = 'FormSkeleton';

// ── PageSkeleton ─────────────────────────────────────────────────────────────

/**
 * Full page-level skeleton — header + stat cards + table.
 */
const PageSkeleton = () => (
  <div role="status" aria-label="Loading page" className="flex flex-col gap-6">
    {/* Page title + action */}
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1.5">
        <Skeleton height="h-6" width="w-48" />
        <Skeleton height="h-3" width="w-64" />
      </div>
      <Skeleton height="h-9" width="w-28" />
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>

    {/* Table */}
    <TableSkeleton rows={6} cols={5} />

    <span className="sr-only">Loading page content…</span>
  </div>
);

PageSkeleton.displayName = 'PageSkeleton';

export {
  Skeleton,
  TextSkeleton,
  AvatarSkeleton,
  CardSkeleton,
  TableSkeleton,
  FormSkeleton,
  PageSkeleton,
};
export default Skeleton;
