/**
 * AttendanceTimelinePanel.jsx
 * Chronological activity timeline for attendance sessions.
 * Module: 6.6 — Task 6
 *
 * Wraps the existing AttendanceTimeline component with:
 *  - A titled card frame
 *  - Skeleton loading state
 *  - EmptyState when no data
 *  - "Newest first" ordering (done by the hook/service)
 *
 * Props:
 *  timeline  — object[] from useAttendanceHistory
 *  loading   — boolean
 */

import { Clock }    from 'lucide-react';
import { motion }   from 'framer-motion';
import { fadeIn }   from '@constants/animations';
import { TextSkeleton } from '@components/feedback/Skeleton';
import { EmptyState }   from '@components/feedback/EmptyState';
import {
  AttendanceTimeline,
  AttendanceActivityItem,
} from '@components/attendance/AttendanceTimeline';
import { cn } from '@utils/componentUtils';

// ── Status → colour map for timeline icon colour ──────────────────────────────
const STATUS_ICON_COLOR = {
  success: '#22C55E',
  warning: '#F59E0B',
  danger:  '#EF4444',
  default: '#94A3B8',
};

// ── Component ─────────────────────────────────────────────────────────────────

const AttendanceTimelinePanel = ({ timeline = [], loading = false }) => (
  <motion.div
    variants={fadeIn}
    initial="initial"
    animate="animate"
    className="bg-white border border-border rounded-lg p-5 flex flex-col gap-4 h-full"
    aria-label="Attendance activity timeline"
  >
    {/* Header */}
    <div className="flex items-center gap-2">
      <Clock size={16} className="text-accent-600 shrink-0" />
      <h2 className="text-sm font-semibold text-textPrimary">Session Timeline</h2>
      {!loading && timeline.length > 0 && (
        <span className="ml-auto text-xs text-textMuted">{timeline.length} entries</span>
      )}
    </div>

    {/* Loading */}
    {loading && (
      <div className="flex flex-col gap-4" aria-label="Loading timeline" role="status">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse shrink-0" />
            <TextSkeleton lines={2} className="flex-1" />
          </div>
        ))}
        <span className="sr-only">Loading timeline…</span>
      </div>
    )}

    {/* Empty */}
    {!loading && timeline.length === 0 && (
      <EmptyState
        icon={<Clock size={32} className="text-textMuted" />}
        title="No timeline entries"
        description="Adjust your filters to see session activity here."
      />
    )}

    {/* Timeline entries */}
    {!loading && timeline.length > 0 && (
      <div className="overflow-y-auto flex-1 pr-1" style={{ maxHeight: 520 }}>
        <AttendanceTimeline label="Attendance session timeline">
          {timeline.map((entry, i) => {
            const isLast = i === timeline.length - 1;
            return (
              <AttendanceActivityItem
                key={entry.id}
                activity={{
                  id:          entry.id,
                  title:       entry.batchName,
                  description: `${entry.summary} · ${entry.trainerName}`,
                  timestamp:   entry.displayDate,
                  status:      entry.statusColor === 'success' ? 'present'
                              : entry.statusColor === 'danger'  ? 'absent'
                              : 'absent',
                }}
                isLast={isLast}
              />
            );
          })}
        </AttendanceTimeline>
      </div>
    )}
  </motion.div>
);

export default AttendanceTimelinePanel;
