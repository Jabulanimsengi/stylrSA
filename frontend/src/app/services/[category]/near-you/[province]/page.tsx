import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ServiceProvinceNearYouClient from './ServiceProvinceNearYouClient';
import { getAllCategorySlugs, getAllProvinceSlugs } from '@/lib/nearYouContent';
import styles from '../../../../salons/SalonsPage.module.css';

// ISR: Revalidate every hour for fresh content
export const revalidate = 3600;

type Props = {
  params: Promise<{ category: string; province: string }>;
};

export async function generateStaticParams() {
  const categories = getAllCategorySlugs();
  const provinces = getAllProvinceSlugs();
  
  const params = [];
  for (const category of categories) {
    for (const province of provinces) {
      params.push({ category, province });
    }
  }
  
  return params;
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
