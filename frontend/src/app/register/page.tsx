'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect to home page with register modal open
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    router.replace(`/?auth=register&redirect=${encodeURIComponent(callbackUrl)}`);
  }, [router, searchParams]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      color: 'var(--color-text-muted)'
    }}>
      <p>Redirecting to registration...</p>
    </div>
  );
}
