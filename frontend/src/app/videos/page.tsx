// frontend/src/app/videos/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoadingSpinner from '@/components/LoadingSpinner';
import VideosPageClient from './VideosPageClient';

export const metadata: Metadata = {
    title: 'Service Videos | Hair Pros Directory',
    description: 'Watch service videos from top salons and stylists. See hair transformations, styling techniques, and salon services in action.',
    openGraph: {
        title: 'Service Videos | Hair Pros Directory',
        description: 'Watch service videos from top salons and stylists.',
        type: 'website',
    },
};

export default function VideosPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <VideosPageClient />
        </Suspense>
    );
}
