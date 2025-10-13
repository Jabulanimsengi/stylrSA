import type { Metadata } from 'next';

type Props = {
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

export default async function Head({ params }: Props) {
  const { id } = await params;
  const salon = await fetchSalon(id);

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
        url: `https://thesalonhub.com/salons/${salon.id}`,
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
      }
    : null;

  return (
    <>
      <title>{salon ? `${salon.name} - Stylr SA` : 'Salon - Stylr SA'}</title>
      <meta
        name="description"
        content={
          salon
            ? `Find the best beauty services at ${salon.name} in ${salon.city}. Book online today!`
            : 'Discover salons and book beauty services online.'
        }
      />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}
