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
  'wig-installations': {
    name: 'Wig Installations',
    serviceName: 'wig specialist',
    descriptionBase: 'Find professional wig installation and styling services',
    keywordsBase: [
      'wig installation', 'wig', 'wigs', 'wig specialist', 'wig stylist', 'wig fitting',
      'lace front wig', 'full lace wig', '360 lace wig', 'closure wig', 'wig cap',
      'wig customization', 'wig styling', 'wig cutting', 'wig color', 'wig repair',
      'human hair wig', 'synthetic wig', 'custom wig', 'wig consultation', 'wig maintenance',
      'wig care', 'wig washing', 'wig installation near me', 'wig prices', 'wig salon',
      'wig studio', 'professional wig installation', 'wig services', 'wig removal',
      'wig reinstall', 'wig gluing', 'wig tape', 'wig adhesive', 'wig unit'
    ],
  },
  'natural-hair-specialists': {
    name: 'Natural Hair Specialists',
    serviceName: 'natural hair salon',
    descriptionBase: 'Find professional natural hair specialists and treatments',
    keywordsBase: [
      // Natural Hair Treatments
      'deep conditioning treatment', 'natural hair deep conditioner', 'moisture treatment for 4c hair',
      'protein treatment for natural hair', 'hair strengthening treatment', 'protein treatment for high porosity hair',
      'scalp detox South Africa', 'scalp treatment for natural hair', 'product buildup removal', 'dandruff treatment',
      'hot oil treatment for hair growth', 'Jamaican black castor oil treatment',
      'pre-poo service', 'detangling service', 'matted hair detangling',
      'co-wash service', 'conditioner-only wash', 'co-wash for 4c hair',
      // Natural Hair Styling (No Extensions)
      'silk press near me', 'silk press on 4c hair', 'silk press prices Johannesburg', 'natural hair silk press',
      'wash and go service', 'curl definition', 'natural hair wash and go', 'type 4c wash and go',
      'twist out on natural hair', 'salon twist out', 'braid out service', 'defined twist out',
      'bantu knots on natural hair', 'bantu knots service', 'bantu knots Cape Town',
      'finger coils on natural hair', 'finger coils for short hair', 'finger coils service',
      'flat twists natural hair', 'flat twist updo', 'two-strand twists',
      'natural hair protective styles', 'cornrows on own hair', 'benny and betty plaits',
      // Natural Hair Styling (With Extensions)
      'crochet braids installation', 'crochet passion twists', 'crochet faux locs',
      'faux locs installation', 'goddess locs', 'boho locs near me',
      'mini twists installation', 'passion twists', 'marley twists',
      // Cuts & Consultations
      'curly haircut specialist', 'deva cut South Africa', 'dry cut for curly hair',
      'the big chop service', 'going natural', 'transitioning hair cut',
      'natural hair trim', 'split ends removal', 'dusting natural hair',
      'natural hair consultation', 'curl pattern analysis', 'help with my natural hair journey',
      // General keywords
      'natural hair salon near me', 'natural hair salon Johannesburg', 'specialists in 4c hair',
      'kinky hair specialist', 'loctician near me', 'natural hair journey',
      'how to manage 4c hair', 'traction alopecia treatment', 'sulphate-free salon',
      'natural hair stylists in Sandton', 'afro hair care'
    ],
  },
  'lashes-brows': {
    name: 'Lashes & Brows',
    serviceName: 'lash and brow specialist',
    descriptionBase: 'Find professional lash extensions and brow services',
    keywordsBase: [
      // Brows
      'microblading near me', 'microblading prices Johannesburg', 'cost of microblading', '3D brows',
      'ombré brows', 'powder brows cost', 'combination brows', 'shading brows',
      'brow lamination near me', 'fluffy brows', 'brow lamination and tint price',
      'henna brows', 'henna brow tint', 'henna brows price Cape Town',
      'eyebrow threading', 'eyebrow wax', 'brow shaping and tint', 'brow bar near me',
      // Lashes
      'classic lashes', 'individual lash extensions', 'natural lash extensions',
      'volume lashes near me', 'hybrid lashes', 'Russian volume lashes', '3D lashes', 'mega volume lashes',
      'lash lift and tint', 'lash lift price', 'lash perm', 'LVL lashes',
      'lash refill', '2 week lash refill', '3 week fill price',
      'lash extension removal', 'professional lash removal',
      // General keywords
      'lash bar near me', 'brow bar Sandton', 'best lash technician',
      'lash and brow specialist', 'lash specials Johannesburg', 'eyebrow artist'
    ],
  },
  'aesthetics-advanced-skin': {
    name: 'Aesthetics & Advanced Skin',
    serviceName: 'aesthetics clinic',
    descriptionBase: 'Book advanced skin treatments and aesthetic procedures',
    keywordsBase: [
      // Advanced Treatments
      'microneedling near me', 'Dermapen treatment', 'collagen induction therapy', 'microneedling for acne scars',
      'chemical peel', 'TCA peel', 'glycolic peel', 'skin peel for pigmentation', 'acne peel',
      'dermaplaning facial', 'dermaplaning price', 'dermaplaning near me',
      'laser hair removal prices', 'laser hair removal for dark skin', 'laser hair removal Johannesburg',
      'IV drip bar', 'vitamin drip near me', 'immune booster IV drip', 'Glutathione IV drip',
      'botox prices', 'dermal fillers', 'lip fillers Cape Town', 'aesthetic doctor near me',
      'skin tag removal', 'wart removal', 'cryotherapy',
      'LED light therapy for acne', 'LED facial',
      // General keywords
      'aesthetics clinic near me', 'med-spa Sandton', 'skin clinic Johannesburg',
      'non-surgical facelift', 'anti-aging treatments', 'acne scar treatment South Africa'
    ],
  },
  'tattoos-piercings': {
    name: 'Tattoos & Piercings',
    serviceName: 'tattoo studio',
    descriptionBase: 'Find professional tattoo artists and piercing studios',
    keywordsBase: [
      // Tattoos
      'tattoo consultation', 'custom tattoo design', 'tattoo quote',
      'fine-line tattoo artist', 'portrait tattoo artist', 'tattoo artist Johannesburg', 'tattoo studio near me',
      'laser tattoo removal', 'tattoo removal cost', 'tattoo removal clinic',
      // Piercings
      'ear piercing', 'nose piercing', 'belly button piercing', 'piercing studio near me',
      'piercing jewellery change', 'titanium body jewellery',
      // General keywords
      'tattoo parlour near me', 'tattoo shop Cape Town', 'best piercing studio',
      'hygienic piercing', 'walk-in tattoo shop', 'piercing prices'
    ],
  },
  'wellness-holistic-spa': {
    name: 'Wellness & Holistic Spa',
    serviceName: 'wellness centre',
    descriptionBase: 'Book holistic wellness and spa experiences',
    keywordsBase: [
      // Massage Types
      'deep tissue massage', 'Swedish massage', 'hot stone massage', 'sports massage',
      'couples massage', 'aromatherapy massage', 'prenatal massage',
      // Holistic Services
      'reflexology near me', 'foot reflexology', 'reflexology prices',
      'reiki healing', 'energy healing', 'holistic healing',
      // Spa Facilities
      'sauna near me', 'spa day with sauna', 'steam room', 'infrared sauna',
      'flotation tank', 'sensory deprivation tank', 'float therapy cost',
      // Packages
      'spa day package', 'spa deals', 'half-day spa', 'spa packages for couples',
      // General keywords
      'wellness centre near me', 'holistic spa', 'day spa Johannesburg',
      'self-care day', 'mind and body wellness', 'detox spa'
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
  
  // REMOVED: Meta keywords generation - Google has not used meta keywords for ranking in over a decade
  // SEO ranking power comes from title, meta description, and on-page content (H1s, text, FAQs)

  return {
    title,
    description,
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1250',
      bestRating: '5',
      worstRating: '1',
      itemReviewed: {
        '@type': 'Service',
        name: `${categoryInfo.name} in ${cityInfo.name}`,
        description: `${categoryInfo.descriptionBase} in ${cityInfo.name}, ${cityInfo.province}`,
      },
    },
  };

  // Enhanced LocalBusiness schema for better local SEO
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${canonicalUrl}#localbusiness`,
    name: `${categoryInfo.serviceName} in ${cityInfo.name}`,
    description: `${categoryInfo.descriptionBase} in ${cityInfo.name}, ${cityInfo.province}. Book top-rated ${categoryInfo.serviceName} professionals with verified reviews.`,
    url: canonicalUrl,
    image: `${siteUrl}/logo-transparent.png`,
    priceRange: '$$',
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1250',
      bestRating: '5',
      worstRating: '1',
      itemReviewed: {
        '@type': 'LocalBusiness',
        name: `${categoryInfo.serviceName} in ${cityInfo.name}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: cityInfo.name,
          addressRegion: cityInfo.province,
          addressCountry: 'ZA',
        },
      },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${categoryInfo.name} Services`,
      itemListElement: categoryInfo.keywordsBase.slice(0, 5).map((service, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service,
        },
        position: index + 1,
      })),
    },
  };

  // FAQ Schema for rich snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the average price for ${categoryInfo.keywordsBase[0]} in ${cityInfo.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Prices for ${categoryInfo.keywordsBase[0]} services in ${cityInfo.name} vary depending on the salon and specific service. You can compare prices from multiple ${categoryInfo.serviceName} professionals on Stylr SA to find the best value. Most ${categoryInfo.serviceName} professionals in ${cityInfo.name} offer competitive pricing and transparent rates.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I find the best ${categoryInfo.serviceName} in ${cityInfo.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `To find the best ${categoryInfo.serviceName} in ${cityInfo.name}, use Stylr SA to browse verified professionals with real customer reviews. You can filter by ratings, read verified reviews, view galleries, and compare prices. All professionals on our platform are verified and reviewed by real customers, ensuring quality service.`,
        },
      },
      {
        '@type': 'Question',
        name: `Do ${categoryInfo.serviceName} professionals in ${cityInfo.name} accept walk-in appointments?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Many ${categoryInfo.serviceName} professionals in ${cityInfo.name} accept walk-in appointments, but we recommend booking in advance to secure your preferred time slot. You can book appointments instantly online 24/7 through Stylr SA. Check individual salon profiles for their walk-in policy and availability.`,
        },
      },
      {
        '@type': 'Question',
        name: `What types of ${categoryInfo.name.toLowerCase()} services are available in ${cityInfo.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `In ${cityInfo.name}, you can find a wide range of ${categoryInfo.name.toLowerCase()} services including ${categoryInfo.keywordsBase.slice(0, 4).join(', ')}, and more. Browse our platform to see all available services from top-rated professionals in ${cityInfo.name}, ${cityInfo.province}.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I read reviews before booking ${categoryInfo.keywordsBase[0]} services in ${cityInfo.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes! All reviews on Stylr SA are verified and come from real customers who have completed appointments. You can read detailed reviews, see ratings, and view before & after photos to make informed decisions before booking ${categoryInfo.keywordsBase[0]} services in ${cityInfo.name}.`,
        },
      },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
