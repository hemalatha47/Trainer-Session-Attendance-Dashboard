/**
 * Select.jsx
 * Reusable native <select> component (Module 3.2, Task 6).
 *
 * Features : label, placeholder (empty first option), options array,
 *            error state, loading state, disabled state,
 *            accessible markup, consistent design token usage.
 *
 * Note: This is a native <select> for V1 (accessible by default).
 * A searchable/multi-select Combobox can be added in a future module
 * without changing this component's interface — callers would switch
 * to `<Combobox>` explicitly.
 */

import { forwardRef, useId } from 'react';
import { ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { cn, hasContent } from '@utils/componentUtils';

const getSelectClasses = ({ hasError, disabled }) => {
  const base =
    'block w-full appearance-none rounded-md border bg-white text-sm text-textPrimary ' +
    'transition-colors duration-150 outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-offset-0 ' +
    'h-9 pl-3 pr-9 py-0';

  if (disabled) {
    return cn(base, 'border-border bg-neutral-50 text-textMuted cursor-not-allowed opacity-60');
  }
  if (hasError) {
    return cn(base, 'border-danger-DEFAULT focus-visible:ring-danger-DEFAULT/30');
  }
  return cn(base, 'border-border focus-visible:border-accent-600 focus-visible:ring-accent-600/25');
};

/**
 * @param {object}  props
 * @param {string}  [props.label]
 * @param {string}  [props.placeholder]      — renders as a disabled first option
 * @param {Array<{value: string, label: string, disabled?: boolean}>} [props.options=[]]
 * @param {string}  [props.helperText]
 * @param {string}  [props.errorMessage]
 * @param {boolean} [props.loading=false]    — shows spinner instead of chevron
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.required=false]
 * @param {string}  [props.className]        — wrapper
 * @param {string}  [props.id]
 */
const Select = forwardRef(function Select(
  {
    label,
    placeholder,
    options = [],
    helperText,
    errorMessage,
    loading = false,
    disabled = false,
    required = false,
    className,
    id: idProp,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const helpId = `${id}-help`;

  const hasError = hasContent(errorMessage);
  const isDisabled = disabled || loading;

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

      {/* Select wrapper */}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          disabled={isDisabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasContent(helperText) || hasError ? helpId : undefined}
          className={getSelectClasses({ hasError, disabled: isDisabled })}
          {...rest}
        >
          {/* Placeholder */}
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {/* Options */}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron / spinner */}
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-textMuted">
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            : hasError
              ? <AlertCircle className="w-4 h-4 text-danger-DEFAULT" aria-hidden="true" />
              : <ChevronDown className="w-4 h-4" aria-hidden="true" />
          }
        </span>
      </div>

      {/* Helper / error text */}
      {(hasContent(helperText) || hasError) && (
        <p
          id={helpId}
          role={hasError ? 'alert' : undefined}
          className={cn('text-xs leading-relaxed', hasError ? 'text-danger-DEFAULT' : 'text-textMuted')}
        >
          {hasError ? errorMessage : helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export { Select };
export default Select;
