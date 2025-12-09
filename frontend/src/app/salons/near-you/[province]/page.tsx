import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import SalonProvinceNearYouClient from './SalonProvinceNearYouClient';
import { getAllProvinceSlugs } from '@/lib/nearYouContent';
import styles from '@/app/salons/SalonsPage.module.css';

// Fully static - no ISR writes
export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

type Props = {
  params: Promise<{ province: string }>;
};

export async function generateStaticParams() {
  const provinces = getAllProvinceSlugs();
  return provinces.map(province => ({ province }));
}

export default async function SalonProvinceNearYouPage({ params }: Props) {
  const { province } = await params;
  
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <h1 className={styles.title}>Loading Salons...</h1>
          <LoadingSpinner />
        </div>
      }
    >
      <SalonProvinceNearYouClient provinceSlug={province} />
    </Suspense>
  );
}

