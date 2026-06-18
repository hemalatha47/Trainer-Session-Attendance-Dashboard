/**
 * authService.js
 * Authentication data-access layer (Section 10.1, Module 1.5 Task 15).
 *
 * Mock mode: validates email against mockUsers, accepts any non-empty
 * password (documented limitation). Returns a safe user object
 * (no passwordHash).
 *
 * Future migration: swap internals for axios POST to /api/auth/login,
 * storing the returned token instead of the user id — method signatures
 * remain unchanged.
 */

import { mockUsers } from '@data/mockUsers';

/**
 * Attempts to authenticate a user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{id:string,name:string,email:string,role:string}>}
 * @throws {Error} 'Invalid credentials'
 */
export const login = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error('Invalid credentials');
    }

    const match = mockUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!match) {
      throw new Error('Invalid credentials');
    }

    // Mock mode: any non-empty password is accepted.
    const { passwordHash, ...safeUser } = match;
    return safeUser;
  } catch (err) {
    throw new Error(err.message || 'Invalid credentials');
  }
};

/**
 * Mock logout — no server call required.
 * @returns {Promise<void>}
 */
export const logout = async () => {
  return Promise.resolve();
};

/**
 * Looks up a user by id (used during session restore).
 * @param {string} userId
 * @returns {Promise<{id:string,name:string,email:string,role:string}|null>}
 */
export const getCurrentUser = async (userId) => {
  const match = mockUsers.find((u) => u.id === userId);
  if (!match) return null;
  const { passwordHash, ...safeUser } = match;
  return safeUser;
};
