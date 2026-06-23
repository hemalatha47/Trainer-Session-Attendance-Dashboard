/**
 * src/components/data/index.js
 * Barrel export for the entire Data Component Library (Module 3.4).
 *
 * Import from this file in all future modules:
 *   import { DataTable, StatCard, StatusBadge, ProgressBar } from '@components/data';
 */

// Tables
export { DataTable, AdvancedTable } from './DataTable';

// Cards
export { StatCard }   from './StatCard';
export { MetricCard } from './MetricCard';
export { KPIWidget }  from './KPIWidget';

// Info / summary
export {
  InfoCard,
  KeyValueDisplay,
  SummaryCard,
  DataList,
  SearchResultItem,
} from './InfoCard';

// Status / badges (business-aware, wraps Module 3.2 Badge)
export { StatusBadge } from './StatusBadge';

// Avatar system (wraps Module 3.2 Avatar)
export { UserAvatar, InitialAvatar, AttendanceAvatar, AvatarGroup } from './AvatarSystem';

// Progress
export { ProgressBar }                        from './ProgressBar';
export { CircularProgress, PercentageIndicator } from './CircularProgress';

// Trend
export { TrendIndicator } from './TrendIndicator';

// Timeline / Activity
export { Timeline, TimelineItem, ActivityItem } from './Timeline';

// Empty data views (wraps Module 3.3 EmptyState)
export { EmptyDataView, NoResultsView, NoRecordsView } from './DataList';
