'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import SalonCard from './SalonCard';
import { Salon } from '@/types';
import styles from './FeaturedSalons.module.css';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

const SLIDE_INTERVAL = 5000; // 5 seconds auto-advance

export default function FeaturedSalons() {
  const [salons, setSalons] = useState<SalonWithFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();

  // Determine how many cards to show based on screen size
  const [cardsPerView, setCardsPerView] = useState(1);

  useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth;
      if (width >= 1200) {
        setCardsPerView(4);
      } else if (width >= 1024) {
        setCardsPerView(3);
      } else if (width >= 768) {
        setCardsPerView(2);
      } else {
        setCardsPerView(1);
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

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
      // Only show error toast if it's not an empty result
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

  const maxSlide = Math.max(0, salons.length - cardsPerView);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? maxSlide : prev - 1));
    setIsAutoPlaying(false);
  }, [maxSlide]);

  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    setIsAutoPlaying(false);
  }, [maxSlide]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || salons.length <= cardsPerView) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [isAutoPlaying, salons.length, cardsPerView, maxSlide]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        {Array.from({ length: cardsPerView }).map((_, i) => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
    );
  }

  if (salons.length === 0) {
    return null; // Don't show section if no featured salons
  }

  const totalDots = maxSlide + 1;

  return (
    <div 
      className={styles.container}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.carouselWrapper}>
        {salons.length > cardsPerView && (
          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonPrev}`}
            onClick={handlePrevSlide}
            aria-label="Previous slide"
          >
            ‹
          </button>
        )}

        <div className={styles.carouselTrack}>
          <div
            className={styles.carouselInner}
            style={{
              transform: `translateX(-${currentSlide * (100 / cardsPerView)}%)`,
              width: `${(salons.length / cardsPerView) * 100}%`,
            }}
          >
            {salons.map((salon) => (
              <div
                key={salon.id}
                className={styles.carouselItem}
                style={{ width: `${100 / salons.length * cardsPerView}%` }}
              >
                <SalonCard
                  salon={salon}
                  showFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            ))}
          </div>
        </div>

        {salons.length > cardsPerView && (
          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonNext}`}
            onClick={handleNextSlide}
            aria-label="Next slide"
          >
            ›
          </button>
        )}
      </div>

      {salons.length > cardsPerView && totalDots > 1 && (
        <div className={styles.dots}>
          {Array.from({ length: totalDots }).map((_, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.dot} ${index === currentSlide ? styles.dotActive : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
