'use client';

import { Service } from '@/types';
import FeaturedServiceCard from '../FeaturedServiceCard';
import styles from './FeaturedServicesCategoryRow.module.css';

interface FeaturedServicesCategoryRowProps {
  categoryName: string;
  services: Service[];
}

export default function FeaturedServicesCategoryRow({
  categoryName,
  services,
}: FeaturedServicesCategoryRowProps) {
  if (!services || services.length === 0) {
    return null;
  }

  return (
    <div className={styles.categorySection}>
      <h3 className={styles.categoryTitle}>{categoryName}</h3>
      <div className={styles.servicesRow}>
        {services.map((service) => (
          <div key={service.id} className={styles.serviceCardWrapper}>
            <FeaturedServiceCard service={service} />
          </div>
        ))}
      </div>
    </div>
  );
}

