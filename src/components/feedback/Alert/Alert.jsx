/**
 * Alert.jsx
 * Dismissible inline alert component (Module 3.3, Task 2).
 *
 * Variants : success | error | warning | info | neutral
 * Features : title, description, icon, dismissible, action button,
 *            custom content slot, framer-motion entry/exit animations,
 *            ARIA role="alert" for screen readers.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, AlertTriangle, Info, AlertCircle, X,
} from 'lucide-react';
import { slideDown, TRANSITIONS } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import { Button } from '@components/ui/Button';

// ── Variant config ───────────────────────────────────────────────────────────
const VARIANTS = {
  success: {
    wrapper: 'bg-success-bg border-success-border text-success-text',
    icon:    CheckCircle2,
    iconCls: 'text-success-DEFAULT',
  },
  error: {
    wrapper: 'bg-danger-bg border-danger-border text-danger-text',
    icon:    XCircle,
    iconCls: 'text-danger-DEFAULT',
  },
  warning: {
    wrapper: 'bg-warning-bg border-warning-border text-warning-text',
    icon:    AlertTriangle,
    iconCls: 'text-warning-DEFAULT',
  },
  info: {
    wrapper: 'bg-info-bg border-info-border text-info-text',
    icon:    Info,
    iconCls: 'text-info-DEFAULT',
  },
  neutral: {
    wrapper: 'bg-neutral-100 border-neutral-200 text-neutral-700',
    icon:    AlertCircle,
    iconCls: 'text-neutral-500',
  },
};

/**
 * @param {object}  props
 * @param {'success'|'error'|'warning'|'info'|'neutral'} [props.variant='info']
 * @param {string}  [props.title]
 * @param {string}  [props.description]
 * @param {boolean} [props.dismissible=false]
 * @param {function} [props.onDismiss]      — called when user closes alert
 * @param {string}  [props.actionLabel]     — text for optional action button
 * @param {function} [props.onAction]
 * @param {React.ReactNode} [props.children] — custom content slot
 * @param {string}  [props.className]
 */
const Alert = ({
  variant = 'info',
  title,
  description,
  dismissible = false,
  onDismiss,
  actionLabel,
  onAction,
  children,
  className,
}) => {
  const [visible, setVisible] = useState(true);
  const cfg = VARIANTS[variant] ?? VARIANTS.info;
  const IconComponent = cfg.icon;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="alert"
          aria-live={variant === 'error' ? 'assertive' : 'polite'}
          variants={slideDown}
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn(
            'relative flex gap-3 rounded-md border p-4',
            cfg.wrapper,
            className
          )}
        >
          {/* Icon */}
          <span className="mt-0.5 shrink-0" aria-hidden="true">
            <IconComponent className={cn('h-5 w-5', cfg.iconCls)} />
          </span>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <p className="text-sm font-semibold leading-snug">{title}</p>
            )}
            {description && (
              <p className={cn('text-sm leading-relaxed', title && 'mt-0.5 opacity-90')}>
                {description}
              </p>
            )}
            {children && <div className="mt-2">{children}</div>}

            {/* Action button */}
            {actionLabel && onAction && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAction}
                  className="px-0 underline underline-offset-2 hover:no-underline"
                >
                  {actionLabel}
                </Button>
              </div>
            )}
          </div>

          {/* Dismiss button */}
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss alert"
              className={cn(
                'shrink-0 rounded p-0.5 transition-opacity duration-150',
                'hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-current',
                'self-start mt-0.5'
              )}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

Alert.displayName = 'Alert';

export { Alert };
export default Alert;
