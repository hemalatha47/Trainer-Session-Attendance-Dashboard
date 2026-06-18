/**
 * Checkbox.jsx
 * Reusable checkbox component (Module 3.2, Task 7).
 *
 * Features : label, description text, checked/unchecked/indeterminate,
 *            disabled state, error state, full keyboard + accessibility support.
 */

import { forwardRef, useId } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn, hasContent } from '@utils/componentUtils';

/**
 * @param {object}  props
 * @param {string}  [props.label]
 * @param {string}  [props.description]  — secondary line beneath label
 * @param {boolean} [props.checked]
 * @param {boolean} [props.indeterminate] — visual "minus" state (select-all)
 * @param {boolean} [props.disabled=false]
 * @param {string}  [props.errorMessage]
 * @param {boolean} [props.required=false]
 * @param {string}  [props.className]   — wrapper
 * @param {string}  [props.id]
 * @param {function} [props.onChange]
 */
const Checkbox = forwardRef(function Checkbox(
  {
    label,
    description,
    checked,
    indeterminate = false,
    disabled = false,
    errorMessage,
    required = false,
    className,
    id: idProp,
    onChange,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const descId = description ? `${id}-desc` : undefined;
  const errId = errorMessage ? `${id}-err` : undefined;

  const hasError = hasContent(errorMessage);

  const boxBase =
    'flex h-4 w-4 shrink-0 items-center justify-center rounded ' +
    'border transition-colors duration-150 outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-accent-600';

  const boxState = disabled
    ? 'border-border bg-neutral-100 cursor-not-allowed'
    : hasError
      ? 'border-danger-DEFAULT'
      : checked || indeterminate
        ? 'border-accent-600 bg-accent-600'
        : 'border-border bg-white hover:border-accent-400';

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label
        className={cn(
          'flex items-start gap-2.5',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        )}
      >
        {/* Hidden native checkbox */}
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          required={required}
          onChange={onChange}
          aria-describedby={[descId, errId].filter(Boolean).join(' ') || undefined}
          aria-invalid={hasError}
          className="sr-only"
          {...rest}
        />

        {/* Custom visual box */}
        <span className={cn(boxBase, boxState)} aria-hidden="true">
          {indeterminate && !checked && (
            <Minus className="w-2.5 h-2.5 text-accent-600" strokeWidth={3} />
          )}
          {checked && (
            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
          )}
        </span>

        {/* Label text */}
        {(label || description) && (
          <span className="flex flex-col gap-0.5 leading-none">
            {label && (
              <span className="text-sm font-medium text-secondary-800">
                {label}
                {required && <span className="ml-1 text-danger-DEFAULT" aria-hidden="true">*</span>}
              </span>
            )}
            {description && (
              <span id={descId} className="text-xs text-textMuted leading-relaxed">
                {description}
              </span>
            )}
          </span>
        )}
      </label>

      {/* Error */}
      {hasError && (
        <p id={errId} role="alert" className="text-xs text-danger-DEFAULT pl-6">
          {errorMessage}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export default Checkbox;
