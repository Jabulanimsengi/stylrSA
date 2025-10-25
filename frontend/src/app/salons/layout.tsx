import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Salons & Beauty Professionals | Find Top-Rated Salons Near You',
  description: 'Explore the best salons and beauty professionals in South Africa. Find top-rated hair salons, nail salons, spas, barbershops, and more. Filter by location, services, ratings, and price.',
  keywords: 'salon, hair salon, nail salon, spa, beauty salon, barbershop, braiding salon, beauty professionals, South Africa',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://stylrsa.vercel.app'}/salons`,
  },
  openGraph: {
    title: 'Salons & Beauty Professionals | Find Top-Rated Salons Near You',
    description: 'Explore the best salons and beauty professionals in South Africa. Find top-rated hair salons, nail salons, spas, barbershops, and more.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://stylrsa.vercel.app'}/salons`,
    siteName: 'Stylr SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salons & Beauty Professionals | Find Top-Rated Salons Near You',
    description: 'Explore the best salons and beauty professionals in South Africa.',
  },
};

export default function SalonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stylrsa.vercel.app';

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
