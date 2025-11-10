'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import SalonCard from '../SalonCard';
import { Salon } from '@/types';
import styles from './SEOLandingPage.module.css';

interface SalonListingsSectionProps {
  salons: Salon[];
  salonCount: number;
  locationName: string;
  viewAllLink?: string;
}

export default function SalonListingsSection({
  salons,
  salonCount,
  locationName,
  viewAllLink = '/salons',
}: SalonListingsSectionProps) {
  if (salons.length === 0) {
    return null;
  }

  return (
    <section className={styles.contentSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.h2}>
          {salonCount}+ Verified Salons in {locationName}
        </h2>
        {viewAllLink && (
          <Link href={viewAllLink} className={styles.viewAllLink}>
            View All Salons →
          </Link>
        )}
      </div>

      <div className={styles.salonsGrid}>
        {salons.map((salon) => (
          <Suspense key={salon.id} fallback={<div>Loading...</div>}>
            <SalonCard salon={salon} />
          </Suspense>
        ))}
      </div>

      {salons.length < salonCount && (
        <div className={styles.viewMoreContainer}>
          <Link href={viewAllLink} className={styles.viewMoreButton}>
            View All {salonCount} Salons
          </Link>
        </div>
      )}
    </section>
  );
}
