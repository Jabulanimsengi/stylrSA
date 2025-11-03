'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import SalonCard from './SalonCard';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { Salon } from '@/types';
import styles from './FeaturedSalons.module.css';

import 'swiper/css';
import 'swiper/css/navigation';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

export default function FeaturedSalons() {
  const [salons, setSalons] = useState<SalonWithFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const fetchFeaturedSalons = useCallback(async () => {
    setIsLoading(true);
    try {
      // Add cache-busting timestamp to force fresh data
      const timestamp = Date.now();
      const res = await fetch(`/api/salons/featured?_t=${timestamp}`, { 
        credentials: 'include',
        cache: 'no-store' as any
      });
      if (!res.ok) {
        const errorText = await res.text();
        logger.error('Featured salons fetch failed:', { status: res.status, statusText: res.statusText, body: errorText });
        throw new Error(`Failed to fetch featured salons (${res.status}): ${errorText}`);
      }
      const data = await res.json();
      console.log('🎯 Featured salons loaded:', data.map((s: any) => ({ name: s.name, hasLogo: !!s.logo })));
      setSalons(data);
    } catch (error) {
      logger.error('Failed to fetch featured salons:', error);
      if (error instanceof Error && !error.message.includes('404')) {
        toast.error(toFriendlyMessage(error, 'Failed to load featured salons.'));
      }
      setSalons([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedSalons();
  }, [fetchFeaturedSalons, authStatus]);

  // Listen for salon updates from EditSalonModal
  useEffect(() => {
    const handleSalonUpdate = (event: any) => {
      console.log('🔄 FeaturedSalons: Salon updated event received, refetching...');
      setTimeout(() => {
        fetchFeaturedSalons();
      }, 500);
    };

    window.addEventListener('salon-updated', handleSalonUpdate);
    return () => window.removeEventListener('salon-updated', handleSalonUpdate);
  }, [fetchFeaturedSalons]);

  const handleToggleFavorite = async (e: React.MouseEvent, salonId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (authStatus !== 'authenticated') {
      toast.info('Please log in to add salons to your favorites.');
      openModal('login');
      return;
    }

    const originalSalons = salons;
    setSalons(prevSalons =>
      prevSalons.map(salon =>
        salon.id === salonId ? { ...salon, isFavorited: !salon.isFavorited } : salon
      )
    );

    try {
      const res = await fetch(`/api/favorites/toggle/${salonId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to update favorite status.');
      }

      const { favorited } = await res.json();
      const message = favorited ? 'Added to favorites!' : 'Removed from favorites.';
      toast.success(message);

    } catch (error) {
      toast.error('Could not update favorites. Please try again.');
      setSalons(originalSalons);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
    );
  }

  if (salons.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Swiper
        modules={[Navigation]}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          if (typeof swiper.params.navigation !== 'boolean') {
            const navigation = swiper.params.navigation;
            if (navigation) {
              navigation.prevEl = prevRef.current;
              navigation.nextEl = nextRef.current;
            }
          }
        }}
        spaceBetween={16}
        slidesPerView={'auto'}
        style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}
        onSlideChange={(swiper: SwiperType) => setActiveIndex(swiper.activeIndex)}
        breakpoints={{
          320: {
            slidesPerView: 1.15,
          },
          769: {
            slidesPerView: 5.1,
          },
        }}
      >
        {salons.map((salon) => (
          <SwiperSlide key={salon.id}>
            <SalonCard
              salon={salon}
              showFavorite
              onToggleFavorite={handleToggleFavorite}
              showHours={false}
              compact
            />
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Navigation buttons */}
      <button ref={prevRef} className={styles.prevButton} aria-label="Previous">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button ref={nextRef} className={styles.nextButton} aria-label="Next">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
      
      {/* Scroll indicators for mobile */}
      <div className={styles.scrollIndicators}>
        <div className={styles.scrollIndicatorLeft}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </div>
        <div className={styles.scrollIndicatorRight}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>
      
      {/* Slide counter for mobile */}
      <div className={styles.slideCounter}>
        {activeIndex + 1}/{salons.length}
      </div>
    </div>
  );
}
