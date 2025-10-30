'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthModal } from '@/context/AuthModalContext';

/**
 * Component that handles automatic opening of auth modal based on URL parameters
 * Usage: ?auth=login or ?auth=register
 */
export default function AuthModalHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openModal } = useAuthModal();

  useEffect(() => {
    const authParam = searchParams.get('auth');
    
    if (authParam === 'login' || authParam === 'register') {
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
  }, [searchParams, router, openModal]);

  return null; // This component doesn't render anything
}
