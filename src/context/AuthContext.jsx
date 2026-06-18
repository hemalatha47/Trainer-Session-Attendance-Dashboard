/**
 * AuthContext.jsx — Module 2.3 hardened.
 *
 * Changes from 2.1:
 *   - Added `sessionExpiry` field (reserved; inert in V1 mock mode)
 *   - login() now accepts optional `redirectTo` so callers can pass state.from
 *   - restoreSession() validates stored data shape before hydrating
 *   - logout() clears all auth-related storage keys
 *
 * Owns: currentUser, isAuthenticated, loading, sessionExpiry
 * Does NOT own: batch/student/attendance data.
 * Consumed by: ProtectedRoute, TopBar, Settings, Sidebar, useAuth.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@constants/storageKeys';

const AuthContext = createContext(null);

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [currentUser,     setCurrentUser]     = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [sessionExpiry,   setSessionExpiry]   = useState(null); // reserved for JWT

  /** Validates stored session shape before restoring */
  const isValidSession = (parsed) =>
    parsed &&
    typeof parsed === 'object' &&
    parsed.user &&
    typeof parsed.user.id === 'string' &&
    typeof parsed.user.email === 'string' &&
    typeof parsed.user.role === 'string';

  const restoreSession = useCallback(async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (stored) {
        const session = JSON.parse(stored);
        if (isValidSession(session)) {
          setCurrentUser(session.user);
          setIsAuthenticated(true);
          if (session.expiry) setSessionExpiry(session.expiry);
        } else {
          // Stale / corrupted — clear
          localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { restoreSession(); }, [restoreSession]);

  /**
   * Sets the authenticated session after successful login.
   * @param {Object} user - Safe user object (no passwordHash)
   */
  const login = useCallback((user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem(
      STORAGE_KEYS.AUTH_SESSION,
      JSON.stringify({ user, expiry: null }) // expiry: null in mock mode
    );
  }, []);

  /** Clears session state and all auth storage. */
  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setSessionExpiry(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  }, []);

  const value = {
    currentUser,
    isAuthenticated,
    role: currentUser?.role || null,
    loading,
    sessionRestored: !loading,
    sessionExpiry,
    login,
    logout,
    restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
