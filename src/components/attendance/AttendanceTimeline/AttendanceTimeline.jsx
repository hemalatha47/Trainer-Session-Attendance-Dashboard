/**
 * AttendanceTimeline.jsx
 * Attendance-specific timeline components (Module 3.5, Task 4).
 *
 * Thin wrappers around Module 3.4 Timeline, TimelineItem, ActivityItem.
 * NO new timeline logic — only attendance-domain defaults and conventions.
 *
 * Exports:
 *   AttendanceTimeline      — wrapper (delegates to Timeline)
 *   AttendanceTimelineItem  — single day record item
 *   AttendanceActivityItem  — recent-activity entry with StatusChip
 *
 * Usage — attendance history:
 *   <AttendanceTimeline>
 *     {records.map((r, i) => (
 *       <AttendanceTimelineItem key={r.id} record={r} isLast={i === last} />
 *     ))}
 *   </AttendanceTimeline>
 *
 * Usage — recent submissions:
 *   <AttendanceTimeline>
 *     {activity.map((a, i) => (
 *       <AttendanceActivityItem key={a.id} activity={a} isLast={i === last} />
 *     ))}
 *   </AttendanceTimeline>
 */

import { Timeline, TimelineItem, ActivityItem } from '@components/data/Timeline';
import { AttendanceStatusChip } from '../AttendanceStatusChip';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_LABEL,
  ATTENDANCE_DOT_COLOR,
} from '@constants/attendanceStatus';
import { cn } from '@utils/componentUtils';
import { CheckCircle, XCircle, Clock, Calendar, Circle, MinusCircle } from 'lucide-react';

// ── Icon map (same as StatusChip, kept local for clarity) ─────────────────────
const ICON_MAP = {
  [ATTENDANCE_STATUS.PRESENT]:  <CheckCircle  size={14} />,
  [ATTENDANCE_STATUS.ABSENT]:   <XCircle      size={14} />,
  [ATTENDANCE_STATUS.LATE]:     <Clock        size={14} />,
  [ATTENDANCE_STATUS.LEAVE]:    <Calendar     size={14} />,
  [ATTENDANCE_STATUS.HALF_DAY]: <Circle       size={14} />,
  [ATTENDANCE_STATUS.EXCUSED]:  <MinusCircle  size={14} />,
};

// ── AttendanceTimeline ────────────────────────────────────────────────────────
/**
 * @param {React.ReactNode} props.children
 * @param {string} [props.label='Attendance history']
 * @param {string} [props.className]
 */
const AttendanceTimeline = ({ children, label = 'Attendance history', className }) => (
  <Timeline aria-label={label} className={className}>
    {children}
  </Timeline>
);

AttendanceTimeline.displayName = 'AttendanceTimeline';

// ── AttendanceTimelineItem ────────────────────────────────────────────────────
/**
 * Single attendance record in a history list.
 *
 * @param {object} props.record   — { date, status, batchName?, markedBy?, markedAt? }
 * @param {boolean} [props.isLast=false]
 * @param {string}  [props.className]
 */
const AttendanceTimelineItem = ({ record, isLast = false, className }) => {
  const { date, status, batchName, markedBy } = record ?? {};
  const key = status?.toLowerCase() ?? ATTENDANCE_STATUS.ABSENT;
  const dotColor = ATTENDANCE_DOT_COLOR[key];

  const description = [
    batchName && `Batch: ${batchName}`,
    markedBy  && `Marked by ${markedBy}`,
  ].filter(Boolean).join(' · ') || undefined;

  return (
    <TimelineItem
      icon={
        <span style={{ color: dotColor }} aria-hidden="true">
          {ICON_MAP[key] ?? ICON_MAP[ATTENDANCE_STATUS.ABSENT]}
        </span>
      }
      title={date ?? 'Unknown date'}
      description={description}
      timestamp={<AttendanceStatusChip status={key} mode="compact" size="sm" />}
      isLast={isLast}
      className={className}
    />
  );
};

AttendanceTimelineItem.displayName = 'AttendanceTimelineItem';

// ── AttendanceActivityItem ────────────────────────────────────────────────────
/**
 * Recent-activity entry — e.g. "Manager marked Batch B attendance for Apr 10".
 *
 * @param {object} props.activity  — { id, title, description, timestamp, status, batchName? }
 * @param {boolean} [props.isLast=false]
 * @param {string}  [props.className]
 */
const AttendanceActivityItem = ({ activity, isLast = false, className }) => {
  const { title, description, timestamp, status } = activity ?? {};

  return (
    <ActivityItem
      title={title ?? 'Attendance marked'}
      description={description}
      timestamp={timestamp}
      badgeType="attendance"
      badgeStatus={status}
      icon={status ? (
        <span style={{ color: ATTENDANCE_DOT_COLOR[status?.toLowerCase()] }}>
          {ICON_MAP[status?.toLowerCase()] ?? ICON_MAP[ATTENDANCE_STATUS.PRESENT]}
        </span>
      ) : undefined}
      isLast={isLast}
      className={className}
    />
  );
};

AttendanceActivityItem.displayName = 'AttendanceActivityItem';

export { AttendanceTimeline, AttendanceTimelineItem, AttendanceActivityItem };
export default AttendanceTimeline;
