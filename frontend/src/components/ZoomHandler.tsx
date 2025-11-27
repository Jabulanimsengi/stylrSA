'use client';

import { useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';

/**
 * ZoomHandler - Manages auth-related body attributes
 * 
 * NOTE: CSS zoom has been REMOVED to fix CLS (Cumulative Layout Shift) issues.
 * The zoom feature was causing the page to "zoom out then zoom in" during login,
 * which Google flags as a layout shift problem affecting Core Web Vitals.
 * 
 * If you need to adjust the site's visual scale, use CSS font-size or 
 * responsive design techniques instead of zoom.
 */
export default function ZoomHandler() {
  const { authStatus } = useAuthContext();
  const isAuthenticated = authStatus === 'authenticated';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const body = document.body;
    
    // Set data attribute for styling (can be used for auth-specific styles)
    if (isAuthenticated) {
      body.setAttribute('data-auth', 'true');
    } else {
      body.removeAttribute('data-auth');
    }
  }, [isAuthenticated]);

  return null; // This component doesn't render anything
}
