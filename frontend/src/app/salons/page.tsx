// frontend/src/app/salons/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Salon } from '@/types';
import styles from './SalonsPage.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaHome, FaArrowLeft, FaHeart } from 'react-icons/fa';
import FilterBar from '@/components/FilterBar/FilterBar';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

export default function SalonsPage() {
  const [salons, setSalons] = useState<SalonWithFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();

  const getInitialFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    return {
      province: params.get('province') || '',
      city: params.get('city') || '',
      service: params.get('service') || '',
      offersMobile: params.get('offersMobile') === 'true',
      sortBy: params.get('sortBy') || '',
      openOn: params.get('openOn') || '',
      lat: params.get('lat') || null,
      lon: params.get('lon') || null,
    };
  }, [searchParams]);

  const [initialFilters] = useState(getInitialFilters);


  const fetchSalons = useCallback(async (filters: any) => {
    setIsLoading(true);
    let url = 'http://localhost:3000/api/salons/approved';
    const query = new URLSearchParams();
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    if (filters.lat && filters.lon) {
      url = `http://localhost:3000/api/salons/nearby?lat=${filters.lat}&lon=${filters.lon}`;
    } else {
      if (filters.province) query.append('province', filters.province);
      if (filters.city) query.append('city', filters.city);
      if (filters.service) query.append('service', filters.service);
      if (filters.offersMobile) query.append('offersMobile', 'true');
      if (filters.sortBy) query.append('sortBy', filters.sortBy);
      if (filters.openOn) query.append('openOn', filters.openOn);
      const queryString = query.toString();
      if (queryString) {
        url = `http://localhost:3000/api/salons/approved?${queryString}`;
      }
    }

    try {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('Failed to fetch salons');
      const data = await res.json();
      setSalons(data);
    } catch (error) {
      console.error(error);
      setSalons([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalons(getInitialFilters());
  }, [getInitialFilters, fetchSalons, authStatus]);


  const handleToggleFavorite = async (e: React.MouseEvent, salonId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (authStatus !== 'authenticated') {
      toast.info('Please log in to add salons to your favorites.');
      openModal('login');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Optimistic UI update
    setSalons(prevSalons =>
      prevSalons.map(salon =>
        salon.id === salonId ? { ...salon, isFavorited: !salon.isFavorited } : salon
      )
    );

    try {
      const res = await fetch(`http://localhost:3000/api/favorites/toggle/${salonId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to update favorite status.');
      }

      const { favorited } = await res.json();
      const message = favorited ? 'Added to favorites!' : 'Removed from favorites.';
      toast.success(message);

    } catch (error) {
      toast.error('Could not update favorites. Please try again.');
      // Revert UI on error
      setSalons(prevSalons =>
        prevSalons.map(salon =>
          salon.id === salonId ? { ...salon, isFavorited: !salon.isFavorited } : salon
        )
      );
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.stickyHeader}>
        <div className={styles.navButtonsContainer}>
          <button onClick={() => router.back()} className={styles.navButton}><FaArrowLeft /> Back</button>
          <Link href="/" className={styles.navButton}><FaHome /> Home</Link>
        </div>
        <h1 className={styles.title}>Explore Salons</h1>
        <div className={styles.headerSpacer}></div>
      </div>

      <FilterBar onSearch={fetchSalons} initialFilters={initialFilters} />

      {isLoading ? (
        <LoadingSpinner />
      ) : salons.length === 0 ? (
        <p>No salons found matching your criteria.</p>
      ) : (
        <div className={styles.salonGrid}>
          {salons.map((salon) => (
            <div key={salon.id} className={styles.salonCard}>
              <button
                onClick={(e) => handleToggleFavorite(e, salon.id)}
                className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}
                aria-label={salon.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <FaHeart />
              </button>
              <Link href={`/salons/${salon.id}`} className={styles.salonLink}>
                <img
                  src={salon.backgroundImage || 'https://via.placeholder.com/400x200'}
                  alt={`A photo of ${salon.name}`}
                  className={styles.cardImage}
                />
                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{salon.name}</h2>
                  <p className={styles.cardLocation}>{salon.city}, {salon.province}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}