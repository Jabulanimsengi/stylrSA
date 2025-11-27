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
      
      // Clean up old zoom settings that were causing CLS issues
      // This removes any stored zoom preferences from previous versions
      cleanupZoomSettings();
    } catch (error) {
      // Silently fail if initialization fails (e.g., chunk loading error)
      console.warn('ClientInit failed to initialize:', error);
    }
  }, []);

  return null;
}

/**
 * Remove old zoom settings from localStorage and any injected zoom styles
 * This fixes CLS (Cumulative Layout Shift) issues caused by the old zoom feature
 */
function cleanupZoomSettings() {
  if (typeof window === 'undefined') return;
  
  try {
    // Remove old zoom localStorage items
    localStorage.removeItem('desktop-zoom-level');
    localStorage.removeItem('desktop-zoom-applied');
    localStorage.removeItem('desktop-zoom-browser');
    
    // Remove any injected zoom style element
    const zoomStyle = document.getElementById('desktop-zoom-style');
    if (zoomStyle) {
      zoomStyle.remove();
    }
    
    // Reset any inline zoom on html element
    const html = document.documentElement;
    if (html.style.zoom) {
      html.style.zoom = '';
    }
  } catch (e) {
    // Silently fail if cleanup fails
  }
}
