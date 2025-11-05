import type { Metadata } from 'next';
import { PROVINCES, getCityInfo } from '@/lib/locationData';

type Props = {
  children: React.ReactNode;
  params: Promise<{ category: string; location: string; city: string }>;
};

// Category information for SEO
const CATEGORY_INFO: Record<string, { 
  name: string; 
  serviceName: string; 
  descriptionBase: string;
  keywordsBase: string[];
}> = {
  'nail-care': {
    name: 'Nail Care',
    serviceName: 'nail salon',
    descriptionBase: 'Find professional nail services',
    keywordsBase: ['nail salon', 'manicure', 'pedicure', 'gel nails', 'nail art'],
  },
  'massage-body-treatments': {
    name: 'Massage & Body Treatments',
    serviceName: 'massage spa',
    descriptionBase: 'Book relaxing massage therapy and body treatments',
    keywordsBase: ['massage', 'spa', 'massage therapy', 'body treatment', 'wellness'],
  },
  'skin-care-facials': {
    name: 'Skin Care & Facials',
    serviceName: 'spa',
    descriptionBase: 'Book professional facial treatments and skin care',
    keywordsBase: ['facial', 'spa', 'skin care', 'esthetician', 'facial treatment'],
  },
  'haircuts-styling': {
    name: 'Haircuts & Styling',
    serviceName: 'hair salon',
    descriptionBase: 'Find expert hairstylists for cuts and styling',
    keywordsBase: ['haircut', 'hair styling', 'hairstylist', 'hair salon'],
  },
  'hair-color-treatments': {
    name: 'Hair Coloring & Treatments',
    serviceName: 'hair salon',
    descriptionBase: 'Professional hair coloring and treatment services',
    keywordsBase: ['hair color', 'balayage', 'highlights', 'hair treatment'],
  },
  'makeup-beauty': {
    name: 'Makeup & Beauty',
    serviceName: 'makeup artist',
    descriptionBase: 'Book professional makeup artists',
    keywordsBase: ['makeup artist', 'beauty services', 'bridal makeup', 'professional makeup'],
  },
  'waxing-hair-removal': {
    name: 'Waxing & Hair Removal',
    serviceName: 'waxing salon',
    descriptionBase: 'Book professional waxing and hair removal services',
    keywordsBase: ['waxing', 'hair removal', 'Brazilian wax', 'wax specialist'],
  },
  'braiding-weaving': {
    name: 'Braiding & Weaving',
    serviceName: 'braiding salon',
    descriptionBase: 'Find professional braiding and weaving specialists',
    keywordsBase: ['braiding', 'hair braiding', 'box braids', 'weaving', 'hair extensions'],
  },
  'mens-grooming': {
    name: 'Men\'s Grooming',
    serviceName: 'barber',
    descriptionBase: 'Book professional men\'s grooming services',
    keywordsBase: ['men\'s grooming', 'barber', 'men\'s haircut', 'beard trim'],
  },
  'bridal-services': {
    name: 'Bridal Services',
    serviceName: 'bridal beauty',
    descriptionBase: 'Book professional bridal hair and makeup services',
    keywordsBase: ['bridal services', 'wedding hair', 'wedding makeup', 'bridal makeup'],
  },
};

// Generate static params for all combinations
export async function generateStaticParams() {
  const params: Array<{ category: string; location: string; city: string }> = [];
  
  const categories = Object.keys(CATEGORY_INFO);
  
  Object.keys(PROVINCES).forEach(provinceSlug => {
    const province = PROVINCES[provinceSlug];
    province.cities.forEach(city => {
      categories.forEach(category => {
        params.push({
          category,
          location: provinceSlug,
          city: city.slug,
        });
      });
    });
  });
  
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, location, city } = await params;
  
  const categoryInfo = CATEGORY_INFO[category];
  const cityInfo = getCityInfo(location, city);
  
  if (!categoryInfo || !cityInfo) {
    return {
      title: 'Services | Stylr SA',
      description: 'Find and book professional beauty services in South Africa',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
  const canonicalUrl = `${siteUrl}/services/${category}/location/${location}/${city}`;

  // Create location-specific title and description
  const title = `${categoryInfo.name} in ${cityInfo.name}, ${cityInfo.province} | Book ${categoryInfo.serviceName} Services`;
  const description = `${categoryInfo.descriptionBase} in ${cityInfo.name}, ${cityInfo.province}. Find the best ${categoryInfo.serviceName} professionals and book appointments near you.`;
  
  // Combine category and location keywords
  const keywords = [
    ...categoryInfo.keywordsBase.map(k => `${k} ${cityInfo.name}`),
    ...categoryInfo.keywordsBase.map(k => `${k} near me ${cityInfo.name}`),
    `${categoryInfo.serviceName} ${cityInfo.name}`,
    `${categoryInfo.serviceName} ${cityInfo.province}`,
    ...cityInfo.keywords.filter(k => 
      categoryInfo.keywordsBase.some(catK => k.toLowerCase().includes(catK.toLowerCase()))
    ),
  ].slice(0, 20).join(', ');

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Stylr SA',
      type: 'website',
      locale: 'en_ZA',
      images: [
        {
          url: `${siteUrl}/logo-transparent.png`,
          width: 800,
          height: 600,
          alt: `${categoryInfo.name} in ${cityInfo.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ServiceLocationLayout({ children, params }: Props) {
  const { category, location, city } = await params;
  const categoryInfo = CATEGORY_INFO[category];
  const cityInfo = getCityInfo(location, city);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

  if (!categoryInfo || !cityInfo) {
    return <>{children}</>;
  }

  // Breadcrumb schema
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
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Services',
        item: `${siteUrl}/services`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryInfo.name,
        item: `${siteUrl}/services/${category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `${categoryInfo.name} in ${cityInfo.name}`,
        item: `${siteUrl}/services/${category}/location/${location}/${city}`,
      },
    ],
  };

  // Service schema with location
  const canonicalUrl = `${siteUrl}/services/${category}/location/${location}/${city}`;
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: categoryInfo.name,
    name: `${categoryInfo.name} in ${cityInfo.name}`,
    description: `${categoryInfo.descriptionBase} in ${cityInfo.name}, ${cityInfo.province}`,
    provider: {
      '@type': 'Organization',
      name: 'Stylr SA',
      url: siteUrl,
    },
    areaServed: {
      '@type': 'City',
      name: cityInfo.name,
      containedIn: {
        '@type': 'State',
        name: cityInfo.province,
      },
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: canonicalUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {children}
    </>
  );
}
