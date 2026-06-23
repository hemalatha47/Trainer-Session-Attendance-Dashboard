/**
<<<<<<< HEAD
 * AppRouter.jsx — Module 6.2 update.
 *
 * Changes from Module 5.1:
 *   - Added ROUTES.ATTENDANCE route for the Attendance Dashboard (Module 6.1).
 *   - Updated ROUTES.MARK_ATTENDANCE to point to the new MarkAttendancePage
 *     (session setup — Module 6.2).
 *   - Old lazy import '@pages/Attendance' now maps to both routes via
 *     separate lazy imports.
=======
 * AppRouter.jsx — Module 2.3 hardened version.
 *
 * Changes from 2.2:
 *   - Route registration now driven by ROUTE_CONFIG (no scattered route strings)
 *   - Login redirect restores `state.from` so users land on their intended page
 *   - PageLoader respects reduced-motion preference
 *   - 404 uses descriptive aria-label
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
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
<<<<<<< HEAD
const LoginPage                 = lazy(() => import('@pages/Login'));
const DashboardPage             = lazy(() => import('@pages/Dashboard'));
const BatchListPage             = lazy(() => import('@pages/Batches/BatchList'));
const BatchDetailsPage          = lazy(() => import('@pages/Batches/BatchDetails'));
const StudentListPage           = lazy(() => import('@pages/Students'));
const StudentDetailsPage        = lazy(() => import('@pages/Students/StudentDetails'));
// Module 6.1 — Attendance Dashboard (now at ROUTES.ATTENDANCE)
const AttendanceDashboardPage   = lazy(() => import('@pages/Attendance'));
// Module 6.2 — Attendance Session Setup (at ROUTES.MARK_ATTENDANCE)
const MarkAttendancePage        = lazy(() => import('@pages/Attendance/MarkAttendance'));
// Module 6.3 — Attendance Sheet Core (at ROUTES.ATTENDANCE_SHEET)
const AttendanceSheetPage       = lazy(() => import('@pages/Attendance/AttendanceSheet'));
// Module 6.6 — Attendance History & Timeline
const AttendanceHistoryPage     = lazy(() => import('@pages/Attendance/AttendanceHistory'));
const ReportsPage               = lazy(() => import('@pages/Reports'));
const AnalyticsPage             = lazy(() => import('@pages/Analytics'));
const SettingsPage              = lazy(() => import('@pages/Settings'));
const NotFoundPage              = lazy(() => import('@pages/NotFound'));
// Dev-only component showcases — not linked in production navigation
const UIShowcase                = lazy(() => import('@pages/UIShowcase'));
const FeedbackShowcase          = lazy(() => import('@pages/FeedbackShowcase'));
// Module 3.6 overlay showcase — requires OverlayProvider (mounted in App.jsx)
const OverlayDemo               = lazy(() => import('@pages/dev/OverlayDemo'));
// Module 3.5 attendance component showcase
const AttendanceShowcase        = lazy(() => import('@pages/AttendanceShowcase/AttendanceShowcasePage'));
// Module 3.4 data component showcase
const DataShowcase              = lazy(() => import('@pages/DataShowcase'));
=======
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
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726

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
<<<<<<< HEAD
          <Route path={ROUTES.STUDENT_DETAIL}  element={<StudentDetailsPage />} />
          {/* Attendance Dashboard (Module 6.1) */}
          <Route path={ROUTES.ATTENDANCE}      element={<AttendanceDashboardPage />} />
          {/* Mark Attendance — Session Setup (Module 6.2) */}
          <Route path={ROUTES.MARK_ATTENDANCE} element={<MarkAttendancePage />} />
          {/* Attendance Sheet — Core Marking (Module 6.3) */}
          <Route path={ROUTES.ATTENDANCE_SHEET}   element={<AttendanceSheetPage />} />
          {/* Attendance History & Timeline (Module 6.6) */}
          <Route path={ROUTES.ATTENDANCE_HISTORY} element={<AttendanceHistoryPage />} />
          <Route path={ROUTES.REPORTS}            element={<ReportsPage />} />
=======
          <Route path={ROUTES.MARK_ATTENDANCE} element={<MarkAttendancePage />} />
          <Route path={ROUTES.REPORTS}         element={<ReportsPage />} />
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
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
