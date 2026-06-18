/**
 * StatusBadge.jsx
 * Business-aware status badge (Module 3.4, Task 2/7).
 *
 * DOES NOT duplicate Badge logic — re-exports Module 3.2 Badge with
 * a semantic variant resolver for attendance, batch, and student statuses.
 *
 * Usage:
 *   <StatusBadge type="attendance" status="present" />
 *   <StatusBadge type="batch" status="active" />
 *   <StatusBadge type="student" status="inactive" />
 *   <StatusBadge type="generic" status="success" />
 */

import { Badge } from '@components/ui/Badge';

// ── Semantic → Badge variant map ─────────────────────────────────────────────
const ATTENDANCE_MAP = {
  present: { variant: 'present', label: 'Present' },
  absent:  { variant: 'absent',  label: 'Absent'  },
  late:    { variant: 'late',    label: 'Late'     },
  leave:   { variant: 'leave',   label: 'On Leave' },
};

const BATCH_MAP = {
  active:    { variant: 'active',    label: 'Active'    },
  completed: { variant: 'completed', label: 'Completed' },
  upcoming:  { variant: 'upcoming',  label: 'Upcoming'  },
  archived:  { variant: 'neutral',   label: 'Archived'  },
};

const STUDENT_MAP = {
  active:   { variant: 'success', label: 'Active'   },
  inactive: { variant: 'neutral', label: 'Inactive' },
};

const REPORT_MAP = {
  generated: { variant: 'success', label: 'Generated' },
  pending:   { variant: 'warning', label: 'Pending'   },
  failed:    { variant: 'danger',  label: 'Failed'    },
};

const GENERIC_MAP = {
  success: { variant: 'success', label: 'Success' },
  warning: { variant: 'warning', label: 'Warning' },
  danger:  { variant: 'danger',  label: 'Danger'  },
  error:   { variant: 'danger',  label: 'Error'   },
  info:    { variant: 'info',    label: 'Info'    },
  neutral: { variant: 'neutral', label: 'Neutral' },
};

const TYPE_MAPS = {
  attendance: ATTENDANCE_MAP,
  batch:      BATCH_MAP,
  student:    STUDENT_MAP,
  report:     REPORT_MAP,
  generic:    GENERIC_MAP,
};

/**
 * @param {'attendance'|'batch'|'student'|'report'|'generic'} [props.type='generic']
 * @param {string}  props.status          — semantic status key
 * @param {string}  [props.label]         — override resolved label
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.dot=true]
 * @param {string}  [props.className]
 */
const StatusBadge = ({
  type = 'generic',
  status,
  label: labelOverride,
  size = 'md',
  dot = true,
  className,
}) => {
  const map = TYPE_MAPS[type] ?? TYPE_MAPS.generic;
  const resolved = map[status?.toLowerCase()] ?? { variant: 'neutral', label: status ?? '—' };

  return (
    <Badge
      variant={resolved.variant}
      size={size}
      dot={dot}
      className={className}
    >
      {labelOverride ?? resolved.label}
    </Badge>
  );
};

StatusBadge.displayName = 'StatusBadge';

export { StatusBadge };
export default StatusBadge;
