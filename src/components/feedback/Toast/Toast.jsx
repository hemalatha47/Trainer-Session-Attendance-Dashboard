/**
 * Toast.jsx
 * Individual toast notification card (Module 3.3, Task 3).
 *
 * Consumed by ToastContainer — not used directly by product pages.
 * Pages call `useToast()` hook or `AppContext.showToast()` to trigger toasts.
 *
 * Features: auto-dismiss progress bar, manual close, 5 variants,
 *           entry/exit animation, ARIA live region.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, AlertTriangle, Info, AlertCircle, X,
} from 'lucide-react';
import { toastEnter, toastExit, TRANSITIONS } from '@constants/animations';
import { cn } from '@utils/componentUtils';

// ── Variant config ───────────────────────────────────────────────────────────
const TOAST_VARIANTS = {
  success: {
    wrapper: 'border-l-4 border-l-success-DEFAULT bg-white',
    icon:    CheckCircle2,
    iconCls: 'text-success-DEFAULT',
    bar:     'bg-success-DEFAULT',
    label:   'Success',
  },
  error: {
    wrapper: 'border-l-4 border-l-danger-DEFAULT bg-white',
    icon:    XCircle,
    iconCls: 'text-danger-DEFAULT',
    bar:     'bg-danger-DEFAULT',
    label:   'Error',
  },
  warning: {
    wrapper: 'border-l-4 border-l-yellow-400 bg-white',
    icon:    AlertTriangle,
    iconCls: 'text-warning-text',
    bar:     'bg-yellow-400',
    label:   'Warning',
  },
  info: {
    wrapper: 'border-l-4 border-l-accent-600 bg-white',
    icon:    Info,
    iconCls: 'text-accent-600',
    bar:     'bg-accent-600',
    label:   'Info',
  },
  neutral: {
    wrapper: 'border-l-4 border-l-neutral-400 bg-white',
    icon:    AlertCircle,
    iconCls: 'text-neutral-500',
    bar:     'bg-neutral-400',
    label:   'Notice',
  },
};

/**
 * @param {object}   props
 * @param {string}   props.id
 * @param {string}   [props.message]
 * @param {string}   [props.title]
 * @param {'success'|'error'|'warning'|'info'|'neutral'} [props.type='success']
 * @param {number}   [props.duration=3000]  — ms; 0 disables auto-close
 * @param {function} props.onDismiss        — called to remove from queue
 */
const Toast = ({ id, message, title, type = 'success', duration = 3000, onDismiss }) => {
  const cfg = TOAST_VARIANTS[type] ?? TOAST_VARIANTS.success;
  const IconComponent = cfg.icon;

  // Progress bar
  const [progress, setProgress] = useState(100);
  const startTime = useRef(Date.now());
  const rafRef = useRef(null);

  useEffect(() => {
    if (duration === 0) return;

    const tick = () => {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onDismiss(id);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      layout
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${cfg.label}: ${title ?? message}`}
      variants={{ ...toastEnter, ...toastExit }}
      initial="initial"
      animate="animate"
      exit="exit"
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
        onClick={() => onDismiss(id)}
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

      {/* Auto-close progress bar */}
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
