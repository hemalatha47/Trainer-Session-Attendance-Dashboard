/**
 * InfoCard.jsx
 * Information display components (Module 3.4, Task 6/12).
 *
 * Exports:
 *   InfoCard          — titled white card container (wraps content sections)
 *   KeyValueDisplay   — grid of label:value pairs (batch details, student profile)
 *   SummaryCard       — compact stats summary with title + metric list
 *   DataList          — styled <dl> list for key-value pairs
 *   SearchResultItem  — single search result row (name + meta + badge)
 */

import { motion } from 'framer-motion';
import { cardHover, usePrefersReducedMotion } from '@constants/animations';
import { cn, safeMotion } from '@utils/componentUtils';

// ── InfoCard ─────────────────────────────────────────────────────────────────

/**
 * @param {string}  [props.title]
 * @param {string}  [props.subtitle]
 * @param {React.ReactNode} [props.headerRight]  — header right-slot (badge / button)
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.hoverable=false]
 * @param {string}  [props.className]
 */
const InfoCard = ({ title, subtitle, headerRight, children, hoverable = false, className }) => {
  const reduced = usePrefersReducedMotion();

  const motionProps = hoverable
    ? safeMotion(reduced, { variants: cardHover, initial: 'rest', whileHover: 'hover' })
    : {};

  return (
    <motion.div
      className={cn(
        'rounded-md border border-border bg-white shadow-card',
        className
      )}
      {...motionProps}
    >
      {/* Header */}
      {(title || headerRight) && (
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-semibold text-textPrimary leading-snug truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-textMuted mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </div>
      )}

      {/* Body */}
      <div className="px-5 py-4">{children}</div>
    </motion.div>
  );
};

InfoCard.displayName = 'InfoCard';

// ── KeyValueDisplay ───────────────────────────────────────────────────────────

/**
 * @param {Array<{label:string, value:ReactNode, span?:boolean}>} props.items
 * @param {number}  [props.cols=2]   — grid columns (1 or 2)
 * @param {string}  [props.className]
 */
const KeyValueDisplay = ({ items = [], cols = 2, className }) => (
  <dl
    className={cn(
      'grid gap-x-6 gap-y-3',
      cols === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2',
      className
    )}
  >
    {items.map((item, i) => (
      <div
        key={i}
        className={cn('flex flex-col gap-0.5', item.span && 'sm:col-span-2')}
      >
        <dt className="text-xs font-medium text-textMuted uppercase tracking-wide">
          {item.label}
        </dt>
        <dd className="text-sm font-medium text-textPrimary break-words">
          {item.value ?? '—'}
        </dd>
      </div>
    ))}
  </dl>
);

KeyValueDisplay.displayName = 'KeyValueDisplay';

// ── SummaryCard ───────────────────────────────────────────────────────────────

/**
 * Compact stats summary: title + list of {label, value, color?} metrics.
 *
 * @param {string}  props.title
 * @param {Array<{label:string, value:ReactNode, color?:string}>} props.metrics
 * @param {React.ReactNode} [props.footer]
 * @param {string}  [props.className]
 */
const SummaryCard = ({ title, metrics = [], footer, className }) => (
  <div
    className={cn(
      'rounded-md border border-border bg-white shadow-card p-5 flex flex-col gap-4',
      className
    )}
  >
    <h3 className="text-sm font-semibold text-textPrimary">{title}</h3>

    <ul className="flex flex-col gap-2.5">
      {metrics.map((m, i) => (
        <li key={i} className="flex items-center justify-between gap-2">
          <span className="text-xs text-textMuted">{m.label}</span>
          <span className={cn('text-sm font-semibold tabular-nums', m.color ?? 'text-textPrimary')}>
            {m.value}
          </span>
        </li>
      ))}
    </ul>

    {footer && (
      <div className="pt-3 border-t border-border">{footer}</div>
    )}
  </div>
);

SummaryCard.displayName = 'SummaryCard';

// ── DataList ─────────────────────────────────────────────────────────────────

/**
 * Styled description list — horizontal label + value rows.
 *
 * @param {Array<{label:string, value:ReactNode}>} props.items
 * @param {string}  [props.className]
 */
const DataList = ({ items = [], className }) => (
  <dl className={cn('divide-y divide-border', className)}>
    {items.map((item, i) => (
      <div key={i} className="flex items-start justify-between gap-3 py-2.5">
        <dt className="text-sm text-textMuted shrink-0 min-w-0 w-2/5">{item.label}</dt>
        <dd className="text-sm font-medium text-textPrimary text-right break-words">
          {item.value ?? '—'}
        </dd>
      </div>
    ))}
  </dl>
);

DataList.displayName = 'DataList';

// ── SearchResultItem ──────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {React.ReactNode} [props.avatar]   — Avatar element
 * @param {string}  props.title
 * @param {string}  [props.subtitle]
 * @param {string}  [props.meta]             — right-side metadata text
 * @param {React.ReactNode} [props.badge]    — StatusBadge element
 * @param {function} [props.onClick]
 * @param {string}  [props.className]
 */
const SearchResultItem = ({
  avatar,
  title,
  subtitle,
  meta,
  badge,
  onClick,
  className,
}) => (
  <div
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    className={cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-md',
      'transition-colors duration-100',
      onClick && 'cursor-pointer hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-accent-600',
      className
    )}
  >
    {avatar && <span className="shrink-0">{avatar}</span>}

    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-textPrimary truncate">{title}</p>
      {subtitle && (
        <p className="text-xs text-textMuted truncate">{subtitle}</p>
      )}
    </div>

    <div className="flex items-center gap-2 shrink-0">
      {meta && <span className="text-xs text-textMuted">{meta}</span>}
      {badge}
    </div>
  </div>
);

SearchResultItem.displayName = 'SearchResultItem';

export { InfoCard, KeyValueDisplay, SummaryCard, DataList, SearchResultItem };
export default InfoCard;
