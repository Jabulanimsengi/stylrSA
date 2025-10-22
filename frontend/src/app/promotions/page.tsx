'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PageNav from '@/components/PageNav';
import PromotionCard, { Promotion, PromotionCardSkeleton } from '@/components/PromotionCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ImageLightbox from '@/components/ImageLightbox/ImageLightbox';
import styles from './promotions.module.css';
import { toFriendlyMessage } from '@/lib/errors';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'services' | 'products'>('all');
  const [lastFetch, setLastFetch] = useState<Date>(new Date());
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/promotions/public?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        // Only show error for actual failures, not for empty data
        if (response.status !== 404) {
          throw new Error('Failed to fetch promotions');
        }
      }

      const data = await response.json();
      setPromotions(Array.isArray(data) ? data : []);
      setLastFetch(new Date());
    } catch (error) {
      // Only show error toast for network/server errors
      console.error('Error fetching promotions:', error);
      setPromotions([]); // Set empty array instead of showing error
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPromotions();
  };

  const handleImageClick = (images: string[], startIndex: number = 0) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
    setIsLightboxOpen(true);
  };

  const handleLightboxNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    } else if (direction === 'next' && lightboxIndex < lightboxImages.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const filteredPromotions = promotions.filter((promo) => {
    if (filter === 'services') return Boolean(promo.service);
    if (filter === 'products') return Boolean(promo.product);
    return true;
  });

  return (
    <div className={styles.container}>
      <PageNav />
      
      <div className={styles.header}>
        <h1 className={styles.title}>Special Promotions</h1>
        <p className={styles.subtitle}>
          Discover amazing deals on services and products
        </p>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All Promotions
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'services' ? styles.active : ''}`}
            onClick={() => setFilter('services')}
          >
            Services
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'products' ? styles.active : ''}`}
            onClick={() => setFilter('products')}
          >
            Products
          </button>
        </div>
        <button
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={isLoading}
          title="Refresh promotions"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isLoading ? styles.spinning : ''}
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <PromotionCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className={styles.emptyState}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <h2>No Promotions Yet</h2>
          <p>Salon owners haven't created any promotions at the moment.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Check back soon for exciting deals and discounts!
          </p>
        </div>
      ) : (
        <>
          <div className={styles.resultCount}>
            {filteredPromotions.length} promotion{filteredPromotions.length !== 1 ? 's' : ''} available
          </div>
          <div className={styles.grid}>
            {filteredPromotions.map((promotion) => (
              <PromotionCard 
                key={promotion.id} 
                promotion={promotion}
                onImageClick={handleImageClick}
              />
            ))}
          </div>
        </>
      )}

      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={handleLightboxNavigate}
      />
    </div>
  );
}
