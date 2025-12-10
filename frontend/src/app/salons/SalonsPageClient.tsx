// frontend/src/app/salons/SalonsPageClient.tsx
'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { transformCloudinary } from '@/utils/cloudinary';
import { useSearchParams } from 'next/navigation';
import { Salon } from '@/types';
import styles from './SalonsPage.module.css';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
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
import { useGeolocation } from '@/hooks/useGeolocation';
import EmptyState from '@/components/EmptyState/EmptyState';


type SalonWithFavorite = Salon & { isFavorited?: boolean };
type SalonPageFilters = Partial<FilterValues> & { q?: string; lat?: string | null; lon?: string | null };

export default function SalonsPageClient() {
    const [salons, setSalons] = useState<SalonWithFavorite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [navigatingSalonId, setNavigatingSalonId] = useState<string | null>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const router = useRouter();

    const searchParams = useSearchParams();
    const { authStatus } = useAuth();
    const { openModal } = useAuthModal();

    // Auto-request geolocation when page loads (with IP fallback)
    const geoState = useGeolocation(true);
    const { coordinates, error: geoError, source: locationSource } = geoState;

    const getInitialFilters = useCallback((): SalonPageFilters => {
        const params = new URLSearchParams(searchParams.toString());
        const urlLat = params.get('lat');
        const urlLon = params.get('lon');
        const urlSortBy = params.get('sortBy');

        // Use URL params if available, otherwise use geolocation
        const lat = urlLat || (coordinates?.latitude ? String(coordinates.latitude) : null);
        const lon = urlLon || (coordinates?.longitude ? String(coordinates.longitude) : null);

        // Auto-enable distance sorting if we have coordinates but no explicit sort
        let sortBy = urlSortBy || '';
        if (!sortBy && lat && lon) {
            sortBy = 'distance';
        }

        return {
            province: params.get('province') || '',
            city: params.get('city') || '',
            service: params.get('service') || '',
            category: params.get('category') || '',
            q: params.get('q') || '',
            offersMobile: params.get('offersMobile') === 'true',
            sortBy,
            openNow: params.get('openNow') === 'true',
            priceMin: params.get('priceMin') || '',
            priceMax: params.get('priceMax') || '',
            lat,
            lon,
        };
    }, [searchParams, coordinates]);

    const [initialFilters] = useState<SalonPageFilters>(getInitialFilters);

    const fetchSalons = useCallback(async (
        filters: Partial<FilterValues> & { q?: string; lat?: number | string | null; lon?: number | string | null }
    ) => {
        setIsLoading(true);
        const query = new URLSearchParams();

        // Add cache-busting timestamp
        query.append('_t', String(Date.now()));

        let url = '/api/salons/approved';
        if (filters.province) query.append('province', filters.province);
        if (filters.city) query.append('city', filters.city);
        if (filters.service) query.append('service', filters.service);
        if (filters.category) query.append('category', filters.category);
        if (filters.q) query.append('q', filters.q);
        if (filters.offersMobile) query.append('offersMobile', 'true');
        if (filters.sortBy) query.append('sortBy', filters.sortBy);
        if (filters.openNow) query.append('openNow', 'true');
        if (filters.priceMin) query.append('priceMin', String(filters.priceMin));
        if (filters.priceMax) query.append('priceMax', String(filters.priceMax));
        if (filters.sortBy === 'distance' && filters.lat && filters.lon) {
            query.append('lat', String(filters.lat));
            query.append('lon', String(filters.lon));
            if (filters.radius) {
                query.append('radius', String(filters.radius));
            }
        }
        const queryString = query.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        try {
            const res = await fetch(url, { credentials: 'include', cache: 'no-store' as any });
            if (!res.ok) throw new Error('Failed to fetch salons');
            const data = await res.json();
            console.log('📋 Salons loaded:', data.map((s: any) => ({ name: s.name, hasLogo: !!s.logo })));
            setSalons(data);
        } catch (error) {
            logger.error('Failed to fetch salons:', error);
            toast.error(toFriendlyMessage(error, 'Failed to load salons. Please try again.'));
            setSalons([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSalons(getInitialFilters());
    }, [getInitialFilters, fetchSalons, authStatus]);

    // Show notification when location is detected
    useEffect(() => {
        if (coordinates && !searchParams.get('lat')) {
            const message = locationSource === 'ip'
                ? '📍 Showing salons near your estimated location'
                : '📍 Showing salons near your location';
            toast.info(message, {
                position: 'bottom-center',
                autoClose: 3000,
            });
        }
    }, [coordinates, searchParams, locationSource]);

    // Show error if geolocation fails
    useEffect(() => {
        if (geoError) {
            logger.debug('Geolocation error:', geoError);
            // Don't show toast for permission denied, as it's user choice
            if (!geoError.includes('denied')) {
                toast.warn('Unable to get your location. Showing all salons instead.');
            }
        }
    }, [geoError]);

    // Listen for salon updates from EditSalonModal
    useEffect(() => {
        const handleSalonUpdate = (event: any) => {
            console.log('🔄 SalonsPage: Salon updated event received, refetching...');
            setTimeout(() => {
                fetchSalons(getInitialFilters());
            }, 500);
        };

        window.addEventListener('salon-updated', handleSalonUpdate);
        return () => window.removeEventListener('salon-updated', handleSalonUpdate);
    }, [fetchSalons, getInitialFilters]);


    const handleToggleFavorite = async (e: React.MouseEvent, salonId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (authStatus !== 'authenticated') {
            toast.info('Please log in to add salons to your favorites.');
            openModal('login');
            return;
        }

        // Optimistic UI update
        const originalSalons = salons;
        setSalons(prevSalons =>
            prevSalons.map(salon =>
                salon.id === salonId ? { ...salon, isFavorited: !salon.isFavorited } : salon
            )
        );

        try {
            const res = await fetch(`/api/favorites/toggle/${salonId}`, {
                method: 'POST',
                credentials: 'include', // This sends the required authentication cookie
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
            setSalons(originalSalons);
        }
    };


    return (
        <div className={styles.container}>
            <PageNav />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                <h1 className={styles.title}>Explore Salons</h1>
                <p style={{ fontSize: '1rem', marginBottom: '1rem', color: '#666' }}>
                    <Link href="/salons/near-me" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                        Find salons near you →
                    </Link>
                </p>
            </div>

            {isMobile ? (
                <MobileSearch onSearch={fetchSalons} />
            ) : (
                <FilterBar onSearch={fetchSalons} initialFilters={initialFilters} />
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
                <EmptyState
                    variant="no-results"
                    title="No Salons Found"
                    description="Try adjusting your filters or search terms to find salons near you."
                />
            ) : (
                <div className={styles.salonGrid}>
                    {salons.map((salon) => {
                        const isNavigating = navigatingSalonId === salon.id;
                        const salonUrl = `/salons/${salon.slug || salon.id}`;

                        const handleCardClick = (e: React.MouseEvent) => {
                            // Don't navigate if clicking on favorite button
                            if ((e.target as HTMLElement).closest('button')) {
                                return;
                            }
                            e.preventDefault();
                            setNavigatingSalonId(salon.id);
                            router.push(salonUrl);
                            // Reset after timeout in case navigation fails
                            setTimeout(() => setNavigatingSalonId(null), 5000);
                        };

                        return (
                            <div
                                key={salon.id}
                                className={`${styles.salonCard} ${isNavigating ? styles.navigating : ''}`}
                                onClick={handleCardClick}
                                style={{ cursor: 'pointer' }}
                            >
                                {isNavigating && (
                                    <div className={styles.cardLoadingOverlay}>
                                        <LoadingSpinner size="medium" color="white" />
                                    </div>
                                )}
                                <button
                                    onClick={(e) => handleToggleFavorite(e, salon.id)}
                                    className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}
                                    aria-label={salon.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    <FaHeart />
                                </button>
                                <div className={styles.salonLink}>
                                    <div className={styles.imageWrapper}>
                                        <ReviewBadge
                                            reviewCount={salon.reviews?.length || 0}
                                            avgRating={salon.avgRating || 0}
                                        />
                                        <Image
                                            src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), { width: 600, quality: 'auto', format: 'auto', crop: 'fill' })}
                                            alt={`A photo of ${salon.name}`}
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
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
