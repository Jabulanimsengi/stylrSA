/**
 * Class Name Utility
 * 
 * Combines class names conditionally, similar to clsx/classnames.
 * 
 * Usage:
 * ```ts
 * cn('base-class', isActive && 'active', { 'disabled': isDisabled })
 * // => 'base-class active' (if isActive is true and isDisabled is false)
 * ```
 */

type ClassValue = 
  | string 
  | number 
  | boolean 
  | undefined 
  | null 
  | ClassValue[] 
  | Record<string, boolean | undefined | null>;

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}

export default cn;
