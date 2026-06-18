/**
 * DataTable.jsx
 * Enterprise-grade reusable data table (Module 3.4, Task 2).
 *
 * Features:
 *   - Column definitions with optional custom `render` function
 *   - Client-side sorting (asc/desc) by column key
 *   - Loading, empty, and error states via Module 3.3 feedback components
 *   - Alternating row colors, sticky header, hover highlight
 *   - Horizontal scroll on mobile (responsive)
 *   - Row click handler
 *   - Action column (last column, right-aligned)
 *   - Full ARIA table semantics
 *
 * Column definition shape:
 *   { key: string, label: string, render?: (value, row) => ReactNode,
 *     sortable?: boolean, width?: string, align?: 'left'|'center'|'right',
 *     isAction?: boolean }
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { fadeIn, TRANSITIONS } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import { TableSkeleton } from '@components/feedback/Skeleton';
import { ErrorState } from '@components/feedback/ErrorState';
import { EmptyState } from '@components/feedback/EmptyState';

// ── Sort icon ────────────────────────────────────────────────────────────────
const SortIcon = ({ direction }) => {
  if (direction === 'asc')  return <ChevronUp  className="w-3.5 h-3.5" aria-hidden="true" />;
  if (direction === 'desc') return <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" aria-hidden="true" />;
};

// ── DataTable ────────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {Array<{key,label,render?,sortable?,width?,align?,isAction?}>} props.columns
 * @param {Array<object>} props.data
 * @param {boolean}  [props.loading=false]
 * @param {string}   [props.error]          — error message string
 * @param {function} [props.onRetry]
 * @param {function} [props.onRowClick]     — (row) => void
 * @param {string}   [props.emptyTitle='No records found']
 * @param {string}   [props.emptyDescription]
 * @param {React.ReactNode} [props.emptyIcon]
 * @param {string}   [props.emptyActionLabel]
 * @param {function} [props.onEmptyAction]
 * @param {string}   [props.className]
 * @param {string}   [props.caption]        — accessible table caption
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  error,
  onRetry,
  onRowClick,
  emptyTitle = 'No records found',
  emptyDescription,
  emptyIcon,
  emptyActionLabel,
  onEmptyAction,
  className,
  caption,
}) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = useCallback((col) => {
    if (!col.sortable) return;
    setSortDir((prev) => (sortKey === col.key && prev === 'asc' ? 'desc' : 'asc'));
    setSortKey(col.key);
  }, [sortKey]);

  // Client-side sort
  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        const cmp = av == null ? -1 : bv == null ? 1 : av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return <TableSkeleton rows={5} cols={columns.length || 5} className={className} />;
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={cn('rounded-md border border-border bg-white', className)}>
        <ErrorState description={error} onRetry={onRetry} />
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (sortedData.length === 0) {
    return (
      <div className={cn('rounded-md border border-border bg-white', className)}>
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </div>
    );
  }

  // ── Table ──────────────────────────────────────────────────────────────────
  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className={cn(
        'w-full overflow-x-auto rounded-md border border-border bg-white shadow-card',
        className
      )}
    >
      <table className="w-full min-w-full text-sm" role="grid">
        {caption && <caption className="sr-only">{caption}</caption>}

        {/* Header */}
        <thead className="bg-neutral-50 border-b border-border">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                onClick={() => handleSort(col)}
                style={col.width ? { width: col.width } : undefined}
                aria-sort={
                  sortKey === col.key
                    ? sortDir === 'asc' ? 'ascending' : 'descending'
                    : col.sortable ? 'none' : undefined
                }
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wide',
                  'whitespace-nowrap select-none',
                  col.sortable && 'cursor-pointer hover:text-textPrimary hover:bg-neutral-100 transition-colors duration-150',
                  col.align === 'center' && 'text-center',
                  col.align === 'right'  && 'text-right',
                  col.isAction           && 'text-right'
                )}
              >
                <span className={cn('inline-flex items-center gap-1', col.align === 'right' && 'flex-row-reverse')}>
                  {col.label}
                  {col.sortable && <SortIcon direction={sortKey === col.key ? sortDir : null} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {sortedData.map((row, rowIdx) => (
            <tr
              key={row.id ?? rowIdx}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-border last:border-b-0 transition-colors duration-100',
                rowIdx % 2 === 1 && 'bg-neutral-50/40',
                onRowClick && 'cursor-pointer hover:bg-accent-50/50'
              )}
            >
              {columns.map((col) => {
                const value = row[col.key];
                return (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-sm text-textPrimary',
                      'whitespace-nowrap',
                      col.align === 'center' && 'text-center',
                      (col.align === 'right' || col.isAction) && 'text-right'
                    )}
                  >
                    {col.render ? col.render(value, row) : (value ?? '—')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

DataTable.displayName = 'DataTable';

export { DataTable };
export default DataTable;
