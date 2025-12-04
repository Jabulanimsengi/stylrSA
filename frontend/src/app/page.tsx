import type { Metadata } from 'next';
import Script from 'next/script';
import HomePageClient from './HomePageClient';
import { Service, Trend, TrendCategory } from '@/types';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

// Generate metadata for homepage
export const metadata: Metadata = {
  title: 'Stylr SA - South Africa\'s Premier Beauty & Wellness Platform',
  description: 'Discover and book appointments at South Africa\'s top-rated salons, spas, and beauty professionals. Browse services, read reviews, and book online instantly.',
  keywords: 'salon booking South Africa, beauty services, hair salon, nail salon, spa, makeup artist, braiding, barbershop, wellness, Johannesburg, Cape Town, Durban, Pretoria',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Stylr SA - Book Beauty & Wellness Services Online',
    description: 'South Africa\'s premier platform for discovering and booking beauty services. Connect with top-rated salons and professionals.',
    url: siteUrl,
    siteName: 'Stylr SA',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/logo-transparent.png`,
        width: 1200,
        height: 630,
        alt: 'Stylr SA - Beauty & Wellness Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stylr SA - Book Beauty Services Online',
    description: 'Discover South Africa\'s top salons, spas, and beauty professionals',
    images: [`${siteUrl}/logo-transparent.png`],
  },
};

type ServiceWithSalon = Service & { salon: { id: string; name: string, city: string, province: string } };

// Fetch initial data server-side
async function getInitialData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:5000';
  const isBuildPhase = process.env.IS_BUILD_PHASE === 'true' || process.env.NEXT_PHASE === 'phase-production-build';
  
  // Only skip fetching during build time when API is localhost
  if (isBuildPhase && (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1'))) {
    return {
      services: [] as ServiceWithSalon[],
      trends: {} as Record<TrendCategory, Trend[]>,
      hasMore: false,
      totalPages: 1,
    };
  }
  
  try {
    // Fetch initial services - 5 minute revalidation to reduce ISR writes
    const servicesRes = await fetch(`${apiUrl}/api/services/approved?page=1&pageSize=24`, {
      next: { revalidate: 300 },
    });
    
    const servicesData = servicesRes.ok 
      ? await servicesRes.json() 
      : { services: [], currentPage: 1, totalPages: 1 };

    // Fetch trends - 5 minute revalidation
    const trendsRes = await fetch(`${apiUrl}/api/trends`, {
      next: { revalidate: 300 },
    });
    
    const trendsData = trendsRes.ok 
      ? await trendsRes.json() 
      : {} as Record<TrendCategory, Trend[]>;

    // Sort trends by view count
    const sortedTrends: Record<TrendCategory, Trend[]> = {} as Record<TrendCategory, Trend[]>;
    Object.keys(trendsData).forEach((category) => {
      const categoryKey = category as TrendCategory;
      const trends = trendsData[categoryKey] as Trend[];
      sortedTrends[categoryKey] = trends.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    });

    return {
      services: servicesData.services as ServiceWithSalon[],
      trends: sortedTrends,
      hasMore: servicesData.currentPage < servicesData.totalPages,
      totalPages: servicesData.totalPages,
    };
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    return {
      services: [] as ServiceWithSalon[],
      trends: {} as Record<TrendCategory, Trend[]>,
      hasMore: false,
      totalPages: 1,
    };
  }
}

export default async function HomePage() {
  const initialData = await getInitialData();

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: 'Stylr SA',
    legalName: 'Stylr South Africa',
    alternateName: ['stylrsa', 'Stylr', 'Stylr South Africa'],
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      '@id': `${siteUrl}/#logo`,
      url: `${siteUrl}/logo-transparent.png`,
      width: '800',
      height: '600',
      caption: 'Stylr SA Logo',
    },
    image: `${siteUrl}/logo-transparent.png`,
    description: 'South Africa\'s premier platform for discovering and booking beauty services. Connect with top-rated salons, hair stylists, braiders, nail technicians, makeup artists, and wellness professionals across South Africa.',
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'ZA',
      addressRegion: 'Gauteng',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['en', 'zu', 'xh', 'af'],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '50000',
      bestRating: '5',
      worstRating: '1',
    },
    areaServed: {
      '@type': 'Country',
      name: 'South Africa',
    },
  };

  // WebSite Schema with search action
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: 'Stylr SA',
    alternateName: 'stylrsa.co.za',
    description: 'Book beauty services online - Find salons, stylists, and beauty professionals in South Africa',
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/salons?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    ],
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        strategy="afterInteractive"
      />

      {/* Client Component with server-rendered initial data */}
      <HomePageClient 
        initialServices={initialData.services}
        initialTrends={initialData.trends}
        initialHasMore={initialData.hasMore}
        initialTotalPages={initialData.totalPages}
      />
    </>
  );
}
