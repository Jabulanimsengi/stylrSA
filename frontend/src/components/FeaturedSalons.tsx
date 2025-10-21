'use client';

import { useEffect, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
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
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();

  const fetchFeaturedSalons = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/salons/featured', { credentials: 'include' });
      if (!res.ok) {
        const errorText = await res.text();
        logger.error('Featured salons fetch failed:', { status: res.status, statusText: res.statusText, body: errorText });
        throw new Error(`Failed to fetch featured salons (${res.status}): ${errorText}`);
      }
      const data = await res.json();
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
        spaceBetween={16}
        slidesPerView={'auto'}
        navigation
        style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}
        breakpoints={{
          320: {
            slidesPerView: 2.1,
          },
          768: {
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
    </div>
  );
}
