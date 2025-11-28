'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import styles from './LiveRegion.module.css';

interface LiveRegionContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const LiveRegionContext = createContext<LiveRegionContextType | null>(null);

/**
 * Live Region Provider
 * 
 * Provides accessible announcements for screen readers.
 * Wrap your app with this provider to enable announcements.
 * 
 * Usage:
 * ```tsx
 * // In layout.tsx
 * <LiveRegionProvider>
 *   {children}
 * </LiveRegionProvider>
 * 
 * // In any component
 * const { announce } = useLiveRegion();
 * announce('Item added to cart');
 * ```
 */
export function LiveRegionProvider({ children }: { children: ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveMessage('');
      // Small delay to ensure screen readers pick up the change
      setTimeout(() => setAssertiveMessage(message), 100);
    } else {
      setPoliteMessage('');
      setTimeout(() => setPoliteMessage(message), 100);
    }
  }, []);

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      {/* Polite announcements - read when user is idle */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {politeMessage}
      </div>
      {/* Assertive announcements - interrupt current speech */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  );
}

/**
 * Hook to access live region announcements
 */
export function useLiveRegion(): LiveRegionContextType {
  const context = useContext(LiveRegionContext);
  
  if (!context) {
    // Return a no-op if provider is not available
    return {
      announce: () => {
        console.warn('LiveRegionProvider not found. Wrap your app with <LiveRegionProvider>');
      },
    };
  }
  
  return context;
}

export default LiveRegionProvider;
