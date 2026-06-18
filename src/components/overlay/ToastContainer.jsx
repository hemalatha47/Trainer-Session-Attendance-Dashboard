/**
 * ToastContainer.jsx
 * Renders the active overlay-toast queue in a fixed, portal-mounted layer
 * (Module 3.6 Part 4 — Toast System).
 *
 * Architecture:
 *   ToastContainer is rendered once by OverlayProvider. It reads the toast
 *   queue from OverlayContext (not AppContext) so the overlay system is
 *   self-contained and does not depend on any external provider.
 *
 *   Each toast is wrapped in a pointer-events-auto div inside a pointer-
 *   events-none container so clicks cannot accidentally reach page content
 *   below the toast stack.
 *
 *   The container sits at OVERLAY_Z.toast (1200) to float above all other
 *   overlay layers (backdrop: 1000, content: 1001).
 *
 * Supported positions:
 *   top-right (default) | top-left | bottom-right | bottom-left
 *
 * Usage:
 *   Rendered internally by OverlayProvider — do not mount manually.
 */

import { useContext } from 'react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@utils/componentUtils';
import { OVERLAY_Z } from './Overlay';
import { Toast } from './Toast';
import { OverlayContext } from './OverlayProvider';

// ── Position class map ───────────────────────────────────────────────────────
const POSITION_CLASSES = {
  'top-right'    : 'top-4 right-4 items-end',
  'top-left'     : 'top-4 left-4 items-start',
  'bottom-right' : 'bottom-4 right-4 items-end',
  'bottom-left'  : 'bottom-4 left-4 items-start',
};

/**
 * ToastContainer — renders all active overlay toasts.
 *
 * @param {'top-right'|'top-left'|'bottom-right'|'bottom-left'} [props.position='top-right']
 */
const ToastContainer = ({ position = 'top-right' }) => {
  const { toasts, hideToast } = useContext(OverlayContext);
  const posClass              = POSITION_CLASSES[position] ?? POSITION_CLASSES['top-right'];

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        'pointer-events-none fixed flex flex-col gap-2',
        posClass
      )}
      style={{ zIndex: OVERLAY_Z.toast }}
    >
      <AnimatePresence mode="sync">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast
              id={t.id}
              type={t.type}
              title={t.title}
              message={t.message}
              duration={t.duration}
              onClose={hideToast}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

ToastContainer.displayName = 'ToastContainer';

export { ToastContainer };
export default ToastContainer;
