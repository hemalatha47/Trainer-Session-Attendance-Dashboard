/**
 * RecentActivityPanel.jsx
 * Recent batch activity panel for Batch Details page.
 *
 * Shows the last N attendance submissions for this batch
 * using the AttendanceTimeline components.
 *
 * Blueprint: Sections 6.2, 6.4, 8.4
 * Module: 4.2 — Task 10
 */

import { motion }                from 'framer-motion';
import { Activity, ClipboardCheck } from 'lucide-react';

import { InfoCard }              from '@components/data/InfoCard';
import { EmptyState }            from '@components/feedback/EmptyState';
import { CardSkeleton }          from '@components/feedback/Skeleton';
import { fadeIn }                from '@constants/animations';
import { cn }                    from '@utils/componentUtils';
import { formatDate }            from '@utils/dateUtils';

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {object[]} props.sessionDates    — distinct session dates for this batch (YYYY-MM-DD[])
 * @param {object[]} props.todayAttendance — today's attendance records
 * @param {boolean}  [props.loading]
 * @param {string}   [props.className]
 */
const RecentActivityPanel = ({
  sessionDates,
  todayAttendance,
  loading,
  className,
}) => {
  if (loading) {
    return <CardSkeleton className={cn('h-64', className)} />;
  }

  // Build activity items from session dates (most recent first)
  const sortedDates = [...(sessionDates ?? [])]
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 6);

  const activityItems = sortedDates.map((date) => ({
    id:           `session-${date}`,
    date,
    label:        formatDate(date),
    studentCount: null, // not available from session dates alone
    type:         'session',
  }));

  const hasActivity = activityItems.length > 0;

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className={className}
    >
      <InfoCard
        title="Recent Sessions"
        subtitle={hasActivity ? `${sortedDates.length} recent dates` : undefined}
        className="h-full"
      >
        {!hasActivity ? (
          <EmptyState
            icon={<Activity size={28} />}
            title="No sessions yet"
            description="Session dates will appear here once attendance is marked."
            className="py-8"
          />
        ) : (
          <div className="px-4 pb-4">
            <ul className="mt-2 space-y-0" role="list" aria-label="Recent session dates">
              {activityItems.map((item, idx) => (
                <li
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 py-2.5',
                    idx < activityItems.length - 1 ? 'border-b border-border/40' : ''
                  )}
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center self-stretch shrink-0 w-4">
                    <div className="w-2 h-2 rounded-full bg-accent-400 mt-1.5 shrink-0" aria-hidden="true" />
                    {idx < activityItems.length - 1 && (
                      <div className="w-px flex-1 bg-border/50 mt-1" aria-hidden="true" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-textPrimary">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-textMuted">
                      Session recorded
                    </p>
                  </div>

                  {/* Icon */}
                  <ClipboardCheck
                    size={14}
                    className="text-success-DEFAULT shrink-0"
                    aria-hidden="true"
                  />
                </li>
              ))}
            </ul>

            {sessionDates?.length > 6 && (
              <p className="text-xs text-textMuted text-center pt-3">
                +{sessionDates.length - 6} earlier sessions
              </p>
            )}
          </div>
        )}
      </InfoCard>
    </motion.div>
  );
};

export default RecentActivityPanel;
