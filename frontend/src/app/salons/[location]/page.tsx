'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { transformCloudinary } from '@/utils/cloudinary';
import { Salon } from '@/types';
import styles from '../SalonsPage.module.css';
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

type SalonWithFavorite = Salon & { isFavorited?: boolean };

// Location information for SEO
const LOCATION_INFO: Record<string, { name: string; description: string; keywords: string }> = {
  'gauteng': {
    name: 'Gauteng',
    description: 'Find top-rated salons and beauty professionals in Gauteng, South Africa. Book appointments at the best hair salons, nail salons, spas, and barbershops in Johannesburg, Pretoria, and surrounding areas.',
    keywords: 'Gauteng salons, Johannesburg hair salon, Pretoria beauty salon, Gauteng spa, Johannesburg nail salon',
  },
  'western-cape': {
    name: 'Western Cape',
    description: 'Discover premier salons and beauty services in the Western Cape. Book appointments at top-rated hair salons, nail salons, and spas in Cape Town, Stellenbosch, and the Garden Route.',
    keywords: 'Western Cape salons, Cape Town hair salon, Cape Town beauty salon, Western Cape spa, Cape Town nail salon',
  },
  'kwazulu-natal': {
    name: 'KwaZulu-Natal',
    description: 'Find the best salons and beauty professionals in KwaZulu-Natal. Book services at top hair salons, nail salons, and spas in Durban, Pietermaritzburg, and the North Coast.',
    keywords: 'KwaZulu-Natal salons, Durban hair salon, Durban beauty salon, KZN spa, Durban nail salon',
  },
  'eastern-cape': {
    name: 'Eastern Cape',
    description: 'Explore top salons and beauty services in the Eastern Cape. Book appointments at the best hair salons, nail salons, and spas in Port Elizabeth, East London, and surrounding areas.',
    keywords: 'Eastern Cape salons, Port Elizabeth hair salon, East London beauty salon, Eastern Cape spa',
  },
  'mpumalanga': {
    name: 'Mpumalanga',
    description: 'Find professional salons and beauty services in Mpumalanga. Book appointments at top-rated hair salons, nail salons, and spas in Nelspruit, Witbank, and the Lowveld region.',
    keywords: 'Mpumalanga salons, Nelspruit hair salon, Mpumalanga beauty salon, Lowveld spa',
  },
  'limpopo': {
    name: 'Limpopo',
    description: 'Discover quality salons and beauty professionals in Limpopo. Book services at the best hair salons, nail salons, and spas in Polokwane, Tzaneen, and surrounding areas.',
    keywords: 'Limpopo salons, Polokwane hair salon, Limpopo beauty salon, Polokwane spa',
  },
  'north-west': {
    name: 'North West',
    description: 'Find top salons and beauty services in North West Province. Book appointments at the best hair salons, nail salons, and spas in Rustenburg, Mahikeng, and Potchefstroom.',
    keywords: 'North West salons, Rustenburg hair salon, North West beauty salon, Mahikeng spa',
  },
  'free-state': {
    name: 'Free State',
    description: 'Explore professional salons and beauty services in the Free State. Book appointments at top-rated hair salons, nail salons, and spas in Bloemfontein, Welkom, and surrounding areas.',
    keywords: 'Free State salons, Bloemfontein hair salon, Free State beauty salon, Bloemfontein spa',
  },
  'northern-cape': {
    name: 'Northern Cape',
    description: 'Find quality salons and beauty professionals in the Northern Cape. Book services at the best hair salons, nail salons, and spas in Kimberley, Upington, and the region.',
    keywords: 'Northern Cape salons, Kimberley hair salon, Northern Cape beauty salon, Kimberley spa',
  },
};

function SalonsLocationContent() {
  const params = useParams();
  const locationSlug = params.location as string;
  const [salons, setSalons] = useState<SalonWithFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();

  const locationInfo = LOCATION_INFO[locationSlug] || {
    name: 'South Africa',
    description: 'Find the best salons and beauty professionals in South Africa',
    keywords: 'South Africa salons',
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
                    const samples = entries.slice(0, 2).map(([day, hrs]) => `${day.substring(0,3)} ${hrs}`);
                    const extra = entries.length > 2 ? ` +${entries.length - 2} more` : '';
                    return <p className={styles.cardMeta}>Hours: {samples.join(' • ')}{extra}</p>;
                  })()}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SalonsLocationPage() {
  return (
    <Suspense fallback={<div><LoadingSpinner /></div>}>
      <SalonsLocationContent />
    </Suspense>
  );
}
