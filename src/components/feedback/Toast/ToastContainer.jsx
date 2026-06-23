/**
 * ToastContainer.jsx
 * Renders the active toast queue in a fixed overlay (Module 3.3, Task 3).
 *
 * Reads `toasts` and `dismissToast` from AppContext.
 * Supports 6 position configurations (default: top-right).
 *
 * Mount once near the App root — already wired in App.jsx modification.
 */

import { AnimatePresence } from 'framer-motion';
import { useAppContext } from '@context/AppContext';
import Toast from './Toast';
import { cn } from '@utils/componentUtils';

// ── Position classes ─────────────────────────────────────────────────────────
const POSITION_CLASSES = {
  'top-right':     'top-4 right-4 items-end',
  'top-left':      'top-4 left-4 items-start',
  'top-center':    'top-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-right':  'bottom-4 right-4 items-end',
  'bottom-left':   'bottom-4 left-4 items-start',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
};

/**
 * @param {'top-right'|'top-left'|'top-center'|'bottom-right'|'bottom-left'|'bottom-center'} [props.position='top-right']
 * @param {number} [props.defaultDuration=3000]
 */
const ToastContainer = ({ position = 'top-right', defaultDuration = 3000 }) => {
  const { toasts, dismissToast } = useAppContext();
  const posClass = POSITION_CLASSES[position] ?? POSITION_CLASSES['top-right'];

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        'pointer-events-none fixed z-[9999] flex flex-col gap-2',
        posClass
      )}
    >
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              message={toast.message}
              title={toast.title}
              type={toast.type}
              duration={toast.duration ?? defaultDuration}
              onDismiss={dismissToast}
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
