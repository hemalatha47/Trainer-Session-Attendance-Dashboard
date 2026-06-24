/**
 * useAnalyticsInsights.js
 * Module 8.3 — Analytics Charts & Summary Views
 *
 * Custom hook that owns all Module 8.3 analytics data:
 *  - Filtered trend series for the line chart
 *  - Filtered batch comparison for the bar chart
 *  - Student risk grouping for the risk summary panel
 *  - Summary card metrics (avg, best, worst, at-risk)
 *
 * Design goals:
 *  - Single source of truth for the Analytics page's 8.3 data layer.
 *  - All heavy computation is delegated to analyticsInsightsService.
 *  - useMemo / useCallback throughout to prevent spurious re-renders.
 *  - Filters forwarded from useAnalyticsFilters shape.
 *
 * Hook API:
 *  {
 *    trendData,       — annotated series: [{ date, displayDate, rate, trend, highPoint, lowPoint }]
 *    trendMeta,       — { from, to, overallTrend, delta, highPoint, lowPoint }
 *    batchComparison, — annotated rows: [{ batchId, batchName, averageRate, risk, rank, isTop, isBottom }]
 *    riskSummary,     — { groups, totals, alerts }
 *    summaryCards,    — { avgAttendance, bestBatch, worstBatch, atRiskStudents }
 *    loading,         — true while any fetch is in flight
 *    error,           — string error message or null
 *    refresh,         — () => void
 *  }
 *
 * @param {object} [filters]             — from useAnalyticsFilters
 * @param {string|null} [filters.batchId]
 * @param {string|null} [filters.dateFrom]
 * @param {string|null} [filters.dateTo]
 * @param {number}      [threshold=75]
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAttendanceTrendData,
  getBatchComparisonData,
  getStudentRiskSummary,
  getAnalyticsSummaryCards,
} from '@services/analyticsInsightsService';

// ── Default shapes (prevents undefined crashes) ───────────────────────────────

const DEFAULT_TREND_META = {
  from:          null,
  to:            null,
  overallTrend:  'flat',
  delta:         0,
  highPoint:     null,
  lowPoint:      null,
  points:        0,
};

const DEFAULT_RISK_SUMMARY = {
  groups:  [],
  totals:  { low: 0, medium: 0, high: 0, critical: 0, total: 0 },
  alerts:  [],
};

const DEFAULT_SUMMARY_CARDS = {
  avgAttendance:  null,
  bestBatch:      null,
  worstBatch:     null,
  atRiskStudents: null,
};

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @param {object} [options]
 * @param {object} [options.filters]   — filter state from useAnalyticsFilters
 * @param {number} [options.threshold] — low-attendance threshold (default 75)
 */
const useAnalyticsInsights = (options = {}) => {
  const { filters = {}, threshold = 75 } = options;

  // ── Local state ───────────────────────────────────────────────────────────
  const [trendData,       setTrendData]       = useState([]);
  const [trendMeta,       setTrendMeta]       = useState(DEFAULT_TREND_META);
  const [batchComparison, setBatchComparison] = useState([]);
  const [riskSummary,     setRiskSummary]     = useState(DEFAULT_RISK_SUMMARY);
  const [summaryCards,    setSummaryCards]    = useState(DEFAULT_SUMMARY_CARDS);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [tick,            setTick]            = useState(0);

  // Stable refresh trigger
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  // Stable filter params derived from options
  const batchId  = filters.batchId  ?? null;
  const dateFrom = filters.dateFrom ?? null;
  const dateTo   = filters.dateTo   ?? null;

  // ── Data loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const [trendRes, comparisonRes, riskRes, cardsRes] = await Promise.all([
        getAttendanceTrendData({ batchId, from: dateFrom, to: dateTo }),
        getBatchComparisonData({ batchId }),
        getStudentRiskSummary({ threshold, batchId }),
        getAnalyticsSummaryCards({ threshold, batchId }),
      ]);

      if (cancelled) return;

      // Surface error only if ALL requests failed
      const failures = [trendRes, comparisonRes, riskRes, cardsRes].filter((r) => !r.success);
      if (failures.length === 4) {
        setError(failures[0]?.error?.message ?? 'Failed to load analytics insights');
      } else {
        setError(null);
      }

      if (trendRes.success) {
        setTrendData(trendRes.data ?? []);
        setTrendMeta({
          from:         trendRes.meta?.from         ?? null,
          to:           trendRes.meta?.to           ?? null,
          overallTrend: trendRes.meta?.overallTrend ?? 'flat',
          delta:        trendRes.meta?.delta        ?? 0,
          highPoint:    trendRes.meta?.highPoint    ?? null,
          lowPoint:     trendRes.meta?.lowPoint     ?? null,
          points:       trendRes.meta?.points       ?? 0,
        });
      }

      if (comparisonRes.success) setBatchComparison(comparisonRes.data ?? []);
      if (riskRes.success)       setRiskSummary(riskRes.data ?? DEFAULT_RISK_SUMMARY);
      if (cardsRes.success)      setSummaryCards(cardsRes.data ?? DEFAULT_SUMMARY_CARDS);

      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [batchId, dateFrom, dateTo, threshold, tick]);

  // ── Memoized derivations ──────────────────────────────────────────────────

  /** True when there is at least one data point across all four feeds. */
  const hasData = useMemo(
    () =>
      trendData.length > 0 ||
      batchComparison.length > 0 ||
      (riskSummary?.totals?.total ?? 0) > 0,
    [trendData, batchComparison, riskSummary]
  );

  /** Memoized risk totals for badge / count display. */
  const riskTotals = useMemo(
    () => riskSummary?.totals ?? DEFAULT_RISK_SUMMARY.totals,
    [riskSummary]
  );

  return {
    trendData,
    trendMeta,
    batchComparison,
    riskSummary,
    riskTotals,
    summaryCards,
    loading,
    error,
    refresh,
    hasData,
  };
};

export default useAnalyticsInsights;
