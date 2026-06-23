/**
 * ReportTypeSelector.jsx
 * Card-based selector for the three report types.
 * Module 7.1 — Task 6
 *
 * Types:
 *  - Attendance Reports
 *  - Batch Reports
 *  - Student Reports
 *
 * Each card shows: title, description, icon, count preview.
 * Selected card has a visible accent border + background.
 * Loading state renders CardSkeleton placeholders.
 */

import { useMemo }  from 'react';
import { motion }   from 'framer-motion';
import { ClipboardList, Layers, Users } from 'lucide-react';
import { CardSkeleton } from '@components/feedback/Skeleton';
import { cn }           from '@utils/componentUtils';
import { cardHover, usePrefersReducedMotion } from '@constants/animations';
import { safeMotion }   from '@utils/componentUtils';

// ── Icon resolver (maps iconName string → Lucide element) ─────────────────────

const ICON_MAP = {
  ClipboardList: <ClipboardList size={24} aria-hidden="true" />,
  Layers:        <Layers        size={24} aria-hidden="true" />,
  Users:         <Users         size={24} aria-hidden="true" />,
};

// ── Color tokens per card ─────────────────────────────────────────────────────

const COLOR_MAP = {
  accent:  {
    icon:     'bg-accent-100 text-accent-600',
    selected: 'border-accent-500 bg-accent-50',
    badge:    'bg-accent-100 text-accent-700',
  },
  success: {
    icon:     'bg-success-bg text-success-DEFAULT',
    selected: 'border-success-DEFAULT bg-success-bg',
    badge:    'bg-success-bg text-success-DEFAULT',
  },
  warning: {
    icon:     'bg-warning-bg text-warning-text',
    selected: 'border-warning-DEFAULT bg-warning-bg',
    badge:    'bg-warning-bg text-warning-text',
  },
};

// ── Single selector card ──────────────────────────────────────────────────────

const SelectorCard = ({ card, isSelected, onSelect, reduced }) => {
  const colors = COLOR_MAP[card.color] ?? COLOR_MAP.accent;

  return (
    <motion.button
      {...safeMotion(reduced, {
        variants:   cardHover,
        initial:    'rest',
        whileHover: 'hover',
      })}
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={`Select ${card.title}`}
      onClick={() => onSelect(card.id)}
      className={cn(
        'relative flex flex-col gap-3 w-full text-left rounded-xl border-2 p-5',
        'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-accent-500 focus-visible:ring-offset-2 cursor-pointer',
        isSelected
          ? colors.selected
          : 'border-border bg-surface hover:border-accent-200 hover:bg-neutral-50'
      )}
    >
      {/* Selected indicator */}
      {isSelected && (
        <span
          className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-accent-500"
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors.icon)}>
        {ICON_MAP[card.iconName] ?? <ClipboardList size={24} aria-hidden="true" />}
      </div>

      {/* Text */}
      <div>
        <p className="text-sm font-semibold text-textPrimary leading-snug">{card.title}</p>
        <p className="text-xs text-textMuted mt-1 leading-relaxed">{card.description}</p>
      </div>

      {/* Count badge */}
      {typeof card.count === 'number' && (
        <div className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', colors.badge)}>
          <span>{card.count}</span>
          <span className="opacity-75">{card.countLabel}</span>
        </div>
      )}
    </motion.button>
  );
};

// ── Loading skeleton ──────────────────────────────────────────────────────────

const SelectorSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading report types">
    {[0, 1, 2].map((i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object}    props
 * @param {Array}     props.reportTypes     — from useReportsDashboard().reportTypes
 * @param {string}    props.selectedType    — currently selected type id
 * @param {function}  props.onSelectType    — (id: string) => void
 * @param {boolean}   [props.loading=false]
 * @param {string}    [props.className]
 */
const ReportTypeSelector = ({
  reportTypes,
  selectedType,
  onSelectType,
  loading = false,
  className,
}) => {
  const reduced = usePrefersReducedMotion();

  if (loading) return <SelectorSkeleton />;

  return (
    <div
      role="radiogroup"
      aria-label="Report type"
      className={cn('grid grid-cols-1 sm:grid-cols-3 gap-4', className)}
    >
      {reportTypes.map((card) => (
        <SelectorCard
          key={card.id}
          card={card}
          isSelected={selectedType === card.id}
          onSelect={onSelectType}
          reduced={reduced}
        />
      ))}
    </div>
  );
};

export default ReportTypeSelector;
