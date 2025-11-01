'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Salon detail page error:', error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>We couldn't load the salon details. Please try again later.</p>
      <button
        onClick={reset}
        style={{
          padding: '12px 24px',
          margin: '1rem',
          background: '#f51957',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
      <Link
        href="/salons"
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          margin: '1rem',
          background: '#333',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
        }}
      >
        ← Back to Salons
      </Link>
    </div>
  );
}
