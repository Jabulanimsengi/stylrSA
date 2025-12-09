import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CityPageClient from './CityPageClient';
import { getCityInfo } from '@/lib/locationData';

interface PageProps {
    params: Promise<{
        location: string;
        city: string;
    }>;
}

// Fully static - no ISR writes
export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

// Fetch initial salons on server for better LCP (only at build time)
async function getInitialSalons(cityName: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.stylrsa.co.za';
    const isBuildPhase = process.env.IS_BUILD_PHASE === 'true' || process.env.NEXT_PHASE === 'phase-production-build';
    
    // Only skip fetching during build time when API is localhost
    if (isBuildPhase && (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1'))) {
        return [];
    }
    try {
        const res = await fetch(`${apiUrl}/api/salons/approved?city=${encodeURIComponent(cityName)}&limit=12`, {
            cache: 'force-cache', // Static cache - no ISR
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

// Generate all city pages at build time
export async function generateStaticParams() {
    const { getAllLocationCityParams } = await import('@/lib/seo-generation');
    return getAllLocationCityParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { location, city } = await params;
    const cityInfo = getCityInfo(location, city);

    if (!cityInfo) {
        return {
            title: 'City Not Found | Stylr SA',
            description: 'The city you are looking for could not be found.',
        };
    }

    const title = `Best Hair Salons & Spas in ${cityInfo.name}, ${cityInfo.province} | Stylr SA`;
    const description = cityInfo.description;
    const canonicalUrl = `https://www.stylrsa.co.za/salons/location/${location}/${city}`;

    return {
        title,
        description,
        keywords: cityInfo.keywords.join(', '),
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

export default async function CityPage({ params }: PageProps) {
    const { location, city } = await params;
    const cityInfo = getCityInfo(location, city);

    if (!cityInfo) {
        notFound();
    }

    // Fetch initial data on server for faster LCP
    const initialSalons = await getInitialSalons(cityInfo.name);

    return <CityPageClient initialSalons={initialSalons} cityInfo={cityInfo} />;
}
