'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect to home page with login modal open
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    router.replace(`/?auth=login&redirect=${encodeURIComponent(callbackUrl)}`);
  }, [router, searchParams]);

  // Don't render anything - just redirect
  return null;
}