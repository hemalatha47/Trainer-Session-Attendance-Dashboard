/**
 * roles.js
 * User role enum values and permission maps (Section 16.5).
 * Inert in V1 (single-role auth) — reserved for Phase 9 role-gating.
 */

export const ROLES = {
  ADMIN:   'admin',
  MANAGER: 'manager',
  TRAINER: 'trainer',
};

export const PERMISSIONS = {
  [ROLES.ADMIN]:   ['batch:write', 'student:write', 'attendance:write', 'report:read', 'settings:write'],
  [ROLES.MANAGER]: ['batch:write', 'student:write', 'attendance:write', 'report:read'],
  [ROLES.TRAINER]: ['attendance:write', 'report:read'],
};

export const hasPermission = (role, permission) =>
  (PERMISSIONS[role] || []).includes(permission);
