/**
 * ReportTablePagination.jsx
 * Module 7.3 — Report Tables & Summary Views
 *
 * Minimal pagination bar: Previous / page info / Next.
 * Sits below each report table.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { cn }     from '@utils/componentUtils';

/**
 * @param {object}   props
 * @param {object}   props.pagination   — meta from useReportsData (page, totalPages, hasNext, hasPrev, from, to, total)
 * @param {Function} props.onPageChange — (newPage: number) => void
 * @param {string}   [props.className]
 */
const ReportTablePagination = ({ pagination, onPageChange, className }) => {
  const { page, totalPages, hasNext, hasPrev, from, to, total } = pagination ?? {};

  if (!total || totalPages <= 1) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-neutral-50',
        className
      )}
      aria-label="Pagination controls"
    >
      {/* Record range */}
      <p className="text-xs text-textMuted">
        Showing <span className="font-medium text-textPrimary">{from}–{to}</span> of{' '}
        <span className="font-medium text-textPrimary">{total}</span> records
      </p>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          aria-label="Previous page"
          iconLeft={<ChevronLeft size={14} aria-hidden="true" />}
        >
          Previous
        </Button>

        <span className="text-xs text-textMuted px-1" aria-live="polite" aria-atomic="true">
          {page} / {totalPages}
        </span>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          aria-label="Next page"
          iconRight={<ChevronRight size={14} aria-hidden="true" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ReportTablePagination;
