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

  // Don't render anything - just redirect
  return null;
}
