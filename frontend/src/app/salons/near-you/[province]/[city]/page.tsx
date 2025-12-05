import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import SalonCityNearYouClient from './SalonCityNearYouClient';
import { getAllProvinceSlugs } from '@/lib/nearYouContent';
import { getCitiesByProvince } from '@/lib/locationData';
import styles from '@/app/salons/SalonsPage.module.css';

// ISR: Revalidate every 24 hours to reduce ISR writes
export const revalidate = 86400;

type Props = {
  params: Promise<{ province: string; city: string }>;
};

export async function generateStaticParams() {
  // Return empty array to disable static generation at build time
  // Pages will be generated on-demand (ISR)
  return [];
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

