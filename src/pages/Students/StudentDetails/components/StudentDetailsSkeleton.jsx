/**
 * StudentDetailsSkeleton.jsx
 * Module 5.2 — Student Details Page
 *
 * Full-page skeleton loading state shown while useStudentDetails resolves.
 * Mirrors the real page layout so the visual jump is minimal.
 */

import {
  Skeleton,
  CardSkeleton,
  TextSkeleton,
} from '@components/feedback/Skeleton';

// ── Header skeleton ───────────────────────────────────────────────────────────
const HeaderSkeleton = () => (
  <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
    <div className="flex items-center gap-4">
      <Skeleton shape="circle" width="w-20" height="h-20" />
      <div className="flex-1">
        <Skeleton height="h-6" width="w-48" className="mb-2" />
        <Skeleton height="h-4" width="w-32" className="mb-3" />
        <div className="flex gap-2">
          <Skeleton shape="pill" height="h-5" width="w-20" />
          <Skeleton shape="pill" height="h-5" width="w-28" />
          <Skeleton shape="pill" height="h-5" width="w-24" />
        </div>
      </div>
    </div>
  </div>
);

// ── KPI row skeleton ──────────────────────────────────────────────────────────
const KPIRowSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// ── Panel skeleton ────────────────────────────────────────────────────────────
const PanelSkeleton = () => (
  <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
    <Skeleton height="h-5" width="w-24" className="mb-4" />
    <TextSkeleton lines={5} />
  </div>
);

// ── Page skeleton ─────────────────────────────────────────────────────────────
const StudentDetailsSkeleton = () => (
  <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading student details">
    <HeaderSkeleton />
    <KPIRowSkeleton />
    {/* Tab bar placeholder */}
    <div className="flex gap-2 border-b border-border pb-px">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} height="h-9" width="w-24" />
      ))}
    </div>
    {/* Two-column panel area */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <PanelSkeleton />
        <PanelSkeleton />
      </div>
      <div className="flex flex-col gap-6">
        <PanelSkeleton />
        <PanelSkeleton />
      </div>
    </div>
  </div>
);

export default StudentDetailsSkeleton;
