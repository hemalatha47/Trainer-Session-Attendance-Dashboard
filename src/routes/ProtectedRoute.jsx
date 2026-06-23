/**
 * ProtectedRoute.jsx
 * Route guard — hardened in Module 2.3.
 *
 * Guarantees:
 *   1. No flash-redirect: shows spinner until session restore completes (loading=true).
 *   2. Preserves attempted URL: unauthenticated access to /reports saves that path
 *      so the user is returned there after login (via `state.from`).
 *   3. Future role/permission support: reads futureRoles/futurePermissions from
 *      routeConfig when requiredPermission prop is supplied (Phase 9 activation).
 *
 * Props:
 *   requiredPermission {string} – optional, for future role-gating (inert in V1)
 *
 * Consumed by: AppRouter
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '@context/AuthContext';
import { ROUTES }        from '@constants/routes';

const ProtectedRoute = ({ requiredPermission }) => {
  const { isAuthenticated, loading, currentUser } = useAuthContext();
  const location = useLocation();

  // ── 1. Session restore in progress — show neutral spinner ───────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background"
        role="status" aria-live="polite" aria-label="Restoring session">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent
            rounded-full animate-spin" aria-hidden="true" />
          <p className="text-sm text-textMuted">Restoring session…</p>
        </div>
      </div>
    );
  }

  // ── 2. Not authenticated — redirect to login, preserving attempted path ─
  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: location }}
      />
    );
  }

  // ── 3. Future: permission check (inert in V1 — no role restrictions yet) ─
  // When Phase 9 activates role-gating, uncomment and implement:
  // if (requiredPermission && currentUser) {
  //   const { hasPermission } = await import('@constants/roles');
  //   if (!hasPermission(currentUser.role, requiredPermission)) {
  //     return <Navigate to={ROUTES.DASHBOARD} replace />;
  //   }
  // }

  // ── 4. Authenticated — render nested routes ──────────────────────────────
  return <Outlet />;
};

export default ProtectedRoute;
