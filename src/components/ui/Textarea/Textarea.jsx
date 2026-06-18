/**
 * Textarea.jsx
 * Reusable textarea component (Module 3.2, Task 5).
 *
 * Features : label, helper text, error state, character count,
 *            auto-resize option, disabled state, accessible markup.
 */

import { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn, hasContent } from '@utils/componentUtils';

const getTextareaClasses = ({ hasError, disabled }) => {
  const base =
    'block w-full rounded-md border bg-white text-sm text-textPrimary ' +
    'placeholder:text-textMuted leading-relaxed ' +
    'transition-colors duration-150 outline-none resize-y ' +
    'focus-visible:ring-2 focus-visible:ring-offset-0';

  if (disabled) {
    return cn(base, 'border-border bg-neutral-50 text-textMuted cursor-not-allowed opacity-60 resize-none');
  }
  if (hasError) {
    return cn(base, 'border-danger-DEFAULT focus-visible:ring-danger-DEFAULT/30');
  }
  return cn(base, 'border-border focus-visible:border-accent-600 focus-visible:ring-accent-600/25');
};

/**
 * @param {object}  props
 * @param {string}  [props.label]
 * @param {string}  [props.placeholder]
 * @param {string}  [props.helperText]
 * @param {string}  [props.errorMessage]
 * @param {number}  [props.maxLength]     — enables character count when provided
 * @param {number}  [props.rows=3]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.required=false]
 * @param {string}  [props.className]     — wrapper div
 * @param {string}  [props.id]
 * @param {string}  [props.value]         — for controlled + character count
 */
const Textarea = forwardRef(function Textarea(
  {
    label,
    placeholder,
    helperText,
    errorMessage,
    maxLength,
    rows = 3,
    disabled = false,
    required = false,
    className,
    id: idProp,
    value,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const helpId = `${id}-help`;

  const hasError = hasContent(errorMessage);
  const charCount = typeof value === 'string' ? value.length : 0;
  const hasCharCount = maxLength != null;
  const charCountColor = hasCharCount && charCount > maxLength * 0.9 ? 'text-warning-text' : 'text-textMuted';

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {/* Label */}
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-secondary-700">
          {label}
          {required && (
            <span className="ml-1 text-danger-DEFAULT" aria-hidden="true">*</span>
          )}
        </label>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          value={value}
          aria-invalid={hasError}
          aria-describedby={hasContent(helperText) || hasError ? helpId : undefined}
          className={cn(
            getTextareaClasses({ hasError, disabled }),
            'px-3 py-2',
            hasError && 'pr-9'
          )}
          {...rest}
        />

        {/* Error icon */}
        {hasError && (
          <span className="pointer-events-none absolute right-3 top-2.5">
            <AlertCircle className="w-4 h-4 text-danger-DEFAULT" aria-hidden="true" />
          </span>
        )}
      </div>

      {/* Footer row: helper/error text + char count */}
      <div className="flex items-start justify-between gap-2">
        {(hasContent(helperText) || hasError) ? (
          <p
            id={helpId}
            role={hasError ? 'alert' : undefined}
            className={cn('text-xs leading-relaxed', hasError ? 'text-danger-DEFAULT' : 'text-textMuted')}
          >
            {hasError ? errorMessage : helperText}
          </p>
        ) : <span />}

        {hasCharCount && (
          <p className={cn('text-xs shrink-0 tabular-nums', charCountColor)} aria-live="polite">
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
export default Textarea;
