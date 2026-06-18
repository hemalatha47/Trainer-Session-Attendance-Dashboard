/**
 * EmptyDataViews.jsx
 * Domain-specific empty state wrappers (Module 3.4, Task 7/13).
 *
 * DOES NOT duplicate EmptyState logic — composes Module 3.3 EmptyState
 * with domain-specific defaults for each entity type.
 *
 * Exports:
 *   EmptyDataView     — generic configurable empty state for data sections
 *   NoResultsView     — search returned 0 results
 *   NoRecordsView     — table has no records at all (vs no search results)
 *
 * Entity presets (pass `entity` prop):
 *   'students' | 'batches' | 'attendance' | 'reports' | 'analytics' | 'generic'
 */

import {
  Users, Layers, ClipboardCheck, FileText, BarChart2, Database, Search, FolderOpen,
} from 'lucide-react';
import { EmptyState } from '@components/feedback/EmptyState';

// ── Entity presets ────────────────────────────────────────────────────────────
const ENTITY_PRESETS = {
  students: {
    icon: <Users className="w-8 h-8" />,
    title: 'No students yet',
    description: 'Add students to this batch to start tracking attendance.',
  },
  batches: {
    icon: <Layers className="w-8 h-8" />,
    title: 'No batches found',
    description: 'Create your first training batch to get started.',
  },
  attendance: {
    icon: <ClipboardCheck className="w-8 h-8" />,
    title: 'No attendance records',
    description: 'Attendance hasn\'t been marked for this batch yet.',
  },
  reports: {
    icon: <FileText className="w-8 h-8" />,
    title: 'No reports available',
    description: 'Generate a report by selecting a batch and date range.',
  },
  analytics: {
    icon: <BarChart2 className="w-8 h-8" />,
    title: 'No analytics data',
    description: 'Analytics will appear once attendance has been recorded.',
  },
  generic: {
    icon: <Database className="w-8 h-8" />,
    title: 'No data yet',
    description: 'Data will appear here once records are available.',
  },
};

// ── EmptyDataView ─────────────────────────────────────────────────────────────

/**
 * @param {'students'|'batches'|'attendance'|'reports'|'analytics'|'generic'} [props.entity='generic']
 * @param {string}  [props.title]             — overrides preset title
 * @param {string}  [props.description]       — overrides preset description
 * @param {React.ReactNode} [props.icon]      — overrides preset icon
 * @param {string}  [props.actionLabel]
 * @param {function} [props.onAction]
 * @param {string}  [props.secondaryLabel]
 * @param {function} [props.onSecondaryAction]
 * @param {string}  [props.className]
 */
const EmptyDataView = ({
  entity = 'generic',
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  className,
}) => {
  const preset = ENTITY_PRESETS[entity] ?? ENTITY_PRESETS.generic;

  return (
    <EmptyState
      icon={icon ?? preset.icon}
      title={title ?? preset.title}
      description={description ?? preset.description}
      actionLabel={actionLabel}
      onAction={onAction}
      secondaryLabel={secondaryLabel}
      onSecondaryAction={onSecondaryAction}
      className={className}
    />
  );
};

EmptyDataView.displayName = 'EmptyDataView';

// ── NoResultsView ─────────────────────────────────────────────────────────────

/**
 * Search returned zero results.
 *
 * @param {string}  [props.query]          — the search term that returned nothing
 * @param {function} [props.onClear]       — callback to clear search
 * @param {string}  [props.className]
 */
const NoResultsView = ({ query, onClear, className }) => (
  <EmptyState
    icon={<Search className="w-8 h-8" />}
    title="No results found"
    description={
      query
        ? `No records match "${query}". Try a different search term.`
        : 'No records match your search criteria.'
    }
    actionLabel={onClear ? 'Clear search' : undefined}
    onAction={onClear}
    className={className}
  />
);

NoResultsView.displayName = 'NoResultsView';

// ── NoRecordsView ─────────────────────────────────────────────────────────────

/**
 * Table/list has no records at all (before any data is added).
 *
 * @param {string}  [props.entity='generic']
 * @param {string}  [props.actionLabel]
 * @param {function} [props.onAction]
 * @param {string}  [props.className]
 */
const NoRecordsView = ({ entity = 'generic', actionLabel, onAction, className }) => {
  const preset = ENTITY_PRESETS[entity] ?? ENTITY_PRESETS.generic;

  return (
    <EmptyState
      icon={<FolderOpen className="w-8 h-8" />}
      title={preset.title}
      description={preset.description}
      actionLabel={actionLabel}
      onAction={onAction}
      className={className}
    />
  );
};

NoRecordsView.displayName = 'NoRecordsView';

export { EmptyDataView, NoResultsView, NoRecordsView };
export default EmptyDataView;
