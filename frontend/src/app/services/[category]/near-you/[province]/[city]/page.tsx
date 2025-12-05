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
  const categories = getAllCategorySlugs();
  const provinces = getAllProvinceSlugs();
  
  const params = [];
  for (const category of categories) {
    for (const province of provinces) {
      const cities = getCitiesByProvince(province);
      for (const city of cities) {
        params.push({ category, province, city: city.slug });
      }
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

