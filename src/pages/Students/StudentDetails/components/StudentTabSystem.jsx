/**
 * StudentTabSystem.jsx
 * Module 5.6 update — Attendance tab now ACTIVE.
 *
 * Changes from Module 5.2:
 *   - Tab 'attendance' → ready: true
 *   - Accepts studentId + batchId props for passing to StudentAttendanceTab
 *   - Renders StudentAttendanceTab when 'attendance' tab is active
 *   - Overview tab still receives children (unchanged layout)
 *   - Performance, Documents, Activity remain as placeholders
 */

import { useState }      from 'react';
import { motion }        from 'framer-motion';
import { fadeIn }        from '@constants/animations';
import { cn }            from '@utils/componentUtils';
import { EmptyState }    from '@components/feedback/EmptyState';
import StudentAttendanceTab from './StudentAttendanceTab';
import {
  LayoutDashboard,
  Calendar,
  BarChart2,
  FileText,
  Clock,
} from 'lucide-react';

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  {
    id:    'overview',
    label: 'Overview',
    icon:  LayoutDashboard,
    ready: true,
  },
  {
    id:    'attendance',
    label: 'Attendance',
    icon:  Calendar,
    ready: true,                          // ← Module 5.6: ACTIVATED
  },
  {
    id:    'performance',
    label: 'Performance',
    icon:  BarChart2,
    ready: false,
    hint:  'Analytics charts — coming soon',
  },
  {
    id:    'documents',
    label: 'Documents',
    icon:  FileText,
    ready: false,
    hint:  'Student documents — future enhancement',
  },
  {
    id:    'activity',
    label: 'Activity',
    icon:  Clock,
    ready: false,
    hint:  'Full activity log — future enhancement',
  },
];

// ── Placeholder panel ─────────────────────────────────────────────────────────
const PlaceholderPanel = ({ tab }) => (
  <motion.div
    variants={fadeIn}
    initial="initial"
    animate="animate"
    className="bg-surface rounded-xl border border-border border-dashed p-10"
  >
    <EmptyState
      icon={<tab.icon className="w-7 h-7" />}
      title={`${tab.label} — Coming Soon`}
      description={tab.hint}
    />
  </motion.div>
);

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @param {React.ReactNode} props.children   — Overview tab content
 * @param {string}          props.studentId  — passed to Attendance tab
 * @param {string}          props.batchId    — passed to Attendance tab
 */
const StudentTabSystem = ({ children, studentId, batchId }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const current = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  // ── Tab panel content resolver ────────────────────────────────────────────
  const renderContent = () => {
    if (!current.ready) return <PlaceholderPanel tab={current} />;

    if (current.id === 'attendance') {
      return (
        <StudentAttendanceTab
          studentId={studentId}
          batchId={batchId}
        />
      );
    }

    // Overview tab — receives children from StudentDetailsPage
    return children;
  };

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto scrollbar-none"
        role="tablist"
        aria-label="Student detail tabs"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap',
                'border-b-2 -mb-px transition-colors focus-visible:outline-none',
                'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                isActive
                  ? 'border-accent text-accent-600'
                  : 'border-transparent text-textMuted hover:text-textPrimary hover:border-border'
              )}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {tab.label}
              {!tab.ready && (
                <span
                  className="ml-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full
                    bg-border text-textMuted"
                >
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab panel */}
      <div
        role="tabpanel"
        id={`tabpanel-${current.id}`}
        aria-labelledby={`tab-${current.id}`}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentTabSystem;
