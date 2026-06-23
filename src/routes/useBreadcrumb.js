/**
 * useBreadcrumb.js
 * Breadcrumb foundation hook.
 * Derives the breadcrumb trail from the current pathname via routeConfig.
 * Consumed by: TopBar (breadcrumb display), future BreadcrumbBar component.
 *
 * Returns an array of { label, path } objects.
 * The last item is the current page (no link); previous items are navigable.
 *
 * Future: supports dynamic label injection (e.g. batch name instead of "Batch Details")
 * via the optional `overrides` map passed by pages.
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteConfig } from './routeConfig';
import { ROUTES } from '@constants/routes';

/**
 * @param {Record<string, string>} [overrides] - Dynamic label overrides.
 *   e.g. { 'Batch Details': 'Batch A – Jan 2026' }
 * @returns {{ label: string, path: string | null }[]}
 */
const useBreadcrumb = (overrides = {}) => {
  const { pathname } = useLocation();

  return useMemo(() => {
    const config = getRouteConfig(pathname);
    if (!config || config.breadcrumb.length === 0) return [];

    return config.breadcrumb.map((label, index) => {
      const isLast = index === config.breadcrumb.length - 1;
      const displayLabel = overrides[label] || label;

      // Assign a sensible path for each breadcrumb level
      let path = null;
      if (!isLast) {
        // Root crumb links back to the parent section
        if (label === 'Batches') path = ROUTES.BATCHES;
        else if (label === 'Students') path = ROUTES.STUDENTS;
        else if (label === 'Attendance') path = ROUTES.MARK_ATTENDANCE;
        else if (label === 'Dashboard') path = ROUTES.DASHBOARD;
        else if (label === 'Reports') path = ROUTES.REPORTS;
        else if (label === 'Analytics') path = ROUTES.ANALYTICS;
        else if (label === 'Settings') path = ROUTES.SETTINGS;
      }

      return { label: displayLabel, path };
    });
  }, [pathname, overrides]);
};

export default useBreadcrumb;
