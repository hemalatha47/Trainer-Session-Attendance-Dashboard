/**
 * StudentRecentActivity.jsx
 * Module 5.2 — Student Details Page
 *
 * Vertical timeline of recent activity events for the student.
 * Derived from attendance records and enrollment event in useStudentDetails.
 *
 * Props:
 *   recentActivity  {Array}   — from useStudentDetails
 *   loading         {boolean}
 */

import { CheckCircle, XCircle, UserPlus, Activity } from 'lucide-react';
import { motion }        from 'framer-motion';
import { fadeIn }        from '@constants/animations';
import { cn }            from '@utils/componentUtils';
import { EmptyState }    from '@components/feedback/EmptyState';
import { TextSkeleton }  from '@components/feedback/Skeleton';

// ── Icon resolver ─────────────────────────────────────────────────────────────
const eventIcon = (type) => {
  const map = {
    present:  { Icon: CheckCircle, cls: 'text-success-DEFAULT bg-success-DEFAULT/10' },
    absent:   { Icon: XCircle,     cls: 'text-danger-DEFAULT bg-danger-DEFAULT/10'  },
    enrolled: { Icon: UserPlus,    cls: 'text-accent-600 bg-accent-100'              },
  };
  return map[type] ?? { Icon: Activity, cls: 'text-textMuted bg-border' };
};

// ── Single event item ─────────────────────────────────────────────────────────
const ActivityEventItem = ({ event, isLast }) => {
  const { Icon, cls } = eventIcon(event.type);

  return (
    <motion.li
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="relative flex gap-4 pb-5 last:pb-0"
    >
      {/* Connector line */}
      {!isLast && (
        <div
          className="absolute left-4 top-8 bottom-0 w-px bg-border"
          aria-hidden="true"
        />
      )}

      {/* Icon dot */}
      <span
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10',
          cls
        )}
        aria-hidden="true"
      >
        <Icon className="w-4 h-4" />
      </span>

      {/* Content */}
      <div className="flex-1 pt-1 min-w-0">
        <p className="text-sm font-medium text-textPrimary">{event.title}</p>
        {event.description && (
          <p className="text-xs text-textMuted mt-0.5">{event.description}</p>
        )}
        {event.timestamp && (
          <time
            dateTime={event.timestamp}
            className="text-xs text-textMuted mt-1 block"
          >
            {event.timestamp}
          </time>
        )}
      </div>
    </motion.li>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const StudentRecentActivity = ({ recentActivity = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
        <h2 className="text-sm font-semibold text-textPrimary mb-4">Recent Activity</h2>
        <TextSkeleton lines={8} />
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
      <h2 className="text-sm font-semibold text-textPrimary mb-1">Recent Activity</h2>
      <p className="text-xs text-textMuted mb-4">Latest session events</p>

      {recentActivity.length === 0 ? (
        <EmptyState
          icon={<Activity className="w-6 h-6" />}
          title="No activity yet"
          description="Attendance events will appear here as they are recorded."
        />
      ) : (
        <ol className="relative flex flex-col" aria-label="Recent activity timeline">
          {recentActivity.map((event, i) => (
            <ActivityEventItem
              key={event.id}
              event={event}
              isLast={i === recentActivity.length - 1}
            />
          ))}
        </ol>
      )}
    </motion.div>
  );
};

export default StudentRecentActivity;
