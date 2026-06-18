/**
 * LoadingOverlay.jsx
 * Loading state overlay with fullscreen and container modes
 * (Module 3.6 Part 3 — Overlay Components).
 *
 * Architecture:
 *   LoadingOverlay has two distinct rendering modes controlled by `fullscreen`:
 *
 *   fullscreen=true (default):
 *     Delegates to <Overlay> — same Portal + backdrop infrastructure used by
 *     Modal and Drawer. Renders a centred spinner panel above a dim backdrop,
 *     blocking all interaction with the page behind it. Suitable for top-level
 *     API loading states (e.g. initial data fetch, form submission).
 *
 *   fullscreen=false (container mode):
 *     Skips the Overlay/Portal entirely and renders an `absolute inset-0`
 *     positioned layer directly in the DOM. The parent element MUST have
 *     `position: relative` (or non-static) for containment. Suitable for
 *     loading a single card, table section, or content panel without
 *     blocking the whole page.
 *
 * Size values (spinner + text block):
 *   sm  — Spinner xs, text-xs — tight spaces, small cards
 *   md  — Spinner md, text-sm — default; standard panels
 *   lg  — Spinner lg, text-base — prominent full-section loaders
 *
 * Spinner:
 *   Reuses the existing <Spinner> component from @components/feedback/Loader
 *   so there is exactly one spinner implementation across the entire codebase.
 *
 * Interaction blocking:
 *   Both modes use `pointer-events: all` on the overlay layer and
 *   `pointer-events: none` is NOT set — the overlay intentionally captures
 *   all clicks and touches while active, preventing accidental interaction
 *   with content underneath.
 *
 * Future async support:
 *   isOpen is a controlled boolean — callers set it to true when an async
 *   operation begins and false when it resolves/rejects. No internal timers
 *   or auto-dismiss logic exists here.
 *
 * Accessibility:
 *   - Fullscreen: role="status" + aria-live="polite" + aria-label on inner panel
 *   - Container: role="status" + aria-live="polite" on the overlay div
 *   - Spinner has its own aria-label via the Spinner component
 *   - When message is present it is visible to screen readers
 *
 * Usage — fullscreen:
 *   import { LoadingOverlay } from '@components/overlay';
 *
 *   <LoadingOverlay isOpen={isSubmitting} message="Saving attendance…" />
 *
 * Usage — container:
 *   <div className="relative">
 *     <LoadingOverlay isOpen={isFetching} fullscreen={false} message="Loading students…" />
 *     <StudentTable data={students} />
 *   </div>
 */

import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, usePrefersReducedMotion } from '@constants/animations';
import { cn, safeMotion } from '@utils/componentUtils';
import { Spinner } from '@components/feedback/Loader';
import { Overlay } from './Overlay';

// ── Size config ──────────────────────────────────────────────────────────────
const SIZE_CONFIG = {
  sm: { spinner: 'sm', text: 'text-xs', gap: 'gap-2.5', padding: 'p-5'  },
  md: { spinner: 'md', text: 'text-sm', gap: 'gap-3',   padding: 'p-6'  },
  lg: { spinner: 'lg', text: 'text-base', gap: 'gap-4', padding: 'p-8'  },
};

// ── Inner loading panel (shared by both modes) ───────────────────────────────
const LoadingPanel = ({ message, size, reduced, role = 'status' }) => {
  const cfg = SIZE_CONFIG[size] ?? SIZE_CONFIG.md;

  return (
    <motion.div
      role={role}
      aria-live="polite"
      aria-label={message || 'Loading'}
      className={cn(
        'flex flex-col items-center justify-center',
        cfg.gap,
        cfg.padding,
        /* Visual panel — only shown in fullscreen mode */
        'bg-white rounded-xl shadow-modal',
        'min-w-[120px]',
        /* Re-enable pointer events (overlay-content-wrapper disables them) */
        'pointer-events-auto',
      )}
      {...safeMotion(reduced, {
        variants: fadeIn,
        initial:  'initial',
        animate:  'animate',
        exit:     'exit',
      })}
    >
      <Spinner size={cfg.spinner} label={message || 'Loading'} />
      {message && (
        <p className={cn(
          cfg.text,
          'text-secondary-600 font-medium text-center leading-snug',
          'max-w-[200px]',
        )}>
          {message}
        </p>
      )}
    </motion.div>
  );
};

// ── Container-mode overlay ───────────────────────────────────────────────────
// Renders absolutely within the nearest positioned ancestor.
// Does NOT use Portal so it is scoped to its container.
const ContainerLoadingOverlay = ({ isOpen, message, size, reduced }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        role="status"
        aria-live="polite"
        aria-label={message || 'Loading'}
        className={cn(
          'absolute inset-0 z-10',
          'flex items-center justify-center',
          'bg-white/75 backdrop-blur-[2px]',
          'rounded-[inherit]',   /* inherit border-radius from container */
        )}
        {...safeMotion(reduced, {
          variants: fadeIn,
          initial:  'initial',
          animate:  'animate',
          exit:     'exit',
        })}
      >
        {/* Inner panel is minimal in container mode — no card chrome */}
        <div className={cn(
          'flex flex-col items-center justify-center',
          SIZE_CONFIG[size]?.gap ?? 'gap-3',
        )}>
          <Spinner
            size={SIZE_CONFIG[size]?.spinner ?? 'md'}
            label={message || 'Loading'}
          />
          {message && (
            <p className={cn(
              SIZE_CONFIG[size]?.text ?? 'text-sm',
              'text-secondary-600 font-medium text-center leading-snug',
            )}>
              {message}
            </p>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Main component ───────────────────────────────────────────────────────────

/**
 * LoadingOverlay — blocks interaction and shows a loading indicator.
 *
 * @param {boolean}  props.isOpen          — controlled open state
 * @param {string}   [props.message]       — loading label text (visible + aria)
 * @param {boolean}  [props.fullscreen=true] — true: Portal overlay; false: container-scoped
 * @param {'sm'|'md'|'lg'} [props.size='md'] — spinner + text size
 */
const LoadingOverlay = ({
  isOpen,
  message,
  fullscreen = true,
  size       = 'md',
}) => {
  const reduced = usePrefersReducedMotion();

  // ── Container mode ─────────────────────────────────────────────────────
  if (!fullscreen) {
    return (
      <ContainerLoadingOverlay
        isOpen={isOpen}
        message={message}
        size={size}
        reduced={reduced}
      />
    );
  }

  // ── Fullscreen mode ────────────────────────────────────────────────────
  // Overlay handles: Portal, backdrop, scroll-lock.
  // We do NOT pass closeOnEscape or closeOnBackdropClick — loading overlays
  // are non-dismissable by the user; only the caller can set isOpen=false.
  return (
    <Overlay
      isOpen={isOpen}
      onClose={undefined}
      closeOnEscape={false}
      closeOnBackdropClick={false}
      hasBackdrop
      role="status"              // override Overlay's default role="dialog"
      ariaLabel={message || 'Loading'}
    >
      <LoadingPanel
        message={message}
        size={size}
        reduced={reduced}
      />
    </Overlay>
  );
};

LoadingOverlay.displayName = 'LoadingOverlay';

export { LoadingOverlay };
export default LoadingOverlay;
