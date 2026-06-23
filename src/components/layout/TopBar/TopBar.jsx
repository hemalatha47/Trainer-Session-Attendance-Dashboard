/**
 * TopBar.jsx
 * Sticky top navigation bar — consumes title/breadcrumb from routeConfig via useBreadcrumb.
 * No hardcoded page titles or breadcrumb arrays.
 *
 * Features:
 *   - Mobile hamburger toggle (AppContext)
 *   - Dynamic page title from routeConfig
 *   - Breadcrumb trail from useBreadcrumb hook
 *   - Notification bell placeholder
 *   - User avatar dropdown: Settings link, Logout
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation }  from 'react-router-dom';
import { useAppContext }  from '@context/AppContext';
import { useAuthContext } from '@context/AuthContext';
import useAuth           from '@hooks/useAuth';
import useBreadcrumb     from '@/routes/useBreadcrumb';
import { getRouteConfig } from '@/routes/routeConfig';
import { ROUTES }        from '@constants/routes';

// ── Notification Bell ────────────────────────────────────────────────────────

const NotificationBell = () => (
  <button
    aria-label="Notifications (coming soon)"
    className="relative p-2 rounded-md text-textMuted hover:text-textPrimary
      hover:bg-neutral-100 transition-colors outline-none
      focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-DEFAULT rounded-full" aria-hidden="true" />
  </button>
);

// ── User Dropdown ────────────────────────────────────────────────────────────

const UserDropdown = ({ currentUser, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open]);

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Open user menu"
        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-100
          transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-xs font-semibold select-none">{initials}</span>
        </div>
        <div className="hidden sm:block text-left min-w-0">
          <p className="text-sm font-medium text-textPrimary leading-tight truncate max-w-[120px]">
            {currentUser?.name || 'User'}
          </p>
          <p className="text-xs text-textMuted leading-tight capitalize">{currentUser?.role || ''}</p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round"
          className={`hidden sm:block w-4 h-4 text-textMuted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User options"
          className="absolute right-0 top-full mt-1 w-48 bg-surface rounded-lg
            shadow-dropdown border border-border py-1 z-50"
        >
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-sm font-medium text-textPrimary truncate">{currentUser?.name}</p>
            <p className="text-xs text-textMuted truncate">{currentUser?.email}</p>
          </div>

          <div className="py-1">
            {/* Profile — placeholder */}
            <button role="menuitem" disabled aria-disabled="true"
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm
                text-textMuted cursor-not-allowed opacity-60">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              View Profile
            </button>

            <Link to={ROUTES.SETTINGS} role="menuitem" onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-textPrimary
                hover:bg-neutral-50 transition-colors outline-none focus-visible:bg-neutral-50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
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
              </svg>
              Settings
            </Link>

            <div className="border-t border-border my-1" />

            <button role="menuitem" onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger-DEFAULT
                hover:bg-red-50 transition-colors outline-none focus-visible:bg-red-50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Breadcrumb display ───────────────────────────────────────────────────────

const BreadcrumbBar = ({ crumbs }) => {
  if (crumbs.length <= 1) return null;
  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1 mt-0.5">
      {crumbs.map((crumb, i) => (
        <span key={crumb.label} className="flex items-center gap-1">
          {i > 0 && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className="w-3 h-3 text-textMuted" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          )}
          {crumb.path ? (
            <Link to={crumb.path}
              className="text-xs text-textMuted hover:text-accent transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-xs text-textMuted">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

// ── Main TopBar ──────────────────────────────────────────────────────────────

const TopBar = () => {
  const { toggleSidebar }  = useAppContext();
  const { currentUser }    = useAuthContext();
  const { logout }         = useAuth();
  const { pathname }       = useLocation();
  const crumbs             = useBreadcrumb();
  const routeMeta          = getRouteConfig(pathname);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 flex items-center h-16 px-4 lg:px-6
        bg-surface border-b border-border shadow-sm flex-shrink-0"
    >
      {/* Mobile hamburger */}
      <button
        onClick={toggleSidebar}
        aria-label="Open navigation menu"
        className="lg:hidden mr-3 p-2 rounded-md text-textMuted hover:text-textPrimary
          hover:bg-neutral-100 transition-colors outline-none
          focus-visible:ring-2 focus-visible:ring-accent"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
          <line x1="3" y1="6"  x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Title + breadcrumb — driven entirely by routeConfig */}
      <div className="flex-1 min-w-0">
<<<<<<< HEAD
        <h1 className="text-base font-semibold text-textPrimary leading-tight truncate">
=======
        <h1 className="text-base font-semibold text-primary leading-tight truncate">
>>>>>>> 83da42ba2764e152fa78cf9b177f8d106d2a9726
          {routeMeta?.title || 'Dashboard'}
        </h1>
        <BreadcrumbBar crumbs={crumbs} />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-3">
        <NotificationBell />
        <UserDropdown currentUser={currentUser} onLogout={handleLogout} />
      </div>
    </header>
  );
};

export default TopBar;
