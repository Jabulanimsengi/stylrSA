'use client';

import { useEffect, useState, useRef, useCallback, memo, useTransition } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import SalonCard from '@/components/SalonCard';
import { Salon } from '@/types';
import { toast } from 'react-toastify';
import styles from './ForYouRecommendations.module.css';
import { useAuthModal } from '@/context/AuthModalContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import 'swiper/css';
import 'swiper/css/navigation';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

function ForYouRecommendations() {
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();
  const [salons, setSalons] = useState<SalonWithFavorite[]>([]);
  // 'pending' = not started, 'loading' = fetching, 'done' = completed
  const [loadingState, setLoadingState] = useState<'pending' | 'loading' | 'done'>('pending');
  const [activeIndex, setActiveIndex] = useState(0);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingState('loading');
      try {
        // Add timeout to prevent infinite loading (5 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('/api/salons/recommended', {
          credentials: 'include',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          setSalons([]);
          return;
        }

        const data = await response.json();
        setSalons(data || []);
      } catch (error) {
        // Silently fail on timeout/abort
        setSalons([]);
      } finally {
        setLoadingState('done');
      }
    };

    if (authStatus === 'authenticated' && !hasFetched.current) {
      hasFetched.current = true;
      fetchRecommendations();
    } else if (authStatus !== 'authenticated') {
      setLoadingState('done'); // Mark as done so we don't show skeleton
      setSalons([]);
      hasFetched.current = false; // Reset so it fetches again if user logs in
    }
  }, [authStatus]);

  const [isPending, startTransition] = useTransition();

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent, salonId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (authStatus !== 'authenticated') {
      toast.info('Please log in to add salons to your favorites.');
      openModal('login');
      return;
    }

    const originalSalons = salons;
    // Use startTransition for non-urgent UI updates to improve INP
    startTransition(() => {
      setSalons(prevSalons =>
        prevSalons.map(salon =>
          salon.id === salonId ? { ...salon, isFavorited: !salon.isFavorited } : salon
        )
      );
    });

    try {
      const res = await fetch(`/api/favorites/toggle/${salonId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to update favorite status.');
      }

      const { favorited } = await res.json();
      toast.success(favorited ? 'Added to favorites!' : 'Removed from favorites.');
    } catch (error) {
      toast.error('Could not update favorites. Please try again.');
      startTransition(() => setSalons(originalSalons));
    }
  }, [authStatus, openModal, salons]);

  // Don't render anything until we know if there's data
  // This prevents the flash of skeleton → empty
  if (authStatus !== 'authenticated') {
    return null;
  }

  // Still waiting to start or haven't checked yet
  if (loadingState === 'pending') {
    return null;
  }

  // Show skeleton only while actively loading
  if (loadingState === 'loading') {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.title}>Recommended for You</h2>
        </div>
        <div className={styles.skeletonContainer}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </section>
    );
  }

  // After loading completes, only render if we have salons
  if (salons.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recommended for You</h2>
        <span className={styles.subtitle}>Based on your preferences</span>
      </div>

      <div className={styles.container}>
        <Swiper
          modules={isMobile ? [] : [Navigation]}
          navigation={isMobile ? false : {
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            if (!isMobile && typeof swiper.params.navigation !== 'boolean') {
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
          allowTouchMove={true}
          simulateTouch={true}
          touchRatio={1}
          threshold={10}
          longSwipesRatio={0.5}
          breakpoints={{
            320: {
              slidesPerView: 1.15,
            },
            769: {
              slidesPerView: 4.1,
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

        {/* Navigation buttons - hidden on mobile */}
        {!isMobile && (
          <>
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
          </>
        )}

        {/* Slide counter for mobile */}
        <div className={styles.slideCounter}>
          {activeIndex + 1}/{salons.length}
        </div>
      </div>
    </section>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(ForYouRecommendations);
