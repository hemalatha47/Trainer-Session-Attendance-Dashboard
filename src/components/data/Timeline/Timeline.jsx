/**
 * Timeline.jsx
 * Vertical timeline with activity items (Module 3.4, Task 5/11).
 *
 * Exports:
 *   Timeline      — wrapper with vertical connector line
 *   TimelineItem  — generic step/event with icon, title, description, timestamp
 *   ActivityItem  — attendance/batch activity entry (uses TimelineItem + StatusBadge)
 *
 * Future usage: attendance history, student activity, batch activity, recent submissions.
 */

import { motion } from 'framer-motion';
import { fadeIn } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import { StatusBadge } from '../StatusBadge';

// ── Timeline ─────────────────────────────────────────────────────────────────

/**
 * @param {React.ReactNode} props.children  — TimelineItem / ActivityItem elements
 * @param {string}  [props.className]
 */
const Timeline = ({ children, className }) => (
  <ol
    className={cn('relative flex flex-col', className)}
    aria-label="Timeline"
  >
    {children}
  </ol>
);

Timeline.displayName = 'Timeline';

// ── TimelineItem ──────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {React.ReactNode} [props.icon]   — dot or icon (defaults to a circle dot)
 * @param {string}  props.title
 * @param {string}  [props.description]
 * @param {string}  [props.timestamp]
 * @param {boolean} [props.isLast=false]   — hides the connector line
 * @param {string}  [props.className]
 */
const TimelineItem = ({
  icon,
  title,
  description,
  timestamp,
  isLast = false,
  className,
}) => (
  <motion.li
    variants={fadeIn}
    initial="initial"
    animate="animate"
    className={cn('relative flex gap-4 pb-6 last:pb-0', className)}
  >
    {/* Connector line */}
    {!isLast && (
      <span
        className="absolute left-4 top-9 bottom-0 w-px bg-border"
        aria-hidden="true"
      />
    )}

    {/* Icon / dot */}
    <span
      className={cn(
        'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center',
        'rounded-full bg-white border-2 border-border',
        'text-textMuted'
      )}
      aria-hidden="true"
    >
      {icon ?? (
        <span className="h-2 w-2 rounded-full bg-accent-600" />
      )}
    </span>

    {/* Content */}
    <div className="flex-1 min-w-0 pt-0.5">
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <p className="text-sm font-semibold text-textPrimary leading-snug">{title}</p>
        {timestamp && (
          <time className="text-xs text-textMuted shrink-0">{timestamp}</time>
        )}
      </div>
      {description && (
        <p className="mt-0.5 text-sm text-textMuted leading-relaxed">{description}</p>
      )}
    </div>
  </motion.li>
);

TimelineItem.displayName = 'TimelineItem';

// ── ActivityItem ──────────────────────────────────────────────────────────────

/**
 * Attendance/batch activity entry — TimelineItem with StatusBadge.
 *
 * @param {object}  props
 * @param {string}  props.title
 * @param {string}  [props.description]
 * @param {string}  [props.timestamp]
 * @param {'attendance'|'batch'|'student'|'generic'} [props.badgeType]
 * @param {string}  [props.badgeStatus]   — status key for StatusBadge
 * @param {React.ReactNode} [props.icon]
 * @param {boolean} [props.isLast=false]
 * @param {string}  [props.className]
 */
const ActivityItem = ({
  title,
  description,
  timestamp,
  badgeType,
  badgeStatus,
  icon,
  isLast = false,
  className,
}) => (
  <TimelineItem
    title={title}
    timestamp={timestamp}
    isLast={isLast}
    icon={icon}
    className={className}
    description={
      <span className="flex flex-wrap items-center gap-2 mt-1">
        {description && <span className="text-sm text-textMuted">{description}</span>}
        {badgeType && badgeStatus && (
          <StatusBadge type={badgeType} status={badgeStatus} size="sm" />
        )}
      </span>
    }
  />
);

ActivityItem.displayName = 'ActivityItem';

export { Timeline, TimelineItem, ActivityItem };
export default Timeline;
