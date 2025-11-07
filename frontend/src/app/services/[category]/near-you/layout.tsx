import type { Metadata } from 'next';
import { generateNearYouMetadata, generateBreadcrumbSchema, generateServiceSchema } from '@/lib/seoHelpers';

type Props = {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  return generateNearYouMetadata(category, null, null);
}

export default async function ServiceCategoryNearYouLayout({ children, params }: Props) {
  const { category } = await params;
  const breadcrumbSchema = generateBreadcrumbSchema(category, null, null);
  const serviceSchema = generateServiceSchema(category, null, null);

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
      {children}
    </>
  );
}

