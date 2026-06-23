/**
 * mockUsers.js
 * Seed user accounts covering admin, manager, trainer roles (Section 17.2).
 * Consumed by authService in mock mode.
 */

import { ROLES } from '@constants/roles';

export const mockUsers = [
  { id: 'u1', name: 'Admin User',       email: 'admin@aaro.com',   role: ROLES.ADMIN,   passwordHash: 'hashed' },
  { id: 'u2', name: 'Training Manager', email: 'manager@aaro.com', role: ROLES.MANAGER, passwordHash: 'hashed' },
  { id: 'u3', name: 'Trainer One',      email: 'trainer@aaro.com', role: ROLES.TRAINER, passwordHash: 'hashed' },
];
