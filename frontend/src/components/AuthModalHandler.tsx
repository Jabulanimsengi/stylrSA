'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthModal } from '@/context/AuthModalContext';
import { useAuth } from '@/hooks/useAuth';

/**
 * Component that handles automatic opening of auth modal based on URL parameters
 * Usage: ?auth=login or ?auth=register
 */
export default function AuthModalHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openModal } = useAuthModal();
  const { authStatus } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Don't open modal if user is already authenticated
    if (authStatus === 'authenticated') {
      // Clean up URL if auth param exists
      const authParam = searchParams.get('auth');
      if (authParam) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('auth');
        
        const newUrl = params.toString() 
          ? `${window.location.pathname}?${params.toString()}`
          : window.location.pathname;
        
        router.replace(newUrl, { scroll: false });
      }
      return;
    }

    const authParam = searchParams.get('auth');
    
    // Only process once to avoid reopening modal
    if ((authParam === 'login' || authParam === 'register') && !hasProcessed.current) {
      hasProcessed.current = true;
      
      // Open the appropriate modal
      openModal(authParam);
      
      // Clean up URL by removing the auth parameter
      const params = new URLSearchParams(searchParams.toString());
      params.delete('auth');
      
      const newUrl = params.toString() 
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      
      // Replace URL without reloading the page
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router, openModal, authStatus]);

  return null; // This component doesn't render anything
}
