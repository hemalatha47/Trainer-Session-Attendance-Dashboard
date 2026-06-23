/**
 * SuccessState.jsx
 * Reusable success confirmation component (Module 3.3, Task 8).
 *
 * Used after completing a key action — Attendance saved, Batch created, etc.
 * Provides clear confirmation + optional next-step actions.
 */

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { scaleIn } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import { Button } from '@components/ui/Button';

/**
 * @param {object}  props
 * @param {string}  [props.title='Done!']
 * @param {string}  [props.description]
 * @param {string}  [props.actionLabel]
 * @param {function} [props.onAction]
 * @param {string}  [props.secondaryLabel]
 * @param {function} [props.onSecondaryAction]
 * @param {React.ReactNode} [props.children]
 * @param {string}  [props.className]
 */
const SuccessState = ({
  title = 'Done!',
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  children,
  className,
}) => (
  <motion.div
    variants={scaleIn}
    initial="initial"
    animate="animate"
    className={cn(
      'flex flex-col items-center justify-center gap-4 py-14 px-6 text-center',
      className
    )}
  >
    {/* Animated check icon */}
    <motion.span
      className="flex h-16 w-16 items-center justify-center rounded-full bg-success-bg"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
      aria-hidden="true"
    >
      <CheckCircle2 className="h-8 w-8 text-success-DEFAULT" />
    </motion.span>

    <div className="flex flex-col gap-1 max-w-xs">
      <h3 className="text-base font-semibold text-textPrimary">{title}</h3>
      {description && (
        <p className="text-sm text-textMuted leading-relaxed">{description}</p>
      )}
    </div>

    {children}

    {(actionLabel || secondaryLabel) && (
      <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
        {actionLabel && (
          <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
        )}
        {secondaryLabel && (
          <Button variant="outline" onClick={onSecondaryAction}>{secondaryLabel}</Button>
        )}
      </div>
    )}
  </motion.div>
);

SuccessState.displayName = 'SuccessState';

export { SuccessState };
export default SuccessState;
