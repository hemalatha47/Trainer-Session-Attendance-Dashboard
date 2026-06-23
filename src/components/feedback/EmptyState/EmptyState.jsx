/**
 * EmptyState.jsx
 * Reusable empty-state component (Module 3.3, Task 6).
 *
 * Used when a list/table has no data to display.
 * Provides clear direction rather than a blank screen (Section 15.4 blueprint).
 *
 * Future usage: No Students, No Attendance, No Reports, No Search Results, etc.
 */

import { motion } from 'framer-motion';
import { fadeIn } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import { Button } from '@components/ui/Button';

/**
 * @param {object}  props
 * @param {React.ReactNode} [props.icon]       — lucide icon element
 * @param {string}  [props.title='No data yet']
 * @param {string}  [props.description]
 * @param {string}  [props.actionLabel]        — primary CTA text
 * @param {function} [props.onAction]
 * @param {string}  [props.secondaryLabel]     — secondary CTA text
 * @param {function} [props.onSecondaryAction]
 * @param {React.ReactNode} [props.children]   — custom slot below description
 * @param {string}  [props.className]
 */
const EmptyState = ({
  icon,
  title = 'No data yet',
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  children,
  className,
}) => (
  <motion.div
    variants={fadeIn}
    initial="initial"
    animate="animate"
    className={cn(
      'flex flex-col items-center justify-center gap-4 py-14 px-6 text-center',
      className
    )}
  >
    {/* Icon container */}
    {icon && (
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400"
        aria-hidden="true"
      >
        {icon}
      </span>
    )}

    {/* Text */}
    <div className="flex flex-col gap-1 max-w-xs">
      <h3 className="text-base font-semibold text-textPrimary">{title}</h3>
      {description && (
        <p className="text-sm text-textMuted leading-relaxed">{description}</p>
      )}
    </div>

    {/* Custom content */}
    {children}

    {/* Actions */}
    {(actionLabel || secondaryLabel) && (
      <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
        {actionLabel && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryLabel && (
          <Button variant="outline" onClick={onSecondaryAction}>
            {secondaryLabel}
          </Button>
        )}
      </div>
    )}
  </motion.div>
);

EmptyState.displayName = 'EmptyState';

export { EmptyState };
export default EmptyState;
