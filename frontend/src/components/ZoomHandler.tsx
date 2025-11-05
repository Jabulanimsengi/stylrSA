'use client';

import { useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { applyDefaultZoomOnLogin, removeZoom, shouldApplyZoom } from '@/lib/browserZoom';

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

    // Apply zoom level for desktop browsers on login
    if (shouldApplyZoom(isAuthenticated)) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        applyDefaultZoomOnLogin();
      }, 100);
    } else {
      // Remove zoom when logged out
      removeZoom();
    }
  }, [isAuthenticated]);

  return null; // This component doesn't render anything
}
