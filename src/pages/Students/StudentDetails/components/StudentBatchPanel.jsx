/**
 * StudentBatchPanel.jsx
 * Module 5.2 — Student Details Page
 *
 * Shows the batch the student belongs to.
 * Includes: Batch Name, Code, Trainer, Status, Start/End dates, Capacity.
 *
 * Props:
 *   batch    {object | null}  — batch record from batchService
 *   student  {object}         — needed for batchId fallback
 *   loading  {boolean}
 */

import { BookOpen, Calendar, User, Hash, Activity } from 'lucide-react';
import { motion }        from 'framer-motion';
import { useNavigate }   from 'react-router-dom';
import { fadeIn }        from '@constants/animations';
import { Button }        from '@components/ui/Button';
import { StatusBadge }   from '@components/data/StatusBadge';
import { TextSkeleton }  from '@components/feedback/Skeleton';
import { ROUTES, buildRoute } from '@constants/routes';

// ── Field row (same style as ProfilePanel) ────────────────────────────────────
const FieldRow = ({ icon: Icon, label, value, children }) => (
  <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
    <span className="mt-0.5 flex-shrink-0 text-textMuted">
      <Icon className="w-4 h-4" aria-hidden="true" />
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-textMuted font-medium uppercase tracking-wide mb-0.5">
        {label}
      </p>
      {children ?? (
        <p className="text-sm text-textPrimary font-medium truncate">
          {value || <span className="text-textMuted italic">—</span>}
        </p>
      )}
    </div>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const StudentBatchPanel = ({ batch, student, loading = false }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
        <h2 className="text-sm font-semibold text-textPrimary mb-4">Batch</h2>
        <TextSkeleton lines={5} />
      </div>
    );
  }

  // If batch failed to load but we have the batchId from student
  if (!batch) {
    return (
      <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
        <h2 className="text-sm font-semibold text-textPrimary mb-1">Batch</h2>
        <p className="text-xs text-textMuted mt-2">
          Batch ID:{' '}
          <span className="font-mono text-textPrimary">{student?.batchId ?? '—'}</span>
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="bg-surface rounded-xl border border-border shadow-sm p-5"
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-textPrimary">Batch</h2>
        <Button
          variant="ghost"
          size="xs"
          onClick={() =>
            navigate(buildRoute(ROUTES.BATCH_DETAIL, { id: batch.id }))
          }
          aria-label={`View batch ${batch.name}`}
        >
          View Batch
        </Button>
      </div>
      <p className="text-xs text-textMuted mb-4">Enrolled batch details</p>

      <div className="divide-y divide-border">
        <FieldRow icon={BookOpen}  label="Batch Name"   value={batch.name} />
        <FieldRow icon={Hash}      label="Batch ID"     value={batch.id} />
        <FieldRow icon={User}      label="Trainer"      value={batch.trainerId} />
        <FieldRow icon={Calendar}  label="Start Date"   value={batch.startDate} />
        <FieldRow icon={Calendar}  label="End Date"     value={batch.endDate} />
        <FieldRow icon={Activity}  label="Status">
          <StatusBadge type="batch" status={batch.status ?? 'active'} />
        </FieldRow>
      </div>
    </motion.div>
  );
};

export default StudentBatchPanel;
