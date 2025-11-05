"use client";

import { useEffect } from 'react';
import { setupPortalErrorHandling } from '@/lib/portalUtils';

/**
 * Client-side initialization component
 * Sets up error handling and cleanup for portals and other client-side features
 */
export default function ClientInit() {
  useEffect(() => {
    try {
      // Set up portal error handling to prevent crashes
      setupPortalErrorHandling();
    } catch (error) {
      // Silently fail if initialization fails (e.g., chunk loading error)
      console.warn('ClientInit failed to initialize:', error);
    }
  }, []);

  return null;
}
