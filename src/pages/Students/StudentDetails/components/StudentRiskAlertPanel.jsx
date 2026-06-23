/**
 * StudentRiskAlertPanel.jsx
 * Risk alert section for Student Details Page (Module 5.6, Task 11).
 *
 * Displays:
 *   - Risk badge from riskUtils classification
 *   - Alert cards per triggered alert (consecutive absence, low %, sudden drop)
 *   - Streak summary (longest records)
 *
 * Severity styles: info | warning | critical
 * Typography: TYPOGRAPHY tokens throughout.
 *
 * Props:
 *   analytics  {object | null}  — from useStudentAttendance
 *   loading    {boolean}
 */

import { motion }         from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Shield,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { fadeIn }         from '@constants/animations';
import { cn }             from '@utils/componentUtils';
import { CardSkeleton }   from '@components/feedback/Skeleton';
import { RISK_LEVELS }    from '@utils/riskUtils';

// ── Severity config ───────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  critical: {
    icon:       AlertCircle,
    cardClass:  'border-danger-border bg-danger-bg',
    iconClass:  'text-danger-DEFAULT',
    textClass:  'text-danger-DEFAULT',
    labelClass: 'text-danger-DEFAULT font-semibold',
  },
  warning: {
    icon:       AlertTriangle,
    cardClass:  'border-warning-border bg-warning-bg',
    iconClass:  'text-warning-text',
    textClass:  'text-warning-text',
    labelClass: 'text-warning-text font-semibold',
  },
  info: {
    icon:       Info,
    cardClass:  'border-blue-200 bg-blue-50',
    iconClass:  'text-blue-500',
    textClass:  'text-blue-700',
    labelClass: 'text-blue-700 font-semibold',
  },
};

// ── Risk header badge ─────────────────────────────────────────────────────────
const RiskBadge = ({ risk }) => {
  const isGood = risk.level === RISK_LEVELS.EXCELLENT || risk.level === RISK_LEVELS.GOOD;
  const Icon   = isGood ? ShieldCheck : Shield;
  const colors = {
    excellent: 'text-success-DEFAULT bg-success-bg border-success-border',
    good:      'text-success-DEFAULT bg-success-bg border-success-border',
    warning:   'text-warning-text bg-warning-bg border-warning-border',
    critical:  'text-danger-DEFAULT bg-danger-bg border-danger-border',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold',
        colors[risk.level]
      )}
      role="status"
      aria-label={`Risk level: ${risk.label}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      {risk.label}
    </div>
  );
};

// ── Single alert card ─────────────────────────────────────────────────────────
const AlertCard = ({ alert }) => {
  const config = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.info;
  const Icon   = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border',
        config.cardClass
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', config.iconClass)} aria-hidden="true" />
      <p className={cn('text-sm leading-relaxed', config.textClass)}>
        {alert.message}
      </p>
    </div>
  );
};

// ── Streak summary row ────────────────────────────────────────────────────────
const StreakRow = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
    <span className="text-sm text-textMuted">{label}</span>
    <span
      className={cn(
        'text-sm font-semibold tabular-nums',
        highlight ? 'text-success-DEFAULT' : 'text-textPrimary'
      )}
    >
      {value}
    </span>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const StudentRiskAlertPanel = ({ analytics, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
        <h3 className="text-base font-semibold text-textPrimary mb-4">Risk & Alerts</h3>
        <CardSkeleton />
      </div>
    );
  }

  const {
    risk    = { label: '—', level: RISK_LEVELS.CRITICAL, colorToken: 'danger', severity: 4 },
    alerts  = [],
    streaks = {
      currentPresentStreak: 0,
      currentAbsentStreak:  0,
      longestPresentStreak: 0,
      longestAbsentStreak:  0,
    },
  } = analytics ?? {};

  const hasAlerts = alerts.length > 0;

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="bg-surface rounded-xl border border-border shadow-sm p-5 flex flex-col gap-5"
    >
      {/* Risk badge */}
      <div>
        <h3 className="text-base font-semibold text-textPrimary mb-3">Risk & Alerts</h3>
        <RiskBadge risk={risk} />
      </div>

      {/* Alert cards */}
      {hasAlerts ? (
        <div className="flex flex-col gap-2" aria-label="Attendance alerts">
          {alerts.map((alert, idx) => (
            <AlertCard key={`${alert.type}-${idx}`} alert={alert} />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-success-DEFAULT">
          <Zap className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm font-medium">No attendance alerts. Keep it up!</p>
        </div>
      )}

      {/* Streak records */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-textMuted mb-2">
          Streak Records
        </p>
        <StreakRow
          label="Longest present streak"
          value={`${streaks.longestPresentStreak} sessions`}
          highlight={streaks.longestPresentStreak > 0}
        />
        <StreakRow
          label="Longest absent streak"
          value={`${streaks.longestAbsentStreak} sessions`}
          highlight={false}
        />
      </div>
    </motion.div>
  );
};

StudentRiskAlertPanel.displayName = 'StudentRiskAlertPanel';

export default StudentRiskAlertPanel;
