/**
 * StudentAttendanceTimeline.jsx
 * Attendance history timeline panel for Student Details Page (Module 5.6, Task 8).
 *
 * Wraps AttendanceTimeline + AttendanceTimelineItem from Module 3.5.
 * Shows sessions newest first with pagination (page size 10).
 *
 * Props:
 *   timeline   {object[]}  — from studentAttendanceService (newest first)
 *   loading    {boolean}
 */

import { useState }         from 'react';
import { motion }           from 'framer-motion';
import { History }          from 'lucide-react';
import { fadeIn }           from '@constants/animations';
import { cn }               from '@utils/componentUtils';
import { CardSkeleton }     from '@components/feedback/Skeleton';
import { Button }           from '@components/ui/Button';
import {
  AttendanceTimeline,
  AttendanceTimelineItem,
} from '@components/attendance/AttendanceTimeline';
import { NoAttendanceData } from '@components/attendance/AttendanceEmptyStates';

const PAGE_SIZE = 10;

const StudentAttendanceTimeline = ({ timeline = [], loading = false, className }) => {
  const [page, setPage] = useState(1);

  if (loading) {
    return (
      <div className={cn('bg-surface rounded-xl border border-border shadow-sm p-5', className)}>
        <h3 className="text-base font-semibold text-textPrimary mb-4">Attendance History</h3>
        <CardSkeleton />
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className={cn('bg-surface rounded-xl border border-border shadow-sm p-5', className)}>
        <h3 className="text-base font-semibold text-textPrimary mb-4">Attendance History</h3>
        <NoAttendanceData className="py-6" />
      </div>
    );
  }

  const totalPages = Math.ceil(timeline.length / PAGE_SIZE);
  const pageItems  = timeline.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className={cn(
        'bg-surface rounded-xl border border-border shadow-sm p-5',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-textMuted" aria-hidden="true" />
        <h3 className="text-base font-semibold text-textPrimary">Attendance History</h3>
        <span className="ml-auto text-xs text-textMuted">
          {timeline.length} record{timeline.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Timeline */}
      <AttendanceTimeline label="Student attendance history">
        {pageItems.map((item, idx) => (
          <AttendanceTimelineItem
            key={item.date}
            record={{
              date:    item.date,
              status:  item.status,
              remarks: item.remarks || undefined,
            }}
            isLast={idx === pageItems.length - 1 && page === totalPages}
          />
        ))}
      </AttendanceTimeline>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between pt-4 mt-4 border-t border-border"
          aria-label="Timeline pagination"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-xs text-textMuted">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </motion.div>
  );
};

StudentAttendanceTimeline.displayName = 'StudentAttendanceTimeline';

export default StudentAttendanceTimeline;
