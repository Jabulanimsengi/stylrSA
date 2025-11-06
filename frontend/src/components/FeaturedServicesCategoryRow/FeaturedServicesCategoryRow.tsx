'use client';

import React, { useRef } from 'react';
import styles from './FeaturedServicesCategoryRow.module.css';
import FeaturedServiceCard from '@/components/FeaturedServiceCard';
import { Service } from '@/types';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

type ServiceWithSalon = Service & { salon: { id: string; name: string; city: string; province: string } };

interface FeaturedServicesCategoryRowProps {
  categoryName: string;
  services: ServiceWithSalon[];
}

export default function FeaturedServicesCategoryRow({ categoryName, services }: FeaturedServicesCategoryRowProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.clientWidth * 0.8; // Scroll 80% of the container width
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (!services || services.length === 0) {
    return null;
  }

  return (
    <div className={styles.categorySection}>
      <h3 className={styles.categoryTitle}>{categoryName}</h3>
      <div className={styles.carouselContainer}>
        {isMobile && services.length > 1 && (
          <button className={`${styles.scrollButton} ${styles.left}`} onClick={() => scroll('left')} aria-label="Scroll left">
            <FaChevronLeft />
          </button>
        )}
        <div className={styles.servicesGrid} ref={scrollContainerRef}>
          {services.map((service) => (
            <FeaturedServiceCard key={service.id} service={service} />
          ))}
        </div>
        {isMobile && services.length > 1 && (
          <button className={`${styles.scrollButton} ${styles.right}`} onClick={() => scroll('right')} aria-label="Scroll right">
            <FaChevronRight />
          </button>
        )}
      </div>
    </div>
  );
}

