/** @type {import('tailwindcss').Config} */

import { COLORS } from './src/constants/colors.js';
import { SPACING_PX } from './src/constants/spacing.js';
import { RADIUS, SHADOWS } from './src/constants/shadows.js';
import { BREAKPOINTS_PX } from './src/constants/responsive.js';

const px = (value) => `${value}px`;

/**
 * The codebase already uses some explicit `*-DEFAULT` utility names
 * (for example `bg-danger-DEFAULT`, `text-success-DEFAULT`).
 * Tailwind normally maps `DEFAULT` to the shorter class name
 * (`bg-danger`, `text-success`), so we add explicit aliases for the
 * exact class strings already present in the source.
 */
const DEFAULT_COLOR_ALIASES = {
  'primary-DEFAULT': COLORS.primary.DEFAULT,
  'accent-DEFAULT': COLORS.accent.DEFAULT,
  'secondary-DEFAULT': COLORS.secondary.DEFAULT,

  'success-DEFAULT': COLORS.success.DEFAULT,
  'warning-DEFAULT': COLORS.warning.DEFAULT,
  'danger-DEFAULT': COLORS.danger.DEFAULT,
  'info-DEFAULT': COLORS.info.DEFAULT,
};

const colors = {
  ...COLORS,
  ...DEFAULT_COLOR_ALIASES,
};

const spacing = Object.fromEntries(
  Object.entries(SPACING_PX).map(([key, value]) => [key, px(value)])
);

const screens = {
  sm: `${BREAKPOINTS_PX.mobile}px`,
  md: `${BREAKPOINTS_PX.tablet}px`,
  lg: `${BREAKPOINTS_PX.laptop}px`,
  xl: `${BREAKPOINTS_PX.desktop}px`,
  '2xl': `${BREAKPOINTS_PX.wide}px`,
};

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },

      colors,

      spacing,

      /**
       * The project uses `text-md` in typography tokens, so we register
       * a matching font size here. The rest of Tailwind's default sizes
       * stay available.
       */
      fontSize: {
        md: ['1rem', { lineHeight: '1.5rem' }],
      },

      /**
       * 8px default radius is used throughout the UI standards.
       * `rounded` and `rounded-md` both resolve to 8px here for consistency.
       */
      borderRadius: {
        DEFAULT: RADIUS.md,
        xs: RADIUS.xs,
        sm: RADIUS.sm,
        md: RADIUS.md,
        lg: RADIUS.lg,
        xl: RADIUS.xl,
        '2xl': RADIUS['2xl'],
        full: RADIUS.full,
      },

      /**
       * Shadow tokens used across cards, dropdowns, modals, drawers,
       * toasts, and floating elements.
       */
      boxShadow: {
        card: SHADOWS.card,
        hover: SHADOWS.hover,
        dropdown: SHADOWS.dropdown,
        modal: SHADOWS.modal,
        floating: SHADOWS.floating,
        focus: SHADOWS.focus,
      },

      screens,

      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },

      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};