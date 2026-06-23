/**
 * BatchHeaderSection.jsx
 * Page header for Batch Details page.
 *
 * Displays: batch name, code, status badge, trainer, date range.
 * Actions: Edit Batch (placeholder), Export (placeholder), More Actions (placeholder).
 *
 * Blueprint: Sections 6.4, 7.1–7.3, 11.3
 * Module: 4.2 — Task 5
 */

import { motion }            from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  User,
  MoreVertical,
  Download,
  Edit2,
}                            from 'lucide-react';
import { useNavigate }       from 'react-router-dom';

import { Badge }             from '@components/ui/Badge';
import { Button }            from '@components/ui/Button';
import { Skeleton }          from '@components/feedback/Skeleton';
import {
  BATCH_STATUS_LABELS,
  BATCH_STATUS_BADGE_VARIANTS,
}                            from '@constants/batchStatus';
import { ROUTES }            from '@constants/routes';
import { fadeIn }            from '@constants/animations';
import { cn }                from '@utils/componentUtils';
import { formatDate }        from '@utils/dateUtils';

// ── Local helpers ─────────────────────────────────────────────────────────────

const ActionBtn = ({ icon: Icon, label, onClick, variant = 'ghost', disabled = false }) => (
  <Button
    variant={variant}
    size="sm"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className="gap-1.5"
  >
    <Icon size={15} aria-hidden="true" />
    <span className="hidden sm:inline">{label}</span>
  </Button>
);

// ── Header skeleton ───────────────────────────────────────────────────────────

export const BatchHeaderSkeleton = () => (
  <div className="space-y-3" aria-busy="true" aria-label="Loading batch header">
    <Skeleton width="w-24" height="h-4" />
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2 flex-1">
        <Skeleton width="w-3/4" height="h-7" />
        <Skeleton width="w-1/3" height="h-4" />
      </div>
      <Skeleton width="w-36" height="h-9" />
    </div>
    <div className="flex gap-4">
      <Skeleton width="w-32" height="h-4" />
      <Skeleton width="w-40" height="h-4" />
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.batch     — batch entity from batchService
 * @param {boolean} [props.loading]
 * @param {function} [props.onEdit]  — opens the edit modal
 */
const BatchHeaderSection = ({ batch, loading, onEdit }) => {
  const navigate = useNavigate();

  if (loading) return <BatchHeaderSkeleton />;
  if (!batch)  return null;

  const statusLabel   = BATCH_STATUS_LABELS[batch.status]    ?? batch.status;
  const statusVariant = BATCH_STATUS_BADGE_VARIANTS[batch.status] ?? 'default';

  const dateRange = [
    batch.startDate ? formatDate(batch.startDate) : null,
    batch.endDate   ? formatDate(batch.endDate)   : null,
  ]
    .filter(Boolean)
    .join(' – ');

  return (
    <motion.header
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className=""
    >
      {/* Back link */}
      <button
        type="button"
        onClick={() => navigate(ROUTES.BATCHES)}
        className={cn(
          'inline-flex items-center gap-1.5 mb-3',
          'text-xs font-medium text-textMuted hover:text-accent-600',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-accent-600 focus-visible:ring-offset-1 rounded',
        )}
        aria-label="Back to batch list"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All Batches
      </button>

      {/* Title row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Left — name + code + status */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
<<<<<<< HEAD
            <h1 className="text-xl font-semibold text-textPrimary leading-tight truncate">
=======
            <h1 className="text-xl sm:text-2xl font-bold text-textPrimary leading-tight truncate">
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
              {batch.batchName}
            </h1>
            <Badge variant={statusVariant} size="sm">
              {statusLabel}
            </Badge>
          </div>

          {batch.batchCode && (
            <p className="text-xs font-mono text-textMuted tracking-wide">
              {batch.batchCode}
            </p>
          )}
        </div>

        {/* Right — action buttons (placeholders) */}
        <div
          className="flex items-center gap-2 shrink-0"
          role="toolbar"
          aria-label="Batch actions"
        >
          <ActionBtn
            icon={Edit2}
            label="Edit Batch"
            variant="outline"
            disabled={!onEdit}
            onClick={() => onEdit?.()}
          />
          <ActionBtn
            icon={Download}
            label="Export"
            variant="ghost"
            disabled
            onClick={() => {
              /* Module 4.5 — Export — placeholder */
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            aria-label="More actions"
            disabled
            className="px-2"
          >
            <MoreVertical size={15} aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Meta row — trainer + dates */}
      <dl className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
        {batch.trainerName && (
          <div className="flex items-center gap-1.5 text-xs text-textMuted">
            <User size={13} aria-hidden="true" className="shrink-0 text-accent-500" />
            <dt className="sr-only">Trainer</dt>
            <dd className="font-medium text-textPrimary">{batch.trainerName}</dd>
          </div>
        )}

        {dateRange && (
          <div className="flex items-center gap-1.5 text-xs text-textMuted">
            <Calendar size={13} aria-hidden="true" className="shrink-0 text-accent-500" />
            <dt className="sr-only">Date range</dt>
            <dd>{dateRange}</dd>
          </div>
        )}
      </dl>
    </motion.header>
  );
};

export default BatchHeaderSection;
