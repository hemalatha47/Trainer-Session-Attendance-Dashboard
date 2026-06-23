/**
 * ValidationBanner.jsx
 * Displays session validation state — error messages, checking indicator,
 * and success ("session ready") confirmation.
 * Module: 6.2, Task 5 / 13.
 */

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence }            from 'framer-motion';
import { slideDown }                          from '@constants/animations';
import { cn, safeMotion }                     from '@utils/componentUtils';
import { usePrefersReducedMotion }            from '@constants/animations';

/**
 * @param {object}  props
 * @param {boolean} props.isValid
 * @param {string}  [props.error]
 * @param {boolean} [props.checking=false]
 * @param {boolean} [props.show=false]     - Only render when batch + date are set
 */
const ValidationBanner = ({ isValid, error, checking = false, show = false }) => {
  const reduced = usePrefersReducedMotion();

  if (!show) return null;

  const motionProps = safeMotion(reduced, {
    variants: slideDown,
    initial:  'initial',
    animate:  'animate',
    exit:     'exit',
  });

  if (checking) {
    return (
      <motion.div
        key="checking"
        className="flex items-center gap-2 rounded-md border border-border bg-secondary-50 px-3 py-2"
        {...motionProps}
      >
        <Loader2 className="w-4 h-4 animate-spin text-textMuted shrink-0" aria-hidden="true" />
        <p className="text-xs text-textMuted">Checking session…</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        key="error"
        role="alert"
        className="flex items-start gap-2 rounded-md border border-danger-DEFAULT/30 bg-danger-bg px-3 py-2"
        {...motionProps}
      >
        <AlertCircle className="w-4 h-4 text-danger-DEFAULT shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-danger-DEFAULT leading-relaxed">{error}</p>
      </motion.div>
    );
  }

  if (isValid) {
    return (
      <motion.div
        key="valid"
        className="flex items-center gap-2 rounded-md border border-success-DEFAULT/30 bg-success-bg px-3 py-2"
        {...motionProps}
      >
        <CheckCircle2 className="w-4 h-4 text-success-DEFAULT shrink-0" aria-hidden="true" />
        <p className="text-xs text-success-DEFAULT font-medium">Session configuration is valid</p>
      </motion.div>
    );
  }

  return null;
};

ValidationBanner.displayName = 'ValidationBanner';

export default ValidationBanner;
