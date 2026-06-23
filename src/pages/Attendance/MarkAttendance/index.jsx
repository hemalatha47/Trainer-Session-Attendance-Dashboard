/**
 * MarkAttendancePage (Session Setup)
 * Module 6.2 — Batch Selection & Session Setup
 *
 * This page is the gateway to the attendance sheet workflow.
 * Step layout:
 *   Header (page title + subtitle)
 *   ↓
 *   Session Setup Card
 *     Batch Selector
 *     Date Picker
 *     Trainer Info
 *     Validation Banner
 *   ↓
 *   Session Header (visible after valid selection)
 *   ↓
 *   Continue Button (enabled only when session is valid)
 *
 * State: useAttendanceSession hook.
 * No direct service or mock data imports.
 */

import { useCallback }      from 'react';
import { useNavigate }      from 'react-router-dom';
import { motion }           from 'framer-motion';
import { ClipboardCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { fadeIn, usePrefersReducedMotion } from '@constants/animations';
import { safeMotion }       from '@utils/componentUtils';
import { CARD, PAGE_LAYOUT } from '@constants/uiStandards';
import { Button }           from '@components/ui/Button';
import { EmptyState }       from '@components/feedback/EmptyState';
import { ErrorState }       from '@components/feedback/ErrorState';
import { Skeleton }         from '@components/feedback/Skeleton';
import { useAppContext }    from '@context/AppContext';
import { ROUTES, buildRoute } from '@constants/routes';

import useAttendanceSession from '@hooks/useAttendanceSession';

import BatchSelector          from './components/BatchSelector';
import DateSelector           from './components/DateSelector';
import TrainerInfoCard        from './components/TrainerInfoCard';
import ValidationBanner       from './components/ValidationBanner';
import AttendanceSessionHeader from './components/AttendanceSessionHeader';

// ── Section label ──────────────────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <p className="text-xs font-semibold text-textMuted uppercase tracking-wide mb-3">
    {children}
  </p>
);

// ── Skeleton for loading state ─────────────────────────────────────────────────

const SetupCardSkeleton = () => (
  <div className={`${CARD.padded} flex flex-col gap-6`}>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-20 rounded" />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-28 rounded" />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
    <Skeleton className="h-12 w-full rounded-md" />
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const MarkAttendancePage = () => {
  const reduced  = usePrefersReducedMotion();
  const navigate = useNavigate();
  const { setActiveBatch } = useAppContext();

  const {
    session,
    validation,
    availableBatches,
    batchOptions,
    loading,
    error,
    setBatch,
    setDate,
    validate,
    refresh,
  } = useAttendanceSession();

  // Derived state
  const hasBatchAndDate = !!(session.batchId && session.date);
  const canContinue     = validation.isValid && !validation.checking;

  // ── Continue action ─────────────────────────────────────────────────────────
  const handleContinue = useCallback(async () => {
    const isValid = await validate();
    if (!isValid) return;

    // Store activeBatchId for cross-page context
    setActiveBatch(session.batchId);

    // Navigate to Attendance Sheet (Module 6.3)
    navigate(buildRoute(ROUTES.ATTENDANCE_SHEET, {
      batchId: session.batchId,
      date:    session.date,
    }));
  }, [validate, setActiveBatch, session, navigate]);

  const pageProps = safeMotion(reduced, {
    variants: fadeIn,
    initial:  'initial',
    animate:  'animate',
  });

  // ── Full error (batch list failed) ─────────────────────────────────────────
  if (!loading && error) {
    return (
      <div className={PAGE_LAYOUT.root}>
        <header>
          <h1 className={PAGE_LAYOUT.title}>Mark Attendance</h1>
        </header>
        <ErrorState
          title="Failed to load batches"
          description={error}
          retryLabel="Retry"
          onRetry={refresh}
        />
      </div>
    );
  }

  return (
    <motion.div className={PAGE_LAYOUT.root} {...pageProps}>

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <header className={PAGE_LAYOUT.header}>
        <div className={PAGE_LAYOUT.headerLeft}>
          <div className={PAGE_LAYOUT.titleRow}>
            <ClipboardCheck
              className="w-5 h-5 text-accent-600"
              aria-hidden="true"
            />
            <h1 className={PAGE_LAYOUT.title}>Mark Attendance</h1>
          </div>
          <p className={PAGE_LAYOUT.subtitle}>
            Select a batch and date to begin the attendance session
          </p>
        </div>

        <div className={PAGE_LAYOUT.headerRight}>
          <Button
            variant="secondary"
            size="sm"
            onClick={refresh}
            disabled={loading}
            iconLeft={
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
            }
            aria-label="Refresh batch list"
          >
            Refresh
          </Button>
        </div>
      </header>

      {/* ── Setup card ────────────────────────────────────────────────────── */}
      {loading ? (
        <SetupCardSkeleton />
      ) : availableBatches.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No active batches available"
          description="There are no active or upcoming batches to mark attendance for. Batches must be active or upcoming to accept attendance records."
          action={
            <Button variant="secondary" size="sm" onClick={refresh}>
              Refresh
            </Button>
          }
        />
      ) : (
        <div className={`${CARD.padded} flex flex-col gap-6`}>
          <SectionLabel>Session Configuration</SectionLabel>

          {/* Batch selector */}
          <BatchSelector
            batches={availableBatches}
            batchOptions={batchOptions}
            selectedBatchId={session.batchId}
            selectedBatch={session.batch}
            onSelect={setBatch}
            loading={loading}
          />

          {/* Date picker — enabled only after batch is selected */}
          <DateSelector
            value={session.date}
            onChange={setDate}
            minDate={session.batch?.startDate}
            maxDate={session.batch?.endDate}
            disabled={!session.batchId}
            helperText={
              !session.batchId
                ? 'Select a batch first'
                : session.batch
                ? `Batch runs ${session.batch.startDate} — ${session.batch.endDate}`
                : undefined
            }
            errorMessage={
              validation.error &&
              (validation.error.toLowerCase().includes('date') ||
               validation.error.toLowerCase().includes('future') ||
               validation.error.toLowerCase().includes('before') ||
               validation.error.toLowerCase().includes('after'))
                ? validation.error
                : undefined
            }
          />

          {/* Trainer info — shown after batch is selected */}
          {session.batchId && session.batch && (
            <div>
              <SectionLabel>Session Trainer</SectionLabel>
              <TrainerInfoCard
                trainerInfo={session.trainerInfo}
                loading={!session.trainerInfo}
              />
            </div>
          )}

          {/* Validation banner */}
          <ValidationBanner
            isValid={validation.isValid}
            error={
              validation.error &&
              !validation.error.toLowerCase().includes('date') &&
              !validation.error.toLowerCase().includes('future') &&
              !validation.error.toLowerCase().includes('before') &&
              !validation.error.toLowerCase().includes('after')
                ? validation.error
                : validation.error && !session.date
                ? validation.error
                : null
            }
            checking={validation.checking}
            show={hasBatchAndDate}
          />
        </div>
      )}

      {/* ── Session header (visible after valid selection) ─────────────── */}
      <AttendanceSessionHeader
        session={session}
        show={validation.isValid && !validation.checking}
      />

      {/* ── Continue button ────────────────────────────────────────────── */}
      {availableBatches.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            disabled={!canContinue}
            onClick={handleContinue}
            iconRight={
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            }
            aria-label={
              canContinue
                ? `Continue to attendance sheet for ${session.date}`
                : 'Complete session setup to continue'
            }
          >
            {validation.checking
              ? 'Validating…'
              : canContinue
              ? session.mode === 'edit'
                ? 'Continue to Edit Session'
                : 'Continue to Attendance Sheet'
              : 'Continue'}
          </Button>
        </div>
      )}

    </motion.div>
  );
};

MarkAttendancePage.displayName = 'MarkAttendancePage';

export default MarkAttendancePage;
