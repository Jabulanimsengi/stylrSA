// frontend/src/app/before-after/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoadingSpinner from '@/components/LoadingSpinner';
import BeforeAfterPageClient from './BeforeAfterPageClient';

export const metadata: Metadata = {
    title: 'Before & After Transformations | Hair Pros Directory',
    description: 'Browse stunning before and after hair transformations from top salons. See real results and find your next stylist.',
    openGraph: {
        title: 'Before & After Transformations | Hair Pros Directory',
        description: 'Browse stunning before and after hair transformations from top salons.',
        type: 'website',
    },
};

export default function BeforeAfterPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <BeforeAfterPageClient />
        </Suspense>
    );
}
