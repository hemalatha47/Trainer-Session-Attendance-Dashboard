/**
 * Switch.jsx
 * Animated toggle switch component (Module 3.2, Task 9).
 *
 * Features : active/inactive states, disabled state, label/description,
 *            framer-motion thumb animation, full accessibility (role=switch).
 */

import { forwardRef, useId } from 'react';
import { motion } from 'framer-motion';
import { TRANSITIONS, usePrefersReducedMotion } from '@constants/animations';
import { cn, hasContent, safeMotion } from '@utils/componentUtils';

const SIZES = {
  sm: {
    track: 'h-4 w-7',
    thumb: 'h-3 w-3',
    translateOn: 12,
  },
  md: {
    track: 'h-5 w-9',
    thumb: 'h-3.5 w-3.5',
    translateOn: 16,
  },
  lg: {
    track: 'h-6 w-11',
    thumb: 'h-4.5 w-4.5',
    translateOn: 20,
  },
};

/**
 * @param {object}  props
 * @param {boolean} [props.checked=false]
 * @param {boolean} [props.disabled=false]
 * @param {string}  [props.label]
 * @param {string}  [props.description]
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {function} [props.onChange]
 * @param {string}  [props.className]
 * @param {string}  [props.id]
 */
const Switch = forwardRef(function Switch(
  {
    checked = false,
    disabled = false,
    label,
    description,
    size = 'md',
    onChange,
    className,
    id: idProp,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const descId = description ? `${id}-desc` : undefined;
  const reduced = usePrefersReducedMotion();

  const { track, thumb, translateOn } = SIZES[size] ?? SIZES.md;

  const thumbMotion = safeMotion(reduced, {
    layout: true,
    transition: TRANSITIONS.spring,
  });

  const trackClass = cn(
    'relative inline-flex shrink-0 items-center rounded-full p-0.5',
    'transition-colors duration-200 cursor-pointer',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-600',
    track,
    checked
      ? disabled ? 'bg-accent-300' : 'bg-accent-600'
      : disabled ? 'bg-neutral-200' : 'bg-neutral-300',
    disabled && 'cursor-not-allowed opacity-60'
  );

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange?.({ target: { checked: !checked } });
    }
  };

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      {/* Track */}
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        aria-describedby={descId}
        disabled={disabled}
        tabIndex={0}
        onClick={() => !disabled && onChange?.({ target: { checked: !checked } })}
        onKeyDown={handleKeyDown}
        className={cn(trackClass, 'outline-none')}
        {...rest}
      >
        {/* Thumb */}
        <motion.span
          className={cn(
            'rounded-full bg-white shadow',
            thumb,
            'block'
          )}
          animate={{ x: checked ? translateOn - 8 : 0 }}
          {...thumbMotion}
          aria-hidden="true"
        />
      </button>

      {/* Label + description */}
      {(label || description) && (
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => !disabled && onChange?.({ target: { checked: !checked } })}
          className={cn(
            'flex flex-col gap-0.5 text-left',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          )}
        >
          {label && (
            <span className="text-sm font-medium text-secondary-800 leading-none">
              {label}
            </span>
          )}
          {description && (
            <span id={descId} className="text-xs text-textMuted leading-relaxed">
              {description}
            </span>
          )}
        </button>
      )}
    </div>
  );
});

Switch.displayName = 'Switch';

export { Switch };
export default Switch;
