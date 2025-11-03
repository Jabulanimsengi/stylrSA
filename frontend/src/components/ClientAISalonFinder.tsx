'use client';

import dynamic from 'next/dynamic';

// Dynamically import AISalonFinder to avoid SSR issues
const AISalonFinder = dynamic(() => import('./AISalonFinder'), {
  ssr: false,
});

export default function ClientAISalonFinder() {
  return <AISalonFinder />;
}
