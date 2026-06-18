/**
 * Avatar.jsx
 * User avatar component (Module 3.2, Task 11).
 *
 * Modes  : image (with initials fallback) | initials-only
 * Sizes  : xs | sm | md | lg | xl
 * Status : online | offline | away | busy (dot indicator)
 * Group  : AvatarGroup stacks multiple avatars with overlap
 */

import { useState } from 'react';
import { cn, getInitials } from '@utils/componentUtils';

// ── Size map ─────────────────────────────────────────────────────────────────
const SIZE_CLASSES = {
  xs: { ring: 'h-6 w-6 text-[10px]', dot: 'h-1.5 w-1.5', ring_px: 'ring-1' },
  sm: { ring: 'h-8 w-8 text-xs',     dot: 'h-2 w-2',     ring_px: 'ring-1' },
  md: { ring: 'h-9 w-9 text-sm',     dot: 'h-2.5 w-2.5', ring_px: 'ring-2' },
  lg: { ring: 'h-11 w-11 text-base', dot: 'h-3 w-3',     ring_px: 'ring-2' },
  xl: { ring: 'h-14 w-14 text-lg',   dot: 'h-3.5 w-3.5', ring_px: 'ring-2' },
};

// ── Status dot colors ─────────────────────────────────────────────────────────
const STATUS_CLASSES = {
  online:  'bg-success-DEFAULT',
  offline: 'bg-neutral-400',
  away:    'bg-warning-DEFAULT',
  busy:    'bg-danger-DEFAULT',
};

// ── Palette for initials-only avatars (consistent per name) ──────────────────
// Avatar color palette — uses only token-registered Tailwind classes.
// Each slot maps to a hue distinct enough to differentiate users visually.
const PALETTE = [
  'bg-accent-100 text-accent-700',      // blue
  'bg-present-bg text-present-text',    // green
  'bg-warning-bg text-warning-text',    // amber
  'bg-danger-bg text-danger-DEFAULT',   // red
  'bg-leave-bg text-leave-text',        // violet
  'bg-secondary-100 text-secondary-700',// slate
];

const pickColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

// ── Avatar ────────────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {string}  [props.src]          — image URL
 * @param {string}  [props.alt]          — alt text for image
 * @param {string}  [props.name]         — used for initials + aria-label fallback
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {'online'|'offline'|'away'|'busy'} [props.status]
 * @param {string}  [props.className]
 */
const Avatar = ({
  src,
  alt,
  name = '',
  size = 'md',
  status,
  className,
}) => {
  const [imgError, setImgError] = useState(false);
  const { ring, dot, ring_px } = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const initials = getInitials(name);
  const colorClass = pickColor(name);
  const showImage = src && !imgError;

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'flex items-center justify-center rounded-full overflow-hidden',
          'font-semibold select-none',
          ring,
          showImage ? 'bg-neutral-100' : colorClass
        )}
        aria-label={alt ?? name}
        role={src ? 'img' : undefined}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt ?? name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </span>

      {/* Status dot */}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-white',
            ring_px,
            dot,
            STATUS_CLASSES[status] ?? STATUS_CLASSES.offline
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </span>
  );
};

Avatar.displayName = 'Avatar';

// ── AvatarGroup ───────────────────────────────────────────────────────────────

/**
 * Stacks a set of Avatar elements with ring overlap and an overflow count.
 *
 * @param {object}   props
 * @param {React.ReactNode[]} props.children  — Avatar elements
 * @param {number}   [props.max=4]            — max visible before "+N" indicator
 * @param {'xs'|'sm'|'md'|'lg'} [props.size='sm']
 * @param {string}   [props.className]
 */
const AvatarGroup = ({ children, max = 4, size = 'sm', className }) => {
  const items = Array.isArray(children) ? children.filter(Boolean) : [children];
  const visible = items.slice(0, max);
  const overflow = items.length - max;

  const { ring, ring_px } = SIZE_CLASSES[size] ?? SIZE_CLASSES.sm;

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((child, i) => (
        <span
          key={i}
          className={cn('relative ring-2 ring-white rounded-full', i !== 0 && '-ml-2')}
          style={{ zIndex: visible.length - i }}
        >
          {child}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            '-ml-2 flex items-center justify-center rounded-full',
            'bg-neutral-200 text-neutral-600 font-medium text-[10px]',
            'ring-2 ring-white z-0',
            ring
          )}
          aria-label={`${overflow} more`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
};

AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup };
export default Avatar;
