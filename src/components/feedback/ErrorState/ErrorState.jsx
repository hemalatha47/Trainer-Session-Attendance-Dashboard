/**
 * ErrorState.jsx
 * Reusable error state component (Module 3.3, Task 7).
 *
 * Used when a data fetch or operation fails.
 * Always provides a recovery action (retry) so users are never stuck.
 *
 * Future usage: API failure, network failure, page crash boundary.
 */

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { fadeIn } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import { Button } from '@components/ui/Button';

/**
 * @param {object}  props
 * @param {string}  [props.title='Something went wrong']
 * @param {string}  [props.description]
 * @param {string}  [props.errorDetail]    — technical detail (collapsed by default)
 * @param {string}  [props.retryLabel='Try again']
 * @param {function} [props.onRetry]
 * @param {React.ReactNode} [props.actions] — custom action slot (overrides retry)
 * @param {string}  [props.className]
 */
const ErrorState = ({
  title = 'Something went wrong',
  description = 'We couldn\'t load this data. Please try again.',
  errorDetail,
  retryLabel = 'Try again',
  onRetry,
  actions,
  className,
}) => (
  <motion.div
    variants={fadeIn}
    initial="initial"
    animate="animate"
    role="alert"
    aria-live="assertive"
    className={cn(
      'flex flex-col items-center justify-center gap-4 py-14 px-6 text-center',
      className
    )}
  >
    {/* Icon */}
    <span
      className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-bg"
      aria-hidden="true"
    >
      <AlertCircle className="h-8 w-8 text-danger-DEFAULT" />
    </span>

    {/* Text */}
    <div className="flex flex-col gap-1 max-w-sm">
      <h3 className="text-base font-semibold text-textPrimary">{title}</h3>
      <p className="text-sm text-textMuted leading-relaxed">{description}</p>
    </div>

    {/* Technical detail (optional) */}
    {errorDetail && (
      <details className="w-full max-w-sm text-left">
        <summary className="cursor-pointer text-xs text-textMuted hover:text-textPrimary transition-colors">
          Show error details
        </summary>
        <pre className="mt-2 rounded bg-neutral-100 p-3 text-[11px] text-neutral-700 overflow-auto max-h-32 leading-relaxed">
          {errorDetail}
        </pre>
      </details>
    )}

    {/* Actions */}
    <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
      {actions ?? (
        onRetry && (
          <Button variant="primary" onClick={onRetry}>
            {retryLabel}
          </Button>
        )
      )}
    </div>
  </motion.div>
);

ErrorState.displayName = 'ErrorState';

export { ErrorState };
export default ErrorState;
