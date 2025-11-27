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

    return <CityPageClient />;
}
