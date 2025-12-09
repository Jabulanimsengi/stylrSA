import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ServiceCityNearYouClient from './ServiceCityNearYouClient';
import { getAllCategorySlugs, getAllProvinceSlugs } from '@/lib/nearYouContent';
import { getCitiesByProvince } from '@/lib/locationData';
import styles from '../../../../../salons/SalonsPage.module.css';

// ISR: Revalidate every 24 hours to reduce ISR writes
export const revalidate = 86400;

type Props = {
  params: Promise<{ category: string; province: string; city: string }>;
};

export async function generateStaticParams() {
  // Generate static pages for all service category + province + city combinations
  // This generates ~768 pages (16 categories × ~48 cities)
  const { getAllCategorySlugs } = await import('@/lib/nearYouContent');
  const { getAllServiceCityParams } = await import('@/lib/seo-generation');

  const categories = getAllCategorySlugs();
  const cityParams = getAllServiceCityParams();

  const params = [];
  for (const category of categories) {
    for (const { province, city } of cityParams) {
      params.push({ category, province, city });
    }
  }

  return params;
}

export default async function ServiceCityNearYouPage({ params }: Props) {
  const { category, province, city } = await params;

  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <h1 className={styles.title}>Loading Services...</h1>
          <LoadingSpinner />
        </div>
      }
    >
      <ServiceCityNearYouClient categorySlug={category} provinceSlug={province} citySlug={city} />
    </Suspense>
  );
}

