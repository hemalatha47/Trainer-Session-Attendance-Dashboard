/**
 * DateSelector.jsx
 * Date picker for Attendance Session Setup.
 * Module: 6.2, Task 4.
 *
 * Uses native <input type="date"> styled via Input component pattern.
 * Enforces local-date-safe value format (YYYY-MM-DD).
 * Applies min/max constraints from the selected batch.
 */

import { useId }    from 'react';
import { Calendar } from 'lucide-react';
import { cn }       from '@utils/componentUtils';
import { getToday, formatDate } from '@utils/dateUtils';

// ── Styles (mirrors Input component pattern for visual consistency) ──────────

const getDateInputClasses = ({ hasError, disabled }) => {
  const base =
    'block w-full rounded-md border bg-white text-sm text-textPrimary ' +
    'transition-colors duration-150 outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-offset-0 ' +
    'h-9 pl-9 pr-3 py-0';

  if (disabled) return cn(base, 'border-border bg-neutral-50 text-textMuted cursor-not-allowed opacity-60');
  if (hasError) return cn(base, 'border-danger-DEFAULT focus-visible:ring-danger-DEFAULT/30');
  return cn(base, 'border-border focus-visible:border-accent-600 focus-visible:ring-accent-600/25');
};

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {string}  props.value            - YYYY-MM-DD
 * @param {function} props.onChange        - (date: string) => void
 * @param {string}  [props.minDate]        - Batch start date (YYYY-MM-DD)
 * @param {string}  [props.maxDate]        - Batch end date or today (YYYY-MM-DD)
 * @param {boolean} [props.disabled=false] - Disable until a batch is selected
 * @param {string}  [props.errorMessage]
 * @param {string}  [props.helperText]
 */
const DateSelector = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  errorMessage,
  helperText,
}) => {
  const id     = useId();
  const helpId = `${id}-help`;
  const today  = getToday();

  // Cap maxDate to today (cannot mark future attendance unless explicitly allowed)
  const effectiveMax = maxDate
    ? (maxDate < today ? maxDate : today)
    : today;

  const hasError = !!errorMessage;

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-secondary-700">
        Session Date
        <span className="ml-1 text-danger-DEFAULT" aria-hidden="true">*</span>
      </label>

      <div className="relative">
        {/* Calendar icon */}
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-textMuted">
          <Calendar className="w-4 h-4" aria-hidden="true" />
        </span>

        <input
          id={id}
          type="date"
          value={value}
          min={minDate}
          max={effectiveMax}
          disabled={disabled}
          onChange={handleChange}
          aria-invalid={hasError}
          aria-describedby={errorMessage || helperText ? helpId : undefined}
          className={getDateInputClasses({ hasError, disabled })}
        />
      </div>

      {/* Helper / error text */}
      {(errorMessage || helperText) && (
        <p
          id={helpId}
          role={hasError ? 'alert' : undefined}
          className={cn(
            'text-xs leading-relaxed',
            hasError ? 'text-danger-DEFAULT' : 'text-textMuted'
          )}
        >
          {hasError ? errorMessage : helperText}
        </p>
      )}
    </div>
  );
};

DateSelector.displayName = 'DateSelector';

export default DateSelector;
