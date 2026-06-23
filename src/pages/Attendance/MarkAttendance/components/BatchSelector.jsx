/**
 * BatchSelector.jsx
 * Batch selection dropdown for the Attendance Session Setup.
 * Module: 6.2, Task 3.
 *
 * Displays active + upcoming batches with trainer and student count info.
 * Shows skeleton during load; empty state when no eligible batches exist.
 */

import { useMemo }           from 'react';
import { Users, Layers }     from 'lucide-react';
import { Select }            from '@components/ui/Select';
import { Skeleton }          from '@components/feedback/Skeleton';
import { BATCH_STATUS, BATCH_STATUS_LABELS } from '@constants/batchStatus';
import { cn }                from '@utils/componentUtils';

// ── Status pill ───────────────────────────────────────────────────────────────

const STATUS_PILL_CLASSES = {
  [BATCH_STATUS.ACTIVE]:   'bg-accent-50 text-accent-700 border border-accent-200',
  [BATCH_STATUS.UPCOMING]: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
};

const BatchStatusPill = ({ status }) => {
  const classes = STATUS_PILL_CLASSES[status] ?? 'bg-neutral-100 text-neutral-600';
  return (
    <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium', classes)}>
      {BATCH_STATUS_LABELS[status] ?? status}
    </span>
  );
};

// ── Selected batch card (info below the dropdown) ─────────────────────────────

const SelectedBatchCard = ({ batch }) => {
  if (!batch) return null;

  return (
    <div className="mt-3 rounded-md border border-border bg-secondary-50 p-3 flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm font-semibold text-textPrimary leading-tight truncate">
          {batch.batchName}
        </p>
        <BatchStatusPill status={batch.status} />
      </div>

      <div className="flex items-center gap-4 text-xs text-textMuted flex-wrap">
        {/* Trainer */}
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Trainer: <strong className="text-textPrimary">{batch.trainerName ?? '—'}</strong></span>
        </span>

        {/* Student count */}
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-textPrimary">{batch.currentStudentCount ?? 0}</strong> students
          </span>
        </span>

        {/* Dates */}
        <span className="text-textMuted">
          {batch.startDate} — {batch.endDate}
        </span>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {object[]} props.batches          - Available batch objects
 * @param {object[]} props.batchOptions     - [{ value, label }] for Select
 * @param {string}   props.selectedBatchId  - Currently selected batch id
 * @param {object}   [props.selectedBatch]  - Full batch object (resolved by hook)
 * @param {function} props.onSelect         - (batchId: string) => void
 * @param {boolean}  [props.loading=false]
 * @param {string}   [props.errorMessage]
 */
const BatchSelector = ({
  batches,
  batchOptions,
  selectedBatchId,
  selectedBatch,
  onSelect,
  loading = false,
  errorMessage,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    );
  }

  const noBatches = !loading && batches.length === 0;

  return (
    <div>
      <Select
        label="Select Batch"
        required
        placeholder="Choose a batch…"
        options={batchOptions}
        value={selectedBatchId}
        onChange={(e) => onSelect(e.target.value)}
        disabled={noBatches}
        loading={loading}
        errorMessage={noBatches ? 'No active batches available' : errorMessage}
        helperText={
          !noBatches && !selectedBatchId
            ? 'Only active and upcoming batches are shown'
            : undefined
        }
        aria-label="Select batch for attendance"
      />

      {selectedBatch && (
        <SelectedBatchCard batch={selectedBatch} />
      )}
    </div>
  );
};

BatchSelector.displayName = 'BatchSelector';

export default BatchSelector;
