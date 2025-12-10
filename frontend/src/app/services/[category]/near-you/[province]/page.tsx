import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ServiceProvinceNearYouClient from './ServiceProvinceNearYouClient';
import { getAllCategorySlugs, getAllProvinceSlugs } from '@/lib/nearYouContent';
import styles from '../../../../salons/SalonsPage.module.css';

// ISR - all pages generated on-demand
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 86400; // Cache for 24 hours

type Props = {
  params: Promise<{ category: string; province: string }>;
};

// No pre-built pages - all generated on-demand
export async function generateStaticParams() {
  return [];
}

export default async function ServiceProvinceNearYouPage({ params }: Props) {
  const { category, province } = await params;

  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <h1 className={styles.title}>Loading Services...</h1>
          <LoadingSpinner />
        </div>
      }
    >
      <ServiceProvinceNearYouClient categorySlug={category} provinceSlug={province} />
    </Suspense>
  );
}
