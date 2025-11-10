'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import ServiceCard from '../ServiceCard';
import { Service } from '@/types';
import styles from './SEOLandingPage.module.css';

interface ServiceListingsSectionProps {
  services: Service[];
  serviceCount: number;
  keyword: string;
  locationName: string;
  viewAllLink?: string;
}

export default function ServiceListingsSection({
  services,
  serviceCount,
  keyword,
  locationName,
  viewAllLink = '/services',
}: ServiceListingsSectionProps) {
  // Placeholder handlers for ServiceCard
  const handleBook = (service: Service) => {
    // This will be handled by the booking modal in the parent page
    console.log('Book service:', service);
  };

  const handleImageClick = (images: string[], index: number) => {
    // This will be handled by the image lightbox in the parent page
    console.log('View images:', images, index);
  };

  if (services.length === 0) {
    return null;
  }

  return (
    <section className={styles.contentSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.h2}>
          {serviceCount}+ {keyword} Services in {locationName}
        </h2>
        {viewAllLink && (
          <Link href={viewAllLink} className={styles.viewAllLink}>
            View All Services →
          </Link>
        )}
      </div>

      <div className={styles.servicesGrid}>
        {services.map((service) => (
          <Suspense key={service.id} fallback={<div>Loading...</div>}>
            <ServiceCard
              service={service}
              onBook={handleBook}
              onImageClick={handleImageClick}
              variant="listing"
            />
          </Suspense>
        ))}
      </div>

      {services.length < serviceCount && (
        <div className={styles.viewMoreContainer}>
          <Link href={viewAllLink} className={styles.viewMoreButton}>
            View All {serviceCount} Services
          </Link>
        </div>
      )}
    </section>
  );
}
