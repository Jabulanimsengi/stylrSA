import type { Metadata } from 'next';
import { generateNearYouMetadata, generateBreadcrumbSchema, generateServiceSchema, generateLocalBusinessSchema } from '@/lib/seoHelpers';
import { generateLocationFAQs, generateFAQSchema } from '@/lib/faqSchema';

type Props = {
  children: React.ReactNode;
  params: Promise<{ category: string; province: string; city: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, province, city } = await params;
  return generateNearYouMetadata(category, province, city);
}

export default async function ServiceCityNearYouLayout({ children, params }: Props) {
  const { category, province, city } = await params;
  const breadcrumbSchema = generateBreadcrumbSchema(category, province, city);
  const serviceSchema = generateServiceSchema(category, province, city);
  const localBusinessSchema = generateLocalBusinessSchema(category, province, city);
  const faqs = generateLocationFAQs(category, province, city);
  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {serviceSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
      )}
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

