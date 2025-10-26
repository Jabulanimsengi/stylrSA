import type { Metadata } from 'next';

type Props = {
  children: React.ReactNode;
  params: { category: string };
};

const CATEGORY_INFO: Record<string, { title: string; description: string; keywords: string }> = {
  'haircuts-styling': {
    title: 'Haircuts & Styling Services | Book Top Stylists in South Africa',
    description: 'Find expert hairstylists for cuts, styling, and transformations. Book appointments at the best hair salons in South Africa. Professional haircuts for men, women, and children.',
    keywords: 'haircut, hair styling, hairstylist, hair salon, barber, hair transformation, professional haircut, South Africa',
  },
  'hair-color-treatments': {
    title: 'Hair Coloring & Treatment Services | Expert Color Specialists',
    description: 'Professional hair coloring, highlights, balayage, and treatment services. Book experienced colorists at top salons across South Africa for stunning hair transformations.',
    keywords: 'hair color, hair dye, balayage, highlights, ombre, hair treatment, keratin treatment, colorist, South Africa',
  },
  'nail-care': {
    title: 'Nail Salon Services | Manicures, Pedicures & Nail Art in SA',
    description: 'Book professional nail services including manicures, pedicures, gel nails, acrylics, and custom nail art. Find the best nail salons and technicians in South Africa.',
    keywords: 'nail salon, manicure, pedicure, gel nails, acrylic nails, nail art, nail technician, nail care, South Africa',
  },
  'skin-care-facials': {
    title: 'Skin Care & Facial Services | Professional Estheticians in SA',
    description: 'Book professional facial treatments, skin care consultations, and rejuvenating spa services. Find expert estheticians and skin therapists across South Africa.',
    keywords: 'facial, skin care, esthetician, skin treatment, spa facial, anti-aging, acne treatment, skincare specialist, South Africa',
  },
  'massage-body-treatments': {
    title: 'Massage & Body Treatment Services | Wellness Spas in SA',
    description: 'Book relaxing massage therapy and body treatments. Find professional massage therapists and wellness spas offering therapeutic and relaxation services across South Africa.',
    keywords: 'massage, body treatment, spa, massage therapy, wellness, relaxation, deep tissue, Swedish massage, hot stone, South Africa',
  },
  'makeup-beauty': {
    title: 'Makeup & Beauty Services | Professional Makeup Artists in SA',
    description: 'Book professional makeup artists for special events, bridal makeup, editorial looks, and beauty services. Find expert makeup professionals across South Africa.',
    keywords: 'makeup artist, beauty services, bridal makeup, special event makeup, professional makeup, makeup application, beauty specialist, South Africa',
  },
  'waxing-hair-removal': {
    title: 'Waxing & Hair Removal Services | Professional Waxing in SA',
    description: 'Book professional waxing and hair removal services. Find experienced technicians offering Brazilian waxing, full body waxing, and laser hair removal across South Africa.',
    keywords: 'waxing, hair removal, Brazilian wax, laser hair removal, body waxing, threading, wax specialist, South Africa',
  },
  'braiding-weaving': {
    title: 'Braiding & Weaving Services | Expert Braiders in South Africa',
    description: 'Find professional braiding and weaving specialists for box braids, cornrows, Ghana braids, crochet braids, and hair extensions. Book expert braiders across South Africa.',
    keywords: 'braiding, hair braiding, box braids, cornrows, Ghana braids, weaving, hair extensions, braider, crochet braids, South Africa',
  },
  'mens-grooming': {
    title: 'Men\'s Grooming Services | Barbers & Male Grooming in SA',
    description: 'Book professional men\'s grooming services including haircuts, beard trims, hot towel shaves, and styling. Find expert barbers across South Africa.',
    keywords: 'men\'s grooming, barber, men\'s haircut, beard trim, hot shave, male grooming, barber shop, South Africa',
  },
  'bridal-services': {
    title: 'Bridal Beauty Services | Wedding Hair & Makeup in SA',
    description: 'Book professional bridal hair, makeup, and beauty services for your special day. Find experienced bridal specialists offering packages for weddings across South Africa.',
    keywords: 'bridal services, wedding hair, wedding makeup, bridal makeup artist, bridal hairstylist, wedding beauty, bridal package, South Africa',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = params;
  const categoryInfo = CATEGORY_INFO[category] || {
    title: 'Beauty Services | Stylr SA',
    description: 'Find and book professional beauty services in South Africa',
    keywords: 'beauty services, salon, South Africa',
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stylrsa.vercel.app';
  const canonicalUrl = `${siteUrl}/services/${category}`;

  return {
    title: categoryInfo.title,
    description: categoryInfo.description,
    keywords: categoryInfo.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: categoryInfo.title,
      description: categoryInfo.description,
      url: canonicalUrl,
      siteName: 'Stylr SA',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/logo-transparent.png`,
          width: 800,
          height: 600,
          alt: 'Stylr SA',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: categoryInfo.title,
      description: categoryInfo.description,
    },
  };
}

export default async function ServiceCategoryLayout({ children, params }: Props) {
  const { category } = params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stylrsa.vercel.app';

  // Structured data for service category
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
        name: CATEGORY_INFO[category]?.title.split('|')[0].trim() || 'Category',
        item: `${siteUrl}/services/${category}`,
      },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: CATEGORY_INFO[category]?.title.split('|')[0].trim() || 'Beauty Service',
    provider: {
      '@type': 'Organization',
      name: 'Stylr SA',
      url: siteUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'South Africa',
    },
    description: CATEGORY_INFO[category]?.description || '',
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

