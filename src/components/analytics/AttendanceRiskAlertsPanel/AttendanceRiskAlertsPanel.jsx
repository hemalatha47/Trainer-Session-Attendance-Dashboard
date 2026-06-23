/**
 * AttendanceRiskAlertsPanel.jsx
 * Risk alert panel for Module 6.7 — Attendance Analytics & Alerts.
 *
 * Displays sorted risk alerts (Critical → High).
 * Each alert shows: severity badge, student name, batch, percentage, message.
 * Empty state when no alerts.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, AlertTriangle, ChevronRight } from 'lucide-react';
import { fadeIn }          from '@constants/animations';
import { cn }              from '@utils/componentUtils';
import { CardSkeleton }    from '@components/feedback/Skeleton';
import { EmptyState }      from '@components/feedback/EmptyState';
import { ANALYTICS_RISK, ANALYTICS_RISK_META } from '@services/attendanceAnalyticsService';

// ── Alert row ─────────────────────────────────────────────────────────────────

const SEVERITY_ICON = {
  [ANALYTICS_RISK.CRITICAL]: <AlertOctagon size={16} aria-hidden="true" />,
  [ANALYTICS_RISK.HIGH]:     <AlertTriangle size={16} aria-hidden="true" />,
};

const AlertRow = ({ alert }) => {
  const meta = ANALYTICS_RISK_META[alert.severity] ?? ANALYTICS_RISK_META[ANALYTICS_RISK.HIGH];
  const icon = SEVERITY_ICON[alert.severity] ?? <AlertTriangle size={16} aria-hidden="true" />;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3',
        'bg-surface',
        alert.severity === ANALYTICS_RISK.CRITICAL
          ? 'border-danger-200'
          : 'border-warning-200'
      )}
      role="listitem"
      aria-label={`${meta.label} alert for ${alert.studentName}`}
    >
      {/* Severity icon */}
      <span
        className={cn(
          'mt-0.5 shrink-0 flex items-center justify-center h-7 w-7 rounded-full',
          alert.severity === ANALYTICS_RISK.CRITICAL
            ? 'bg-danger-50 text-danger-600'
            : 'bg-warning-50 text-warning-600'
        )}
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-textPrimary truncate">
            {alert.studentName}
          </span>
          <span
            className={cn(
              'text-[10px] font-medium px-1.5 py-0.5 rounded-full border',
              meta.bgClass
            )}
          >
            {meta.label}
          </span>
        </div>
        <p className="text-xs text-textMuted mt-0.5 truncate">{alert.batchName}</p>
        <p className="text-xs text-textPrimary mt-1">{alert.message}</p>
      </div>

      {/* Percentage pill */}
      <span
        className={cn(
          'shrink-0 text-xs font-bold tabular-nums px-2 py-1 rounded-md',
          alert.severity === ANALYTICS_RISK.CRITICAL
            ? 'bg-danger-50 text-danger-700'
            : 'bg-warning-50 text-warning-700'
        )}
        aria-label={`${alert.percentage}% attendance`}
      >
        {alert.percentage}%
      </span>
    </motion.li>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {Array}   props.alerts       — alert objects from calculateRiskAlerts
 * @param {boolean} [props.loading=false]
 * @param {string}  [props.error]
 * @param {number}  [props.maxVisible=8]
 * @param {string}  [props.className]
 */
const AttendanceRiskAlertsPanel = ({
  alerts = [],
  loading = false,
  error,
  maxVisible = 8,
  className,
}) => {
  if (loading) return <CardSkeleton className={cn('h-64', className)} />;

  const visible        = alerts.slice(0, maxVisible);
  const hiddenCount    = Math.max(0, alerts.length - maxVisible);
  const criticalCount  = alerts.filter((a) => a.severity === ANALYTICS_RISK.CRITICAL).length;
  const highCount      = alerts.filter((a) => a.severity === ANALYTICS_RISK.HIGH).length;

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className={cn(
        'bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col gap-4',
        className
      )}
      role="region"
      aria-label="Attendance risk alerts"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <AlertOctagon size={18} className="text-danger-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-textPrimary">Risk Alerts</h3>
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-textMuted">
            {criticalCount > 0 && (
              <span className="bg-danger-50 text-danger-700 border border-danger-200 px-2 py-0.5 rounded-full font-medium">
                {criticalCount} Critical
              </span>
            )}
            {highCount > 0 && (
              <span className="bg-warning-50 text-warning-700 border border-warning-200 px-2 py-0.5 rounded-full font-medium">
                {highCount} High
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {error ? (
        <div className="flex items-center justify-center h-32 text-sm text-danger-600">
          {error}
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={<AlertOctagon size={28} className="text-success-500" />}
          title="All students are on track"
          description="No critical or high-risk attendance alerts at this time."
          className="py-8"
        />
      ) : (
        <>
          <ul className="flex flex-col gap-2" aria-label="Alert list">
            <AnimatePresence initial={false}>
              {visible.map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
            </AnimatePresence>
          </ul>
          {hiddenCount > 0 && (
            <p className="text-xs text-textMuted text-center pt-1">
              +{hiddenCount} more alert{hiddenCount !== 1 ? 's' : ''} not shown
            </p>
          )}
        </>
      )}
    </motion.div>
  );
};

export default AttendanceRiskAlertsPanel;
