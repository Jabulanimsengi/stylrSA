'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart } from 'react-icons/fa';
import { transformCloudinary } from '@/utils/cloudinary';
import { getImageWithFallback } from '@/lib/placeholders';
import { useCardsLayout } from '@/hooks/useCardsLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { Salon } from '@/types';
import styles from './FeaturedSalons.module.css';
import exploreStyles from '@/app/salons/SalonsPage.module.css';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

const SLIDE_INTERVAL = 5000; // 5 seconds auto-advance

export default function FeaturedSalons() {
  const [salons, setSalons] = useState<SalonWithFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Determine how many cards to show based on viewport width
  const getCardsPerView = (width: number) => {
    if (width < 480) return 2.2; // Small mobile: 2.2 cards (2 full + peek)
    if (width < 768) return 2.5; // Mobile: 2.5 cards
    if (width < 1024) return 3; // Tablet: 3 cards
    if (width < 1440) return 4; // Desktop: 4 cards
    return 5; // Large: 5 cards
  };

  const [cardsPerView, setCardsPerView] = useState<number>(4); // Default for SSR
  const [gapPx, setGapPx] = useState<number>(12);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const layout = useCardsLayout(wrapperRef as unknown as { current: HTMLElement | null });

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
    setCardsPerView(layout.cardsPerView);
    setGapPx(layout.gapPx);
  }, [layout.cardsPerView, layout.gapPx]);

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
  const effectiveCardsPerView = salons.length > 0 ? Math.min(cardsPerView, salons.length) : cardsPerView;
  const maxSlide = Math.max(0, Math.ceil(salons.length - effectiveCardsPerView));

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
  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || salons.length <= effectiveCardsPerView) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [isAutoPlaying, salons.length, effectiveCardsPerView, maxSlide]);

  // Resume auto-play after touch interaction
  useEffect(() => {
    if (touchStart === null && touchEnd === null) {
      const timer = setTimeout(() => setIsAutoPlaying(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [touchStart, touchEnd]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsAutoPlaying(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && salons.length > effectiveCardsPerView) {
      handleNextSlide();
    }
    if (isRightSwipe && salons.length > effectiveCardsPerView) {
      handlePrevSlide();
    }
  };

  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        {Array.from({ length: Math.ceil(cardsPerView) }).map((_, i) => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
    );
  }

  if (salons.length === 0) {
    return null; // Don't show section if no featured salons
  }

  const totalDots = maxSlide + 1;
  const isSlidingPossible = salons.length > effectiveCardsPerView;
  const isPrevDisabled = !isSlidingPossible || currentSlide === 0;
  const isNextDisabled = !isSlidingPossible || currentSlide >= maxSlide;

  return (
    <div 
      className={styles.container}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className={styles.carouselWrapper} 
        ref={wrapperRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          className={`${styles.navButton} ${styles.navButtonPrev}`}
          onClick={handlePrevSlide}
          aria-label="Previous slide"
          disabled={isPrevDisabled}
        >
          ‹
        </button>

        <div className={styles.carouselTrack}>
          <div
            className={styles.carouselInner}
            style={{
              transform: `translateX(calc(-${currentSlide * (100 / effectiveCardsPerView)}% - ${currentSlide * gapPx}px))`,
              width: `${salons.length > 0 ? (salons.length / effectiveCardsPerView) * 100 : 100}%`,
              gap: `var(--card-gap, ${gapPx}px)`
            }}
          >
            {salons.map((salon) => (
              <div
                key={salon.id}
                className={styles.carouselItem}
                style={{ width: `calc(${100 / effectiveCardsPerView}% - ${gapPx * (effectiveCardsPerView - 1) / effectiveCardsPerView}px)` }}
              >
                <div className={exploreStyles.salonCard}>
                  <button
                    onClick={(e) => handleToggleFavorite(e, salon.id)}
                    className={`${exploreStyles.favoriteButton} ${salon.isFavorited ? exploreStyles.favorited : ''}`}
                    aria-label={salon.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <FaHeart />
                  </button>
                  <Link href={`/salons/${salon.id}`} className={exploreStyles.salonLink}>
                    <div className={exploreStyles.imageWrapper}>
                      <Image
                        src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), { width: 600, quality: 'auto', format: 'auto', crop: 'fill' })}
                        alt={`A photo of ${salon.name}`}
                        className={exploreStyles.cardImage}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className={exploreStyles.cardContent}>
                      <h2 className={exploreStyles.cardTitle}>{salon.name}</h2>
                      <p className={exploreStyles.cardLocation}>{salon.city}, {salon.province}</p>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={`${styles.navButton} ${styles.navButtonNext}`}
          onClick={handleNextSlide}
          aria-label="Next slide"
          disabled={isNextDisabled}
        >
          ›
        </button>
      </div>

      {salons.length > effectiveCardsPerView && totalDots > 1 && (
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
