/**
 * PageWrapper.jsx
 * App shell layout — Sidebar + TopBar + main content Outlet.
 * Rendered as a layout route inside ProtectedRoute (AppRouter).
 */

import { Outlet } from 'react-router-dom';
import Sidebar from '@components/layout/Sidebar/Sidebar';
import TopBar from '@components/layout/TopBar/TopBar';

const PageWrapper = () => (
  <div className="flex min-h-screen bg-background">
    <Sidebar />
    <div className="flex flex-col flex-1 min-w-0">
      <TopBar />
      <main className="flex-1 p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

export default PageWrapper;
