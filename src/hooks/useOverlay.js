/**
 * useOverlay.js
 * Consumer hook for the OverlayProvider context (Module 3.6 Part 4).
 *
 * Exposes the overlay-layer toast API so product pages never import
 * OverlayContext or OverlayProvider directly.
 *
 * Requirements:
 *   - OverlayProvider must be an ancestor in the component tree.
 *   - Throws a descriptive error in development if used outside the provider.
 *
 * API:
 *   showToast({ type, title, message, duration })  → id (string)
 *   hideToast(id)                                  → void
 *   clearToasts()                                  → void
 *
 * Convenience methods (all return the toast id):
 *   success(message, opts)  → id
 *   error(message, opts)    → id
 *   warning(message, opts)  → id
 *   info(message, opts)     → id
 *
 * Usage:
 *   import { useOverlay } from '@hooks/useOverlay';
 *
 *   const { showToast, success, error } = useOverlay();
 *
 *   // Full control:
 *   showToast({ type: 'success', title: 'Saved', message: 'All changes saved.', duration: 4000 });
 *
 *   // Convenience:
 *   success('Attendance marked successfully.');
 *   error('Failed to save. Please try again.', { title: 'Save Error', duration: 0 });
 *   warning('Below 75% attendance threshold.', { title: 'Low Attendance' });
 *   info('Session already marked for today.');
 */

import { useCallback, useContext } from 'react';
import { OverlayContext } from '@components/overlay/OverlayProvider';

/**
 * @returns {{
 *   showToast:   (opts: ToastOptions) => string,
 *   hideToast:   (id: string)         => void,
 *   clearToasts: ()                   => void,
 *   success:     (message: string, opts?: PartialToastOptions) => string,
 *   error:       (message: string, opts?: PartialToastOptions) => string,
 *   warning:     (message: string, opts?: PartialToastOptions) => string,
 *   info:        (message: string, opts?: PartialToastOptions) => string,
 * }}
 *
 * @typedef {{ type?: string, title?: string, message?: string, duration?: number }} ToastOptions
 * @typedef {{ title?: string, duration?: number }} PartialToastOptions
 */
const useOverlay = () => {
  const ctx = useContext(OverlayContext);

  if (!ctx) {
    throw new Error(
      '[useOverlay] Must be used inside <OverlayProvider>. ' +
      'Ensure <OverlayProvider> wraps your component tree (App root or sub-tree).'
    );
  }

  const { showToast, hideToast, clearToasts } = ctx;

  // ── Convenience wrappers ─────────────────────────────────────────────────
  const success = useCallback(
    (message, opts = {}) => showToast({ type: 'success', message, ...opts }),
    [showToast]
  );

  const error = useCallback(
    (message, opts = {}) => showToast({ type: 'error', message, ...opts }),
    [showToast]
  );

  const warning = useCallback(
    (message, opts = {}) => showToast({ type: 'warning', message, ...opts }),
    [showToast]
  );

  const info = useCallback(
    (message, opts = {}) => showToast({ type: 'info', message, ...opts }),
    [showToast]
  );

  return {
    showToast,
    hideToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };
};

export { useOverlay };
export default useOverlay;
