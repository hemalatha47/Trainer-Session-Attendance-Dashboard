/**
 * BatchDashboardCards.jsx
 * Renders the full KPI dashboard card grid for batch management.
 * Placed above filters and the batch table on BatchListPage.
 *
 * Architecture decision (Task 15):
 *   Cards use the GLOBAL dataset by default.
 *   The optional `filteredBatches` prop lets the caller pass a filtered
 *   subset — cards will then reflect those filtered metrics in real-time.
 *   This supports both use-cases without coupling this component to the
 *   filter state machine of BatchListPage.
 */

import { Fragment } from 'react';
import {
  Layers,
  PlayCircle,
  CheckCircle,
  Clock,
  Users,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  InboxIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useBatchDashboard } from '../../hooks/useBatchDashboard';

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------
const ICON_MAP = {
  layers: Layers,
  'play-circle': PlayCircle,
  'check-circle': CheckCircle,
  clock: Clock,
  users: Users,
  'bar-chart-2': BarChart2,
  'trending-up': TrendingUp,
  'alert-triangle': AlertTriangle,
};

// ---------------------------------------------------------------------------
// Color token map → Tailwind utility classes
// ---------------------------------------------------------------------------
const COLOR_ICON_BG = {
  primary: 'bg-[#1E3A5F]/10 text-[#1E3A5F]',
  accent:  'bg-[#2563EB]/10 text-[#2563EB]',
  blue:    'bg-blue-100 text-blue-700',
  green:   'bg-green-100 text-green-700',
  yellow:  'bg-yellow-100 text-yellow-700',
  red:     'bg-red-100 text-red-700',
};

const COLOR_VALUE = {
  primary: 'text-[#1E3A5F]',
  accent:  'text-[#2563EB]',
  blue:    'text-blue-700',
  green:   'text-green-700',
  yellow:  'text-yellow-700',
  red:     'text-red-700',
};

const COLOR_PROGRESS = {
  primary: 'bg-[#1E3A5F]',
  accent:  'bg-[#2563EB]',
  blue:    'bg-blue-500',
  green:   'bg-green-500',
  yellow:  'bg-yellow-400',
  red:     'bg-red-500',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Skeleton shimmer card for loading state */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-200" />
        <div className="w-16 h-4 rounded bg-gray-200" />
      </div>
      <div className="w-12 h-7 rounded bg-gray-200 mb-1" />
      <div className="w-24 h-3 rounded bg-gray-100" />
    </div>
  );
}

/** Single KPI card */
function KpiCard({ card, index }) {
  const IconComponent = ICON_MAP[card.icon] ?? Layers;
  const iconBg = COLOR_ICON_BG[card.color] ?? COLOR_ICON_BG.primary;
  const valueColor = COLOR_VALUE[card.color] ?? COLOR_VALUE.primary;
  const progressColor = COLOR_PROGRESS[card.color] ?? COLOR_PROGRESS.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col gap-2
                 hover:shadow-md transition-shadow duration-200"
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <span
          className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${iconBg}`}
          aria-hidden="true"
        >
          <IconComponent size={20} />
        </span>
        <span className="text-xs text-gray-400 font-medium leading-tight text-right max-w-[90px]">
          {card.label}
        </span>
      </div>

      {/* Value */}
      <p className={`text-2xl font-bold tracking-tight ${valueColor}`}>
        {card.value}
      </p>

      {/* Helper text */}
      <p className="text-xs text-gray-500 leading-snug">{card.helperText}</p>

      {/* Optional progress bar */}
      {card.progress !== undefined && (
        <div
          className="mt-1 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden"
          role="progressbar"
          aria-valuenow={card.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${card.label}: ${card.progress}%`}
        >
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${Math.min(card.progress, 100)}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * @param {object}  props
 * @param {Batch[]} [props.filteredBatches] - Optional filtered batch set.
 *                                            Pass undefined to use global data.
 */
export function BatchDashboardCards({ filteredBatches }) {
  const { kpiCards, loading, error, refresh } = useBatchDashboard({
    batches: filteredBatches,
    autoFetch: true,
  });

  // --- Loading state ---
  if (loading) {
    return (
      <section
        aria-label="Batch metrics loading"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </section>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div
        role="alert"
        className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center
                   justify-between gap-4"
      >
        <div className="flex items-center gap-3 text-red-700">
          <AlertTriangle size={18} aria-hidden="true" />
          <span className="text-sm font-medium">{error}</span>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 text-sm font-medium text-red-700
                     hover:text-red-900 transition-colors"
          aria-label="Retry loading metrics"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  // --- Empty state ---
  if (!kpiCards.length) {
    return (
      <div
        className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-8 flex flex-col
                   items-center gap-3 text-gray-500"
      >
        <InboxIcon size={36} className="text-gray-300" aria-hidden="true" />
        <p className="text-sm font-medium">No batch data available</p>
        <button
          onClick={refresh}
          className="text-xs text-[#2563EB] hover:underline"
        >
          Refresh
        </button>
      </div>
    );
  }

  // --- Cards grid ---
  return (
    <section aria-label="Batch KPI metrics">
      {/* Row 1: 4 status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {kpiCards.slice(0, 4).map((card, i) => (
          <KpiCard key={card.id} card={card} index={i} />
        ))}
      </div>
      {/* Row 2: remaining cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.slice(4).map((card, i) => (
          <KpiCard key={card.id} card={card} index={i + 4} />
        ))}
      </div>
    </section>
  );
}

export default BatchDashboardCards;
