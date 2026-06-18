/**
 * Icon.jsx
 * Thin wrapper around lucide-react icons that applies project-wide
 * defaults (stroke width, size) from the THEME token system.
 *
 * Usage:
 *   import { Icon } from '@components/ui/Icon';
 *   <Icon name="dashboard" size="md" className="text-accent-600" />
 *
 * Or pass a component directly (useful when the name lookup isn't needed):
 *   import { Icon } from '@components/ui/Icon';
 *   import { Loader2 } from 'lucide-react';
 *   <Icon component={Loader2} size="sm" className="animate-spin" />
 */

import { ICONS, ICON_SIZES, ICON_STROKE_WIDTH } from '@constants/icons';
import { cn } from '@utils/componentUtils';

/**
 * @param {object}  props
 * @param {string}  [props.name]        — semantic name from ICONS registry
 * @param {React.ComponentType} [props.component] — direct component override
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {number}  [props.strokeWidth] — overrides ICON_STROKE_WIDTH default
 * @param {string}  [props.className]
 * @param {string}  [props.aria-label]
 * @param {boolean} [props.aria-hidden] — defaults to true when no label
 */
const Icon = ({
  name,
  component: ComponentProp,
  size = 'md',
  strokeWidth = ICON_STROKE_WIDTH,
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  ...rest
}) => {
  const Component = ComponentProp ?? ICONS[name];

  if (!Component) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Icon] Unknown icon name: "${name}". Add it to src/constants/icons.js.`);
    }
    return null;
  }

  const px = ICON_SIZES[size] ?? ICON_SIZES.md;
  const hidden = ariaLabel ? undefined : (ariaHidden ?? true);

  return (
    <Component
      width={px}
      height={px}
      strokeWidth={strokeWidth}
      aria-label={ariaLabel}
      aria-hidden={hidden}
      className={cn('shrink-0', className)}
      {...rest}
    />
  );
};

export { Icon };
export default Icon;
