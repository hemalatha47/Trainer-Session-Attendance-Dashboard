/**
 * Radio.jsx
 * Reusable Radio button + RadioGroup components (Module 3.2, Task 8).
 *
 * RadioGroup   : renders a fieldset with legend, manages group name.
 * Radio        : individual radio option with label/description/disabled support.
 *
 * Accessibility: uses <fieldset>/<legend> for group context; each radio
 * has a unique id linked to its <label>; aria-describedby for descriptions.
 */

import { forwardRef, useId } from 'react';
import { cn, hasContent } from '@utils/componentUtils';

// ── Radio (single option) ────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {string}  props.name          — radio group name (inherited from RadioGroup)
 * @param {string}  props.value         — this option's value
 * @param {string}  [props.label]
 * @param {string}  [props.description]
 * @param {boolean} [props.checked]
 * @param {boolean} [props.disabled=false]
 * @param {function} [props.onChange]
 * @param {string}  [props.className]
 * @param {string}  [props.id]
 */
const Radio = forwardRef(function Radio(
  {
    name,
    value,
    label,
    description,
    checked,
    disabled = false,
    onChange,
    className,
    id: idProp,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const descId = description ? `${id}-desc` : undefined;

  const dotBase =
    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full ' +
    'border transition-colors duration-150 ' +
    'focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-accent-600';

  const dotState = disabled
    ? 'border-border bg-neutral-100 cursor-not-allowed'
    : checked
      ? 'border-accent-600 bg-white'
      : 'border-border bg-white hover:border-accent-400';

  return (
    <label
      className={cn(
        'flex items-start gap-2.5',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        className
      )}
    >
      <input
        ref={ref}
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-describedby={descId}
        className="sr-only"
        {...rest}
      />

      {/* Custom radio dot */}
      <span className={cn(dotBase, dotState)} aria-hidden="true">
        {checked && (
          <span className="h-2 w-2 rounded-full bg-accent-600 transition-transform duration-150 scale-100" />
        )}
      </span>

      {(label || description) && (
        <span className="flex flex-col gap-0.5 leading-none">
          {label && (
            <span className="text-sm font-medium text-secondary-800">{label}</span>
          )}
          {description && (
            <span id={descId} className="text-xs text-textMuted leading-relaxed">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
});

Radio.displayName = 'Radio';

// ── RadioGroup ───────────────────────────────────────────────────────────────

/**
 * @param {object}        props
 * @param {string}        props.name           — shared name for all radios in the group
 * @param {string}        [props.legend]       — group label rendered as <legend>
 * @param {string}        [props.errorMessage]
 * @param {string}        [props.helperText]
 * @param {React.ReactNode} props.children     — <Radio> elements
 * @param {'vertical'|'horizontal'} [props.orientation='vertical']
 * @param {string}        [props.className]
 */
const RadioGroup = ({
  name,
  legend,
  errorMessage,
  helperText,
  children,
  orientation = 'vertical',
  className,
}) => {
  const errId = useId();
  const hasError = hasContent(errorMessage);

  return (
    <fieldset
      className={cn('border-none p-0 m-0', className)}
      aria-describedby={hasError ? errId : undefined}
    >
      {legend && (
        <legend className="mb-2 text-sm font-medium text-secondary-700">{legend}</legend>
      )}

      <div
        className={cn(
          'flex gap-3',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}
        role="radiogroup"
      >
        {/* Inject name into each Radio child */}
        {Array.isArray(children)
          ? children.map((child, i) =>
              child ? { ...child, props: { ...child.props, name } } : child
            )
          : children}
      </div>

      {(hasError || hasContent(helperText)) && (
        <p
          id={hasError ? errId : undefined}
          role={hasError ? 'alert' : undefined}
          className={cn('mt-1.5 text-xs', hasError ? 'text-danger-DEFAULT' : 'text-textMuted')}
        >
          {hasError ? errorMessage : helperText}
        </p>
      )}
    </fieldset>
  );
};

RadioGroup.displayName = 'RadioGroup';

export { Radio, RadioGroup };
export default Radio;
