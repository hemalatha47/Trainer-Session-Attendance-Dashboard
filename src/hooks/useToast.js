/**
 * useToast.js
 * Ergonomic hook for triggering toast notifications (Module 3.3, Task 3).
 *
 * Wraps AppContext's showToast/dismissToast with a typed API so pages
 * never need to import AppContext directly for notifications.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Attendance saved');
 *   toast.error('Failed to save', { title: 'Error', duration: 5000 });
 *   toast.dismiss(id);
 */

import { useCallback } from 'react';
import { useAppContext } from '@context/AppContext';

/**
 * @returns {{
 *   success: (message: string, opts?: ToastOptions) => string,
 *   error:   (message: string, opts?: ToastOptions) => string,
 *   warning: (message: string, opts?: ToastOptions) => string,
 *   info:    (message: string, opts?: ToastOptions) => string,
 *   neutral: (message: string, opts?: ToastOptions) => string,
 *   show:    (message: string, type: string, opts?: ToastOptions) => string,
 *   dismiss: (id: string) => void,
 * }}
 *
 * @typedef {{ title?: string, duration?: number }} ToastOptions
 */
const useToast = () => {
  const { showToast, dismissToast } = useAppContext();

  const show = useCallback(
    (message, type = 'success', opts = {}) => showToast(message, type, opts),
    [showToast]
  );

  return {
    success: useCallback((msg, opts) => show(msg, 'success', opts), [show]),
    error:   useCallback((msg, opts) => show(msg, 'error',   opts), [show]),
    warning: useCallback((msg, opts) => show(msg, 'warning', opts), [show]),
    info:    useCallback((msg, opts) => show(msg, 'info',    opts), [show]),
    neutral: useCallback((msg, opts) => show(msg, 'neutral', opts), [show]),
    show,
    dismiss: dismissToast,
  };
};

export { useToast };
export default useToast;
