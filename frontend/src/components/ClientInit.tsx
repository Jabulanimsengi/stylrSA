"use client";

import { useEffect } from 'react';
import { setupPortalErrorHandling } from '@/lib/portalUtils';

/**
 * Client-side initialization component
 * Sets up error handling and cleanup for portals and other client-side features
 */
export default function ClientInit() {
  useEffect(() => {
    // Set up portal error handling to prevent crashes
    setupPortalErrorHandling();
  }, []);

  return null;
}
