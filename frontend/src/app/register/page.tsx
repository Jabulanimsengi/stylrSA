'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RegisterContent() {
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Redirecting...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

