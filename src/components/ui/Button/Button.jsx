/**
 * Button.jsx
 * Enterprise-grade button component (Module 3.2, Task 3).
 *
 * Variants : primary | secondary | outline | ghost | danger | success
 * Sizes    : sm | md | lg
 * States   : default | hover | active | loading | disabled | focused
 * Features : icon-left, icon-right, loading spinner, full-width,
 *            framer-motion press animation, full accessibility
 */

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { TRANSITIONS, usePrefersReducedMotion } from '@constants/animations';
import { cn, resolveVariant, resolveSize, safeMotion } from '@utils/componentUtils';

// ── Variant styles ───────────────────────────────────────────────────────────
const VARIANT_CLASSES = {
  primary:
    'bg-accent-600 text-white border border-accent-600 ' +
    'hover:bg-accent-700 hover:border-accent-700 ' +
    'focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 ' +
    'active:bg-accent-800 active:border-accent-800 ' +
    'disabled:bg-accent-300 disabled:border-accent-300 disabled:cursor-not-allowed',

  secondary:
    'bg-secondary-100 text-secondary-800 border border-secondary-200 ' +
    'hover:bg-secondary-200 hover:border-secondary-300 ' +
    'focus-visible:ring-2 focus-visible:ring-secondary-400 focus-visible:ring-offset-2 ' +
    'active:bg-secondary-300 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',

  outline:
    'bg-transparent text-accent-600 border border-accent-600 ' +
    'hover:bg-accent-50 ' +
    'focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 ' +
    'active:bg-accent-100 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',

  ghost:
    'bg-transparent text-secondary-700 border border-transparent ' +
    'hover:bg-secondary-100 hover:text-secondary-900 ' +
    'focus-visible:ring-2 focus-visible:ring-secondary-400 focus-visible:ring-offset-2 ' +
    'active:bg-secondary-200 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',

  danger:
    'bg-danger-DEFAULT text-white border border-danger-DEFAULT ' +
    'hover:bg-red-700 hover:border-red-700 ' +
    'focus-visible:ring-2 focus-visible:ring-danger-DEFAULT focus-visible:ring-offset-2 ' +
    'active:bg-red-800 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',

  success:
    'bg-success-DEFAULT text-white border border-success-DEFAULT ' +
    'hover:bg-green-700 hover:border-green-700 ' +
    'focus-visible:ring-2 focus-visible:ring-success-DEFAULT focus-visible:ring-offset-2 ' +
    'active:bg-green-800 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',
};

// ── Size styles ──────────────────────────────────────────────────────────────
const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-4 text-sm gap-2 rounded-md',
  lg: 'h-11 px-6 text-base gap-2.5 rounded-md',
};

const ICON_SIZE_CLASSES = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

// ── Press animation ──────────────────────────────────────────────────────────
const pressVariants = {
  rest: { scale: 1 },
  tap: { scale: 0.97 },
};

/**
 * @param {object}  props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'|'success'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.loading=false]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.fullWidth=false]
 * @param {React.ReactNode} [props.iconLeft]   — icon element rendered left of label
 * @param {React.ReactNode} [props.iconRight]  — icon element rendered right of label
 * @param {React.ReactNode} props.children
 * @param {'button'|'submit'|'reset'} [props.type='button']
 * @param {string} [props.className]
 * @param {function} [props.onClick]
 */
const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    iconLeft,
    iconRight,
    children,
    type = 'button',
    className,
    onClick,
    ...rest
  },
  ref
) {
  const reduced = usePrefersReducedMotion();
  const isDisabled = disabled || loading;

  const motionProps = safeMotion(reduced, {
    variants: pressVariants,
    initial: 'rest',
    whileTap: 'tap',
    transition: TRANSITIONS.fast,
  });

  const iconClass = ICON_SIZE_CLASSES[size] ?? ICON_SIZE_CLASSES.md;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading}
      className={cn(
        // Base
        'inline-flex items-center justify-center font-medium',
        'transition-colors duration-150',
        'select-none outline-none',
        // Variant
        resolveVariant(VARIANT_CLASSES, variant),
        // Size
        resolveSize(SIZE_CLASSES, size),
        // Full width
        fullWidth && 'w-full',
        className
      )}
      {...motionProps}
      {...rest}
    >
      {/* Loading spinner replaces iconLeft when loading */}
      {loading ? (
        <Loader2 className={cn(iconClass, 'animate-spin')} aria-hidden="true" />
      ) : (
        iconLeft && (
          <span className={cn(iconClass, 'flex items-center')} aria-hidden="true">
            {iconLeft}
          </span>
        )
      )}

      {/* Label */}
      {children && (
        <span className={loading ? 'opacity-70' : undefined}>{children}</span>
      )}

      {/* Right icon — hidden during loading */}
      {!loading && iconRight && (
        <span className={cn(iconClass, 'flex items-center')} aria-hidden="true">
          {iconRight}
        </span>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export { Button };
export default Button;
