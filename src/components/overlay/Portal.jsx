/**
 * Portal.jsx
 * Mounts children outside the React root into a dedicated DOM node
 * (Module 3.6 — Base Overlay Infrastructure).
 *
 * Why a Portal?
 *   Overlays rendered inside the component tree can be clipped by ancestor
 *   elements with `overflow: hidden`, `transform`, `filter`, or a lower
 *   `z-index` stacking context. A Portal escapes those constraints by
 *   attaching to a sibling of `#root` that has no such ancestors.
 *
 * Mount strategy:
 *   On first render, Portal creates (or re-uses) a `<div id="overlay-root">`
 *   sibling to `<div id="root">` in `document.body`. A single shared node
 *   is used rather than per-instance nodes to keep the DOM minimal; multiple
 *   Portals sharing the same container is safe because React tracks each
 *   portal's vDOM tree independently.
 *
 * Cleanup:
 *   The shared `#overlay-root` node persists for the app lifetime (removing
 *   it would tear down all active overlays). Individual overlay cleanup is
 *   handled by their own unmount logic, not by this component.
 *
 * Usage:
 *   import { Portal } from '@components/overlay';
 *
 *   <Portal>
 *     <div className="my-overlay">...</div>
 *   </Portal>
 */

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// ── Overlay root node ID — single source of truth ───────────────────────────
const OVERLAY_ROOT_ID = 'overlay-root';

/**
 * Lazily creates (or finds) the shared overlay container in document.body.
 * Returns the same node on every call — no duplicates.
 *
 * @returns {HTMLElement}
 */
const getOrCreateOverlayRoot = () => {
  let root = document.getElementById(OVERLAY_ROOT_ID);
  if (!root) {
    root = document.createElement('div');
    root.id = OVERLAY_ROOT_ID;
    // Position outside the normal flow; overlays control their own positioning
    root.setAttribute('data-overlay-container', 'true');
    root.setAttribute('aria-live', 'off'); // individual overlays set their own aria-live
    document.body.appendChild(root);
  }
  return root;
};

/**
 * Portal component — teleports `children` into the shared overlay container.
 *
 * @param {object}       props
 * @param {React.ReactNode} props.children  — content to render inside the portal
 * @param {string}       [props.containerId]  — override the target container ID;
 *                                              defaults to OVERLAY_ROOT_ID ('overlay-root')
 *
 * @returns {React.ReactPortal|null}
 */
const Portal = ({ children, containerId }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // If a custom containerId is provided, use that element; otherwise
    // use (or create) the shared overlay root.
    if (containerId) {
      const custom = document.getElementById(containerId);
      if (custom) {
        containerRef.current = custom;
      } else {
        // Custom target not found — fall back to shared root and warn
        if (import.meta.env.DEV) {
          console.warn(
            `[Portal] Element with id="${containerId}" not found in the DOM. ` +
            `Falling back to #${OVERLAY_ROOT_ID}.`
          );
        }
        containerRef.current = getOrCreateOverlayRoot();
      }
    } else {
      containerRef.current = getOrCreateOverlayRoot();
    }
  }, [containerId]);

  // On first render, containerRef.current is not yet set (useEffect fires after paint).
  // Compute the target synchronously for the initial createPortal call.
  const target = containerRef.current ?? (containerId
    ? document.getElementById(containerId) ?? getOrCreateOverlayRoot()
    : getOrCreateOverlayRoot()
  );

  return createPortal(children, target);
};

Portal.displayName = 'Portal';

export { Portal };
export default Portal;
