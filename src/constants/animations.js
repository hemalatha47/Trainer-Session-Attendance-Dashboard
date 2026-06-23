/**
 * animations.js
 * Centralized motion/animation tokens (Phase 3, Module 3.1).
 *
 * Built on framer-motion. Exports reusable `variants` objects and shared
 * `transition` presets so every future component (Modal, Toast, Drawer,
 * page transitions, hover effects) imports from one place rather than
 * inlining duration/ease values.
 *
 * Performance: all animations restrict themselves to `opacity`, `transform`
 * (x/y/scale) — GPU-accelerated properties only. No animating
 * width/height/layout properties directly.
 *
 * Accessibility: components consuming these tokens MUST also check
 * `usePrefersReducedMotion()` (see hooks below) and short-circuit to
 * instant/no-op transitions when the user has reduced motion enabled.
 */

import { useState, useEffect } from 'react';

// ── Shared transition presets ────────────────────────────────────────────
export const TRANSITIONS = {
  fast:    { duration: 0.15, ease: 'easeOut' },
  base:    { duration: 0.2,  ease: 'easeOut' },
  slow:    { duration: 0.3,  ease: 'easeInOut' },
  spring:  { type: 'spring', stiffness: 380, damping: 30 },
  springSoft: { type: 'spring', stiffness: 260, damping: 26 },
};

// ── Fade ──────────────────────────────────────────────────────────────────
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: TRANSITIONS.base },
  exit:    { opacity: 0, transition: TRANSITIONS.fast },
};

export const fadeOut = {
  initial: { opacity: 1 },
  animate: { opacity: 0, transition: TRANSITIONS.fast },
};

// ── Slide ─────────────────────────────────────────────────────────────────
export const slideUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: TRANSITIONS.base },
  exit:    { opacity: 0, y: 16, transition: TRANSITIONS.fast },
};

export const slideDown = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: TRANSITIONS.base },
  exit:    { opacity: 0, y: -16, transition: TRANSITIONS.fast },
};

export const slideLeft = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: TRANSITIONS.base },
  exit:    { opacity: 0, x: 24, transition: TRANSITIONS.fast },
};

export const slideRight = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0, transition: TRANSITIONS.base },
  exit:    { opacity: 0, x: -24, transition: TRANSITIONS.fast },
};

// ── Scale ─────────────────────────────────────────────────────────────────
export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: TRANSITIONS.springSoft },
  exit:    { opacity: 0, scale: 0.96, transition: TRANSITIONS.fast },
};

export const scaleOut = {
  initial: { opacity: 1, scale: 1 },
  animate: { opacity: 0, scale: 0.96, transition: TRANSITIONS.fast },
};

// ── Page transition (route changes) ─────────────────────────────────────
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: TRANSITIONS.base },
  exit:    { opacity: 0, y: -8, transition: TRANSITIONS.fast },
};

// ── Interaction micro-animations ─────────────────────────────────────────
export const cardHover = {
  rest:  { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  hover: { y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.10)', transition: TRANSITIONS.fast },
};

export const buttonPress = {
  rest:    { scale: 1 },
  pressed: { scale: 0.97, transition: TRANSITIONS.fast },
};

// ── Overlay components ───────────────────────────────────────────────────
export const modalOpen = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: TRANSITIONS.springSoft },
  exit:    { opacity: 0, scale: 0.95, y: 8, transition: TRANSITIONS.fast },
};

export const modalOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: TRANSITIONS.base },
  exit:    { opacity: 0, transition: TRANSITIONS.fast },
};

export const drawerOpen = {
  initial: { x: '-100%' },
  animate: { x: 0, transition: TRANSITIONS.spring },
  exit:    { x: '-100%', transition: TRANSITIONS.base },
};

// ── Toast ─────────────────────────────────────────────────────────────────
export const toastEnter = {
  initial: { opacity: 0, y: -12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: TRANSITIONS.springSoft },
};

export const toastExit = {
  exit: { opacity: 0, x: 32, transition: TRANSITIONS.fast },
};

/**
 * Returns true if the user has requested reduced motion at the OS level.
 * Components must use this to disable/shorten the variants above.
 *
 * @example
 *   const reduced = usePrefersReducedMotion();
 *   <motion.div {...(reduced ? {} : fadeIn)} />
 */
export const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);

    const handler = (e) => setReduced(e.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  return reduced;
};

export default {
  TRANSITIONS,
  fadeIn,
  fadeOut,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scaleIn,
  scaleOut,
  pageTransition,
  cardHover,
  buttonPress,
  modalOpen,
  modalOverlay,
  drawerOpen,
  toastEnter,
  toastExit,
  usePrefersReducedMotion,
};
