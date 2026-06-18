/**
 * BatchTabSystem.jsx
 * Tab navigation system for Batch Details page.
 *
 * Tabs:
 *   Overview    — fully implemented (Module 4.2)
 *   Students    — placeholder (Module 4.3)
 *   Attendance  — placeholder (Module 4.4 / Phase 6)
 *   Reports     — placeholder (Phase 7)
 *   Analytics   — placeholder (Phase 8)
 *
 * Blueprint: Sections 6.4, 7.1, 11.3
 * Module: 4.2 — Task 11
 */

import { useState }         from 'react';
import { motion }           from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BarChart2,
  PieChart,
}                           from 'lucide-react';

import { EmptyState }       from '@components/feedback/EmptyState';
import { fadeIn }           from '@constants/animations';
import { cn }               from '@utils/componentUtils';

// ── Tab definitions ───────────────────────────────────────────────────────────

const TABS = [
  {
    id:        'overview',
    label:     'Overview',
    icon:      LayoutDashboard,
    available: true,
    ariaLabel: 'Overview tab',
  },
  {
    id:        'students',
    label:     'Students',
    icon:      Users,
    available: false,
    badge:     'Module 4.3',
    ariaLabel: 'Students tab — coming in Module 4.3',
  },
  {
    id:        'attendance',
    label:     'Attendance',
    icon:      ClipboardCheck,
    available: false,
    badge:     'Phase 6',
    ariaLabel: 'Attendance tab — coming in Phase 6',
  },
  {
    id:        'reports',
    label:     'Reports',
    icon:      BarChart2,
    available: false,
    badge:     'Phase 7',
    ariaLabel: 'Reports tab — coming in Phase 7',
  },
  {
    id:        'analytics',
    label:     'Analytics',
    icon:      PieChart,
    available: false,
    badge:     'Phase 8',
    ariaLabel: 'Analytics tab — coming in Phase 8',
  },
];

// ── Tab bar ───────────────────────────────────────────────────────────────────

const TabBar = ({ activeTab, onTabChange }) => (
  <div
    role="tablist"
    aria-label="Batch detail sections"
    className="flex items-center gap-0.5 border-b border-border bg-white overflow-x-auto no-scrollbar"
  >
    {TABS.map((tab) => {
      const Icon    = tab.icon;
      const isActive = activeTab === tab.id;

      return (
        <button
          key={tab.id}
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={isActive}
          aria-controls={`tabpanel-${tab.id}`}
          aria-label={tab.ariaLabel}
          disabled={!tab.available}
          onClick={() => tab.available && onTabChange(tab.id)}
          className={cn(
            'relative inline-flex items-center gap-1.5 px-4 py-3',
            'text-xs font-medium whitespace-nowrap',
            'border-b-2 -mb-px transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-accent-600 focus-visible:ring-inset',
            isActive
              ? 'border-accent-600 text-accent-600'
              : tab.available
              ? 'border-transparent text-textMuted hover:text-textPrimary hover:border-border'
              : 'border-transparent text-textMuted/40 cursor-not-allowed',
          )}
        >
          <Icon size={14} aria-hidden="true" />
          {tab.label}
          {tab.badge && !tab.available && (
            <span className="ml-1 px-1 py-0.5 rounded text-[9px] font-medium bg-neutral-100 text-neutral-400">
              {tab.badge}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

// ── Placeholder panel ─────────────────────────────────────────────────────────

const PlaceholderPanel = ({ tab }) => (
  <div
    role="tabpanel"
    id={`tabpanel-${tab.id}`}
    aria-labelledby={`tab-${tab.id}`}
    className="p-5"
  >
    <EmptyState
      icon={<tab.icon size={32} />}
      title={`${tab.label} — Coming Soon`}
      description={`This tab will be implemented in ${tab.badge}. The architecture is in place and ready for connection.`}
      className="py-14"
    />
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {React.ReactNode} props.overviewContent — rendered Overview tab content
 * @param {string} [props.className]
 */
const BatchTabSystem = ({ overviewContent, className }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const activeTabDef = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <section
      className={cn('rounded-md border border-border bg-white shadow-card', className)}
      aria-label="Batch detail tabs"
    >
      {/* Tab bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab panels */}
      <motion.div
        key={activeTab}
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="p-4 sm:p-5"
      >
        {activeTab === 'overview' ? (
          <div
            role="tabpanel"
            id="tabpanel-overview"
            aria-labelledby="tab-overview"
          >
            {overviewContent}
          </div>
        ) : (
          <PlaceholderPanel tab={activeTabDef} />
        )}
      </motion.div>
    </section>
  );
};

export default BatchTabSystem;
