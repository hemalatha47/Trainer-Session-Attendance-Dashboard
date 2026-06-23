/**
 * FeedbackShowcase/index.jsx
 * Visual testing reference for all Module 3.3 Feedback Components.
 * Development-only — accessible at /feedback-showcase.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@constants/animations';
import useToast from '@hooks/useToast';
import {
  Alert,
  Spinner, PageLoader, SectionLoader, InlineLoader, CardLoader, TableLoader,
  Skeleton, TextSkeleton, AvatarSkeleton, CardSkeleton, TableSkeleton, FormSkeleton, PageSkeleton,
  EmptyState, ErrorState, SuccessState, StatusMessage,
  OfflineState, ConnectionLostState, ServerErrorState, MaintenanceState,
  LoadingPage, EmptyPage, ErrorPage, SuccessPage,
} from '@components/feedback';
import { Button } from '@components/ui/Button';
import { Divider } from '@components/ui/Divider';
import {
  Users, ClipboardCheck, FileText, Search, Plus,
} from 'lucide-react';

// ── Layout helpers ───────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <section className="flex flex-col gap-5">
    <h2 className="text-lg font-semibold text-primary-600 border-b border-border pb-2">
      {title}
    </h2>
    {children}
  </section>
);

const Row = ({ label, children, wrap = true }) => (
  <div className="flex flex-col gap-2">
    {label && <p className="text-xs font-medium text-textMuted uppercase tracking-wide">{label}</p>}
    <div className={`flex gap-3 ${wrap ? 'flex-wrap' : ''} items-start`}>{children}</div>
  </div>
);

// ── Showcase ─────────────────────────────────────────────────────────────────
const FeedbackShowcase = () => {
  const toast = useToast();
  const [showPage, setShowPage] = useState(null);

  // Demo page-state previews
  if (showPage === 'loading')  return <div onClick={() => setShowPage(null)} className="cursor-pointer"><LoadingPage label="Loading batch data…" /></div>;
  if (showPage === 'empty')    return <div onClick={() => setShowPage(null)} className="cursor-pointer"><EmptyPage icon={<Users className="w-8 h-8" />} title="No students yet" description="Add your first student to get started." actionLabel="Add Student" /></div>;
  if (showPage === 'error')    return <div onClick={() => setShowPage(null)} className="cursor-pointer"><ErrorPage onRetry={() => setShowPage(null)} /></div>;
  if (showPage === 'success')  return <div onClick={() => setShowPage(null)} className="cursor-pointer"><SuccessPage title="Attendance Saved" description="All 24 students' attendance has been recorded for today." actionLabel="View Report" onAction={() => setShowPage(null)} /></div>;

  return (
    <motion.div className="min-h-screen bg-background p-6 lg:p-10" {...pageTransition}>
      <div className="max-w-5xl mx-auto space-y-12">

        <div>
          <h1 className="text-2xl font-bold text-primary-600">Feedback Component Library</h1>
          <p className="mt-1 text-sm text-textMuted">Module 3.3 — Development showcase. Click page-state buttons to preview.</p>
        </div>

        {/* ── Toast ─────────────────────────────────────────────────────── */}
        <Section title="Toast System">
          <Row label="Trigger toasts">
            <Button variant="success" size="sm" onClick={() => toast.success('Attendance saved successfully!')}>
              Success Toast
            </Button>
            <Button variant="danger" size="sm" onClick={() => toast.error('Failed to save. Please retry.', { title: 'Error' })}>
              Error Toast
            </Button>
            <Button variant="secondary" size="sm" onClick={() => toast.warning('Attendance below 75% threshold.', { title: 'Low Attendance' })}>
              Warning Toast
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info('Batch B session added for today.')}>
              Info Toast
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toast.neutral('Auto-close disabled.', { duration: 0 })}>
              Persistent Toast
            </Button>
          </Row>
        </Section>

        <Divider />

        {/* ── Alert ─────────────────────────────────────────────────────── */}
        <Section title="Alert">
          <Alert variant="success" title="Attendance saved" description="All 24 students' records have been updated for 14 Jun 2026." dismissible />
          <Alert variant="error" title="Save failed" description="Could not write attendance records. Check your connection." dismissible actionLabel="Retry now" onAction={() => {}} />
          <Alert variant="warning" title="Low attendance detected" description="5 students are below the 75% threshold in Batch B." dismissible />
          <Alert variant="info" title="Session scheduled" description="Batch C starts on 6 Jul 2026. Prepare student roster in advance." dismissible />
          <Alert variant="neutral" title="Maintenance window" description="System maintenance is scheduled for Sunday 22 Jun, 2:00–4:00 AM." dismissible />
        </Section>

        <Divider />

        {/* ── StatusMessage ─────────────────────────────────────────────── */}
        <Section title="Status Message">
          <Row label="Inline">
            <StatusMessage variant="success" message="Saved successfully" />
            <StatusMessage variant="error" message="Invalid email address" />
            <StatusMessage variant="warning" message="Below threshold" />
            <StatusMessage variant="info" message="5 sessions remaining" />
            <StatusMessage variant="neutral" message="No changes made" />
          </Row>
          <Row label="Form display">
            <StatusMessage variant="error" display="form" message="Please fix the errors above before submitting." />
            <StatusMessage variant="success" display="form" message="All fields are valid." />
          </Row>
        </Section>

        <Divider />

        {/* ── Loaders ───────────────────────────────────────────────────── */}
        <Section title="Loaders">
          <Row label="Spinner sizes">
            <Spinner size="xs" />
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Spinner size="xl" />
          </Row>
          <Row label="Inline loader">
            <InlineLoader label="Fetching students…" />
          </Row>
          <Row label="Section loader">
            <div className="w-full max-w-xs border border-border rounded-md overflow-hidden">
              <SectionLoader label="Loading batch data…" minHeight="min-h-32" />
            </div>
          </Row>
          <Row label="Card loader">
            <div className="w-60">
              <CardLoader />
            </div>
          </Row>
          <Row label="Table loader">
            <TableLoader rows={3} cols={4} />
          </Row>
        </Section>

        <Divider />

        {/* ── Skeleton ──────────────────────────────────────────────────── */}
        <Section title="Skeleton">
          <Row label="Text skeleton">
            <div className="w-full max-w-sm">
              <TextSkeleton lines={3} />
            </div>
          </Row>
          <Row label="Avatar skeletons">
            <AvatarSkeleton size="xs" />
            <AvatarSkeleton size="sm" />
            <AvatarSkeleton size="md" />
            <AvatarSkeleton size="lg" />
            <AvatarSkeleton size="xl" />
          </Row>
          <Row label="Card skeleton">
            <div className="w-64">
              <CardSkeleton />
            </div>
          </Row>
          <Row label="Form skeleton">
            <div className="w-full max-w-sm">
              <FormSkeleton fields={3} />
            </div>
          </Row>
          <Row label="Table skeleton">
            <TableSkeleton rows={3} cols={4} />
          </Row>
        </Section>

        <Divider />

        {/* ── Empty / Error / Success States ────────────────────────────── */}
        <Section title="Empty State">
          <div className="border border-border rounded-md overflow-hidden bg-white">
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="No students found"
              description="This batch has no students yet. Add a student to get started."
              actionLabel="Add Student"
              secondaryLabel="Import CSV"
            />
          </div>
          <div className="border border-border rounded-md overflow-hidden bg-white">
            <EmptyState
              icon={<Search className="w-8 h-8" />}
              title="No results"
              description="No students match 'xyz'. Try a different search term."
            />
          </div>
        </Section>

        <Section title="Error State">
          <div className="border border-border rounded-md overflow-hidden bg-white">
            <ErrorState
              onRetry={() => toast.info('Retrying…')}
              errorDetail="Error: NETWORK_TIMEOUT after 5000ms\n  at fetchStudents (studentService.js:42)"
            />
          </div>
        </Section>

        <Section title="Success State">
          <div className="border border-border rounded-md overflow-hidden bg-white">
            <SuccessState
              title="Attendance Saved"
              description="All 24 students' attendance has been recorded for 14 Jun 2026."
              actionLabel="View Report"
              secondaryLabel="Mark Another Day"
            />
          </div>
        </Section>

        <Divider />

        {/* ── Network States ─────────────────────────────────────────────── */}
        <Section title="Network States">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[OfflineState, ConnectionLostState, ServerErrorState].map((Comp, i) => (
              <div key={i} className="border border-border rounded-md overflow-hidden bg-white">
                <Comp onRetry={() => toast.info('Retrying connection…')} />
              </div>
            ))}
            <div className="border border-border rounded-md overflow-hidden bg-white">
              <MaintenanceState estimatedTime="2:00 AM IST" />
            </div>
          </div>
        </Section>

        <Divider />

        {/* ── Page States ───────────────────────────────────────────────── */}
        <Section title="Page States (click to preview full-screen)">
          <Row label="Preview buttons">
            <Button variant="secondary" size="sm" onClick={() => setShowPage('loading')}>Loading Page</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowPage('empty')}>Empty Page</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowPage('error')}>Error Page</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowPage('success')}>Success Page</Button>
          </Row>
          <p className="text-xs text-textMuted">Click the preview to return to showcase.</p>
        </Section>

        <Divider spacing="xl" />

        <p className="text-center text-xs text-textMuted pb-6">
          Module 3.3 — Feedback Component Library — Naan Mudhalvan Internship 2026
        </p>

      </div>
    </motion.div>
  );
};

export default FeedbackShowcase;
