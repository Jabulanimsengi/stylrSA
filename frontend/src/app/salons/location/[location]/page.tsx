import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocationPageClient from './LocationPageClient';
import { PROVINCES, getProvinceInfo } from '@/lib/locationData';

interface PageProps {
    params: Promise<{
        location: string;
    }>;
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

    return <LocationPageClient />;
}
