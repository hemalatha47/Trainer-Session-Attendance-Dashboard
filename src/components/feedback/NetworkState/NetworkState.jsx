/**
 * NetworkState.jsx
 * Network and server error state components (Module 3.3, Task 10).
 *
 * Future-ready — no backend integration needed now.
 * Components are standalone and consume the same EmptyState/ErrorState patterns.
 *
 * Exports:
 *   OfflineState         — navigator.onLine = false
 *   ConnectionLostState  — mid-session connection dropped
 *   ServerErrorState     — HTTP 5xx response
 *   MaintenanceState     — scheduled downtime notice
 */

import { motion } from 'framer-motion';
import { WifiOff, ServerCrash, Wrench, RefreshCw } from 'lucide-react';
import { fadeIn } from '@constants/animations';
import { cn } from '@utils/componentUtils';
import { Button } from '@components/ui/Button';

// ── Shared layout ─────────────────────────────────────────────────────────────
const NetworkStateBase = ({
  icon,
  iconBg = 'bg-neutral-100',
  iconColor = 'text-neutral-400',
  title,
  description,
  children,
  className,
}) => (
  <motion.div
    variants={fadeIn}
    initial="initial"
    animate="animate"
    role="alert"
    aria-live="assertive"
    className={cn(
      'flex flex-col items-center justify-center gap-4 py-16 px-6 text-center',
      className
    )}
  >
    <span
      className={cn('flex h-16 w-16 items-center justify-center rounded-full', iconBg)}
      aria-hidden="true"
    >
      {icon}
    </span>
    <div className="flex flex-col gap-1 max-w-sm">
      <h3 className="text-base font-semibold text-textPrimary">{title}</h3>
      <p className="text-sm text-textMuted leading-relaxed">{description}</p>
    </div>
    {children}
  </motion.div>
);

// ── OfflineState ─────────────────────────────────────────────────────────────
const OfflineState = ({ className }) => (
  <NetworkStateBase
    icon={<WifiOff className="h-8 w-8 text-neutral-500" />}
    iconBg="bg-neutral-100"
    title="You're offline"
    description="Check your internet connection and try again. Your recent data is still available."
    className={className}
  >
    <Button
      variant="secondary"
      onClick={() => window.location.reload()}
      iconLeft={<RefreshCw className="w-4 h-4" />}
    >
      Retry
    </Button>
  </NetworkStateBase>
);

OfflineState.displayName = 'OfflineState';

// ── ConnectionLostState ───────────────────────────────────────────────────────
const ConnectionLostState = ({ onRetry, className }) => (
  <NetworkStateBase
    icon={<WifiOff className="h-8 w-8 text-warning-text" />}
    iconBg="bg-warning-bg"
    title="Connection lost"
    description="Your session was interrupted. Reconnecting automatically…"
    className={className}
  >
    {onRetry && (
      <Button
        variant="outline"
        onClick={onRetry}
        iconLeft={<RefreshCw className="w-4 h-4" />}
      >
        Reconnect now
      </Button>
    )}
  </NetworkStateBase>
);

ConnectionLostState.displayName = 'ConnectionLostState';

// ── ServerErrorState ──────────────────────────────────────────────────────────
const ServerErrorState = ({ onRetry, className }) => (
  <NetworkStateBase
    icon={<ServerCrash className="h-8 w-8 text-danger-DEFAULT" />}
    iconBg="bg-danger-bg"
    title="Server error"
    description="Our server ran into a problem. The team has been notified. Please try again in a moment."
    className={className}
  >
    {onRetry && (
      <Button
        variant="primary"
        onClick={onRetry}
        iconLeft={<RefreshCw className="w-4 h-4" />}
      >
        Try again
      </Button>
    )}
  </NetworkStateBase>
);

ServerErrorState.displayName = 'ServerErrorState';

// ── MaintenanceState ──────────────────────────────────────────────────────────
const MaintenanceState = ({ estimatedTime, className }) => (
  <NetworkStateBase
    icon={<Wrench className="h-8 w-8 text-info-DEFAULT" />}
    iconBg="bg-info-bg"
    title="Scheduled maintenance"
    description={
      estimatedTime
        ? `The system is under maintenance. Expected to be back by ${estimatedTime}.`
        : 'The system is undergoing maintenance. We\'ll be back shortly.'
    }
    className={className}
  />
);

MaintenanceState.displayName = 'MaintenanceState';

export { OfflineState, ConnectionLostState, ServerErrorState, MaintenanceState };
export default OfflineState;
