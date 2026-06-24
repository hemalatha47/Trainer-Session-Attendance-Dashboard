/**
 * AnalyticsOverviewPanels.jsx
 * Module 8.1 — Analytics Dashboard Page.
 *
 * Three lightweight overview panels for the analytics landing page:
 *
 * Panel 1 — Attendance Overview:
 *   avg attendance, absent ratio
 *
 * Panel 2 — Batch Performance Overview:
 *   best batch, worst batch, avg batch performance
 *
 * Panel 3 — Student Risk Overview:
 *   risk students, critical students, needs-attention count
 *
 * Designed to be informational cards — no interactivity.
 * Deep-dive links direct users to the full Analytics page.
 */

import { motion }         from 'framer-motion';
import { TrendingUp, TrendingDown, Layers, Users, AlertTriangle, AlertOctagon, Activity } from 'lucide-react';
import { useNavigate }    from 'react-router-dom';
import { fadeIn, usePrefersReducedMotion } from '@constants/animations';
import { cn, safeMotion } from '@utils/componentUtils';
import { CardSkeleton }   from '@components/feedback/Skeleton';
import { Button }         from '@components/ui/Button';
import { ROUTES }         from '@constants/routes';

// ── Panel wrapper ──────────────────────────────────────────────────────────────

const Panel = ({ title, icon, children, className }) => {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      {...safeMotion(reduced, { variants: fadeIn, initial: 'initial', animate: 'animate' })}
      className={cn(
        'rounded-md border border-border bg-white p-5 shadow-card flex flex-col gap-4',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-accent-500" aria-hidden="true">{icon}</span>
        <h3 className="text-sm font-semibold text-textPrimary">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
};

// ── Stat row ──────────────────────────────────────────────────────────────────

const StatRow = ({ label, value, valueClass = 'text-textPrimary' }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-xs text-textMuted">{label}</span>
    <span className={cn('text-sm font-semibold tabular-nums', valueClass)}>{value}</span>
  </div>
);

// ── Risk pill ──────────────────────────────────────────────────────────────────

const riskColor = (risk) => {
  if (risk === 'low')      return 'text-success-700';
  if (risk === 'medium')   return 'text-accent-700';
  if (risk === 'high')     return 'text-warning-text';
  if (risk === 'critical') return 'text-danger-DEFAULT';
  return 'text-textPrimary';
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {object}  props.panels         — from useAnalyticsDashboard().overviewPanels
 * @param {boolean} [props.loading=false]
 * @param {string}  [props.className]
 */
const AnalyticsOverviewPanels = ({
  panels,
  loading = false,
  className,
}) => {
  const navigate = useNavigate();
  const { panel1, panel2, panel3 } = panels ?? {};

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-3', className)}>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div
      className={cn('grid grid-cols-1 gap-4 md:grid-cols-3', className)}
      role="region"
      aria-label="Analytics overview panels"
    >
      {/* Panel 1 — Attendance Overview */}
      <Panel title="Attendance Overview" icon={<Activity size={16} />}>
        <div className="flex flex-col gap-2">
          <StatRow
            label="Avg Attendance"
            value={`${panel1?.avgAttendance ?? 0}%`}
            valueClass={
              (panel1?.avgAttendance ?? 0) >= 75
                ? 'text-success-700'
                : 'text-danger-DEFAULT'
            }
          />
          <StatRow
            label="Absent Ratio"
            value={`${panel1?.absentRatio ?? 0}%`}
            valueClass="text-textPrimary"
          />
          {panel1?.weeklyDelta != null && (
            <StatRow
              label="Weekly Delta"
              value={`${panel1.weeklyDelta > 0 ? '+' : ''}${panel1.weeklyDelta}%`}
              valueClass={panel1.weeklyDelta >= 0 ? 'text-success-700' : 'text-danger-DEFAULT'}
            />
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="self-start mt-auto"
          onClick={() => navigate(ROUTES.ANALYTICS)}
          aria-label="View full attendance analytics"
        >
          View details →
        </Button>
      </Panel>

      {/* Panel 2 — Batch Performance */}
      <Panel title="Batch Performance" icon={<Layers size={16} />}>
        <div className="flex flex-col gap-2">
          <StatRow
            label="Avg Batch Performance"
            value={`${panel2?.avgBatchPerformance ?? 0}%`}
          />
          {panel2?.bestBatch && (
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs text-textMuted flex items-center gap-1">
                <TrendingUp size={12} className="text-success-500" aria-hidden="true" />
                Best Batch
              </span>
              <div className="text-right">
                <p
                  className={cn(
                    'text-xs font-medium truncate max-w-[120px]',
                    riskColor(panel2.bestBatch.risk)
                  )}
                  title={panel2.bestBatch.name}
                >
                  {panel2.bestBatch.name}
                </p>
                <p className="text-xs text-textMuted">{panel2.bestBatch.rate}%</p>
              </div>
            </div>
          )}
          {panel2?.worstBatch && (
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs text-textMuted flex items-center gap-1">
                <TrendingDown size={12} className="text-danger-500" aria-hidden="true" />
                Needs Attention
              </span>
              <div className="text-right">
                <p
                  className={cn(
                    'text-xs font-medium truncate max-w-[120px]',
                    riskColor(panel2.worstBatch.risk)
                  )}
                  title={panel2.worstBatch.name}
                >
                  {panel2.worstBatch.name}
                </p>
                <p className="text-xs text-textMuted">{panel2.worstBatch.rate}%</p>
              </div>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="self-start mt-auto"
          onClick={() => navigate(ROUTES.BATCHES)}
          aria-label="View all batches"
        >
          View batches →
        </Button>
      </Panel>

      {/* Panel 3 — Student Risk */}
      <Panel title="Student Risk Overview" icon={<Users size={16} />}>
        <div className="flex flex-col gap-2">
          <StatRow
            label="At Risk"
            value={panel3?.riskStudents ?? 0}
            valueClass={
              (panel3?.riskStudents ?? 0) > 0 ? 'text-warning-text' : 'text-success-700'
            }
          />
          <StatRow
            label="Critical"
            value={panel3?.criticalStudents ?? 0}
            valueClass={
              (panel3?.criticalStudents ?? 0) > 0 ? 'text-danger-DEFAULT' : 'text-success-700'
            }
          />
          <StatRow
            label="Needs Attention"
            value={panel3?.improvementCount ?? 0}
            valueClass="text-textPrimary"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="self-start mt-auto"
          onClick={() => navigate(ROUTES.STUDENTS)}
          aria-label="View all students"
        >
          View students →
        </Button>
      </Panel>
    </div>
  );
};

AnalyticsOverviewPanels.displayName = 'AnalyticsOverviewPanels';

export default AnalyticsOverviewPanels;
