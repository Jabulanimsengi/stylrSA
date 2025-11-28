/**
 * useClickOutside Hook
 * 
 * Detects clicks outside of a referenced element.
 * Perfect for closing dropdowns, modals, and menus.
 * 
 * Usage:
 * ```ts
 * const dropdownRef = useRef<HTMLDivElement>(null);
 * useClickOutside(dropdownRef, () => setIsOpen(false));
 * 
 * return (
 *   <div ref={dropdownRef}>
 *     {isOpen && <DropdownContent />}
 *   </div>
 * );
 * ```
 */

import { useEffect, RefObject } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}

/**
 * useClickOutsideMultiple Hook
 * 
 * Same as useClickOutside but supports multiple refs.
 * Useful when you have a trigger button and a dropdown that are separate elements.
 * 
 * Usage:
 * ```ts
 * const buttonRef = useRef<HTMLButtonElement>(null);
 * const dropdownRef = useRef<HTMLDivElement>(null);
 * 
 * useClickOutsideMultiple([buttonRef, dropdownRef], () => setIsOpen(false));
 * ```
 */
export function useClickOutsideMultiple<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T>[],
  handler: Handler,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      // Check if click is inside any of the refs
      const isInside = refs.some((ref) => {
        const el = ref?.current;
        return el && el.contains(event.target as Node);
      });

      if (!isInside) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refs, handler, enabled]);
}

export default useClickOutside;
