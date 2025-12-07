import type { Metadata } from 'next';

type Sanitizable = string | null | undefined;

const normalizeText = (value: Sanitizable) => {
  if (!value) return undefined;
  return value
    .replace(/\s+/g, ' ')
    .replace(/[\u0000-\u001F\u007F<>]/g, '')
    .trim();
};

const ensureAbsoluteUrl = (baseUrl: string, url: Sanitizable) => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${normalized}`;
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

async function fetchSalon(id: string) {
  try {
    // ISR: Revalidate every 1 hour to reduce ISR writes while keeping content fresh
    // This serves fast static pages while updating in the background
    const res = await fetch(`/api/salons/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const salon = await fetchSalon(id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
  // Use slug for canonical URL if available for better SEO
  const canonicalUrl = `${siteUrl}/salons/${salon?.slug || id}`;

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
  // Use slug for URLs if available for better SEO
  const salonIdentifier = salon?.slug || id;
  const businessId = `${siteUrl}/salons/${salonIdentifier}#localbusiness`;

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
        item: `${siteUrl}/salons/${salon.slug || salon.id}`,
      },
    ],
  } : null;

  const reviews: Array<{
    id: string;
    rating: number;
    comment?: string | null;
    createdAt?: string;
    author?: { firstName?: string | null; lastName?: string | null } | null;
  }> = Array.isArray(salon?.reviews) ? salon.reviews : [];

  const reviewCount = typeof salon?.reviewCount === 'number'
    ? salon.reviewCount
    : reviews.length;

  const computedAvgRating = (() => {
    if (typeof salon?.avgRating === 'number' && salon.avgRating > 0) {
      return salon.avgRating;
    }
    if (!reviews.length) return undefined;
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return total > 0 ? total / reviews.length : undefined;
  })();

  const aggregateRating = reviewCount > 0 && computedAvgRating
    ? {
        '@type': 'AggregateRating',
        '@id': `${businessId}#aggregateRating`,
        ratingValue: Number(computedAvgRating.toFixed(1)),
        reviewCount,
        bestRating: 5,
        worstRating: 1,
        itemReviewed: {
          '@id': businessId,
          '@type': 'LocalBusiness',
          name: salon?.name,
        },
      }
    : undefined;

  const reviewEntities = reviewCount > 0
    ? reviews
        .filter((review) => typeof review.rating === 'number' && review.rating > 0)
        .slice(0, 10)
        .map((review) => {
          const authorFirst = normalizeText(review.author?.firstName);
          const authorLastInitial = normalizeText(review.author?.lastName)?.charAt(0) || '';
          const authorName = normalizeText(
            [authorFirst, authorLastInitial ? `${authorLastInitial}.` : undefined]
              .filter(Boolean)
              .join(' ')
          ) || 'Verified Customer';

          const reviewBody = normalizeText(review.comment);

          return {
            '@type': 'Review',
            '@id': `${businessId}-review-${review.id}`,
            datePublished: review.createdAt,
            ...(reviewBody ? { reviewBody } : {}),
            itemReviewed: {
              '@id': businessId,
              '@type': 'LocalBusiness',
            },
            author: {
              '@type': 'Person',
              name: authorName,
            },
            reviewRating: {
              '@type': 'Rating',
              ratingValue: review.rating,
              bestRating: 5,
              worstRating: 1,
            },
          };
        })
    : [];

  const normalizedImages = salon?.heroImages && salon.heroImages.length > 0
    ? salon.heroImages
        .map((img: string) => ensureAbsoluteUrl(siteUrl, img))
        .filter((img): img is string => Boolean(img))
    : salon?.backgroundImage
    ? [ensureAbsoluteUrl(siteUrl, salon.backgroundImage)].filter((img): img is string => Boolean(img))
    : undefined;

  const jsonLd = salon
    ? {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': businessId,
        name: salon.name,
        description: salon.description || undefined,
        image: normalizedImages,
        url: `${siteUrl}/salons/${salon.slug || salon.id}`,
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
        aggregateRating,
        review: reviewEntities.length > 0 ? reviewEntities : undefined,
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
