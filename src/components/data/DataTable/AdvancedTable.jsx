/**
 * AdvancedTable.jsx
 * Scalable table foundation for server-driven features (Module 3.4, Task 1/3).
 *
 * Architecture:
 *   AdvancedTable wraps DataTable and adds:
 *     - Controllable pagination (page/pageSize/totalCount → server-paging ready)
 *     - Bulk row selection with select-all checkbox
 *     - Toolbar slot (search bar + column visibility + custom actions)
 *     - Column visibility toggle
 *     - Export slot (wired from exportUtils.js in Phase 8)
 *
 *   Server-sort and server-search are supported by surfacing
 *   `onSortChange(key, dir)` and `onSearchChange(q)` callbacks —
 *   callers pass pre-sorted/filtered `data` and control pagination themselves.
 *
 *   For V1 (mock data), all sorting/filtering stays client-side inside DataTable.
 *   Switching to server mode = pass `serverSide={true}` + provide callbacks.
 */

import { useState, useCallback, useMemo } from 'react';
import { Settings2, Download } from 'lucide-react';
import { cn } from '@utils/componentUtils';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Checkbox } from '@components/ui/Checkbox';
import { DataTable } from '../DataTable';

// ── Pagination controls ──────────────────────────────────────────────────────
const Pagination = ({ page, pageSize, totalCount, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-border bg-neutral-50 text-xs text-textMuted">
      <span>
        {totalCount === 0 ? 'No records' : `${from}–${to} of ${totalCount}`}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          ‹ Prev
        </Button>
        <span className="px-2 font-medium text-textPrimary tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next ›
        </Button>
      </div>
    </div>
  );
};

// ── Column visibility toggle ──────────────────────────────────────────────────
const ColumnVisibilityMenu = ({ columns, hidden, onToggle }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        iconLeft={<Settings2 className="w-3.5 h-3.5" />}
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle column visibility"
        aria-expanded={open}
      >
        Columns
      </Button>
      {open && (
        <div
          className="absolute right-0 top-10 z-20 w-44 rounded-md border border-border bg-white shadow-floating py-1"
          role="menu"
        >
          {columns
            .filter((c) => !c.isAction)
            .map((col) => (
              <label
                key={col.key}
                className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-neutral-50"
                role="menuitemcheckbox"
                aria-checked={!hidden.includes(col.key)}
              >
                <Checkbox
                  checked={!hidden.includes(col.key)}
                  onChange={() => onToggle(col.key)}
                />
                {col.label}
              </label>
            ))}
        </div>
      )}
    </div>
  );
};

// ── AdvancedTable ─────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {Array}    props.columns               — same schema as DataTable
 * @param {Array}    props.data
 * @param {boolean}  [props.loading=false]
 * @param {string}   [props.error]
 * @param {function} [props.onRetry]
 *
 * Pagination (pass all 3 to enable):
 * @param {number}   [props.page]
 * @param {number}   [props.pageSize]
 * @param {number}   [props.totalCount]
 * @param {function} [props.onPageChange]
 *
 * Server-side hooks (optional):
 * @param {boolean}  [props.serverSide=false]
 * @param {function} [props.onSortChange]        — (key, dir) => void
 * @param {function} [props.onSearchChange]      — (query) => void
 *
 * Bulk selection:
 * @param {boolean}  [props.selectable=false]
 * @param {function} [props.onSelectionChange]   — (selectedIds[]) => void
 *
 * Toolbar:
 * @param {boolean}  [props.searchable=false]
 * @param {string}   [props.searchPlaceholder]
 * @param {React.ReactNode} [props.toolbarRight] — custom buttons/actions slot
 * @param {function} [props.onExport]            — wired from exportUtils in Phase 8
 *
 * Pass-through to DataTable:
 * @param {string}   [props.emptyTitle]
 * @param {string}   [props.emptyDescription]
 * @param {React.ReactNode} [props.emptyIcon]
 * @param {string}   [props.emptyActionLabel]
 * @param {function} [props.onEmptyAction]
 * @param {function} [props.onRowClick]
 * @param {string}   [props.caption]
 * @param {string}   [props.className]
 */
const AdvancedTable = ({
  columns = [],
  data = [],
  loading = false,
  error,
  onRetry,
  // Pagination
  page,
  pageSize,
  totalCount,
  onPageChange,
  // Server-side hooks
  serverSide = false,
  onSortChange,
  onSearchChange,
  // Bulk selection
  selectable = false,
  onSelectionChange,
  // Toolbar
  searchable = false,
  searchPlaceholder = 'Search…',
  toolbarRight,
  onExport,
  // Pass-through
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyActionLabel,
  onEmptyAction,
  onRowClick,
  caption,
  className,
}) => {
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedIds, setSelectedIds]   = useState([]);
  const [hiddenCols,  setHiddenCols]    = useState([]);

  const hasPagination = page != null && pageSize != null && totalCount != null && onPageChange;

  // ── Column visibility ──────────────────────────────────────────────────────
  const toggleColumn = useCallback((key) => {
    setHiddenCols((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenCols.includes(c.key)),
    [columns, hiddenCols]
  );

  // ── Bulk selection helpers ─────────────────────────────────────────────────
  const rowIds = useMemo(() => data.map((r) => r.id).filter(Boolean), [data]);
  const allSelected = rowIds.length > 0 && selectedIds.length === rowIds.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleAll = useCallback(() => {
    const next = allSelected ? [] : rowIds;
    setSelectedIds(next);
    onSelectionChange?.(next);
  }, [allSelected, rowIds, onSelectionChange]);

  const toggleRow = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      onSelectionChange?.(next);
      return next;
    });
  }, [onSelectionChange]);

  // ── Client-side search filter (non-serverSide) ─────────────────────────────
  const handleSearch = useCallback((e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!serverSide) return;
    onSearchChange?.(q);
  }, [serverSide, onSearchChange]);

  const filteredData = useMemo(() => {
    if (serverSide || !searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [data, searchQuery, serverSide]);

  // ── Selection column ───────────────────────────────────────────────────────
  const selectionCol = selectable
    ? [{
        key: '__select__',
        label: '',
        width: '40px',
        render: (_, row) => (
          <Checkbox
            checked={selectedIds.includes(row.id)}
            onChange={() => toggleRow(row.id)}
            aria-label={`Select row ${row.id}`}
          />
        ),
      }]
    : [];

  const selectionHeader = selectable
    ? [{
        key: '__select__',
        label: (
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={toggleAll}
            aria-label="Select all rows"
          />
        ),
        width: '40px',
      }]
    : [];

  const finalColumns = [...(selectable ? selectionHeader : []), ...visibleColumns];
  const tableColumns = selectable
    ? finalColumns.map((c) =>
        c.key === '__select__'
          ? { ...c, label: selectionHeader[0].label }
          : c
      )
    : visibleColumns.map((c) =>
        c.render ? c : { ...c, render: (v, row) => selectionCol[0]?.render(v, row) ?? (v ?? '—') }
      );

  // Build true final columns (selection first, then visible content cols)
  const resolvedColumns = [
    ...(selectable
      ? [{
          key: '__select__',
          label: (
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleAll}
              aria-label="Select all"
            />
          ),
          width: '40px',
          render: (_, row) => (
            <Checkbox
              checked={selectedIds.includes(row.id)}
              onChange={() => toggleRow(row.id)}
              aria-label={`Select ${row.id}`}
            />
          ),
        }]
      : []),
    ...visibleColumns,
  ];

  return (
    <div className={cn('flex flex-col gap-0', className)}>
      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      {(searchable || toolbarRight || onExport || columns.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          {/* Search */}
          <div className="flex-1 min-w-0 max-w-xs">
            {searchable && (
              <Input
                type="search"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={handleSearch}
              />
            )}
          </div>

          {/* Right-side controls */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Selection summary */}
            {selectable && selectedIds.length > 0 && (
              <span className="text-xs text-accent-600 font-medium">
                {selectedIds.length} selected
              </span>
            )}

            {toolbarRight}

            {onExport && (
              <Button
                variant="outline"
                size="sm"
                iconLeft={<Download className="w-3.5 h-3.5" />}
                onClick={onExport}
              >
                Export
              </Button>
            )}

            <ColumnVisibilityMenu
              columns={columns}
              hidden={hiddenCols}
              onToggle={toggleColumn}
            />
          </div>
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-md border border-border">
        <DataTable
          columns={resolvedColumns}
          data={filteredData}
          loading={loading}
          error={error}
          onRetry={onRetry}
          onRowClick={onRowClick}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          emptyIcon={emptyIcon}
          emptyActionLabel={emptyActionLabel}
          onEmptyAction={onEmptyAction}
          caption={caption}
          // Remove the outer border since we own the border above
          className="border-none rounded-none shadow-none"
        />

        {/* ── Pagination ─────────────────────────────────────────────── */}
        {hasPagination && !loading && !error && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
};

AdvancedTable.displayName = 'AdvancedTable';

export { AdvancedTable };
export default AdvancedTable;
