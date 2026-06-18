/**
 * useAuth.js
 * Business workflow hook wrapping authService + AuthContext (Module 1.2 Task 13).
 *
 * Responsibilities:
 *   - Calls authService.login/logout
 *   - Manages loading/error state for the Login form
 *   - Pushes successful session into AuthContext
 *
 * Consumed by: LoginPage, TopBar (logout).
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@context/AuthContext';
import * as authService from '@services/authService';
import { ROUTES } from '@constants/routes';

const useAuth = () => {
  const {
    login: setSession,
    logout: clearSession,
    currentUser,
    isAuthenticated,
    role,
    sessionRestored,
  } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Authenticates the user and stores the session in AuthContext.
   * @param {string} email
   * @param {string} password
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.login(email, password);
      setSession(user);
      return user;
    } catch (err) {
      setError(err.message || 'Invalid credentials');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  /**
   * Logs the user out, clears session, and redirects to /login.
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [clearSession, navigate]);

  /** Clears any inline form error (e.g. on input change). */
  const clearError = useCallback(() => setError(null), []);

  return {
    login,
    logout,
    loading,
    error,
    clearError,
    currentUser,
    isAuthenticated,
    role,
    sessionRestored,
  };
};

export default useAuth;
