/**
 * useBatches.js
 * Data-fetching and state management hook for batch entities.
 *
 * Blueprint: Section 11.2 (custom hooks), Module 4.1
 *
 * Encapsulates:
 *   - Loading / error / data state
 *   - Status filter + search filter (client-side for V1)
 *   - Client-side pagination
 *   - CRUD wrappers: deleteBatch
 *
 * Architecture rules:
 *   - Pages never import batchService directly — always via this hook.
 *   - Hook never imports mock data — only via service.
 *   - Returns consistent { batches, loading, error, meta, ... } shape.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getBatches,
  deleteBatch as _deleteBatch,
} from '@services/batchService';
import { BATCH_STATUS } from '@constants/batchStatus';

const PAGE_SIZE = 10;

/**
 * @returns {{
 *   batches:      object[],
 *   allBatches:   object[],
 *   loading:      boolean,
 *   error:        string | null,
 *   search:       string,
 *   setSearch:    (v: string) => void,
 *   statusFilter: string,
 *   setStatusFilter: (v: string) => void,
 *   page:         number,
 *   setPage:      (v: number) => void,
 *   meta:         { total: number, filtered: number, page: number, pageSize: number, totalPages: number },
 *   reload:       () => void,
 *   removeBatch:  (id: string) => Promise<{ success: boolean, error?: string }>,
 *   statusCounts: { active: number, upcoming: number, completed: number, total: number },
 * }}
 */
const useBatches = () => {
  const [allBatches, setAllBatches]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearchRaw]          = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPageRaw]              = useState(1);
  const [tick, setTick]                 = useState(0); // reload counter

  // ── Fetch all batches from service ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const res = await getBatches();

      if (cancelled) return;

      if (res.success) {
        setAllBatches(res.data ?? []);
      } else {
        setError(res.error?.message ?? 'Failed to load batches');
        setAllBatches([]);
      }

      setLoading(false);
    };

    load();

    return () => { cancelled = true; };
  }, [tick]);

  // ── Derived: status counts (always from unfiltered set) ───────────────────
  const statusCounts = useMemo(() => ({
    total:     allBatches.length,
    active:    allBatches.filter((b) => b.status === BATCH_STATUS.ACTIVE).length,
    upcoming:  allBatches.filter((b) => b.status === BATCH_STATUS.UPCOMING).length,
    completed: allBatches.filter((b) => b.status === BATCH_STATUS.COMPLETED).length,
  }), [allBatches]);

  // ── Derived: filter + search ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...allBatches];

    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.batchName?.toLowerCase().includes(q) ||
          b.batchCode?.toLowerCase().includes(q) ||
          b.trainerName?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allBatches, statusFilter, search]);

  // ── Derived: pagination ────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);

  const batches = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const meta = {
    total:      allBatches.length,
    filtered:   filtered.length,
    page:       safePage,
    pageSize:   PAGE_SIZE,
    totalPages,
    from:       filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1,
    to:         Math.min(safePage * PAGE_SIZE, filtered.length),
  };

  // ── Setters with page-reset side effects ──────────────────────────────────
  const setSearch = useCallback((v) => { setSearchRaw(v); setPageRaw(1); }, []);
  const setPage   = useCallback((v) => setPageRaw(v), []);

  const setStatusFilterWrapped = useCallback((v) => {
    setStatusFilter(v);
    setPageRaw(1);
  }, []);

  // ── Reload trigger ─────────────────────────────────────────────────────────
  const reload = useCallback(() => setTick((t) => t + 1), []);

  // ── CRUD: delete ──────────────────────────────────────────────────────────
  const removeBatch = useCallback(async (id) => {
    const res = await _deleteBatch(id);
    if (res.success) {
      // Optimistic: remove from local state without full reload
      setAllBatches((prev) => prev.filter((b) => b.id !== id));
      return { success: true };
    }
    return { success: false, error: res.error?.message ?? 'Failed to delete batch' };
  }, []);

  return {
    batches,
    allBatches,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter: setStatusFilterWrapped,
    page: safePage,
    setPage,
    meta,
    reload,
    removeBatch,
    statusCounts,
  };
};

export { useBatches };
export default useBatches;
