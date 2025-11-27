'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { transformCloudinary } from '@/utils/cloudinary';
import { Salon } from '@/types';
import styles from '../../SalonsPage.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaHeart } from 'react-icons/fa';
import FilterBar, { type FilterValues } from '@/components/FilterBar/FilterBar';
import { SkeletonGroup, SkeletonCard } from '@/components/Skeleton/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { getImageWithFallback } from '@/lib/placeholders';
import PageNav from '@/components/PageNav';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileSearch from '@/components/MobileSearch/MobileSearch';
import ReviewBadge from '@/components/ReviewBadge/ReviewBadge';
import { PROVINCES } from '@/lib/locationData';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

function SalonsLocationContent() {
  const params = useParams();
  const locationSlug = params.location as string;
  const [salons, setSalons] = useState<SalonWithFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();

  const locationInfo = PROVINCES[locationSlug] || {
    slug: 'south-africa',
    name: 'South Africa',
    description: 'Find the best salons and beauty professionals in South Africa',
    keywords: ['South Africa salons'],
    cities: []
  };

  const fetchSalons = useCallback(async (additionalFilters: FilterValues) => {
    setIsLoading(true);
    const query = new URLSearchParams();

    // Set province from location slug
    query.append('province', locationInfo.name);

    if (additionalFilters.city) query.append('city', additionalFilters.city);
    if (additionalFilters.service) query.append('service', additionalFilters.service);
    if (additionalFilters.category) query.append('category', additionalFilters.category);
    if (additionalFilters.offersMobile) query.append('offersMobile', 'true');
    if (additionalFilters.sortBy) query.append('sortBy', additionalFilters.sortBy);
    if (additionalFilters.openNow) query.append('openNow', 'true');
    if (additionalFilters.priceMin) query.append('priceMin', String(additionalFilters.priceMin));
    if (additionalFilters.priceMax) query.append('priceMax', String(additionalFilters.priceMax));

    const url = `/api/salons/approved?${query.toString()}`;

    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch salons');
      const data = await res.json();
      setSalons(data);
    } catch (error) {
      logger.error('Failed to fetch salons:', error);
      toast.error(toFriendlyMessage(error, 'Failed to load salons. Please try again.'));
      setSalons([]);
    } finally {
      setIsLoading(false);
    }
  }, [locationInfo.name]);

  useEffect(() => {
    fetchSalons({
      province: locationInfo.name,
      city: '',
      service: '',
      category: '',
      offersMobile: false,
      sortBy: '',
      openNow: false,
      priceMin: '',
      priceMax: '',
    });
  }, [fetchSalons, locationInfo.name]);

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

  return (
    <div className={styles.container}>
      <PageNav />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <h1 className={styles.title}>Salons in {locationInfo.name}</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666', lineHeight: '1.6' }}>
          {locationInfo.description}
        </p>
      </div>

      {isMobile ? (
        <MobileSearch onSearch={fetchSalons} />
      ) : (
        <FilterBar
          onSearch={fetchSalons}
          initialFilters={{
            province: locationInfo.name,
            city: '',
            service: '',
            category: '',
            offersMobile: false,
            sortBy: '',
            openNow: false,
            priceMin: '',
            priceMax: '',
          }}
        />
      )}

      {isLoading ? (
        salons.length === 0 ? (
          <SkeletonGroup count={8} className={styles.salonGrid}>
            {() => <SkeletonCard hasImage lines={3} />}
          </SkeletonGroup>
        ) : (
          <div className={styles.loadingState}>
            <LoadingSpinner />
          </div>
        )
      ) : salons.length === 0 ? (
        <p className={styles.emptyState}>No salons found in {locationInfo.name}.</p>
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
                <div className={styles.imageWrapper}>
                  <ReviewBadge
                    reviewCount={salon.reviews?.length || 0}
                    avgRating={salon.avgRating || 0}
                  />
                  <Image
                    src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), { width: 600, quality: 'auto', format: 'auto', crop: 'fill' })}
                    alt={`${salon.name} - Salon in ${locationInfo.name}`}
                    className={styles.cardImage}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{salon.name}</h2>
                  <p className={styles.cardLocation}>{salon.city}, {salon.province}</p>
                  {(() => {
                    const oh = salon.operatingHours as unknown;
                    let hoursRecord: Record<string, string> | null = null;
                    if (Array.isArray(oh)) {
                      const derived: Record<string, string> = {};
                      oh.forEach((entry: { day?: string; open?: string; close?: string }) => {
                        const day = entry?.day;
                        if (!day) return;
                        const open = entry.open;
                        const close = entry.close;
                        if (!open && !close) return;
                        derived[day] = `${open ?? ''} - ${close ?? ''}`.trim();
                      });
                      hoursRecord = Object.keys(derived).length > 0 ? derived : null;
                    } else if (oh && typeof oh === 'object') {
                      hoursRecord = oh as Record<string, string>;
                    }
                    if (!hoursRecord) return null;
                    const entries = Object.entries(hoursRecord);
                    if (entries.length === 0) return null;
                    const samples = entries.slice(0, 2).map(([day, hrs]) => `${day.substring(0, 3)} ${hrs}`);
                    const extra = entries.length > 2 ? ` +${entries.length - 2} more` : '';
                    return <p className={styles.cardMeta}>Hours: {samples.join(' • ')}{extra}</p>;
                  })()}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Internal Links for SEO */}
      <div style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid #eee' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          Popular Searches in {locationInfo.name}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link href={`/hair-salon/${locationInfo.slug}`} className={styles.seoLink}>
            Hair Salons in {locationInfo.name}
          </Link>
          <Link href={`/nail-salon/${locationInfo.slug}`} className={styles.seoLink}>
            Nail Salons in {locationInfo.name}
          </Link>
          <Link href={`/barbershop/${locationInfo.slug}`} className={styles.seoLink}>
            Barbershops in {locationInfo.name}
          </Link>
          <Link href={`/spas/${locationInfo.slug}`} className={styles.seoLink}>
            Spas in {locationInfo.name}
          </Link>
          <Link href={`/braids/${locationInfo.slug}`} className={styles.seoLink}>
            Braiding Salons in {locationInfo.name}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LocationPageClient() {
  return (
    <Suspense fallback={<div><LoadingSpinner /></div>}>
      <SalonsLocationContent />
    </Suspense>
  );
}
