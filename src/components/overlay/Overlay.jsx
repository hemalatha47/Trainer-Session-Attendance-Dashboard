/**
 * Overlay.jsx
 * Reusable base overlay with backdrop, z-index layering, controlled
 * open/close, click-outside detection, and keyboard (Escape) dismissal
 * (Module 3.6 — Base Overlay Infrastructure).
 *
 * This is the FOUNDATION layer only. It does not provide a content panel,
 * header/footer, or specific panel dimensions — those are the concern of
 * Modal, Drawer, Dialog, etc., which will compose Overlay as their backdrop.
 *
 * Architecture:
 *   Overlay renders in a Portal (escapes root tree, avoids stacking-context
 *   traps). It positions a full-screen backdrop <div> and renders `children`
 *   on top of it. Children control their own size, position, and animation.
 *
 * Behaviour contract:
 *   - `isOpen=false`  → nothing rendered (portal is not mounted)
 *   - `isOpen=true`   → portal mounts, backdrop visible, children rendered
 *   - Click on backdrop → `onClose()` called (if `closeOnBackdropClick`)
 *   - Escape key       → `onClose()` called (if `closeOnEscape`, default true)
 *   - `onClose` is never called internally if those props are false/absent
 *
 * Body scroll lock:
 *   While open, `overflow: hidden` is set on `document.body` to prevent the
 *   page scrolling behind the overlay. The original overflow value is
 *   restored on close or unmount.
 *
 * z-index layering (values defined here, consumed by all future overlays):
 *   OVERLAY_Z.backdrop  = 1000   — the dim layer
 *   OVERLAY_Z.content   = 1001   — the content panel (modals, drawers, etc.)
 *   OVERLAY_Z.tooltip   = 1100   — tooltips float above open overlays
 *   OVERLAY_Z.toast     = 1200   — toasts float above everything
 *
 * Usage:
 *   import { Overlay } from '@components/overlay';
 *
 *   <Overlay
 *     isOpen={isOpen}
 *     onClose={handleClose}
 *     closeOnBackdropClick
 *     hasBackdrop
 *   >
 *     <div className="my-panel">...</div>
 *   </Overlay>
 */

import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalOverlay, usePrefersReducedMotion } from '@constants/animations';
import { cn, safeMotion } from '@utils/componentUtils';
import Portal from './Portal';

// ── Z-index layer constants ──────────────────────────────────────────────────
// Exported so Modal, Drawer, Dialog can import and stay in sync.
export const OVERLAY_Z = {
  backdrop : 1000,
  content  : 1001,
  tooltip  : 1100,
  toast    : 1200,
};

/**
 * Backdrop sub-component.
 * Rendered as a full-screen fixed element with the dim effect.
 * Separated for clarity; not exported — only Overlay uses it.
 */
const Backdrop = ({ onClick, hasBackdrop, reduced }) => (
  <motion.div
    aria-hidden="true"
    className={cn(
      'fixed inset-0',
      hasBackdrop ? 'overlay-backdrop' : 'overlay-backdrop--transparent'
    )}
    style={{ zIndex: OVERLAY_Z.backdrop }}
    onClick={onClick}
    {...safeMotion(reduced, {
      variants: modalOverlay,
      initial:  'initial',
      animate:  'animate',
      exit:     'exit',
    })}
  />
);

/**
 * Overlay — base overlay infrastructure component.
 *
 * @param {object}        props
 * @param {boolean}       props.isOpen               — controlled open state
 * @param {function}      [props.onClose]             — called when user dismisses
 * @param {React.ReactNode} props.children             — overlay panel content
 * @param {boolean}       [props.hasBackdrop=true]    — render dim backdrop
 * @param {boolean}       [props.closeOnBackdropClick=true] — dismiss on backdrop click
 * @param {boolean}       [props.closeOnEscape=true]  — dismiss on Escape key
 * @param {string}        [props.role='dialog']       — ARIA role for the overlay wrapper
 * @param {string}        [props.ariaLabel]           — aria-label for the overlay
 * @param {string}        [props.ariaLabelledBy]      — aria-labelledby for the overlay
 * @param {string}        [props.ariaDescribedBy]     — aria-describedby for the overlay
 * @param {string}        [props.containerId]         — Portal target container id
 * @param {string}        [props.className]           — extra classes on the content wrapper
 */
const Overlay = ({
  isOpen,
  onClose,
  children,
  hasBackdrop          = true,
  closeOnBackdropClick = true,
  closeOnEscape        = true,
  role                 = 'dialog',
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  containerId,
  className,
}) => {
  const reduced     = usePrefersReducedMotion();
  const contentRef  = useRef(null);

  // ── Body scroll lock ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // ── Escape key handler ─────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (closeOnEscape && e.key === 'Escape' && onClose) {
        e.stopPropagation();
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // ── Focus trap: return focus to trigger when overlay closes ───────────
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Capture currently focused element so we can restore it on close
      triggerRef.current = document.activeElement;
      // Move focus into the overlay content on next tick
      const frame = requestAnimationFrame(() => {
        if (contentRef.current) {
          const focusable = contentRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable) focusable.focus();
          else contentRef.current.focus();
        }
      });
      return () => cancelAnimationFrame(frame);
    } else {
      // Restore focus to the element that opened the overlay
      if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
        triggerRef.current.focus();
        triggerRef.current = null;
      }
    }
  }, [isOpen]);

  // ── Click-outside detection ────────────────────────────────────────────
  // We detect "backdrop click" by checking if the click target is the
  // backdrop itself (Backdrop component handles its own onClick), so we
  // don't need a document-level listener here — the Backdrop's onClick
  // already scopes the detection correctly.
  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdropClick && onClose) {
      onClose();
    }
  }, [closeOnBackdropClick, onClose]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <Portal containerId={containerId}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <Backdrop
              onClick={handleBackdropClick}
              hasBackdrop={hasBackdrop}
              reduced={reduced}
            />

            {/* Content wrapper — sits above the backdrop */}
            <div
              ref={contentRef}
              role={role}
              aria-modal={role === 'dialog' ? 'true' : undefined}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
              tabIndex={-1}
              className={cn('overlay-content-wrapper', className)}
              style={{ zIndex: OVERLAY_Z.content }}
            >
              {children}
            </div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
};

Overlay.displayName = 'Overlay';

export { Overlay };
export default Overlay;
