import type { Metadata } from 'next';

type Props = {
  children: React.ReactNode;
  params: Promise<{ location: string }>;
};

// Generate static params for all location pages
export async function generateStaticParams() {
  return [
    { location: 'gauteng' },
    { location: 'western-cape' },
    { location: 'kwazulu-natal' },
    { location: 'eastern-cape' },
    { location: 'mpumalanga' },
    { location: 'limpopo' },
    { location: 'north-west' },
    { location: 'free-state' },
    { location: 'northern-cape' },
  ];
}

const LOCATION_INFO: Record<string, { name: string; description: string; keywords: string }> = {
  'gauteng': {
    name: 'Gauteng',
    description: 'Find top-rated salons and beauty professionals in Gauteng, South Africa. Book appointments at the best hair salons, nail salons, spas, and barbershops in Johannesburg, Pretoria, and surrounding areas.',
    keywords: 'Gauteng salons, Johannesburg hair salon, Pretoria beauty salon, Gauteng spa, Johannesburg nail salon, Pretoria barbershop, Gauteng braiding salon',
  },
  'western-cape': {
    name: 'Western Cape',
    description: 'Discover premier salons and beauty services in the Western Cape. Book appointments at top-rated hair salons, nail salons, and spas in Cape Town, Stellenbosch, and the Garden Route.',
    keywords: 'Western Cape salons, Cape Town hair salon, Cape Town beauty salon, Western Cape spa, Cape Town nail salon, Stellenbosch salon',
  },
  'kwazulu-natal': {
    name: 'KwaZulu-Natal',
    description: 'Find the best salons and beauty professionals near you in KwaZulu-Natal. Book services at top hair salons, nail salons, and spas near me in Durban, Pietermaritzburg, Umhlanga, and the North Coast. Beauty services near you.',
    keywords: 'salons near me KZN, hair salon near me Durban, nail salon near me Durban, spa near me Umhlanga, beauty professionals near me KwaZulu-Natal, Durban braiding salon',
  },
  'eastern-cape': {
    name: 'Eastern Cape',
    description: 'Explore top salons and beauty services in the Eastern Cape. Book appointments at the best hair salons, nail salons, and spas in Port Elizabeth, East London, and surrounding areas.',
    keywords: 'Eastern Cape salons, Port Elizabeth hair salon, East London beauty salon, Eastern Cape spa, PE nail salon',
  },
  'mpumalanga': {
    name: 'Mpumalanga',
    description: 'Find professional salons and beauty services in Mpumalanga. Book appointments at top-rated hair salons, nail salons, and spas in Nelspruit, Witbank, and the Lowveld region.',
    keywords: 'Mpumalanga salons, Nelspruit hair salon, Mpumalanga beauty salon, Lowveld spa, Witbank salon',
  },
  'limpopo': {
    name: 'Limpopo',
    description: 'Discover quality salons and beauty professionals in Limpopo. Book services at the best hair salons, nail salons, and spas in Polokwane, Tzaneen, and surrounding areas.',
    keywords: 'Limpopo salons, Polokwane hair salon, Limpopo beauty salon, Polokwane spa, Tzaneen salon',
  },
  'north-west': {
    name: 'North West',
    description: 'Find top salons and beauty services in North West Province. Book appointments at the best hair salons, nail salons, and spas in Rustenburg, Mahikeng, and Potchefstroom.',
    keywords: 'North West salons, Rustenburg hair salon, North West beauty salon, Mahikeng spa, Potchefstroom salon',
  },
  'free-state': {
    name: 'Free State',
    description: 'Explore professional salons and beauty services in the Free State. Book appointments at top-rated hair salons, nail salons, and spas in Bloemfontein, Welkom, and surrounding areas.',
    keywords: 'Free State salons, Bloemfontein hair salon, Free State beauty salon, Bloemfontein spa, Welkom salon',
  },
  'northern-cape': {
    name: 'Northern Cape',
    description: 'Find quality salons and beauty professionals in the Northern Cape. Book services at the best hair salons, nail salons, and spas in Kimberley, Upington, and the region.',
    keywords: 'Northern Cape salons, Kimberley hair salon, Northern Cape beauty salon, Kimberley spa, Upington salon',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  const locationInfo = LOCATION_INFO[location] || {
    name: 'South Africa',
    description: 'Find the best salons and beauty professionals in South Africa',
    keywords: 'South Africa salons, beauty services, hair salon',
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
  const canonicalUrl = `${siteUrl}/salons/${location}`;

  const title = `Salons in ${locationInfo.name} | Hair, Nails, Spa & Beauty Services`;
  const description = locationInfo.description;

  return {
    title,
    description,
    keywords: locationInfo.keywords,
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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SalonsLocationLayout({ children, params }: Props) {
  const { location } = await params;
  const locationInfo = LOCATION_INFO[location] || { name: 'South Africa', description: '', keywords: '' };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

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
        name: 'Salons',
        item: `${siteUrl}/salons`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: locationInfo.name,
        item: `${siteUrl}/salons/${location}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
