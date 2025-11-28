/**
 * useKeyPress Hook
 * 
 * Detects when a specific key is pressed.
 * Great for keyboard shortcuts and accessibility.
 * 
 * Usage:
 * ```ts
 * // Close modal on Escape
 * useKeyPress('Escape', () => setIsOpen(false));
 * 
 * // Submit on Enter
 * useKeyPress('Enter', handleSubmit, { ctrlKey: true });
 * ```
 */

import { useEffect, useCallback } from 'react';

interface KeyPressOptions {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyPress(
  targetKey: string,
  handler: (event: KeyboardEvent) => void,
  options: KeyPressOptions = {}
): void {
  const {
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
    metaKey = false,
    enabled = true,
    preventDefault = false,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const keyMatches = event.key === targetKey || event.code === targetKey;
      const modifiersMatch =
        event.ctrlKey === ctrlKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey &&
        event.metaKey === metaKey;

      if (keyMatches && modifiersMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        handler(event);
      }
    },
    [targetKey, handler, ctrlKey, shiftKey, altKey, metaKey, enabled, preventDefault]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * useEscapeKey Hook
 * 
 * Convenience hook for handling Escape key press.
 * 
 * Usage:
 * ```ts
 * useEscapeKey(() => closeModal());
 * ```
 */
export function useEscapeKey(
  handler: () => void,
  enabled: boolean = true
): void {
  useKeyPress('Escape', handler, { enabled });
}

/**
 * useKeyboardShortcut Hook
 * 
 * Register multiple keyboard shortcuts at once.
 * 
 * Usage:
 * ```ts
 * useKeyboardShortcuts({
 *   'ctrl+s': () => save(),
 *   'ctrl+z': () => undo(),
 *   'Escape': () => close(),
 * });
 * ```
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const modifiers: string[] = [];
      if (event.ctrlKey) modifiers.push('ctrl');
      if (event.shiftKey) modifiers.push('shift');
      if (event.altKey) modifiers.push('alt');
      if (event.metaKey) modifiers.push('meta');

      const key = event.key.toLowerCase();
      const shortcut = [...modifiers, key].join('+');

      // Check for exact match or key-only match
      const handler = shortcuts[shortcut] || shortcuts[event.key];
      
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

export default useKeyPress;
