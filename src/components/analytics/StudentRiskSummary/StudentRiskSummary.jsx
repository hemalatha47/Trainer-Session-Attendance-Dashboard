/**
 * StudentRiskSummary.jsx
 * Module 8.3 — Analytics Charts & Summary Views
 *
 * Displays student risk distribution across 4 risk categories:
 *  Low      ≥ 85%   — Good Standing
 *  Medium   75–84%  — Needs Attention
 *  High     60–74%  — At Risk
 *  Critical < 60%   — Critical
 *
 * Layout:
 *  - Summary row: 4 count chips (one per risk level)
 *  - Visual progress bars showing % distribution
 *  - Expandable student list per risk group
 *  - Risk alert callouts for high/critical students
 *
 * Uses risk data from analyticsInsightsService.getStudentRiskSummary()
 * via useAnalyticsInsights hook. No formula duplication.
 *
 * Blueprint Sections: 4.6, 6.8
 */

import { useState, useMemo }  from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Users,
} from 'lucide-react';
import { fadeIn }          from '@constants/animations';
import { cn }              from '@utils/componentUtils';
import { CardSkeleton }    from '@components/feedback/Skeleton';
import { EmptyState }      from '@components/feedback/EmptyState';
import { ANALYTICS_RISK }  from '@services/attendanceAnalyticsService';
import { COLORS }          from '@constants/colors';

// ── Risk level icons ──────────────────────────────────────────────────────────

const RISK_ICONS = {
  [ANALYTICS_RISK.LOW]:      <CheckCircle  size={16} aria-hidden="true" />,
  [ANALYTICS_RISK.MEDIUM]:   <Info         size={16} aria-hidden="true" />,
  [ANALYTICS_RISK.HIGH]:     <AlertTriangle size={16} aria-hidden="true" />,
  [ANALYTICS_RISK.CRITICAL]: <AlertOctagon  size={16} aria-hidden="true" />,
};

// ── Risk count chip ───────────────────────────────────────────────────────────

const RiskChip = ({ group, isActive, onClick }) => {
  const icon = RISK_ICONS[group.risk];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        'flex flex-col items-center gap-1 rounded-xl border p-3 transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400',
        'min-w-[70px] flex-1 text-center',
        isActive
          ? cn('border-current shadow-sm', group.bgClass)
          : 'border-border bg-surface hover:border-current hover:bg-neutral-50',
        !isActive && `text-textMuted`
      )}
      style={isActive ? {} : { borderColor: group.color + '40' }}
      aria-label={`${group.label}: ${group.students.length} students`}
    >
      <span
        className={cn(
          'flex items-center justify-center h-8 w-8 rounded-full',
          isActive ? '' : 'bg-neutral-100 text-textMuted'
        )}
        style={isActive ? { color: group.color } : {}}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span
        className="text-xl font-bold tabular-nums leading-none"
        style={{ color: group.color }}
      >
        {group.students.length}
      </span>
      <span className={cn('text-[11px] font-medium leading-tight', isActive ? '' : 'text-textMuted')}>
        {group.label}
      </span>
    </button>
  );
};

// ── Distribution bar ──────────────────────────────────────────────────────────

const DistributionBar = ({ groups, total }) => {
  if (total === 0) return null;
  // Ordered for left-to-right visual weight: Critical → High → Medium → Low
  return (
    <div
      className="h-3 rounded-full overflow-hidden flex gap-0.5"
      role="img"
      aria-label="Risk distribution bar"
    >
      {groups.map((group) => {
        const pct = total > 0 ? (group.students.length / total) * 100 : 0;
        if (pct === 0) return null;
        return (
          <div
            key={group.risk}
            className="h-full transition-all duration-500 rounded-sm"
            style={{
              width: `${pct}%`,
              background: group.color,
              minWidth: pct > 0 ? '4px' : '0',
            }}
            title={`${group.label}: ${group.students.length} students (${Math.round(pct)}%)`}
          />
        );
      })}
    </div>
  );
};

// ── Student list row ──────────────────────────────────────────────────────────

const StudentRow = ({ student }) => (
  <li className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
    <div className="flex items-center gap-2 min-w-0">
      <span
        className="flex-shrink-0 h-6 w-6 rounded-full bg-neutral-100 text-textMuted flex items-center justify-center text-xs font-medium"
        aria-hidden="true"
      >
        {student.studentName?.[0]?.toUpperCase() ?? '?'}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-textPrimary truncate">{student.studentName}</p>
        <p className="text-xs text-textMuted truncate">{student.batchName}</p>
      </div>
    </div>
    <span
      className="flex-shrink-0 text-sm font-bold tabular-nums"
      style={{ color: student.percentage < 60 ? COLORS?.danger?.DEFAULT : student.percentage < 75 ? COLORS?.warning?.DEFAULT : COLORS?.accent?.DEFAULT }}
      aria-label={`Attendance: ${student.percentage}%`}
    >
      {student.percentage}%
    </span>
  </li>
);

// ── Expandable risk group panel ───────────────────────────────────────────────

const RiskGroupPanel = ({ group, isExpanded, onToggle }) => {
  const hasStudents = group.students.length > 0;

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden transition-colors duration-150',
        isExpanded ? 'border-current shadow-sm' : 'border-border'
      )}
      style={isExpanded ? { borderColor: group.color + '60' } : {}}
    >
      {/* Panel header */}
      <button
        type="button"
        onClick={onToggle}
        disabled={!hasStudents}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-4 py-3 text-left',
          'transition-colors duration-150',
          hasStudents
            ? 'hover:bg-neutral-50 cursor-pointer'
            : 'cursor-default opacity-60',
          isExpanded ? '' : ''
        )}
        aria-expanded={isExpanded}
        aria-controls={`risk-group-${group.risk}-list`}
        aria-label={`${group.label} group: ${group.students.length} students`}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: group.color }} aria-hidden="true">
            {RISK_ICONS[group.risk]}
          </span>
          <span className="text-sm font-semibold text-textPrimary">{group.label}</span>
          <span
            className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', group.bgClass)}
          >
            {group.students.length} student{group.students.length !== 1 ? 's' : ''}
          </span>
        </div>
        {hasStudents && (
          <span className="text-textMuted" aria-hidden="true">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        )}
      </button>

      {/* Student list */}
      <AnimatePresence>
        {isExpanded && hasStudents && (
          <motion.div
            id={`risk-group-${group.risk}-list`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul
              className="px-4 pb-3 divide-y-0 max-h-56 overflow-y-auto"
              aria-label={`Students in ${group.label} category`}
            >
              {group.students.map((stu) => (
                <StudentRow key={stu.studentId} student={stu} />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Risk alert callouts ───────────────────────────────────────────────────────

const AlertCallouts = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div
      className="rounded-xl border border-danger-border bg-danger-bg/30 p-4"
      role="alert"
      aria-label="High-priority risk alerts"
    >
      <p className="text-xs font-semibold text-danger-DEFAULT mb-2 flex items-center gap-1.5">
        <AlertOctagon size={13} aria-hidden="true" />
        Requires Attention
      </p>
      <ul className="space-y-1">
        {alerts.map((msg, i) => (
          <li key={i} className="text-xs text-textPrimary">
            · {msg}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.riskSummary         — from useAnalyticsInsights().riskSummary
 * @param {boolean} [props.loading=false]
 * @param {string}  [props.error]
 * @param {string}  [props.className]
 */
const StudentRiskSummary = ({
  riskSummary,
  loading = false,
  error,
  className,
}) => {
  const [activeRisk,   setActiveRisk]   = useState(null);
  const [expandedRisk, setExpandedRisk] = useState(null);

  if (loading) return <CardSkeleton className={cn('h-80', className)} />;

  const groups  = riskSummary?.groups  ?? [];
  const totals  = riskSummary?.totals  ?? {};
  const alerts  = riskSummary?.alerts  ?? [];
  const total   = totals.total ?? 0;

  const handleChipClick = (risk) => {
    if (activeRisk === risk) {
      setActiveRisk(null);
      setExpandedRisk(null);
    } else {
      setActiveRisk(risk);
      setExpandedRisk(risk);
    }
  };

  const handlePanelToggle = (risk) => {
    setExpandedRisk((prev) => (prev === risk ? null : risk));
    setActiveRisk(risk);
  };

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
      aria-label="Student risk summary"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-accent-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-textPrimary">Student Risk Summary</h3>
        </div>
        {total > 0 && (
          <span className="text-xs text-textMuted">{total} students tracked</span>
        )}
      </div>

      {/* Content */}
      {error ? (
        <div
          className="flex items-center justify-center h-32 text-sm text-danger-600 rounded-lg bg-danger-bg/30 border border-danger-border"
          role="alert"
        >
          {error}
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="No student data available"
          description="Student risk levels will appear once attendance is recorded."
          className="py-6"
        />
      ) : (
        <>
          {/* Chip row */}
          <div
            className="flex gap-2 flex-wrap sm:flex-nowrap"
            role="group"
            aria-label="Risk level selector"
          >
            {groups.map((group) => (
              <RiskChip
                key={group.risk}
                group={group}
                isActive={activeRisk === group.risk}
                onClick={() => handleChipClick(group.risk)}
              />
            ))}
          </div>

          {/* Distribution bar */}
          <DistributionBar groups={groups} total={total} />

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-textMuted">
            {groups.map((group) => (
              <span key={group.risk} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: group.color }}
                  aria-hidden="true"
                />
                {group.label}: {Math.round(group.percentage)}%
              </span>
            ))}
          </div>

          {/* Expandable group panels */}
          <div className="flex flex-col gap-2" role="list" aria-label="Risk groups">
            {groups.map((group) => (
              <RiskGroupPanel
                key={group.risk}
                group={group}
                isExpanded={expandedRisk === group.risk}
                onToggle={() => handlePanelToggle(group.risk)}
              />
            ))}
          </div>

          {/* Alert callouts */}
          <AlertCallouts alerts={alerts} />
        </>
      )}
    </motion.div>
  );
};

StudentRiskSummary.displayName = 'StudentRiskSummary';

export default StudentRiskSummary;
