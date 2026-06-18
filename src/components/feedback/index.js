/**
 * src/components/feedback/index.js
 * Barrel export for the entire Feedback Component Library (Module 3.3).
 *
 * Import from this file in all future modules:
 *   import { Alert, EmptyState, Spinner, TableSkeleton } from '@components/feedback';
 */

// Alert
export { Alert } from './Alert';

// Toast system
export { Toast, ToastContainer } from './Toast';

// Loaders
export {
  Spinner,
  PageLoader,
  SectionLoader,
  InlineLoader,
  CardLoader,
  TableLoader,
} from './Loader';

// Skeletons
export {
  Skeleton,
  TextSkeleton,
  AvatarSkeleton,
  CardSkeleton,
  TableSkeleton,
  FormSkeleton,
  PageSkeleton,
} from './Skeleton';

// State components
export { EmptyState }   from './EmptyState';
export { ErrorState }   from './ErrorState';
export { SuccessState } from './SuccessState';
export { StatusMessage } from './StatusMessage';

// Network states
export {
  OfflineState,
  ConnectionLostState,
  ServerErrorState,
  MaintenanceState,
} from './NetworkState';

// Page-level states
export { LoadingPage, EmptyPage, ErrorPage, SuccessPage } from './PageStates';
