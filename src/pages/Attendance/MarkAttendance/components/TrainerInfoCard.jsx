/**
 * TrainerInfoCard.jsx
 * Displays resolved trainer context for the selected batch.
 * Module: 6.2, Task 6.
 *
 * Shows: trainer name, role, session ownership indicator.
 * Compact informational panel — no editing.
 */

import { UserCheck, Shield } from 'lucide-react';
import { cn }                from '@utils/componentUtils';

const ROLE_LABELS = {
  admin:   'Administrator',
  manager: 'Training Manager',
  trainer: 'Trainer',
};

/**
 * @param {object} props
 * @param {{ trainerId, trainerName, role, isOwner }} [props.trainerInfo]
 * @param {boolean} [props.loading=false]
 */
const TrainerInfoCard = ({ trainerInfo, loading = false }) => {
  if (loading || !trainerInfo) return null;

  const roleLabel = ROLE_LABELS[trainerInfo.role] ?? trainerInfo.role ?? 'Staff';

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-white p-3">
      {/* Avatar placeholder */}
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-700"
        aria-hidden="true"
      >
        <UserCheck className="w-4.5 h-4.5" />
      </span>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-textPrimary leading-tight truncate">
          {trainerInfo.trainerName}
        </p>
        <p className="text-xs text-textMuted mt-0.5">{roleLabel}</p>
      </div>

      {/* Ownership badge */}
      {trainerInfo.isOwner && (
        <span
          className="flex items-center gap-1 text-[10px] font-medium text-success-DEFAULT bg-success-bg px-2 py-0.5 rounded-full border border-success-DEFAULT/20 shrink-0"
          title="You are the assigned trainer for this batch"
        >
          <Shield className="w-3 h-3" aria-hidden="true" />
          Session Owner
        </span>
      )}
    </div>
  );
};

TrainerInfoCard.displayName = 'TrainerInfoCard';

export default TrainerInfoCard;
