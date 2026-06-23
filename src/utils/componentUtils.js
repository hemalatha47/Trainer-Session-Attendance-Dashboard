/**
 * componentUtils.js
 * Shared utility helpers for building UI components (Module 3.2).
 *
 * Pure functions only — no React imports, no side effects.
 * All components should import from here rather than duplicating logic.
 */

/**
 * Merges multiple class name strings, filtering falsy values.
 * Lightweight alternative to clsx/classnames for this project.
 *
 * @param {...(string|boolean|undefined|null)} classes
 * @returns {string}
 *
 * @example
 *   cn('base-class', isActive && 'active', disabled && 'opacity-50')
 */
export const cn = (...classes) =>
  classes.filter(Boolean).join(' ');

/**
 * Resolves a variant key against a variant map, returning the
 * corresponding class string. Falls back to `defaultVariant` if the
 * given key is not found.
 *
 * @param {Record<string, string>} map       — variant → class string
 * @param {string}                  variant   — requested variant key
 * @param {string}                  fallback  — key to use when variant is missing
 * @returns {string}
 */
export const resolveVariant = (map, variant, fallback = 'primary') =>
  map[variant] ?? map[fallback] ?? '';

/**
 * Resolves a size key against a size map.
 *
 * @param {Record<string, string>} map
 * @param {string}                  size
 * @param {string}                  fallback
 * @returns {string}
 */
export const resolveSize = (map, size, fallback = 'md') =>
  map[size] ?? map[fallback] ?? '';

/**
 * Returns `true` if the value is a non-empty string after trimming.
 * Useful for conditional rendering of helper/error text.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export const hasContent = (value) =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Generates a stable, unique ID string.
 * Used to associate <label htmlFor> with <input id> without
 * depending on React's useId (available in React 18 but keeping
 * a fallback for consistency).
 *
 * @param {string} [prefix='field']
 * @returns {string}
 */
export const generateId = (prefix = 'field') =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Clamps a numeric value between min and max (inclusive).
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

/**
 * Extracts initials from a full name string.
 * Returns up to 2 characters (first + last word initial).
 *
 * @param {string} name
 * @returns {string}
 *
 * @example
 *   getInitials('Arun Kumar')  // 'AK'
 *   getInitials('Divya')       // 'DI'
 */
export const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Motion-safe helper: returns the provided framer-motion props only
 * if `reduced` is false; otherwise returns an empty object so the
 * element renders with no animation.
 *
 * @param {boolean}  reduced   — result of usePrefersReducedMotion()
 * @param {object}   motionProps
 * @returns {object}
 */
export const safeMotion = (reduced, motionProps) =>
  reduced ? {} : motionProps;
