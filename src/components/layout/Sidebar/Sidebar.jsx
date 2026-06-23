/**
 * Sidebar.jsx
 * Fixed left navigation sidebar — consumes SIDEBAR_NAV_ITEMS from routeConfig.
 * No hardcoded navigation items; all metadata comes from src/routes/routeConfig.jsx.
 *
 * Behaviour:
 *   Desktop (≥1024px): sticky, toggles expanded (240px) ↔ icon-only (72px).
 *   Mobile  (<1024px):  slide-in drawer overlay.
 *
 * State: AppContext.sidebarCollapsed / toggleSidebar.
 * Accessibility: role="navigation", aria-current, aria-label, focus-visible.
 */

import { useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppContext }    from '@context/AppContext';
import { useAuthContext }   from '@context/AuthContext';
import { SIDEBAR_NAV_ITEMS } from '@/routes/routeConfig';
import { ROUTES }            from '@constants/routes';

// ── Single nav link ─────────────────────────────────────────────────────────

const NavItem = ({ item, collapsed, onClick }) => {
  const { pathname } = useLocation();

  const isActive = item.exactMatch
    ? pathname === item.path
    : pathname === item.path || pathname.startsWith(item.path + '/');

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? item.title : undefined}
      aria-label={item.description}
      className={[
        'group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium',
        'transition-all duration-150 ease-in-out outline-none',
        'focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-1',
        isActive
          ? 'bg-white/15 text-white'
          : 'text-white/70 hover:bg-white/10 hover:text-white',
        collapsed ? 'justify-center' : '',
      ].join(' ')}
    >
      <span className={isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}>
        {item.icon}
      </span>
      {!collapsed && <span className="truncate leading-none">{item.title}</span>}
      {isActive && !collapsed && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent/80 flex-shrink-0" />
      )}
    </NavLink>
  );
};

// ── Collapse toggle ─────────────────────────────────────────────────────────

const CollapseToggle = ({ collapsed, onClick }) => (
  <button
    onClick={onClick}
    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    className="flex items-center justify-center w-8 h-8 rounded-md
      text-white/60 hover:text-white hover:bg-white/10
      transition-colors duration-150 focus-visible:ring-2
      focus-visible:ring-white/50 outline-none"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      {collapsed
        ? <polyline points="9 18 15 12 9 6" />
        : <polyline points="15 18 9 12 15 6" />
      }
    </svg>
  </button>
);

// ── Logo mark ───────────────────────────────────────────────────────────────

const LogoMark = () => (
  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5" aria-hidden="true">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  </div>
);

// ── User footer ─────────────────────────────────────────────────────────────

const UserFooter = ({ user, collapsed }) => (
  <div className={[
    'border-t border-white/10 px-3 py-3 flex-shrink-0',
    collapsed ? 'flex justify-center' : 'flex items-center gap-2',
  ].join(' ')}>
    <div className="w-7 h-7 rounded-full bg-accent/80 flex items-center justify-center flex-shrink-0">
      <span className="text-white text-xs font-semibold select-none">
        {user.name.charAt(0).toUpperCase()}
      </span>
    </div>
    {!collapsed && (
      <div className="min-w-0">
        <p className="text-white text-xs font-medium truncate leading-tight">{user.name}</p>
        <p className="text-white/50 text-xs truncate leading-tight capitalize">{user.role}</p>
      </div>
    )}
  </div>
);

// ── Main Sidebar ────────────────────────────────────────────────────────────

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useAppContext();
  const { currentUser } = useAuthContext();

  const handleNavClick = useCallback(() => {
    if (window.innerWidth < 1024) toggleSidebar();
  }, [toggleSidebar]);

  const navList = (collapsed) => (
    <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-hide" aria-label="Main navigation">
      <ul role="list" className="flex flex-col gap-0.5">
        {SIDEBAR_NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavItem item={item} collapsed={collapsed} onClick={handleNavClick} />
          </li>
        ))}
      </ul>
    </nav>
  );

  // ── Desktop sidebar ──────────────────────────────────────────────────────
  const desktopSidebar = (
    <aside
      className={[
        'hidden lg:flex flex-col flex-shrink-0',
        'bg-primary h-screen sticky top-0 overflow-hidden',
        'transition-[width] duration-200 ease-in-out',
        sidebarCollapsed ? 'w-[72px]' : 'w-60',
      ].join(' ')}
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {/* Brand header */}
      <div className={[
        'flex items-center gap-3 px-4 py-5 border-b border-white/10 flex-shrink-0',
        sidebarCollapsed ? 'justify-center px-0' : '',
      ].join(' ')}>
        <LogoMark />
        {!sidebarCollapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="text-white font-semibold text-sm leading-tight truncate">Aaro</p>
              <p className="text-white/50 text-xs leading-tight truncate">Attendance Dashboard</p>
            </div>
            <CollapseToggle collapsed={false} onClick={toggleSidebar} />
          </>
        )}
      </div>

      {sidebarCollapsed && (
        <div className="flex justify-center py-2 border-b border-white/10">
          <CollapseToggle collapsed onClick={toggleSidebar} />
        </div>
      )}

      {navList(sidebarCollapsed)}

      {currentUser && <UserFooter user={currentUser} collapsed={sidebarCollapsed} />}
    </aside>
  );

  // ── Mobile drawer ────────────────────────────────────────────────────────
  const mobileDrawer = (
    <>
      {!sidebarCollapsed && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
          onClick={toggleSidebar}
        />
      )}
      <aside
        className={[
          'lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-primary flex flex-col',
          'transition-transform duration-200 ease-in-out shadow-modal',
          sidebarCollapsed ? '-translate-x-full' : 'translate-x-0',
        ].join(' ')}
        role="navigation"
        aria-label="Mobile navigation"
        aria-hidden={sidebarCollapsed}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="text-white font-semibold text-sm leading-tight">Aaro</p>
              <p className="text-white/50 text-xs leading-tight">Attendance Dashboard</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            aria-label="Close navigation menu"
            className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10
              transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {navList(false)}

        {currentUser && <UserFooter user={currentUser} collapsed={false} />}
      </aside>
    </>
  );

  return (
    <>
      {desktopSidebar}
      {mobileDrawer}
    </>
  );
};

export default Sidebar;
