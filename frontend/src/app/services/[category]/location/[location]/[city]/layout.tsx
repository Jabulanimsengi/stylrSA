import type { Metadata } from 'next';
import { PROVINCES, getCityInfo } from '@/lib/locationData';

type Props = {
  children: React.ReactNode;
  params: Promise<{ category: string; location: string; city: string }>;
};

// Category information for SEO - Expanded with comprehensive keywords
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
    keywordsBase: [
      'nail salon', 'manicure', 'pedicure', 'gel nails', 'nail art', 'acrylic nails',
      'nail technician', 'nail studio', 'nail bar', 'nail spa', 'nail care',
      'nail design', 'nail polish', 'nail repair', 'nail extensions', 'nail treatment',
      'gel manicure', 'classic manicure', 'french manicure', 'nail filing', 'cuticle care'
    ],
  },
  'massage-body-treatments': {
    name: 'Massage & Body Treatments',
    serviceName: 'massage spa',
    descriptionBase: 'Book relaxing massage therapy and body treatments',
    keywordsBase: [
      'massage', 'spa', 'massage therapy', 'body treatment', 'wellness',
      'deep tissue massage', 'Swedish massage', 'couples massage', 'hot stone massage',
      'sports massage', 'prenatal massage', 'reflexology', 'full body massage',
      'therapeutic massage', 'relaxation massage', 'massage therapist', 'body scrub',
      'body wrap', 'cellulite treatment', 'aromatherapy massage', 'Thai massage'
    ],
  },
  'skin-care-facials': {
    name: 'Skin Care & Facials',
    serviceName: 'spa',
    descriptionBase: 'Book professional facial treatments and skin care',
    keywordsBase: [
      'facial', 'spa', 'skin care', 'esthetician', 'facial treatment',
      'anti-aging facial', 'acne treatment', 'skin rejuvenation', 'dermaplaning',
      'hydrafacial', 'deep cleansing facial', 'chemical peel', 'microdermabrasion',
      'skin facial', 'facial spa', 'skincare specialist', 'skin treatment',
      'facial massage', 'LED facial', 'oxygen facial', 'collagen facial'
    ],
  },
  'haircuts-styling': {
    name: 'Haircuts & Styling',
    serviceName: 'hair salon',
    descriptionBase: 'Find expert hairstylists for cuts and styling',
    keywordsBase: [
      'haircut', 'hair styling', 'hairstylist', 'hair salon', 'hairdresser',
      'hair studio', 'haircut and style', 'blowout', 'hair transformation',
      'professional haircut', 'haircut for women', 'haircut for men', 'kids haircut',
      'haircut and color', 'hair styling near me', 'hair salon near me', 'haircut prices',
      'trendy haircut', 'modern haircut', 'classic haircut', 'hair consultation'
    ],
  },
  'hair-color-treatments': {
    name: 'Hair Coloring & Treatments',
    serviceName: 'hair salon',
    descriptionBase: 'Professional hair coloring and treatment services',
    keywordsBase: [
      'hair color', 'balayage', 'highlights', 'hair treatment', 'hair dye',
      'ombre', 'hair colour', 'hair coloring', 'colorist', 'hair colorist',
      'keratin treatment', 'Brazilian blowout', 'Olaplex treatment', 'hair repair',
      'hair restoration', 'hair conditioning treatment', 'color correction',
      'full color', 'partial highlights', 'full highlights', 'hair gloss',
      'toner treatment', 'hair color consultation', 'bleach and tone'
    ],
  },
  'makeup-beauty': {
    name: 'Makeup & Beauty',
    serviceName: 'makeup artist',
    descriptionBase: 'Book professional makeup artists',
    keywordsBase: [
      'makeup artist', 'beauty services', 'bridal makeup', 'professional makeup',
      'makeup application', 'beauty specialist', 'event makeup', 'special occasion makeup',
      'prom makeup', 'matric dance makeup', 'makeup artist near me', 'makeup studio',
      'makeup services', 'makeup consultation', 'airbrush makeup', 'HD makeup',
      'natural makeup', 'glam makeup', 'editorial makeup', 'photography makeup'
    ],
  },
  'waxing-hair-removal': {
    name: 'Waxing & Hair Removal',
    serviceName: 'waxing salon',
    descriptionBase: 'Book professional waxing and hair removal services',
    keywordsBase: [
      'waxing', 'hair removal', 'Brazilian wax', 'wax specialist', 'waxing salon',
      'waxing studio', 'Hollywood wax', 'bikini wax', 'leg wax', 'underarm wax',
      'full leg wax', 'half leg wax', 'facial waxing', 'eyebrow waxing',
      'upper lip wax', 'chin wax', 'body waxing', 'waxing near me', 'waxing prices',
      'sugar waxing', 'hot wax', 'strip wax', 'threading', 'laser hair removal'
    ],
  },
  'braiding-weaving': {
    name: 'Braiding & Weaving',
    serviceName: 'braiding salon',
    descriptionBase: 'Find professional braiding and weaving specialists',
    keywordsBase: [
      'braiding', 'hair braiding', 'box braids', 'weaving', 'hair extensions',
      'knotless braids', 'cornrows', 'twists', 'Ghana braids', 'Senegalese twists',
      'crochet braids', 'faux locs', 'dreadlocks', 'braiding salon', 'braid specialist',
      'african hair braiding', 'protective hairstyles', 'braiding near me',
      'weave installation', 'hair extensions', 'clip-in extensions', 'tape-in extensions',
      'micro-link extensions', 'braiding prices', 'braiding styles', 'braiding consultation'
    ],
  },
  'mens-grooming': {
    name: 'Men\'s Grooming',
    serviceName: 'barber',
    descriptionBase: 'Book professional men\'s grooming services',
    keywordsBase: [
      'men\'s grooming', 'barber', 'men\'s haircut', 'beard trim', 'barbershop',
      'barber shop', 'men\'s barber', 'traditional barber', 'fade haircut',
      'hot shave', 'straight razor shave', 'beard grooming', 'mustache trim',
      'men\'s styling', 'men\'s haircut near me', 'barber near me', 'barbershop near me',
      'men\'s grooming services', 'beard styling', 'haircut and shave', 'men\'s spa',
      'men\'s facial', 'men\'s grooming package', 'barber prices', 'men\'s haircut prices'
    ],
  },
  'bridal-services': {
    name: 'Bridal Services',
    serviceName: 'bridal beauty',
    descriptionBase: 'Book professional bridal hair and makeup services',
    keywordsBase: [
      'bridal services', 'wedding hair', 'wedding makeup', 'bridal makeup',
      'bridal hair', 'bridal package', 'wedding hair and makeup', 'bridal beauty',
      'bridal makeup artist', 'bridal hairstylist', 'wedding beauty', 'bridal trial',
      'bridal consultation', 'wedding day hair', 'wedding day makeup', 'bridal party',
      'bridesmaid hair', 'bridesmaid makeup', 'mother of the bride', 'wedding prep',
      'bridal hair styling', 'bridal hair updo', 'bridal hair down', 'bridal hair accessories'
    ],
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

  // Enhanced title with multiple variations (A/B test ready)
  // Primary keyword at the beginning for better SEO
  const titleVariations = [
    `Best ${categoryInfo.serviceName} in ${cityInfo.name} | Top-Rated ${categoryInfo.name} Services`,
    `${categoryInfo.name} in ${cityInfo.name}, ${cityInfo.province} | Book ${categoryInfo.serviceName} Services`,
    `Top ${categoryInfo.serviceName} ${cityInfo.name} | Professional ${categoryInfo.name} Near Me`,
    `Find the Best ${categoryInfo.serviceName} in ${cityInfo.name} | ${categoryInfo.name} Services`,
  ];
  
  // Use first variation (can be rotated for A/B testing)
  const title = titleVariations[0];

  // Enhanced meta description with compelling copy and CTA
  const primaryKeyword = categoryInfo.keywordsBase[0] || categoryInfo.serviceName;
  const description = `Book the best ${primaryKeyword} services in ${cityInfo.name}, ${cityInfo.province}. Find top-rated ${categoryInfo.serviceName} professionals, read verified reviews, compare prices, and book instantly. Open now!`;
  
  // Generate comprehensive keywords using multiple patterns
  const modifiers = ['best', 'top-rated', 'affordable', 'cheap', 'professional', 'experienced', 'certified', 'licensed', 'luxury', 'premium', 'local', 'recommended', 'popular', 'trending'];
  const suffixes = ['near me', 'prices', 'cost', 'reviews', 'open now', 'booking', 'appointment', 'online booking', 'same day', 'walk in', 'discount', 'promotion', 'package', 'treatment', 'service', 'salon', 'studio', 'clinic', 'spa', 'shop', 'for men', 'for women', 'for kids', 'quotes', 'specials', 'deals'];
  
  const keywordPatterns = [
    // Pattern 1: [Service] in [Location]
    ...categoryInfo.keywordsBase.map(k => `${k} in ${cityInfo.name}`),
    ...categoryInfo.keywordsBase.map(k => `${k} in ${cityInfo.province}`),
    
    // Pattern 2: [Service] near me [Location]
    ...categoryInfo.keywordsBase.map(k => `${k} near me ${cityInfo.name}`),
    ...categoryInfo.keywordsBase.map(k => `${k} near me ${cityInfo.province}`),
    
    // Pattern 3: [Service] [Location]
    ...categoryInfo.keywordsBase.map(k => `${k} ${cityInfo.name}`),
    ...categoryInfo.keywordsBase.map(k => `${k} ${cityInfo.province}`),
    
    // Pattern 4: [Modifier] [Service] in [Location]
    ...modifiers.slice(0, 8).flatMap(mod => 
      categoryInfo.keywordsBase.slice(0, 10).map(k => `${mod} ${k} in ${cityInfo.name}`)
    ),
    
    // Pattern 5: [Service] [Location] [Suffix]
    ...categoryInfo.keywordsBase.slice(0, 15).flatMap(k =>
      suffixes.slice(0, 12).map(suffix => `${k} ${cityInfo.name} ${suffix}`)
    ),
    
    // Pattern 6: [Modifier] [Service] [Location] [Suffix] (high-value combinations)
    ...modifiers.slice(0, 6).flatMap(mod =>
      categoryInfo.keywordsBase.slice(0, 8).flatMap(k =>
        suffixes.slice(0, 8).map(suffix => `${mod} ${k} ${cityInfo.name} ${suffix}`)
      )
    ),
    
    // Pattern 7: [Service] [Location] prices/cost/reviews
    ...categoryInfo.keywordsBase.slice(0, 10).map(k => `${k} ${cityInfo.name} prices`),
    ...categoryInfo.keywordsBase.slice(0, 10).map(k => `${k} ${cityInfo.name} cost`),
    ...categoryInfo.keywordsBase.slice(0, 10).map(k => `${k} ${cityInfo.name} reviews`),
    ...categoryInfo.keywordsBase.slice(0, 10).map(k => `${k} ${cityInfo.name} booking`),
    ...categoryInfo.keywordsBase.slice(0, 10).map(k => `${k} ${cityInfo.name} open now`),
    
    // Pattern 8: Base service name variations
    `${categoryInfo.serviceName} ${cityInfo.name}`,
    `${categoryInfo.serviceName} ${cityInfo.province}`,
    `${categoryInfo.serviceName} near me ${cityInfo.name}`,
    `find ${categoryInfo.serviceName} ${cityInfo.name}`,
    `book ${categoryInfo.serviceName} ${cityInfo.name}`,
    `find a ${categoryInfo.serviceName} ${cityInfo.name}`,
    `book a ${categoryInfo.serviceName} ${cityInfo.name}`,
    `best ${categoryInfo.serviceName} ${cityInfo.name}`,
    `top-rated ${categoryInfo.serviceName} ${cityInfo.name}`,
    `affordable ${categoryInfo.serviceName} ${cityInfo.name}`,
    `professional ${categoryInfo.serviceName} ${cityInfo.name}`,
    `luxury ${categoryInfo.serviceName} ${cityInfo.name}`,
    
    // Pattern 9: City-specific keywords that match category
    ...cityInfo.keywords.filter(k => 
      categoryInfo.keywordsBase.some(catK => k.toLowerCase().includes(catK.toLowerCase()))
    ),
    
    // Pattern 10: Additional location variations
    ...categoryInfo.keywordsBase.slice(0, 10).map(k => `${k} ${cityInfo.name} South Africa`),
    ...categoryInfo.keywordsBase.slice(0, 10).map(k => `${k} ${cityInfo.province} South Africa`),
    
    // Pattern 11: Service-specific long-tail keywords
    ...categoryInfo.keywordsBase.slice(0, 8).map(k => `where to get ${k} in ${cityInfo.name}`),
    ...categoryInfo.keywordsBase.slice(0, 8).map(k => `how to find ${k} in ${cityInfo.name}`),
    ...categoryInfo.keywordsBase.slice(0, 8).map(k => `${k} services ${cityInfo.name}`),
  ];
  
  // Remove duplicates and limit to 200 keywords (increased from 50 for better SEO coverage)
  const uniqueKeywords = Array.from(new Set(keywordPatterns)).slice(0, 200);
  const keywords = uniqueKeywords.join(', ');

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

  // Enhanced Service schema with more keyword variations
  const canonicalUrl = `${siteUrl}/services/${category}/location/${location}/${city}`;
  const primaryKeywords = categoryInfo.keywordsBase.slice(0, 5).join(', ');
  
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: categoryInfo.name,
    name: `${categoryInfo.name} in ${cityInfo.name}`,
    description: `${categoryInfo.descriptionBase} in ${cityInfo.name}, ${cityInfo.province}. Find the best ${categoryInfo.serviceName} professionals and book appointments near you.`,
    keywords: primaryKeywords,
    category: categoryInfo.name,
    provider: {
      '@type': 'Organization',
      name: 'Stylr SA',
      url: siteUrl,
      logo: `${siteUrl}/logo-transparent.png`,
    },
    areaServed: {
      '@type': 'City',
      name: cityInfo.name,
      containedIn: {
        '@type': 'State',
        name: cityInfo.province,
        containedIn: {
          '@type': 'Country',
          name: 'South Africa',
        },
      },
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: canonicalUrl,
      serviceName: `${categoryInfo.serviceName} in ${cityInfo.name}`,
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'ZAR',
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
