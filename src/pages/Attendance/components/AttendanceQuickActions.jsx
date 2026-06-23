/**
 * AttendanceQuickActions.jsx
 * Quick action cards for the Attendance Dashboard page.
 * Module: 6.1, Task 7
 *
 * Cards: Mark Attendance, Bulk Attendance, History, Analytics
 * Each card shows: icon, title, description, action button.
 *
 * Routes not yet built (History, Bulk) receive placeholder navigation.
 */

import { useNavigate } from 'react-router-dom';
import { motion }      from 'framer-motion';
import {
  ClipboardCheck,
  Users,
  History,
  BarChart2,
} from 'lucide-react';
import { Button }    from '@components/ui/Button';
import { cn, safeMotion } from '@utils/componentUtils';
import { ROUTES }    from '@constants/routes';
import {
  TRANSITIONS,
  usePrefersReducedMotion,
  cardHover,
} from '@constants/animations';

// ── Action card config ────────────────────────────────────────────────────────

const ACTIONS = [
  {
    id:          'mark',
    icon:        ClipboardCheck,
    iconBg:      'bg-accent/10 text-accent',
    title:       'Mark Attendance',
    description: 'Open the attendance sheet for a batch and date.',
    label:       'Open Sheet',
    route:       ROUTES.MARK_ATTENDANCE,
    available:   true,
  },
  {
    id:          'bulk',
    icon:        Users,
    iconBg:      'bg-success-bg text-success-DEFAULT',
    title:       'Bulk Attendance',
    description: 'Mark all students present or apply a batch action.',
    label:       'Coming Soon',
    route:       null,
    available:   false,
  },
  {
    id:          'history',
    icon:        History,
    iconBg:      'bg-warning-bg text-warning-text',
    title:       'Attendance History',
    description: 'Browse and filter historical attendance records.',
    label:       'View History',
    route:       ROUTES.REPORTS,    // bridge to Reports until History module built
    available:   true,
  },
  {
    id:          'analytics',
    icon:        BarChart2,
    iconBg:      'bg-info-bg text-info-DEFAULT',
    title:       'Analytics',
    description: 'Charts and trends for attendance performance.',
    label:       'View Charts',
    route:       ROUTES.ANALYTICS,
    available:   true,
  },
];

// ── Stagger variants ──────────────────────────────────────────────────────────

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: TRANSITIONS.base },
};

// ── Single action card ────────────────────────────────────────────────────────

const ActionCard = ({ action, reduced }) => {
  const navigate = useNavigate();
  const Icon = action.icon;

  const handleClick = () => {
    if (action.available && action.route) navigate(action.route);
  };

  const motionProps = safeMotion(reduced, {
    variants:  cardVariants,
  });

  const hoverProps = action.available
    ? safeMotion(reduced, { variants: cardHover, initial: 'rest', whileHover: 'hover' })
    : {};

  return (
    <motion.div
      className={cn(
        'flex flex-col gap-4 rounded-md border border-border bg-white p-5 shadow-card',
        !action.available && 'opacity-60'
      )}
      {...motionProps}
      {...hoverProps}
    >
      {/* Icon + title */}
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            action.iconBg
          )}
          aria-hidden="true"
        >
          <Icon className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-textPrimary leading-tight">
            {action.title}
          </p>
          <p className="text-xs text-textMuted mt-0.5 leading-snug">
            {action.description}
          </p>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-auto">
        <Button
          variant={action.available ? 'primary' : 'secondary'}
          size="sm"
          fullWidth
          disabled={!action.available}
          onClick={handleClick}
          aria-label={`${action.label} — ${action.title}`}
        >
          {action.label}
        </Button>
      </div>
    </motion.div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {boolean} [props.loading]  — skeleton state (not needed here, cards are static)
 */
const AttendanceQuickActions = () => {
  const reduced = usePrefersReducedMotion();

  const containerProps = safeMotion(reduced, {
    variants: containerVariants,
    initial:  'hidden',
    animate:  'visible',
  });

  return (
    <section aria-labelledby="quick-actions-heading">
      <h2
        id="quick-actions-heading"
        className="text-sm font-semibold text-textMuted uppercase tracking-wide mb-3"
      >
        Quick Actions
      </h2>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        {...containerProps}
      >
        {ACTIONS.map((action) => (
          <ActionCard key={action.id} action={action} reduced={reduced} />
        ))}
      </motion.div>
    </section>
  );
};

AttendanceQuickActions.displayName = 'AttendanceQuickActions';

export default AttendanceQuickActions;
