/**
 * Drawer.jsx
 * Side-panel drawer built on the Overlay base component
 * (Module 3.6 Part 3 — Overlay Components).
 *
 * Architecture:
 *   Drawer delegates all backdrop, portal, scroll-lock, focus management,
 *   ESC, and click-outside logic to <Overlay>. Drawer itself owns only
 *   the visible panel: its position (left / right), width (size), header
 *   with close button, and a scrollable content area.
 *
 *   The existing `drawerOpen` animation variant from @constants/animations
 *   handles the left-slide. A mirrored `drawerOpenRight` variant is derived
 *   inline here for the right position so the animation file stays untouched.
 *
 *   Overlay's `overlay-content-wrapper` centres children by default. Drawer
 *   overrides alignment via the `className` prop on Overlay, passing
 *   `justify-start` (left) or `justify-end` (right) so the panel anchors
 *   to the correct edge without any CSS changes to Part 1.
 *
 * Position values:
 *   left  — slides in from the left edge (navigation, filters)
 *   right — slides in from the right edge (detail panels, forms)
 *
 * Size values (panel width):
 *   sm  → w-72   (288px)  — compact navigation, icon-heavy menus
 *   md  → w-96   (384px)  — default; filter panels, secondary forms
 *   lg  → w-[480px]       — detail views, multi-column content
 *
 * Accessibility:
 *   - role="dialog" + aria-modal="true" provided by Overlay
 *   - aria-labelledby wired to the title element ID (via useId)
 *   - ESC key and backdrop click handled by Overlay
 *   - Focus moves to first focusable element on open (Overlay)
 *   - Focus restored to trigger on close (Overlay)
 *   - Close button has aria-label="Close drawer"
 *
 * Usage:
 *   import { Drawer } from '@components/overlay';
 *
 *   <Drawer
 *     isOpen={open}
 *     onClose={() => setOpen(false)}
 *     title="Filters"
 *     position="right"
 *     size="md"
 *   >
 *     <p>Drawer body content here.</p>
 *   </Drawer>
 */

import { useId } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { TRANSITIONS, usePrefersReducedMotion } from '@constants/animations';
import { cn, safeMotion } from '@utils/componentUtils';
import { Overlay } from './Overlay';

// ── Size → Tailwind width map ────────────────────────────────────────────────
const SIZE_CLASSES = {
  sm: 'w-72',
  md: 'w-96',
  lg: 'w-[480px]',
};

// ── Animation variants ───────────────────────────────────────────────────────
// Left: reuse the existing `drawerOpen` variant shape (x: -100% → 0).
// Right: mirror it (x: 100% → 0). Defined here so animations.js is untouched.
const LEFT_VARIANTS = {
  initial: { x: '-100%' },
  animate: { x: 0,      transition: TRANSITIONS.spring },
  exit:    { x: '-100%', transition: TRANSITIONS.base  },
};

const RIGHT_VARIANTS = {
  initial: { x: '100%' },
  animate: { x: 0,     transition: TRANSITIONS.spring },
  exit:    { x: '100%', transition: TRANSITIONS.base  },
};

/**
 * Drawer — side-panel overlay with header and scrollable content area.
 *
 * @param {object}          props
 * @param {boolean}         props.isOpen                 — controlled open state
 * @param {function}        props.onClose                — called on close trigger
 * @param {string}          [props.title]                — panel heading text
 * @param {React.ReactNode} [props.children]             — body content
 * @param {'left'|'right'}  [props.position='right']     — which edge to anchor to
 * @param {'sm'|'md'|'lg'}  [props.size='md']            — panel width variant
 * @param {boolean}         [props.closeOnEscape=true]   — ESC key closes drawer
 * @param {boolean}         [props.closeOnBackdropClick=true] — backdrop click closes
 */
const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  position             = 'right',
  size                 = 'md',
  closeOnEscape        = true,
  closeOnBackdropClick = true,
}) => {
  const reduced = usePrefersReducedMotion();
  const titleId = useId();

  // Select animation and edge-alignment based on position
  const isLeft     = position === 'left';
  const variants   = isLeft ? LEFT_VARIANTS : RIGHT_VARIANTS;

  // Override the centred flex-alignment of overlay-content-wrapper so the
  // panel sticks to its edge. `items-stretch` makes the panel fill full height.
  const wrapperAlign = isLeft ? 'justify-start items-stretch' : 'justify-end items-stretch';

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      closeOnEscape={closeOnEscape}
      closeOnBackdropClick={closeOnBackdropClick}
      hasBackdrop
      role="dialog"
      ariaLabelledBy={title ? titleId : undefined}
      // Pass alignment override through Overlay's className prop — this
      // targets the overlay-content-wrapper div without any CSS changes.
      className={wrapperAlign}
    >
      {/* Animated drawer panel */}
      <motion.div
        className={cn(
          /* Layout — full height, fixed width by size */
          'relative flex flex-col h-full flex-shrink-0',
          SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
          /* Appearance */
          'bg-white shadow-modal',
          /* Edge rounding — opposite edge only */
          isLeft ? 'rounded-r-xl' : 'rounded-l-xl',
          /* Re-enable pointer events (overlay-content-wrapper disables them) */
          'pointer-events-auto',
        )}
        {...safeMotion(reduced, {
          variants,
          initial:  'initial',
          animate:  'animate',
          exit:     'exit',
        })}
        // Prevent clicks inside panel reaching the backdrop handler
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-200 flex-shrink-0">
          {title ? (
            <h2
              id={titleId}
              className="text-base font-semibold text-secondary-900 leading-snug"
            >
              {title}
            </h2>
          ) : (
            <span aria-hidden="true" />
          )}

          <button
            type="button"
            aria-label="Close drawer"
            onClick={onClose}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-md',
              'text-secondary-400',
              'hover:text-secondary-600 hover:bg-secondary-100',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-accent-600 focus-visible:ring-offset-1',
              'transition-colors duration-150',
              '-mr-1',
            )}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
          {children}
        </div>
      </motion.div>
    </Overlay>
  );
};

Drawer.displayName = 'Drawer';

export { Drawer };
export default Drawer;
