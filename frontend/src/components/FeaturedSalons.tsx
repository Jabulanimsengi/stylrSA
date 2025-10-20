'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import SalonCard from './SalonCard';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { Salon } from '@/types';
import styles from './FeaturedSalons.module.css';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

export default function FeaturedSalons() {
  const [salons, setSalons] = useState<SalonWithFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasScrollableContent, setHasScrollableContent] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
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
  const scrollByAmount = useCallback((direction: 'left' | 'right') => {
    const node = scrollRef.current;
    if (!node) return;
    const delta = direction === 'left' ? -node.clientWidth : node.clientWidth;
    node.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    const { scrollLeft, scrollWidth, clientWidth } = node;
    setHasScrollableContent(scrollWidth > clientWidth + 8);
    if (scrollWidth <= clientWidth) {
      setScrollPosition(0);
      return;
    }
    if (scrollLeft <= 8) {
      setScrollPosition(0);
    } else if (scrollLeft + clientWidth >= scrollWidth - 8) {
      setScrollPosition(2);
    } else {
      setScrollPosition(1);
    }
  }, []);

  useEffect(() => {
    handleScroll();
  }, [handleScroll, salons]);

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
    return null; // Don't show section if no featured salons
  }

  return (
    <div className={styles.container}>
      {hasScrollableContent && scrollPosition !== 0 && (
        <button
          type="button"
          className={`${styles.chevron} ${styles.chevronLeft}`}
          onClick={() => scrollByAmount('left')}
          aria-label="Scroll salons left"
        >
          <FaChevronLeft />
        </button>
      )}

      <div
        className={styles.carouselRow}
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {salons.map((salon) => (
          <SalonCard
            key={salon.id}
            salon={salon}
            showFavorite
            onToggleFavorite={handleToggleFavorite}
            showHours={false}
            compact
          />
        ))}
      </div>

      {hasScrollableContent && scrollPosition !== 2 && salons.length > 0 && (
        <button
          type="button"
          className={`${styles.chevron} ${styles.chevronRight}`}
          onClick={() => scrollByAmount('right')}
          aria-label="Scroll salons right"
        >
          <FaChevronRight />
        </button>
      )}
    </div>
  );
}
