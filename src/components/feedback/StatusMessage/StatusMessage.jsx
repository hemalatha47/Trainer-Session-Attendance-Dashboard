/**
 * StatusMessage.jsx
 * Compact inline status message (Module 3.3, Task 9).
 *
 * Lighter-weight than Alert — no dismiss, no actions.
 * Ideal for form-level validation summaries, section notices.
 *
 * Variants : success | warning | error | info | neutral
 * Display  : inline | form | section
 */

import {
  CheckCircle2, AlertTriangle, XCircle, Info, AlertCircle,
} from 'lucide-react';
import { cn } from '@utils/componentUtils';

const ICON_MAP = {
  success: { Icon: CheckCircle2, cls: 'text-success-DEFAULT' },
  warning: { Icon: AlertTriangle, cls: 'text-warning-text' },
  error:   { Icon: XCircle,      cls: 'text-danger-DEFAULT' },
  info:    { Icon: Info,         cls: 'text-info-DEFAULT' },
  neutral: { Icon: AlertCircle,  cls: 'text-neutral-500' },
};

const TEXT_MAP = {
  success: 'text-success-text',
  warning: 'text-warning-text',
  error:   'text-danger-text',
  info:    'text-info-text',
  neutral: 'text-neutral-700',
};

const DISPLAY_WRAP = {
  inline:  'inline-flex',
  form:    'flex rounded-md bg-neutral-50 border border-border px-3 py-2',
  section: 'flex rounded-md bg-neutral-50 border border-border px-4 py-3',
};

/**
 * @param {'success'|'warning'|'error'|'info'|'neutral'} [props.variant='info']
 * @param {'inline'|'form'|'section'} [props.display='inline']
 * @param {string}  props.message
 * @param {boolean} [props.showIcon=true]
 * @param {string}  [props.className]
 */
const StatusMessage = ({
  variant = 'info',
  display = 'inline',
  message,
  showIcon = true,
  className,
}) => {
  const { Icon, cls } = ICON_MAP[variant] ?? ICON_MAP.info;
  const textCls = TEXT_MAP[variant] ?? TEXT_MAP.info;
  const wrapCls = DISPLAY_WRAP[display] ?? DISPLAY_WRAP.inline;

  return (
    <span
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={cn('items-center gap-1.5', wrapCls, className)}
    >
      {showIcon && (
        <Icon className={cn('h-4 w-4 shrink-0', cls)} aria-hidden="true" />
      )}
      <span className={cn('text-sm leading-relaxed', textCls)}>{message}</span>
    </span>
  );
};

StatusMessage.displayName = 'StatusMessage';

export { StatusMessage };
export default StatusMessage;
