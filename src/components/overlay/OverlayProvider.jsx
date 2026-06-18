/**
 * OverlayProvider.jsx
 * Global overlay management provider (Module 3.6 Part 4).
 *
 * Responsibilities:
 *   - Provides a self-contained OverlayContext for toast queue management
 *   - Renders the ToastContainer once at the root level
 *   - Does NOT depend on AppContext — fully independent overlay system
 *   - Supports future extensibility for overlay registration/cleanup
 *
 * Provider API (consumed via useOverlay hook):
 *   showToast({ type, title, message, duration })  → string (id)
 *   hideToast(id)                                  → void
 *   clearToasts()                                  → void
 *
 * Usage:
 *   // Wrap app root (or a sub-tree) once:
 *   <OverlayProvider>
 *     <App />
 *   </OverlayProvider>
 *
 *   // In any descendant:
 *   const { showToast } = useOverlay();
 *   showToast({ type: 'success', title: 'Saved', message: 'Changes were saved.' });
 *
 * Toast shape:
 *   { id: string, type: string, title?: string, message?: string, duration: number }
 *
 * Default toast duration: 3 000 ms (3 seconds).
 * Set duration: 0 to disable auto-dismiss (manual close only).
 */

import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ToastContainer } from './ToastContainer';

// ── Context ──────────────────────────────────────────────────────────────────
// Exported so ToastContainer can consume it without importing useOverlay
// (avoids circular dependency: ToastContainer → useOverlay → OverlayProvider).
export const OverlayContext = createContext(null);
OverlayContext.displayName = 'OverlayContext';

const DEFAULT_DURATION = 3000;

/**
 * OverlayProvider — wraps children with overlay state and renders the
 * global ToastContainer.
 *
 * @param {object}          props
 * @param {React.ReactNode} props.children
 * @param {'top-right'|'top-left'|'bottom-right'|'bottom-left'} [props.toastPosition='top-right']
 */
const OverlayProvider = ({ children, toastPosition = 'top-right' }) => {
  const [toasts, setToasts] = useState([]);
  const counterRef          = useRef(0);

  // ── showToast ──────────────────────────────────────────────────────────
  /**
   * Add a toast to the queue.
   *
   * @param {{ type?: string, title?: string, message?: string, duration?: number }} opts
   * @returns {string} — the generated toast id
   */
  const showToast = useCallback(({
    type     = 'success',
    title,
    message,
    duration = DEFAULT_DURATION,
  } = {}) => {
    counterRef.current += 1;
    const id = `overlay-toast-${Date.now()}-${counterRef.current}`;

    const entry = {
      id,
      type    : ['success', 'error', 'warning', 'info'].includes(type) ? type : 'success',
      title   : title   || undefined,
      message : message || undefined,
      duration: typeof duration === 'number' && duration >= 0 ? duration : DEFAULT_DURATION,
    };

    setToasts((prev) => [...prev, entry]);

    // Schedule removal after duration + exit-animation buffer (300 ms)
    if (entry.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, entry.duration + 300);
    }

    return id;
  }, []);

  // ── hideToast ──────────────────────────────────────────────────────────
  /** Remove a single toast by id (manual close). */
  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── clearToasts ────────────────────────────────────────────────────────
  /** Remove all active toasts immediately. */
  const clearToasts = useCallback(() => setToasts([]), []);

  // ── Context value ──────────────────────────────────────────────────────
  const value = useMemo(
    () => ({ toasts, showToast, hideToast, clearToasts }),
    [toasts, showToast, hideToast, clearToasts]
  );

  return (
    <OverlayContext.Provider value={value}>
      {children}
      <ToastContainer position={toastPosition} />
    </OverlayContext.Provider>
  );
};

OverlayProvider.displayName = 'OverlayProvider';

export { OverlayProvider };
export default OverlayProvider;
