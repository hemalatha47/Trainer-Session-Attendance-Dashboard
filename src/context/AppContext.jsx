/**
 * AppContext.jsx
 * Cross-cutting UI/config state (Module 1.2 Task 10-12).
 *
 * Owns: activeBatchId, attendanceThreshold, sidebarCollapsed, toasts, globalFilters.
 * Does NOT own entity data (batches/students/attendance) — that lives in
 * hooks/services. No dependency on AuthContext.
 *
 * Consumed by: Sidebar, TopBar, PageWrapper, and future feature pages.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@constants/storageKeys';

const DEFAULT_THRESHOLD = 75;

const AppContext = createContext(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within an AppProvider');
  return ctx;
};

export const AppProvider = ({ children }) => {
  const [activeBatchId, setActiveBatchIdState] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [globalFilters, setGlobalFilters] = useState({});

  const [attendanceThreshold, setAttendanceThresholdState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.attendanceThreshold === 'number') {
          return parsed.attendanceThreshold;
        }
      }
    } catch {
      // ignore corrupted storage
    }
    return DEFAULT_THRESHOLD;
  });

  // Persist threshold whenever it changes (Section 6.9 "configure" intent)
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.APP_SETTINGS,
        JSON.stringify({ attendanceThreshold })
      );
    } catch {
      // ignore storage write failures
    }
  }, [attendanceThreshold]);

  const setActiveBatch = useCallback((id) => setActiveBatchIdState(id), []);

  const setThreshold = useCallback((value) => {
    const num = Number(value);
    if (!Number.isNaN(num) && num >= 0 && num <= 100) {
      setAttendanceThresholdState(num);
    }
  }, []);

  const toggleSidebar = useCallback(() => setSidebarCollapsed((v) => !v), []);

  const showToast = useCallback((message, type = 'success', opts = {}) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const duration = opts.duration ?? 3000;
    setToasts((prev) => [...prev, { id, message, type, title: opts.title, duration }]);
    // Auto-remove after duration (0 = manual only)
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration + 400); // +400ms for exit animation
    }
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = {
    activeBatchId,
    setActiveBatch,
    attendanceThreshold,
    setThreshold,
    sidebarCollapsed,
    toggleSidebar,
    toasts,
    showToast,
    dismissToast,
    globalFilters,
    setGlobalFilters,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
