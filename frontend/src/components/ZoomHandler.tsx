'use client';

import { useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';

export default function ZoomHandler() {
  const { authStatus } = useAuthContext();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const body = document.body;
    
    if (authStatus === 'authenticated') {
      body.setAttribute('data-auth', 'true');
    } else {
      body.removeAttribute('data-auth');
    }
  }, [authStatus]);

  return null; // This component doesn't render anything
}
