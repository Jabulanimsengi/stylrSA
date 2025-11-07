import type { Metadata } from 'next';
import { generateNearYouMetadata, generateBreadcrumbSchema, generateServiceSchema } from '@/lib/seoHelpers';
import { generateLocationFAQs, generateFAQSchema } from '@/lib/faqSchema';

type Props = {
  children: React.ReactNode;
  params: Promise<{ category: string; province: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, province } = await params;
  return generateNearYouMetadata(category, province, null);
}

export default async function ServiceProvinceNearYouLayout({ children, params }: Props) {
  const { category, province } = await params;
  const breadcrumbSchema = generateBreadcrumbSchema(category, province, null);
  const serviceSchema = generateServiceSchema(category, province, null);
  const faqs = generateLocationFAQs(category, province, null);
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

