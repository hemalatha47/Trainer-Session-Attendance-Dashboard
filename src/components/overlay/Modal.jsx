/**
 * Modal.jsx
 * Composable modal dialog built on the Overlay base component
 * (Module 3.6 Part 2 — Overlay Components).
 *
 * Architecture:
 *   Modal delegates all backdrop, portal, scroll-lock, and keyboard/
 *   click-outside logic to <Overlay>. Modal itself only provides the
 *   visible panel: header (title + close button), scrollable body,
 *   and an optional footer slot. This keeps concerns cleanly separated.
 *
 * Size variants:
 *   sm  → max-w-sm  (384px)   — confirmations, alerts
 *   md  → max-w-md  (448px)   — default; forms, info dialogs
 *   lg  → max-w-lg  (512px)   — complex forms, detail views
 *   xl  → max-w-2xl (672px)   — wide content, tables, multi-column forms
 *
 * Accessibility:
 *   - role="dialog" + aria-modal="true" provided by Overlay
 *   - aria-labelledby wired to the title element ID
 *   - aria-describedby forwarded to Overlay for callers who supply it
 *   - Focus moves to first focusable element inside panel on open (Overlay)
 *   - Focus restored to trigger element on close (Overlay)
 *   - Close button has aria-label="Close dialog"
 *   - ESC key handled by Overlay (closeOnEscape prop)
 *
 * Usage:
 *   import { Modal } from '@components/overlay';
 *
 *   <Modal
 *     isOpen={open}
 *     onClose={() => setOpen(false)}
 *     title="Edit Student"
 *     size="lg"
 *     footer={<Button onClick={handleSave}>Save</Button>}
 *   >
 *     <p>Modal body content here.</p>
 *   </Modal>
 */

import { useId } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { modalOpen, usePrefersReducedMotion } from '@constants/animations';
import { cn, safeMotion } from '@utils/componentUtils';
import { Overlay } from './Overlay';

// ── Size → Tailwind max-width map ────────────────────────────────────────────
const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

/**
 * Modal — dialog panel with header, scrollable body, and optional footer.
 *
 * @param {object}          props
 * @param {boolean}         props.isOpen                — controlled open state
 * @param {function}        props.onClose               — called on close trigger
 * @param {string}          [props.title]               — dialog heading text
 * @param {React.ReactNode} [props.children]            — body content
 * @param {React.ReactNode} [props.footer]              — footer slot (buttons etc.)
 * @param {boolean}         [props.closeOnEscape=true]  — ESC key closes modal
 * @param {boolean}         [props.closeOnBackdropClick=true] — backdrop click closes
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md']      — panel width variant
 * @param {string}          [props.ariaDescribedBy]     — ID of describing element
 * @param {string}          [props.className]           — extra classes on panel
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  closeOnEscape        = true,
  closeOnBackdropClick = true,
  size                 = 'md',
  ariaDescribedBy,
  className,
}) => {
  const reduced  = usePrefersReducedMotion();
  const titleId  = useId();

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      closeOnEscape={closeOnEscape}
      closeOnBackdropClick={closeOnBackdropClick}
      hasBackdrop
      role="dialog"
      ariaLabelledBy={title ? titleId : undefined}
      ariaDescribedBy={ariaDescribedBy}
    >
      {/* Animated panel — pointer-events: auto re-enables interaction */}
      <motion.div
        role="document"
        className={cn(
          /* Layout */
          'relative w-full mx-4 flex flex-col',
          /* Sizing */
          SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
          /* Appearance */
          'bg-white rounded-xl shadow-modal',
          /* Max height with internal scroll */
          'max-h-[90vh]',
          /* Re-enable pointer events (overlay-content-wrapper disables them) */
          'pointer-events-auto',
          className
        )}
        {...safeMotion(reduced, {
          variants: modalOpen,
          initial:  'initial',
          animate:  'animate',
          exit:     'exit',
        })}
        // Prevent clicks inside panel from reaching the backdrop
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200 flex-shrink-0">
          {title ? (
            <h2
              id={titleId}
              className="text-base font-semibold text-secondary-900 leading-snug"
            >
              {title}
            </h2>
          ) : (
            /* Reserve space even when title is absent so close button aligns */
            <span aria-hidden="true" />
          )}

          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-md',
              'text-secondary-400',
              'hover:text-secondary-600 hover:bg-secondary-100',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-accent-600 focus-visible:ring-offset-1',
              'transition-colors duration-150',
              '-mr-1' // align flush with panel edge
            )}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
          {children}
        </div>

        {/* ── Footer (optional) ────────────────────────────────────────── */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-secondary-200 flex-shrink-0 bg-secondary-50 rounded-b-xl">
            {footer}
          </div>
        )}
      </motion.div>
    </Overlay>
  );
};

Modal.displayName = 'Modal';

export { Modal };
export default Modal;
