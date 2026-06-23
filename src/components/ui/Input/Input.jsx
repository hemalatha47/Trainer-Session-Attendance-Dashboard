/**
 * Input.jsx
 * Reusable text input component (Module 3.2, Task 4).
 *
 * Types    : text | email | password | number | search | tel | url
 * Features : label, placeholder, helper text, validation message,
 *            error state, success state, disabled, leading icon,
 *            trailing icon, password visibility toggle, character count.
 * Fully accessible — label is programmatically associated via id/htmlFor.
 */

import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn, hasContent } from '@utils/componentUtils';

// ── State-derived styles ─────────────────────────────────────────────────────
const getInputClasses = ({ hasError, hasSuccess, disabled }) => {
  const base =
    'block w-full rounded-md border bg-white text-sm text-textPrimary ' +
    'placeholder:text-textMuted ' +
    'transition-colors duration-150 outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-offset-0';

  if (disabled) {
    return cn(base, 'border-border bg-neutral-50 text-textMuted cursor-not-allowed opacity-60');
  }
  if (hasError) {
    return cn(base, 'border-danger-DEFAULT focus-visible:ring-danger-DEFAULT/30');
  }
  if (hasSuccess) {
    return cn(base, 'border-success-DEFAULT focus-visible:ring-success-DEFAULT/30');
  }
  return cn(base, 'border-border focus-visible:border-accent-600 focus-visible:ring-accent-600/25');
};

/**
 * @param {object}  props
 * @param {'text'|'email'|'password'|'number'|'search'|'tel'|'url'} [props.type='text']
 * @param {string}  [props.label]
 * @param {string}  [props.placeholder]
 * @param {string}  [props.helperText]
 * @param {string}  [props.errorMessage]
 * @param {string}  [props.successMessage]
 * @param {boolean} [props.disabled=false]
 * @param {React.ReactNode} [props.leadingIcon]
 * @param {React.ReactNode} [props.trailingIcon]
 * @param {boolean} [props.required=false]
 * @param {string}  [props.className]   — applied to wrapper div
 * @param {string}  [props.inputClassName] — applied directly to <input>
 * @param {string}  [props.id]          — auto-generated if omitted
 */
const Input = forwardRef(function Input(
  {
    type = 'text',
    label,
    placeholder,
    helperText,
    errorMessage,
    successMessage,
    disabled = false,
    leadingIcon,
    trailingIcon,
    required = false,
    className,
    inputClassName,
    id: idProp,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const helpId = `${id}-help`;

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const isSearch = type === 'search';

  const hasError = hasContent(errorMessage);
  const hasSuccess = hasContent(successMessage) && !hasError;

  const resolvedType = isPassword
    ? showPassword ? 'text' : 'password'
    : type;

  // Determine padding adjustments for icons
  const paddingLeft = leadingIcon || isSearch ? 'pl-9' : 'px-3';
  const paddingRight =
    isPassword || trailingIcon || hasError || hasSuccess ? 'pr-9' : 'pr-3';

  const statusIcon = hasError ? (
    <AlertCircle className="w-4 h-4 text-danger-DEFAULT" aria-hidden="true" />
  ) : hasSuccess ? (
    <CheckCircle2 className="w-4 h-4 text-success-DEFAULT" aria-hidden="true" />
  ) : null;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-secondary-700"
        >
          {label}
          {required && (
            <span className="ml-1 text-danger-DEFAULT" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Leading icon / search icon */}
        {(leadingIcon || isSearch) && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-textMuted">
            {isSearch
              ? <Search className="w-4 h-4" aria-hidden="true" />
              : leadingIcon}
          </span>
        )}

        <input
          ref={ref}
          id={id}
          type={resolvedType}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasContent(helperText) || hasError || hasSuccess ? helpId : undefined}
          className={cn(
            getInputClasses({ hasError, hasSuccess, disabled }),
            'h-9',
            paddingLeft,
            paddingRight,
            'py-0',
            inputClassName
          )}
          {...rest}
        />

        {/* Trailing area — password toggle, status icon, or custom trailing icon */}
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="text-textMuted hover:text-textPrimary focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword
                ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          ) : statusIcon ? (
            statusIcon
          ) : trailingIcon ? (
            <span className="pointer-events-none text-textMuted">{trailingIcon}</span>
          ) : null}
        </span>
      </div>

      {/* Helper / error / success text */}
      {(hasContent(helperText) || hasError || hasSuccess) && (
        <p
          id={helpId}
          className={cn(
            'text-xs leading-relaxed',
            hasError ? 'text-danger-DEFAULT' : hasSuccess ? 'text-success-DEFAULT' : 'text-textMuted'
          )}
          role={hasError ? 'alert' : undefined}
        >
          {hasError ? errorMessage : hasSuccess ? successMessage : helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
export default Input;
