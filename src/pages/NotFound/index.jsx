/**
 * NotFoundPage — 404 fallback (Module 1.3 route map, '*' route).
 * Rendered outside PageWrapper (no sidebar/topbar shell).
 * Typography: 404 display number capped at text-2xl per consolidation standard.
 */

import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/routes';

const NotFoundPage = () => (
  <div
    className="min-h-screen flex items-center justify-center bg-background p-4"
    role="main"
    aria-label="Page not found"
  >
    <div className="text-center max-w-sm">
      <p className="text-2xl font-bold text-accent-600 mb-2 tabular-nums">404</p>
      <h1 className="text-xl font-semibold text-textPrimary mb-2 leading-tight">Page Not Found</h1>
      <p className="text-sm text-textMuted mb-6 leading-relaxed">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to={ROUTES.DASHBOARD}
        className="inline-block px-4 py-2.5 bg-accent-600 text-white text-sm font-medium
          rounded-md hover:bg-accent-700 transition-colors focus:outline-none
          focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
      >
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
