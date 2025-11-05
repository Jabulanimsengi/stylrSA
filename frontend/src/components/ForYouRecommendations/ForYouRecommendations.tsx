'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import SalonCard from '@/components/SalonCard';
import { Salon } from '@/types';
import { toast } from 'react-toastify';
import styles from './ForYouRecommendations.module.css';
import { useAuthModal } from '@/context/AuthModalContext';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

export default function ForYouRecommendations() {
  const { authStatus, user } = useAuth();
  const { openModal } = useAuthModal();
  const [salons, setSalons] = useState<SalonWithFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/salons/recommended', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        setSalons(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Don't show error toast - just show empty state
        setSalons([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if user is authenticated
    if (authStatus === 'authenticated') {
      fetchRecommendations();
    } else {
      setIsLoading(false);
    }
  }, [authStatus]);

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
      toast.success(favorited ? 'Added to favorites!' : 'Removed from favorites.');
    } catch (error) {
      toast.error('Could not update favorites. Please try again.');
      setSalons(originalSalons);
    }
  };

  // Don't show section if user is not authenticated or no recommendations
  if (authStatus !== 'authenticated' || (isLoading === false && salons.length === 0)) {
    return null;
  }

  if (isLoading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Recommended for You</h2>
        <div className={styles.skeletonContainer}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>✨ Recommended for You</h2>
        <p className={styles.subtitle}>
          Based on your preferences and favorites
        </p>
      </div>
      <div className={styles.grid}>
        {salons.map((salon) => (
          <SalonCard
            key={salon.id}
            salon={salon}
            showFavorite
            onToggleFavorite={handleToggleFavorite}
            showHours={false}
          />
        ))}
      </div>
    </section>
  );
}

