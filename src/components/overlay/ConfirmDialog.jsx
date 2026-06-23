/**
 * ConfirmDialog.jsx
 * Reusable confirmation dialog built on top of Modal
 * (Module 3.6 Part 2 — Overlay Components).
 *
 * Purpose:
 *   Provides a consistent "are you sure?" prompt pattern across the
 *   entire application. Every destructive or irreversible action
 *   (delete batch, remove student, archive record) should use this
 *   component to ensure a uniform UX and accessible keyboard flow.
 *
 * Variants:
 *   default  — neutral confirmation (primary-blue confirm button)
 *   danger   — destructive action (red confirm button, warning icon)
 *   warning  — cautionary action (amber confirm button, caution icon)
 *
 * Future async support:
 *   The component is intentionally stateless regarding async state —
 *   callers who need a loading state should manage `isLoading` externally
 *   and pass `confirmText` such as "Deleting…" or disable the confirm
 *   button via a wrapper. This keeps ConfirmDialog a pure presentational
 *   layer and avoids coupling it to any data-fetching strategy.
 *
 * Accessibility:
 *   - Inherits role="dialog", aria-modal="true", focus management from Modal
 *   - aria-describedby wired to the message paragraph ID
 *   - Cancel button receives focus first (safe default — avoids accidental confirm)
 *   - Both actions are keyboard-reachable via Tab
 *
 * Usage:
 *   import { ConfirmDialog } from '@components/overlay';
 *
 *   <ConfirmDialog
 *     isOpen={showConfirm}
 *     onClose={() => setShowConfirm(false)}
 *     onConfirm={handleDelete}
 *     title="Delete Student"
 *     message="This will permanently remove the student and all their attendance records. This action cannot be undone."
 *     confirmText="Delete"
 *     variant="danger"
 *   />
 */

import { useId } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@utils/componentUtils';
import { Button } from '@components/ui/Button';
import Modal from './Modal';

// ── Variant config ───────────────────────────────────────────────────────────
const VARIANT_CONFIG = {
  default: {
    icon        : HelpCircle,
    iconClass   : 'text-accent-600',
    iconBg      : 'bg-accent-50',
    confirmVariant: 'primary',
  },
  danger: {
    icon        : AlertCircle,
    iconClass   : 'text-danger-DEFAULT',
    iconBg      : 'bg-danger-bg',
    confirmVariant: 'danger',
  },
  warning: {
    icon        : AlertTriangle,
    iconClass   : 'text-warning-text',
    iconBg      : 'bg-warning-bg',
    confirmVariant: 'primary',   // no "warning" button variant in this design
  },
};

/**
 * ConfirmDialog — single-purpose confirmation prompt.
 *
 * @param {object}   props
 * @param {boolean}  props.isOpen         — controlled open state
 * @param {function} props.onClose        — called when user cancels or closes
 * @param {function} props.onConfirm      — called when user confirms the action
 * @param {string}   [props.title]        — dialog heading; defaults to "Are you sure?"
 * @param {string}   [props.message]      — body explanation text
 * @param {string}   [props.confirmText]  — confirm button label; defaults to "Confirm"
 * @param {string}   [props.cancelText]   — cancel button label; defaults to "Cancel"
 * @param {'default'|'danger'|'warning'} [props.variant='default'] — visual variant
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title       = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText  = 'Cancel',
  variant     = 'default',
}) => {
  const messageId = useId();
  const config    = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.default;
  const Icon      = config.icon;

  const handleConfirm = () => {
    if (typeof onConfirm === 'function') onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={undefined}         /* ConfirmDialog renders its own header inside body */
      size="sm"
      closeOnEscape
      closeOnBackdropClick={false}  /* safer default — user must explicitly choose */
      ariaDescribedBy={message ? messageId : undefined}
      footer={
        <>
          {/* Cancel receives focus first — safest default */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            autoFocus
          >
            {cancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            size="sm"
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        {/* Icon badge */}
        <div className={cn(
          'flex-shrink-0 flex items-center justify-center',
          'w-10 h-10 rounded-full',
          config.iconBg
        )}>
          <Icon
            className={cn('w-5 h-5', config.iconClass)}
            aria-hidden="true"
          />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-base font-semibold text-secondary-900 mb-1 leading-snug">
              {title}
            </h3>
          )}
          {message && (
            <p
              id={messageId}
              className="text-sm text-secondary-600 leading-relaxed"
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

ConfirmDialog.displayName = 'ConfirmDialog';

export { ConfirmDialog };
export default ConfirmDialog;
