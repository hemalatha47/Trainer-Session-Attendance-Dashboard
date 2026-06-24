/**
 * routes.js
 * Centralized route path constants. Single source of truth for all
 * application paths. Section 16.4 — ROUTES.DASHBOARD = '/' (no /dashboard alias).
 *
 * Updated Module 5.1: Added STUDENT_DETAIL route for /students/:id
 * Updated Module 6.2: Added ATTENDANCE route for the attendance dashboard (6.1)
 *                     MARK_ATTENDANCE now points to session setup (6.2)
 * Updated Module 6.3: Added ATTENDANCE_SHEET route for the core marking sheet
 * Updated Module 6.6: Added ATTENDANCE_HISTORY route for the history page
 */

export const ROUTES = {
  LOGIN:              '/login',
  DASHBOARD:          '/',
  BATCHES:            '/batches',
  BATCH_DETAIL:       '/batches/:id',
  STUDENTS:           '/students',
  STUDENT_DETAIL:     '/students/:id',
  ATTENDANCE:         '/attendance',
  MARK_ATTENDANCE:    '/attendance/mark',
  ATTENDANCE_SHEET:   '/attendance/sheet/:batchId/:date',
  ATTENDANCE_HISTORY: '/attendance/history',
  REPORTS:            '/reports',
  ANALYTICS:          '/analytics',
  SETTINGS:           '/settings',
  NOT_FOUND:          '*',
};

/**
 * Builds a concrete path from a route template by replacing :param tokens.
 * @example buildRoute(ROUTES.BATCH_DETAIL, { id: '123' }) -> '/batches/123'
 * @example buildRoute(ROUTES.STUDENT_DETAIL, { id: 's21' }) -> '/students/s21'
 * @example buildRoute(ROUTES.ATTENDANCE_SHEET, { batchId: 'b2', date: '2026-06-17' })
 */
export const buildRoute = (template, params = {}) =>
  Object.entries(params).reduce(
    (path, [key, val]) => path.replace(':' + key, val),
    template
  );
