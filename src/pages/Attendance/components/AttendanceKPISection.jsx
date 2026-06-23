/**
 * AttendanceKPISection.jsx
 * Four KPI cards for the Attendance Dashboard landing page.
 * Module: 6.1, Task 6
 *
 * Cards:
 *  1. Today Attendance %   — present / expected for today
 *  2. Total Marked Today   — total records submitted today
 *  3. Absent Today         — absent count today
 *  4. Pending Batches      — active batches not yet marked
 *
 * Reuses StatCard from existing data component library.
 * No new card components are built here.
 */

import {
  CheckCircle,
  XCircle,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';
import { StatCard } from '@components/data/StatCard';
import { motion }   from 'framer-motion';
import { TRANSITIONS, usePrefersReducedMotion } from '@constants/animations';
import { safeMotion } from '@utils/componentUtils';

// ── Stagger container variant ────────────────────────────────────────────────
const containerVariants = {
  hidden:  {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: TRANSITIONS.base },
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.metrics        — from useAttendanceDashboard
 * @param {boolean} props.loading
 */
const AttendanceKPISection = ({ metrics, loading = false }) => {
  const reduced = usePrefersReducedMotion();

  const {
    todayRate         = 0,
    totalMarkedToday  = 0,
    absentToday       = 0,
    pendingCount      = 0,
  } = metrics ?? {};

  // Determine status colors
  const rateStatus = todayRate >= 75 ? 'success'
                   : todayRate >= 50 ? 'warning'
                   : todayRate > 0   ? 'danger'
                   : 'default';

  const pendingStatus = pendingCount === 0 ? 'success'
                      : pendingCount <= 2  ? 'warning'
                      : 'danger';

  const absentStatus = absentToday === 0   ? 'success'
                     : absentToday <= 5    ? 'warning'
                     : 'danger';

  const cards = [
    {
      label:       'Today Attendance',
      value:       `${todayRate}%`,
      description: 'Present rate across active batches',
      icon:        <CheckCircle className="w-5 h-5" aria-hidden="true" />,
      status:      rateStatus,
    },
    {
      label:       'Marked Today',
      value:       totalMarkedToday,
      description: 'Attendance records submitted',
      icon:        <ClipboardList className="w-5 h-5" aria-hidden="true" />,
      status:      totalMarkedToday > 0 ? 'success' : 'default',
    },
    {
      label:       'Absent Today',
      value:       absentToday,
      description: 'Students marked absent',
      icon:        <XCircle className="w-5 h-5" aria-hidden="true" />,
      status:      absentStatus,
    },
    {
      label:       'Pending Batches',
      value:       pendingCount,
      description: 'Active batches not yet marked',
      icon:        <AlertCircle className="w-5 h-5" aria-hidden="true" />,
      status:      pendingStatus,
    },
  ];

  const containerProps = safeMotion(reduced, {
    variants:  containerVariants,
    initial:   'hidden',
    animate:   'visible',
  });

  const itemProps = safeMotion(reduced, { variants: cardVariants });

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      aria-label="Attendance KPI metrics"
      {...containerProps}
    >
      {cards.map((card) => (
        <motion.div key={card.label} {...itemProps}>
          <StatCard
            label={card.label}
            value={loading ? undefined : card.value}
            description={card.description}
            icon={card.icon}
            status={card.status}
            loading={loading}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

AttendanceKPISection.displayName = 'AttendanceKPISection';

export default AttendanceKPISection;
