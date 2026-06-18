/**
 * src/components/overlay/index.js
 * Barrel export for all overlay infrastructure (Module 3.6).
 *
 * Part 1 — Base infrastructure:
 *   Portal, Overlay, OVERLAY_Z
 *
 * Part 2 — Panel components:
 *   Modal, ConfirmDialog
 *
 * Part 3 — Panel components:
 *   Drawer, LoadingOverlay
 *
 * Part 4 — Toast system & provider:
 *   Toast, ToastContainer, OverlayProvider
 *
 * Usage:
 *   import {
 *     Overlay, Portal, OVERLAY_Z,
 *     Modal, ConfirmDialog,
 *     Drawer, LoadingOverlay,
 *     Toast, ToastContainer, OverlayProvider,
 *   } from '@components/overlay';
 */

// Part 1 — Base infrastructure
export { Overlay, OVERLAY_Z } from './Overlay';
export { Portal }             from './Portal';

// Part 2 — Panel components
export { Modal }         from './Modal';
export { ConfirmDialog } from './ConfirmDialog';

// Part 3 — Panel components
export { Drawer }         from './Drawer';
export { LoadingOverlay } from './LoadingOverlay';

// Part 4 — Toast system & provider
export { Toast }           from './Toast';
export { ToastContainer }  from './ToastContainer';
export { OverlayProvider, OverlayContext } from './OverlayProvider';
