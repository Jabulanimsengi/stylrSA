import type { Metadata } from 'next';
import { generateNearYouMetadata, generateBreadcrumbSchema, generateLocalBusinessSchema } from '@/lib/seoHelpers';
import { generateLocationFAQs, generateFAQSchema } from '@/lib/faqSchema';

type Props = {
  children: React.ReactNode;
  params: Promise<{ province: string; city: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province, city } = await params;
  return generateNearYouMetadata(null, province, city);
}

export default async function SalonCityNearYouLayout({ children, params }: Props) {
  const { province, city } = await params;
  const breadcrumbSchema = generateBreadcrumbSchema(null, province, city);
  const localBusinessSchema = generateLocalBusinessSchema(null, province, city);
  const faqs = generateLocationFAQs(null, province, city);
  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {localBusinessSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {children}
    </>
  );
}

