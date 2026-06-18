/**
 * AttendanceLegend.jsx
 * Visual legend for attendance statuses (Module 3.5, Task 7).
 *
 * Reuses AttendanceStatusChip — no new badge logic.
 * Automatically scales to whichever statuses are currently active/visible.
 *
 * @param {string[]} [props.statuses]  — defaults to V1_ATTENDANCE_STATUSES; pass full list for future
 * @param {'horizontal'|'vertical'} [props.layout='horizontal']
 * @param {boolean}  [props.compact=false]  — dot-only mode
 * @param {string}   [props.label='Legend']
 * @param {string}   [props.className]
 */

import { cn } from '@utils/componentUtils';
import { AttendanceStatusChip } from '../AttendanceStatusChip';
import {
  ATTENDANCE_LABEL,
  V1_ATTENDANCE_STATUSES,
  ATTENDANCE_STATUS_LIST,
} from '@constants/attendanceStatus';

const AttendanceLegend = ({
  statuses = V1_ATTENDANCE_STATUSES,
  layout = 'horizontal',
  compact = false,
  label = 'Legend',
  className,
}) => (
  <div
    role="list"
    aria-label={label}
    className={cn(
      'flex flex-wrap items-center gap-2',
      layout === 'vertical' && 'flex-col items-start',
      className,
    )}
  >
    {statuses.map((statusKey) => (
      <div
        key={statusKey}
        role="listitem"
        className="flex items-center gap-1.5"
      >
        <AttendanceStatusChip
          status={statusKey}
          mode={compact ? 'dot' : 'compact'}
          size="sm"
          animated={false}
        />
        {compact && (
          <span className="text-[10px] text-textMuted leading-none">
            {ATTENDANCE_LABEL[statusKey]}
          </span>
        )}
      </div>
    ))}
  </div>
);

AttendanceLegend.displayName = 'AttendanceLegend';

export { AttendanceLegend };
export default AttendanceLegend;
