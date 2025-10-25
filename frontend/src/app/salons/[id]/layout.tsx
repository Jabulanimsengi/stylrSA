import type { Metadata } from 'next';

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

async function fetchSalon(id: string) {
  try {
    const res = await fetch(`/api/salons/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const salon = await fetchSalon(id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stylrsa.vercel.app';
  const canonicalUrl = `${siteUrl}/salons/${id}`;

  if (!salon) {
    return {
      title: 'Salon Not Found | Stylr SA',
      description: 'The salon you are looking for could not be found.',
    };
  }

  const title = `${salon.name} - ${salon.city}, ${salon.province} | Stylr SA`;
  const description = salon.description 
    ? `${salon.description.substring(0, 155)}...`
    : `Book appointments at ${salon.name} in ${salon.city}, ${salon.province}. Find professional beauty services including hair styling, nails, and more.`;

  const images = salon.heroImages && salon.heroImages.length > 0
    ? salon.heroImages.slice(0, 3)
    : salon.backgroundImage
    ? [salon.backgroundImage]
    : [`${siteUrl}/logo-transparent.png`];

  return {
    title,
    description,
    keywords: `${salon.name}, salon, beauty, ${salon.city}, ${salon.province}, South Africa, hair salon, nail salon, spa`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Stylr SA',
      type: 'business.business',
      images: images.map(img => ({
        url: img,
        width: 1200,
        height: 630,
        alt: `${salon.name} - Beauty Salon`,
      })),
      locale: 'en_ZA',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  };
}

export default async function SalonLayout({ children, params }: Props) {
  const { id } = await params;
  const salon = await fetchSalon(id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stylrsa.vercel.app';

  const breadcrumbSchema = salon ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Salons',
        item: `${siteUrl}/salons`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: salon.name,
        item: `${siteUrl}/salons/${salon.id}`,
      },
    ],
  } : null;

  const jsonLd = salon
    ? {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: salon.name,
        description: salon.description || undefined,
        image:
          salon.heroImages && salon.heroImages.length > 0
            ? salon.heroImages
            : salon.backgroundImage
            ? [salon.backgroundImage]
            : undefined,
        url: `${siteUrl}/salons/${salon.id}`,
        telephone: salon.phoneNumber || undefined,
        email: salon.contactEmail || undefined,
        address: {
          '@type': 'PostalAddress',
          addressLocality: salon.city,
          addressRegion: salon.province,
          streetAddress: salon.address || `${salon.town || ''}`.trim(),
          addressCountry: 'ZA',
        },
        geo:
          salon.latitude && salon.longitude
            ? {
                '@type': 'GeoCoordinates',
                latitude: salon.latitude,
                longitude: salon.longitude,
              }
            : undefined,
        aggregateRating: salon.avgRating
          ? {
              '@type': 'AggregateRating',
              ratingValue: salon.avgRating,
              reviewCount: salon.reviews?.length || 0,
            }
          : undefined,
        priceRange: '$$',
      }
    : null;

  return (
    <>
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
