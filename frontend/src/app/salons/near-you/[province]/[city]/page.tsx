import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import SalonCityNearYouClient from './SalonCityNearYouClient';
import { getAllProvinceSlugs } from '@/lib/nearYouContent';
import { getCitiesByProvince } from '@/lib/locationData';
import styles from '@/app/salons/SalonsPage.module.css';

// ISR: Revalidate every hour for fresh content
export const revalidate = 3600;

type Props = {
  params: Promise<{ province: string; city: string }>;
};

export async function generateStaticParams() {
  const provinces = getAllProvinceSlugs();
  
  const params = [];
  for (const province of provinces) {
    const cities = getCitiesByProvince(province);
    for (const city of cities) {
      params.push({ province, city: city.slug });
    }
  }
  
  return params;
}

export default async function SalonCityNearYouPage({ params }: Props) {
  const { province, city } = await params;
  
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <h1 className={styles.title}>Loading Salons...</h1>
          <LoadingSpinner />
        </div>
      }
    >
      <SalonCityNearYouClient provinceSlug={province} citySlug={city} />
    </Suspense>
  );
}

