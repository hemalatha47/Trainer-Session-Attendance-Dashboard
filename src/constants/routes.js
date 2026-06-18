/**
 * routes.js
 * Centralized route path constants. Single source of truth for all
 * application paths. Section 16.4 — ROUTES.DASHBOARD = '/' (no /dashboard alias).
 */

export const ROUTES = {
  LOGIN:           '/login',
  DASHBOARD:       '/',
  BATCHES:         '/batches',
  BATCH_DETAIL:    '/batches/:id',
  STUDENTS:        '/students',
  MARK_ATTENDANCE: '/attendance/mark',
  REPORTS:         '/reports',
  ANALYTICS:       '/analytics',
  SETTINGS:        '/settings',
  NOT_FOUND:       '*',
};

/**
 * Builds a concrete path from a route template by replacing :param tokens.
 * @example buildRoute(ROUTES.BATCH_DETAIL, { id: '123' }) -> '/batches/123'
 */
export const buildRoute = (template, params = {}) =>
  Object.entries(params).reduce(
    (path, [key, val]) => path.replace(':' + key, val),
    template
  );
