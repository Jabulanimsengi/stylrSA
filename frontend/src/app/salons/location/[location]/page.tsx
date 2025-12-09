import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocationPageClient from './LocationPageClient';
import { getProvinceInfo } from '@/lib/locationData';

interface PageProps {
    params: Promise<{
        location: string;
    }>;
}

// Fully static - no ISR writes
export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

// Fetch initial salons on server for better LCP (only at build time)
async function getInitialSalons(provinceName: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.stylrsa.co.za';
    const isBuildPhase = process.env.IS_BUILD_PHASE === 'true' || process.env.NEXT_PHASE === 'phase-production-build';
    
    // Only skip fetching during build time when API is localhost
    if (isBuildPhase && (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1'))) {
        return [];
    }
    try {
        const res = await fetch(`${apiUrl}/api/salons/approved?province=${encodeURIComponent(provinceName)}&limit=12`, {
            cache: 'force-cache', // Static cache - no ISR
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

// Generate all province pages at build time
export async function generateStaticParams() {
    const { getAllProvinceParams } = await import('@/lib/seo-generation');
    return getAllProvinceParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { location } = await params;
    const provinceInfo = getProvinceInfo(location);

    if (!provinceInfo) {
        return {
            title: 'Location Not Found | Stylr SA',
            description: 'The location you are looking for could not be found.',
        };
    }

    const title = `Best Hair Salons & Spas in ${provinceInfo.name} | Stylr SA`;
    const description = provinceInfo.description;
    const canonicalUrl = `https://www.stylrsa.co.za/salons/location/${location}`;

    return {
        title,
        description,
        keywords: provinceInfo.keywords.join(', '),
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'Stylr SA',
            locale: 'en_ZA',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    };
}

export default async function LocationPage({ params }: PageProps) {
    const { location } = await params;
    const provinceInfo = getProvinceInfo(location);

    if (!provinceInfo) {
        notFound();
    }

    // Fetch initial data on server for faster LCP
    const initialSalons = await getInitialSalons(provinceInfo.name);

    return <LocationPageClient initialSalons={initialSalons} provinceInfo={provinceInfo} />;
}
