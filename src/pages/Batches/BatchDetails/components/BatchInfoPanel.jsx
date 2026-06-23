/**
 * BatchInfoPanel.jsx
 * Batch information detail panel.
 *
 * Displays full batch metadata in a structured card:
 *   Batch Name, Code, Trainer, Start/End Dates, Status,
 *   Description, Created Date, Max Students.
 *
 * Reuses: InfoCard, KeyValueDisplay from @components/data/InfoCard
 *
 * Blueprint: Sections 6.4, 8.2, 11.3
 * Module: 4.2 — Task 7
 */

import { motion }           from 'framer-motion';
import {
  Tag,
  User,
  Calendar,
  FileText,
  Hash,
  Users,
  Clock,
}                           from 'lucide-react';

import { InfoCard, KeyValueDisplay } from '@components/data/InfoCard';
import { Badge }            from '@components/ui/Badge';
import { CardSkeleton }     from '@components/feedback/Skeleton';
import {
  BATCH_STATUS_LABELS,
  BATCH_STATUS_BADGE_VARIANTS,
}                           from '@constants/batchStatus';
import { fadeIn }           from '@constants/animations';
import { formatDate, formatDateTime } from '@utils/dateUtils';
import { cn }               from '@utils/componentUtils';

// ── Local field row ───────────────────────────────────────────────────────────

const FieldRow = ({ icon: Icon, label, children, className }) => (
  <div className={cn('flex items-start gap-3 py-3 border-b border-border/50 last:border-0', className)}>
    <div className="mt-0.5 shrink-0 w-7 h-7 rounded bg-accent-50 flex items-center justify-center">
      <Icon size={14} className="text-accent-600" aria-hidden="true" />
    </div>
    <div className="min-w-0 flex-1">
      <dt className="text-[11px] font-medium text-textMuted uppercase tracking-wide mb-0.5">
        {label}
      </dt>
      <dd className="text-sm font-medium text-textPrimary break-words">
        {children}
      </dd>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.batch    — batch entity
 * @param {boolean} [props.loading]
 * @param {string}  [props.className]
 */
const BatchInfoPanel = ({ batch, loading, className }) => {
  if (loading) {
    return <CardSkeleton className={cn('h-64', className)} />;
  }

  if (!batch) return null;

  const statusLabel   = BATCH_STATUS_LABELS[batch.status]    ?? batch.status;
  const statusVariant = BATCH_STATUS_BADGE_VARIANTS[batch.status] ?? 'default';

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className={className}
    >
      <InfoCard title="Batch Information" className="h-full">
        <dl className="px-5 pb-2">
          <FieldRow icon={Tag} label="Batch Name">
            {batch.batchName}
          </FieldRow>

          <FieldRow icon={Hash} label="Batch Code">
            <span className="font-mono text-xs bg-neutral-100 rounded px-1.5 py-0.5">
              {batch.batchCode || '—'}
            </span>
          </FieldRow>

          <FieldRow icon={User} label="Trainer">
            {batch.trainerName || '—'}
          </FieldRow>

          <FieldRow icon={Calendar} label="Date Range">
            <span>
              {batch.startDate ? formatDate(batch.startDate) : '—'}
              {' '}–{' '}
              {batch.endDate ? formatDate(batch.endDate) : '—'}
            </span>
          </FieldRow>

          <FieldRow icon={Tag} label="Status">
            <Badge variant={statusVariant} size="sm">
              {statusLabel}
            </Badge>
          </FieldRow>

          {batch.maxStudents && (
            <FieldRow icon={Users} label="Max Students">
              {batch.maxStudents}
            </FieldRow>
          )}

          {batch.description && (
            <FieldRow icon={FileText} label="Description">
              <span className="text-textMuted font-normal leading-relaxed">
                {batch.description}
              </span>
            </FieldRow>
          )}

          {batch.createdAt && (
            <FieldRow icon={Clock} label="Created">
              <span className="text-textMuted font-normal">
                {formatDateTime(batch.createdAt)}
              </span>
            </FieldRow>
          )}
        </dl>
      </InfoCard>
    </motion.div>
  );
};

export default BatchInfoPanel;
