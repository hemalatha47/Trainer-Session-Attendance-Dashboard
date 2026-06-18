/**
 * AppRouter.jsx — Module 2.3 hardened version.
 *
 * Changes from 2.2:
 *   - Route registration now driven by ROUTE_CONFIG (no scattered route strings)
 *   - Login redirect restores `state.from` so users land on their intended page
 *   - PageLoader respects reduced-motion preference
 *   - 404 uses descriptive aria-label
 *
 * Route strategy:
 *   /login      → public; redirects to state.from or DASHBOARD if authenticated
 *   protected   → ProtectedRoute → PageWrapper → Outlet
 *   *           → NotFoundPage (no layout shell)
 *
 * ROUTES.DASHBOARD = '/' (blueprint Section 16.4 — no /dashboard alias).
 * Consumed by: App.jsx
 */

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import { ROUTES }        from '@constants/routes';
import { useAuthContext } from '@context/AuthContext';
import ProtectedRoute    from './ProtectedRoute';
import PageWrapper       from '@components/layout/PageWrapper';

// ── Lazy-loaded pages ────────────────────────────────────────────────────────
const LoginPage          = lazy(() => import('@pages/Login'));
const DashboardPage      = lazy(() => import('@pages/Dashboard'));
const BatchListPage      = lazy(() => import('@pages/Batches/BatchList'));
const BatchDetailsPage   = lazy(() => import('@pages/Batches/BatchDetails'));
const StudentListPage    = lazy(() => import('@pages/Students'));
const MarkAttendancePage = lazy(() => import('@pages/Attendance'));
const ReportsPage        = lazy(() => import('@pages/Reports'));
const AnalyticsPage      = lazy(() => import('@pages/Analytics'));
const SettingsPage       = lazy(() => import('@pages/Settings'));
const NotFoundPage       = lazy(() => import('@pages/NotFound'));
// Dev-only component showcases — not linked in production navigation
const UIShowcase         = lazy(() => import('@pages/UIShowcase'));
const FeedbackShowcase   = lazy(() => import('@pages/FeedbackShowcase'));
// Module 3.6 overlay showcase — requires OverlayProvider (mounted in App.jsx)
const OverlayDemo        = lazy(() => import('@pages/dev/OverlayDemo'));
// Module 3.5 attendance component showcase
const AttendanceShowcase = lazy(() => import('@pages/AttendanceShowcase/AttendanceShowcasePage'));
// Module 3.4 data component showcase
const DataShowcase       = lazy(() => import('@pages/DataShowcase'));

// ── Shared loading fallback ──────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background"
    role="status" aria-live="polite" aria-label="Loading page">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent
        rounded-full animate-spin" aria-hidden="true" />
      <p className="text-sm text-textMuted">Loading…</p>
    </div>
  </div>
);

// ── Login with redirect-restore ──────────────────────────────────────────────

const LoginRoute = () => {
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();
  // Restore intended destination if redirected from a protected route
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  return <LoginPage />;
};

// ── AppRouter ────────────────────────────────────────────────────────────────

const AppRouter = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* ── Public ─────────────────────────────────────────────────────── */}
      <Route path={ROUTES.LOGIN} element={<LoginRoute />} />

      {/* ── Dev-only: UI Component Showcase ────────────────────────────── */}
      {import.meta.env.DEV && (
        <Route path="/ui-showcase" element={<UIShowcase />} />
      )}
      {import.meta.env.DEV && (
        <Route path="/feedback-showcase" element={<FeedbackShowcase />} />
      )}
      {/* OverlayProvider is mounted in App.jsx — useOverlay() works here */}
      {import.meta.env.DEV && (
        <Route path="/dev/overlay-demo" element={<OverlayDemo />} />
      )}
      {import.meta.env.DEV && (
        <Route path="/dev/attendance-showcase" element={<AttendanceShowcase />} />
      )}
      {import.meta.env.DEV && (
        <Route path="/data-showcase" element={<DataShowcase />} />
      )}

      {/* ── Protected — all rendered inside PageWrapper shell ──────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PageWrapper />}>
          <Route path={ROUTES.DASHBOARD}       element={<DashboardPage />} />
          <Route path={ROUTES.BATCHES}         element={<BatchListPage />} />
          <Route path={ROUTES.BATCH_DETAIL}    element={<BatchDetailsPage />} />
          <Route path={ROUTES.STUDENTS}        element={<StudentListPage />} />
          <Route path={ROUTES.MARK_ATTENDANCE} element={<MarkAttendancePage />} />
          <Route path={ROUTES.REPORTS}         element={<ReportsPage />} />
          <Route path={ROUTES.ANALYTICS}       element={<AnalyticsPage />} />
          <Route path={ROUTES.SETTINGS}        element={<SettingsPage />} />
        </Route>
      </Route>

      {/* ── 404 ────────────────────────────────────────────────────────── */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default AppRouter;
