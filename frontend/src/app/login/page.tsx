'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Redirecting...</div>}>
      <LoginContent />
    </Suspense>
  );
}