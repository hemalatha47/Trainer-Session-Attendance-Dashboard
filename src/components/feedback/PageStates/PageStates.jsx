/**
 * PageStates.jsx
 * Full-page state components (Module 3.3, Task 11).
 *
 * Used when an entire page is in a specific state — not just a section.
 * These wrap the lower-level feedback components in a full-height layout.
 *
 * Exports:
 *   LoadingPage   — page-level loading
 *   EmptyPage     — page with no data + CTA
 *   ErrorPage     — page-level fetch failure
 *   SuccessPage   — page-level success confirmation
 */

import { PageLoader, SectionLoader } from '../Loader';
import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';
import { SuccessState } from '../SuccessState';
import { cn } from '@utils/componentUtils';

// ── Shared full-height wrapper ────────────────────────────────────────────────
const FullPage = ({ children, className }) => (
  <div className={cn('flex min-h-[calc(100vh-6rem)] items-center justify-center', className)}>
    {children}
  </div>
);

// ── LoadingPage ───────────────────────────────────────────────────────────────
/**
 * @param {string} [props.label='Loading…']
 * @param {boolean} [props.fullScreen=false] — use PageLoader instead of SectionLoader
 */
const LoadingPage = ({ label = 'Loading…', fullScreen = false }) =>
  fullScreen ? (
    <PageLoader label={label} />
  ) : (
    <FullPage>
      <SectionLoader label={label} minHeight="min-h-0" />
    </FullPage>
  );

LoadingPage.displayName = 'LoadingPage';

// ── EmptyPage ─────────────────────────────────────────────────────────────────
/**
 * @param {object} props — all EmptyState props forwarded
 */
const EmptyPage = (props) => (
  <FullPage>
    <EmptyState {...props} />
  </FullPage>
);

EmptyPage.displayName = 'EmptyPage';

// ── ErrorPage ─────────────────────────────────────────────────────────────────
/**
 * @param {object} props — all ErrorState props forwarded
 */
const ErrorPage = (props) => (
  <FullPage>
    <ErrorState {...props} />
  </FullPage>
);

ErrorPage.displayName = 'ErrorPage';

// ── SuccessPage ───────────────────────────────────────────────────────────────
/**
 * @param {object} props — all SuccessState props forwarded
 */
const SuccessPage = (props) => (
  <FullPage>
    <SuccessState {...props} />
  </FullPage>
);

SuccessPage.displayName = 'SuccessPage';

export { LoadingPage, EmptyPage, ErrorPage, SuccessPage };
export default LoadingPage;
