'use client';

import { useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { applyDefaultZoomOnLogin, removeZoom, getBrowserInfo } from '@/lib/browserZoom';

export default function ZoomHandler() {
  const { authStatus } = useAuthContext();
  const isAuthenticated = authStatus === 'authenticated';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const body = document.body;
    
    // Set data attribute for styling
    if (isAuthenticated) {
      body.setAttribute('data-auth', 'true');
    } else {
      body.removeAttribute('data-auth');
    }

    // Apply zoom level for desktop browsers (all users, not just authenticated)
    // This ensures the site fits properly on screen from the first visit
    const browserInfo = getBrowserInfo();
    if (browserInfo.isDesktop) {
      // Apply zoom immediately for all desktop users
      // This prevents the "zoomed in 100%" issue
      applyDefaultZoomOnLogin();
    } else {
      // Remove zoom on mobile devices
      removeZoom();
    }
  }, [isAuthenticated]);

  // Run on mount to handle initial page load immediately
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const browserInfo = getBrowserInfo();
    if (browserInfo.isDesktop) {
      // Apply zoom immediately on page load for desktop
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        applyDefaultZoomOnLogin();
      });
    } else {
      removeZoom();
    }
  }, []); // Run once on mount

  return null; // This component doesn't render anything
}
