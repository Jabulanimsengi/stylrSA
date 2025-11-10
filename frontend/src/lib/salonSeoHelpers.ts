// SEO helper functions for salon pages

import type { Salon } from '@/types';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

/**
 * Generate LocalBusiness structured data for a salon
 */
export function generateSalonStructuredData(salon: Salon): object {
  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/salons/${salon.id}`,
    name: salon.name,
    url: `${siteUrl}/salons/${salon.id}`,
    image: salon.logo || salon.backgroundImage || salon.gallery?.[0]?.imageUrl || `${siteUrl}/logo-transparent.png`,
    description: salon.description || `Professional salon services at ${salon.name}`,
    telephone: salon.phoneNumber || undefined,
    email: salon.contactEmail || undefined,
    priceRange: '$$',
  };

  // Add address if available
  if (salon.address || salon.city || salon.province) {
    structuredData.address = {
      '@type': 'PostalAddress',
      streetAddress: salon.address || undefined,
      addressLocality: salon.city || undefined,
      addressRegion: salon.province || undefined,
      addressCountry: 'ZA',
    };
  }

  // Add geo coordinates if available
  if (salon.latitude && salon.longitude) {
    structuredData.geo = {
      '@type': 'GeoCoordinates',
      latitude: salon.latitude,
      longitude: salon.longitude,
    };
  }

  // Add opening hours if available
  if (salon.operatingHours && Array.isArray(salon.operatingHours)) {
    const openingHours: string[] = [];
    const daysMap: { [key: string]: string } = {
      monday: 'Mo',
      tuesday: 'Tu',
      wednesday: 'We',
      thursday: 'Th',
      friday: 'Fr',
      saturday: 'Sa',
      sunday: 'Su',
    };

    salon.operatingHours.forEach((hours: any) => {
      if (hours.isOpen && hours.openTime && hours.closeTime) {
        const dayCode = daysMap[hours.day.toLowerCase()];
        if (dayCode) {
          openingHours.push(`${dayCode} ${hours.openTime}-${hours.closeTime}`);
        }
      }
    });

    if (openingHours.length > 0) {
      structuredData.openingHoursSpecification = openingHours.map(hours => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: hours.split(' ')[0],
        opens: hours.split(' ')[1].split('-')[0],
        closes: hours.split(' ')[1].split('-')[1],
      }));
    }
  }

  // Add aggregate rating if available
  if (salon.avgRating && salon.reviewCount) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: salon.avgRating,
      reviewCount: salon.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add services offered
  if (salon.services && salon.services.length > 0) {
    structuredData.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: salon.services.map((service: any) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.name || service.title,
          description: service.description || undefined,
          offers: {
            '@type': 'Offer',
            price: service.price || undefined,
            priceCurrency: 'ZAR',
          },
        },
      })),
    };
  }

  return structuredData;
}

/**
 * Generate breadcrumb structured data for salon page
 */
export function generateSalonBreadcrumb(salon: Salon): object {
  const items = [
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
  ];

  if (salon.city) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: salon.city,
      item: `${siteUrl}/salons?city=${encodeURIComponent(salon.city)}`,
    });
  }

  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: salon.name,
    item: `${siteUrl}/salons/${salon.id}`,
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}
