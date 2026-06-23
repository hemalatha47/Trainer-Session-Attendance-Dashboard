/**
 * Divider.jsx
 * Flexible divider component (Module 3.2, Task 12).
 *
 * Variants : horizontal | vertical | text (label in middle of line)
 * Spacing  : xs | sm | md | lg | xl
 */

import { cn } from '@utils/componentUtils';

const H_SPACING = {
  xs: 'my-1',
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-6',
  xl: 'my-8',
};

const V_SPACING = {
  xs: 'mx-1',
  sm: 'mx-2',
  md: 'mx-4',
  lg: 'mx-6',
  xl: 'mx-8',
};

/**
 * @param {'horizontal'|'vertical'|'text'} [props.orientation='horizontal']
 * @param {string}  [props.label]      — text content for 'text' variant
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.spacing='md']
 * @param {string}  [props.className]
 */
const Divider = ({
  orientation = 'horizontal',
  label,
  spacing = 'md',
  className,
}) => {
  if (orientation === 'vertical') {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        className={cn(
          'inline-block w-px self-stretch bg-border',
          V_SPACING[spacing] ?? V_SPACING.md,
          className
        )}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        className={cn(
          'flex items-center gap-3',
          H_SPACING[spacing] ?? H_SPACING.md,
          className
        )}
      >
        <span className="flex-1 h-px bg-border" aria-hidden="true" />
        <span className="shrink-0 text-xs font-medium text-textMuted uppercase tracking-wide">
          {label}
        </span>
        <span className="flex-1 h-px bg-border" aria-hidden="true" />
      </div>
    );
  }

  return (
    <hr
      role="separator"
      className={cn(
        'border-none h-px bg-border',
        H_SPACING[spacing] ?? H_SPACING.md,
        className
      )}
    />
  );
};

Divider.displayName = 'Divider';

export { Divider };
export default Divider;
