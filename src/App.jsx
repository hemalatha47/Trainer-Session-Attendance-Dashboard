/**
 * App.jsx
 * Root application component — wires global providers and the router.
 *
 * Provider order (outermost → innermost):
 *   OverlayProvider  — self-contained overlay system (Modal, Drawer, Toast via useOverlay)
 *                      Required by dev/showcase pages (OverlayDemo, AttendanceShowcase).
 *                      Does NOT depend on AuthContext or AppContext.
 *   AuthProvider     — session/auth state (independent)
 *   AppProvider      — cross-cutting UI/config state; owns the canonical toast queue
 *                      for product pages (consumed via useToast → AppContext.showToast)
 *   BrowserRouter    — client-side routing
 *     AppRouter      — route table (Module 2.3)
 *
 * ── Toast Architecture Decision (Phase A Stabilization) ──────────────────────
 *
 * CANONICAL SYSTEM for product pages:
 *   useToast()  →  AppContext.showToast()  →  feedback/Toast/ToastContainer
 *   • Rendered once here via <ToastContainer position="top-right" />
 *   • All feature pages (Batches, Attendance, Reports, …) MUST use useToast()
 *   • z-index: 9999 (via Tailwind z-[9999] class)
 *
 * DEV/SHOWCASE SYSTEM (overlay-layer):
 *   useOverlay()  →  OverlayContext  →  overlay/ToastContainer (inside OverlayProvider)
 *   • Used ONLY by OverlayDemo (/dev/overlay-demo) and showcase pages
 *   • Self-contained; rendered automatically by OverlayProvider
 *   • z-index: OVERLAY_Z.toast (1200)
 *   • DO NOT use useOverlay() in product feature pages
 *
 * Both systems coexist without conflict: they use separate contexts, separate
 * queues, and different z-index ranges. The product system (useToast) is the
 * single recommended API for Module 3.7+ implementation.
 */

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider }    from '@context/AuthContext';
import { AppProvider }     from '@context/AppContext';
import { OverlayProvider } from '@components/overlay/OverlayProvider';
import AppRouter           from '@/routes/AppRouter';
import { ToastContainer }  from '@components/feedback/Toast';

const App = () => (
  // OverlayProvider outermost: self-contained, no deps on Auth/App contexts.
  // Required by dev showcase pages that call useOverlay().
  <OverlayProvider toastPosition="top-right">
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRouter />
          {/* Canonical product toast — driven by AppContext via useToast() */}
          <ToastContainer position="top-right" />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  </OverlayProvider>
);

export default App;
