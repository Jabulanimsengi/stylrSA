import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sellers | Beauty Product Sellers in South Africa | Stylr SA',
  description: 'Discover trusted beauty product sellers from across South Africa. Browse verified sellers offering quality beauty products, cosmetics, and wellness items.',
  keywords: 'beauty sellers, product sellers, beauty products South Africa, cosmetics sellers, verified sellers, Stylr SA',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za'}/sellers`,
  },
  openGraph: {
    title: 'Sellers | Beauty Product Sellers in South Africa | Stylr SA',
    description: 'Discover trusted beauty product sellers from across South Africa. Browse verified sellers offering quality beauty products.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za'}/sellers`,
    siteName: 'Stylr SA',
    type: 'website',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za'}/logo-transparent.png`,
        width: 800,
        height: 600,
        alt: 'Stylr SA Sellers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sellers | Beauty Product Sellers in South Africa',
    description: 'Discover trusted beauty product sellers from across South Africa.',
  },
};

export default function SellersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

  // Structured data for sellers listing page
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
        name: 'Sellers',
        item: `${siteUrl}/sellers`,
      },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Beauty Product Sellers',
    description: 'Discover trusted beauty product sellers from across South Africa',
    url: `${siteUrl}/sellers`,
    publisher: {
      '@type': 'Organization',
      name: 'Stylr SA',
      url: siteUrl,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      {children}
    </>
  );
}

