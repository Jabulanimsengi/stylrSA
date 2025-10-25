import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beauty Services | Find Braiding, Nails, Makeup & More | Stylr SA',
  description: 'Discover and book professional beauty services across South Africa. Find expert braiders, nail technicians, makeup artists, massage therapists, and more. Browse services by category, location, and price.',
  keywords: 'beauty services, salon services, braiding, nail salon, makeup artist, massage, spa, hair styling, waxing, mens grooming, bridal services, South Africa',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://stylrsa.vercel.app'}/services`,
  },
  openGraph: {
    title: 'Beauty Services | Find Braiding, Nails, Makeup & More | Stylr SA',
    description: 'Discover and book professional beauty services across South Africa. Find expert braiders, nail technicians, makeup artists, massage therapists, and more.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://stylrsa.vercel.app'}/services`,
    siteName: 'Stylr SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beauty Services | Find Braiding, Nails, Makeup & More | Stylr SA',
    description: 'Discover and book professional beauty services across South Africa.',
  },
};

export default function ServicesLayout({
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
        name: 'Services',
        item: `${siteUrl}/services`,
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
