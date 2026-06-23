/**
 * Toast.jsx
 * Individual toast notification for the overlay system
 * (Module 3.6 Part 4 — Toast System).
 *
 * This is the overlay-layer toast — it renders via the OverlayProvider
 * and is managed by the useOverlay hook. It is separate from the feedback/
 * Toast component (which is wired to AppContext) so the overlay system
 * remains self-contained and independently usable.
 *
 * Types: success | error | warning | info
 *
 * Features:
 *   - Manual close button
 *   - Auto-dismiss with animated progress bar
 *   - Queue-safe (each instance is independent)
 *   - Multiple simultaneous instances supported
 *   - ARIA live region for screen-reader announcements
 *   - Animation via framer-motion (respects prefers-reduced-motion)
 *   - Non-blocking — pointer-events are self-contained per toast
 *
 * Props:
 *   id        {string}   — unique identifier for dismiss targeting
 *   type      {string}   — 'success' | 'error' | 'warning' | 'info'
 *   title     {string}   — optional heading line
 *   message   {string}   — body text
 *   duration  {number}   — ms before auto-dismiss; 0 = manual only
 *   onClose   {function} — called with (id) to remove from the queue
 *
 * Usage (via useOverlay — preferred):
 *   const { showToast } = useOverlay();
 *   showToast({ type: 'success', title: 'Saved', message: 'Changes saved.' });
 *
 * Usage (direct — for OverlayProvider internal rendering):
 *   <Toast id="t1" type="error" message="Something went wrong" onClose={dismiss} />
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, AlertTriangle, Info, X,
} from 'lucide-react';
import { cn } from '@utils/componentUtils';
import { OVERLAY_Z } from './Overlay';

// ── Variant configuration ────────────────────────────────────────────────────
const TOAST_CONFIG = {
  success: {
    wrapper : 'border-l-4 border-l-success-DEFAULT bg-white',
    icon    : CheckCircle2,
    iconCls : 'text-success-DEFAULT',
    bar     : 'bg-success-DEFAULT',
    label   : 'Success',
  },
  error: {
    wrapper : 'border-l-4 border-l-danger-DEFAULT bg-white',
    icon    : XCircle,
    iconCls : 'text-danger-DEFAULT',
    bar     : 'bg-danger-DEFAULT',
    label   : 'Error',
  },
  warning: {
    wrapper : 'border-l-4 border-l-yellow-400 bg-white',
    icon    : AlertTriangle,
    iconCls : 'text-warning-text',
    bar     : 'bg-yellow-400',
    label   : 'Warning',
  },
  info: {
    wrapper : 'border-l-4 border-l-accent-600 bg-white',
    icon    : Info,
    iconCls : 'text-accent-600',
    bar     : 'bg-accent-600',
    label   : 'Info',
  },
};

// ── Framer-motion variants ───────────────────────────────────────────────────
const toastVariants = {
  initial : { opacity: 0, x: 40, scale: 0.95 },
  animate : { opacity: 1, x: 0,  scale: 1,    transition: { duration: 0.2, ease: 'easeOut' } },
  exit    : { opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } },
};

/**
 * Toast — a single overlay-layer notification card.
 *
 * @param {object}   props
 * @param {string}   props.id
 * @param {'success'|'error'|'warning'|'info'} [props.type='success']
 * @param {string}   [props.title]
 * @param {string}   [props.message]
 * @param {number}   [props.duration=3000]   ms; 0 = manual only
 * @param {function} props.onClose           called with (id) on dismiss
 */
const Toast = ({
  id,
  type     = 'success',
  title,
  message,
  duration = 3000,
  onClose,
}) => {
  const cfg           = TOAST_CONFIG[type] ?? TOAST_CONFIG.success;
  const IconComponent = cfg.icon;

  // Progress bar state (0–100)
  const [progress, setProgress] = useState(100);
  const startRef                = useRef(Date.now());
  const rafRef                  = useRef(null);

  useEffect(() => {
    if (!duration) return;

    const tick = () => {
      const elapsed   = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onClose(id);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [id, duration, onClose]);

  return (
    <motion.div
      layout
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${cfg.label}${title ? ': ' + title : message ? ': ' + message : ''}`}
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ zIndex: OVERLAY_Z.toast }}
      className={cn(
        'relative w-80 max-w-[calc(100vw-2rem)] overflow-hidden',
        'rounded-md shadow-floating',
        cfg.wrapper
      )}
    >
      {/* Content row */}
      <div className="flex items-start gap-3 p-4 pr-10">
        <span className="mt-0.5 shrink-0" aria-hidden="true">
          <IconComponent className={cn('h-5 w-5', cfg.iconCls)} />
        </span>
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-semibold text-textPrimary leading-snug">{title}</p>
          )}
          {message && (
            <p className={cn('text-sm text-textMuted leading-relaxed', title && 'mt-0.5')}>
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={() => onClose(id)}
        aria-label="Dismiss notification"
        className={cn(
          'absolute right-2 top-2 rounded p-1',
          'text-neutral-400 hover:text-neutral-700',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600',
          'transition-colors duration-150'
        )}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Auto-dismiss progress bar */}
      {duration > 0 && (
        <div
          aria-hidden="true"
          className={cn('h-0.5 w-full transition-none', cfg.bar)}
          style={{ width: `${progress}%` }}
        />
      )}
    </motion.div>
  );
};

Toast.displayName = 'Toast';

export { Toast };
export default Toast;
