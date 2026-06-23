/**
 * routeConfig.jsx
 * SINGLE SOURCE OF TRUTH for all route metadata.
 *
 * Every route entry defines:
 *   path            – matches ROUTES.* constants (no duplication)
 *   title           – display name (TopBar page title system)
 *   breadcrumb      – ordered array of crumb labels; last item = current page
 *   requiresAuth    – true = protected by ProtectedRoute
 *   showInSidebar   – true = rendered in Sidebar nav list
 *   group           – logical grouping ('main' | 'management' | 'system')
 *   sortOrder       – controls Sidebar render order
 *   description     – screen-reader / tooltip description
 *   icon            – JSX SVG (used by Sidebar; null for non-sidebar routes)
 *   exactMatch      – true = active only on exact path (Dashboard)
 *   futureRoles     – placeholder for role-based filtering (Phase 9)
 *   futurePermissions – placeholder for permission-based filtering (Phase 9)
 *
 * Consumers: Sidebar, TopBar, AppRouter, ProtectedRoute, useBreadcrumb.
 * DO NOT import feature-level code here — icons only, no business logic.
 */

import { ROUTES } from '@constants/routes';

// ── Icon helpers (inline SVG, no external deps) ─────────────────────────────

const Icon = ({ children, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 flex-shrink-0"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

const icons = {
  dashboard: (
    <Icon>
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
    </Icon>
  ),
  batches: (
    <Icon>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </Icon>
  ),
  students: (
    <Icon>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </Icon>
  ),
  attendance: (
    <Icon>
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </Icon>
  ),
  reports: (
    <Icon>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </Icon>
  ),
  analytics: (
    <Icon>
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </Icon>
  ),
  settings: (
    <Icon>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06
        a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09
        A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83
        l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
        A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83
        l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09
        a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83
        l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09
        a1.65 1.65 0 0 0-1.51 1z"/>
    </Icon>
  ),
};

// ── Route configuration array ────────────────────────────────────────────────

/**
 * @typedef {Object} RouteConfig
 * @property {string}   path
 * @property {string}   title
 * @property {string[]} breadcrumb
 * @property {boolean}  requiresAuth
 * @property {boolean}  showInSidebar
 * @property {string}   group
 * @property {number}   sortOrder
 * @property {string}   description
 * @property {JSX.Element|null} icon
 * @property {boolean}  exactMatch
 * @property {string[]} futureRoles
 * @property {string[]} futurePermissions
 */

/** @type {RouteConfig[]} */
export const ROUTE_CONFIG = [
  {
    path:               ROUTES.LOGIN,
    title:              'Sign In',
    breadcrumb:         ['Sign In'],
    requiresAuth:       false,
    showInSidebar:      false,
    group:              'auth',
    sortOrder:          0,
    description:        'Authentication page',
    icon:               null,
    exactMatch:         true,
    futureRoles:        [],
    futurePermissions:  [],
  },
  {
    path:               ROUTES.DASHBOARD,
    title:              'Dashboard',
    breadcrumb:         ['Dashboard'],
    requiresAuth:       true,
    showInSidebar:      true,
    group:              'main',
    sortOrder:          1,
    description:        'Summary metrics and recent activity',
    icon:               icons.dashboard,
    exactMatch:         true,
    futureRoles:        ['admin', 'manager', 'trainer'],
    futurePermissions:  ['report:read'],
  },
  {
    path:               ROUTES.BATCHES,
    title:              'Batches',
    breadcrumb:         ['Batches'],
    requiresAuth:       true,
    showInSidebar:      true,
    group:              'management',
    sortOrder:          2,
    description:        'Manage training batches',
    icon:               icons.batches,
    exactMatch:         false,
    futureRoles:        ['admin', 'manager'],
    futurePermissions:  ['batch:write'],
  },
  {
    path:               ROUTES.BATCH_DETAIL,
    title:              'Batch Details',
    breadcrumb:         ['Batches', 'Batch Details'],
    requiresAuth:       true,
    showInSidebar:      false,     // child of Batches — not shown independently
    group:              'management',
    sortOrder:          2,
    description:        'View and manage a single batch',
    icon:               null,
    exactMatch:         false,
    futureRoles:        ['admin', 'manager'],
    futurePermissions:  ['batch:write'],
  },
  {
    path:               ROUTES.STUDENTS,
    title:              'Students',
    breadcrumb:         ['Students'],
    requiresAuth:       true,
    showInSidebar:      true,
    group:              'management',
    sortOrder:          3,
    description:        'Manage students across all batches',
    icon:               icons.students,
    exactMatch:         false,
    futureRoles:        ['admin', 'manager'],
    futurePermissions:  ['student:write'],
  },
  {
<<<<<<< HEAD
    path:               ROUTES.STUDENT_DETAIL,
    title:              'Student Details',
    breadcrumb:         ['Students', 'Student Details'],
    requiresAuth:       true,
    showInSidebar:      false,
    group:              'management',
    sortOrder:          3,
    description:        'View detailed profile and attendance for a student',
    icon:               null,
    exactMatch:         false,
    futureRoles:        ['admin', 'manager'],
    futurePermissions:  ['student:write'],
  },
  {
    path:               ROUTES.ATTENDANCE,
    title:              'Attendance',
    breadcrumb:         ['Attendance'],
    requiresAuth:       true,
    showInSidebar:      false,     // Sidebar shows Mark Attendance (child) instead
    group:              'main',
    sortOrder:          4,
    description:        'Attendance management dashboard',
    icon:               icons.attendance,
    exactMatch:         false,
    futureRoles:        ['admin', 'manager', 'trainer'],
    futurePermissions:  ['attendance:write'],
  },
  {
=======
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
    path:               ROUTES.MARK_ATTENDANCE,
    title:              'Mark Attendance',
    breadcrumb:         ['Attendance', 'Mark Attendance'],
    requiresAuth:       true,
    showInSidebar:      true,
    group:              'main',
    sortOrder:          4,
<<<<<<< HEAD
    description:        'Select batch and date to begin an attendance session',
=======
    description:        'Record daily attendance for a batch',
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
    icon:               icons.attendance,
    exactMatch:         false,
    futureRoles:        ['admin', 'manager', 'trainer'],
    futurePermissions:  ['attendance:write'],
  },
  {
<<<<<<< HEAD
    path:               ROUTES.ATTENDANCE_HISTORY,
    title:              'Attendance History',
    breadcrumb:         ['Attendance', 'History'],
    requiresAuth:       true,
    showInSidebar:      true,
    group:              'main',
    sortOrder:          5,
    description:        'View and inspect historical attendance sessions',
    icon: (
      <Icon>
        <path d="M12 8v4l3 3"/>
        <circle cx="12" cy="12" r="10"/>
      </Icon>
    ),
    exactMatch:         false,
    futureRoles:        ['admin', 'manager', 'trainer'],
    futurePermissions:  ['attendance:write'],
  },
  {
=======
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
    path:               ROUTES.REPORTS,
    title:              'Reports',
    breadcrumb:         ['Reports'],
    requiresAuth:       true,
    showInSidebar:      true,
    group:              'insights',
    sortOrder:          5,
    description:        'View and export attendance reports',
    icon:               icons.reports,
    exactMatch:         false,
    futureRoles:        ['admin', 'manager', 'trainer'],
    futurePermissions:  ['report:read'],
  },
  {
    path:               ROUTES.ANALYTICS,
    title:              'Analytics',
    breadcrumb:         ['Analytics'],
    requiresAuth:       true,
    showInSidebar:      true,
    group:              'insights',
    sortOrder:          6,
    description:        'Attendance charts and trends',
    icon:               icons.analytics,
    exactMatch:         false,
    futureRoles:        ['admin', 'manager'],
    futurePermissions:  ['report:read'],
  },
  {
    path:               ROUTES.SETTINGS,
    title:              'Settings',
    breadcrumb:         ['Settings'],
    requiresAuth:       true,
    showInSidebar:      true,
    group:              'system',
    sortOrder:          7,
    description:        'Configure profile and system preferences',
    icon:               icons.settings,
    exactMatch:         false,
    futureRoles:        ['admin'],
    futurePermissions:  ['settings:write'],
  },
  {
    path:               ROUTES.NOT_FOUND,
    title:              'Page Not Found',
    breadcrumb:         ['Not Found'],
    requiresAuth:       false,
    showInSidebar:      false,
    group:              'system',
    sortOrder:          99,
    description:        '404 error page',
    icon:               null,
    exactMatch:         false,
    futureRoles:        [],
    futurePermissions:  [],
  },
];

// ── Derived helpers ──────────────────────────────────────────────────────────

/** All sidebar nav items, sorted by sortOrder */
export const SIDEBAR_NAV_ITEMS = ROUTE_CONFIG
  .filter((r) => r.showInSidebar)
  .sort((a, b) => a.sortOrder - b.sortOrder);

/**
 * Looks up route metadata by pathname.
 * Handles dynamic segments: /batches/abc123 → BATCH_DETAIL config.
 * @param {string} pathname - Current location.pathname
 * @returns {RouteConfig}
 */
export const getRouteConfig = (pathname) => {
  // Exact match first
  const exact = ROUTE_CONFIG.find((r) => r.path === pathname);
  if (exact) return exact;

  // Dynamic segment match: /batches/:id
  if (pathname.startsWith('/batches/') && pathname !== ROUTES.BATCHES) {
    return ROUTE_CONFIG.find((r) => r.path === ROUTES.BATCH_DETAIL);
  }

  // Prefix match for other nested routes (future expansion)
  const prefix = ROUTE_CONFIG.find(
    (r) => r.path !== '/' && r.path !== '*' && pathname.startsWith(r.path)
  );
  if (prefix) return prefix;

  // Dashboard fallback
  return ROUTE_CONFIG.find((r) => r.path === ROUTES.DASHBOARD);
};
