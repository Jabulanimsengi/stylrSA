import type { Metadata } from 'next';
import { generateNearYouMetadata, generateBreadcrumbSchema, generateLocalBusinessSchema } from '@/lib/seoHelpers';

type Props = {
  children: React.ReactNode;
  params: Promise<{ province: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province } = await params;
  return generateNearYouMetadata(null, province, null);
}

export default async function SalonProvinceNearYouLayout({ children, params }: Props) {
  const { province } = await params;
  const breadcrumbSchema = generateBreadcrumbSchema(null, province, null);
  const localBusinessSchema = generateLocalBusinessSchema(null, province, null);

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
      {children}
    </>
  );
}

