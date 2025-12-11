// frontend/src/app/before-after/BeforeAfterPageClient.tsx
'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import styles from './BeforeAfter.module.css';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import FilterBar, { type FilterValues } from '@/components/FilterBar/FilterBar';
import { SkeletonGroup, SkeletonCard } from '@/components/Skeleton/Skeleton';
import { toast } from 'react-toastify';
import { logger } from '@/lib/logger';
import PageNav from '@/components/PageNav';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileSearch from '@/components/MobileSearch/MobileSearch';
import EmptyState from '@/components/EmptyState/EmptyState';
import { getSalonUrl } from '@/utils/salonUrl';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface BeforeAfterPhoto {
    id: string;
    beforeImageUrl: string;
    afterImageUrl: string;
    caption?: string;
    createdAt: string;
    salon: {
        id: string;
        name: string;
        city: string;
        province: string;
        slug?: string | null;
    };
    service?: {
        id: string;
        title: string;
    };
}

interface ProvinceGroup {
    province: string;
    photos: BeforeAfterPhoto[];
}

type PhotoFilters = Partial<FilterValues> & { q?: string };

// PhotoCard component - matches homepage BeforeAfterCard design
function PhotoCard({
    photo,
    onFullView
}: {
    photo: BeforeAfterPhoto;
    onFullView: (photo: BeforeAfterPhoto) => void;
}) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [photo.beforeImageUrl, photo.afterImageUrl];
    const labels = ['Before', 'After'];

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex(0);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex(1);
    };

    return (
        <div className={styles.photoCard}>
            <div className={styles.imageContainer} onClick={() => onFullView(photo)}>
                <Image
                    src={images[currentImageIndex]}
                    alt={`${labels[currentImageIndex]} - ${photo.service?.title || 'Transformation'}`}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 160px, 240px"
                />
                <span className={styles.imageLabel}>{labels[currentImageIndex]}</span>

                {/* Navigation arrows */}
                <button
                    className={`${styles.navArrowCard} ${styles.navPrevCard}`}
                    onClick={handlePrev}
                    disabled={currentImageIndex === 0}
                    aria-label="View before image"
                >
                    ‹
                </button>
                <button
                    className={`${styles.navArrowCard} ${styles.navNextCard}`}
                    onClick={handleNext}
                    disabled={currentImageIndex === 1}
                    aria-label="View after image"
                >
                    ›
                </button>
            </div>
            <div className={styles.cardContent}>
                <Link href={getSalonUrl(photo.salon)} className={styles.cardTitle} onClick={(e) => e.stopPropagation()}>
                    {photo.salon.name}
                </Link>
                <p className={styles.cardLocation}>
                    {photo.salon.city}
                </p>
                {photo.service && (
                    <p className={styles.cardMeta}>{photo.service.title}</p>
                )}
            </div>
        </div>
    );
}

// Province row component with horizontal scrolling
function ProvinceRow({
    province,
    photos,
    onPhotoClick,
    isMobile
}: {
    province: string;
    photos: BeforeAfterPhoto[];
    onPhotoClick: (photo: BeforeAfterPhoto) => void;
    isMobile: boolean;
}) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScrollButtons = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }, []);

    useEffect(() => {
        checkScrollButtons();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollButtons);
            window.addEventListener('resize', checkScrollButtons);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', checkScrollButtons);
            }
            window.removeEventListener('resize', checkScrollButtons);
        };
    }, [checkScrollButtons, photos]);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cardWidth = isMobile ? 160 : 240;
        const scrollAmount = cardWidth * 2;

        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    return (
        <section className={styles.provinceSection}>
            <div className={styles.provinceHeader}>
                <h2 className={styles.provinceTitle}>
                    {province}
                    <span className={styles.photoCount}>({photos.length} {photos.length === 1 ? 'photo' : 'photos'})</span>
                </h2>
                <Link href={`/before-after?province=${encodeURIComponent(province)}`} className={styles.viewAllLink}>
                    View all →
                </Link>
            </div>

            <div className={styles.scrollWrapper}>
                {!isMobile && canScrollLeft && (
                    <button
                        className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
                        onClick={() => scroll('left')}
                        aria-label="Scroll left"
                    >
                        <FaChevronLeft />
                    </button>
                )}

                <div
                    ref={scrollContainerRef}
                    className={styles.horizontalScroll}
                >
                    {photos.map((photo) => (
                        <PhotoCard
                            key={photo.id}
                            photo={photo}
                            onFullView={onPhotoClick}
                        />
                    ))}
                </div>

                {!isMobile && canScrollRight && (
                    <button
                        className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
                        onClick={() => scroll('right')}
                        aria-label="Scroll right"
                    >
                        <FaChevronRight />
                    </button>
                )}
            </div>
        </section>
    );
}

export default function BeforeAfterPageClient() {
    const [photos, setPhotos] = useState<BeforeAfterPhoto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState<BeforeAfterPhoto | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // 0 = Before, 1 = After
    const isMobile = useMediaQuery('(max-width: 768px)');

    const searchParams = useSearchParams();

    const getInitialFilters = useCallback((): PhotoFilters => {
        const params = new URLSearchParams(searchParams.toString());
        return {
            province: params.get('province') || '',
            city: params.get('city') || '',
            q: params.get('q') || '',
        };
    }, [searchParams]);

    const [initialFilters] = useState<PhotoFilters>(getInitialFilters);

    // Group photos by province and sort by count
    const provinceGroups = useMemo((): ProvinceGroup[] => {
        const groups: Record<string, BeforeAfterPhoto[]> = {};

        photos.forEach(photo => {
            const province = photo.salon?.province || 'Other';
            if (!groups[province]) {
                groups[province] = [];
            }
            groups[province].push(photo);
        });

        // Sort provinces by number of photos (descending)
        return Object.entries(groups)
            .map(([province, photoList]) => ({ province, photos: photoList }))
            .filter(group => group.photos.length > 0)
            .sort((a, b) => b.photos.length - a.photos.length);
    }, [photos]);

    // Check if filtering by specific province
    const isFilteredByProvince = Boolean(searchParams.get('province'));

    const fetchPhotos = useCallback(async (
        filters: Partial<FilterValues> & { q?: string }
    ) => {
        setIsLoading(true);
        const query = new URLSearchParams();

        query.append('_t', String(Date.now()));
        query.append('limit', '100');

        if (filters.province) query.append('province', filters.province);
        if (filters.city) query.append('city', filters.city);
        if (filters.q) query.append('q', filters.q);

        const url = `/api/before-after/approved?${query.toString()}`;

        try {
            const res = await fetch(url, { credentials: 'include', cache: 'no-store' as any });
            if (!res.ok) throw new Error('Failed to fetch photos');
            const data = await res.json();
            setPhotos(data);
        } catch (error) {
            logger.error('Failed to fetch before/after photos:', error);
            toast.error('Failed to load photos. Please try again.');
            setPhotos([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPhotos(getInitialFilters());
    }, [getInitialFilters, fetchPhotos]);

    const handlePhotoClick = (photo: BeforeAfterPhoto) => {
        setSelectedPhoto(photo);
        setCurrentImageIndex(0); // Start with Before image
    };

    const handleCloseModal = () => {
        setSelectedPhoto(null);
        setCurrentImageIndex(0);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex(0);
    };

    const handleNextImage = () => {
        setCurrentImageIndex(1);
    };

    const currentImage = selectedPhoto
        ? (currentImageIndex === 0 ? selectedPhoto.beforeImageUrl : selectedPhoto.afterImageUrl)
        : '';
    const currentLabel = currentImageIndex === 0 ? 'Before' : 'After';

    return (
        <div className={styles.container}>
            <PageNav />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                <h1 className={styles.title}>Before & After Transformations</h1>
                <p className={styles.subtitle}>
                    See real results from top stylists and salons
                </p>
            </div>

            {isMobile ? (
                <MobileSearch onSearch={fetchPhotos} />
            ) : (
                <FilterBar onSearch={fetchPhotos} initialFilters={initialFilters} />
            )}

            {isLoading ? (
                photos.length === 0 ? (
                    <SkeletonGroup count={8} className={styles.photoGrid}>
                        {() => <SkeletonCard hasImage lines={2} />}
                    </SkeletonGroup>
                ) : (
                    <div className={styles.loadingState}>
                        <LoadingSpinner />
                    </div>
                )
            ) : photos.length === 0 ? (
                <EmptyState
                    variant="no-results"
                    title="No Transformations Found"
                    description="Try adjusting your filters to see more results."
                />
            ) : isFilteredByProvince ? (
                // If filtered by province, show traditional grid
                <div className={styles.photoGrid}>
                    {photos.map((photo) => (
                        <PhotoCard
                            key={photo.id}
                            photo={photo}
                            onFullView={handlePhotoClick}
                        />
                    ))}
                </div>
            ) : (
                // Otherwise, show grouped by province with horizontal scrolling
                <div className={styles.provinceGroupsContainer}>
                    {provinceGroups.map((group) => (
                        <ProvinceRow
                            key={group.province}
                            province={group.province}
                            photos={group.photos}
                            onPhotoClick={handlePhotoClick}
                            isMobile={isMobile}
                        />
                    ))}
                </div>
            )}

            {/* Full view modal - Single image with navigation */}
            {selectedPhoto && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={handleCloseModal}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        {/* Single image display */}
                        <div className={styles.modalSingleImage}>
                            <span className={styles.modalLabel}>{currentLabel}</span>
                            <Image
                                src={currentImage}
                                alt={currentLabel}
                                fill
                                className={styles.modalImage}
                                sizes="90vw"
                            />

                            {/* Navigation arrows */}
                            <button
                                className={`${styles.navArrow} ${styles.navPrev}`}
                                onClick={handlePrevImage}
                                disabled={currentImageIndex === 0}
                                aria-label="View before image"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                            <button
                                className={`${styles.navArrow} ${styles.navNext}`}
                                onClick={handleNextImage}
                                disabled={currentImageIndex === 1}
                                aria-label="View after image"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </button>
                        </div>

                        {/* Dots indicator */}
                        <div className={styles.dotsContainer}>
                            <button
                                className={`${styles.dot} ${currentImageIndex === 0 ? styles.dotActive : ''}`}
                                onClick={handlePrevImage}
                                aria-label="Before"
                            />
                            <button
                                className={`${styles.dot} ${currentImageIndex === 1 ? styles.dotActive : ''}`}
                                onClick={handleNextImage}
                                aria-label="After"
                            />
                        </div>

                        <div className={styles.modalInfo}>
                            <Link href={getSalonUrl(selectedPhoto.salon)} className={styles.modalTitle}>
                                {selectedPhoto.salon.name}
                            </Link>
                            <p className={styles.modalLocation}>
                                {selectedPhoto.salon.city}, {selectedPhoto.salon.province}
                            </p>
                            {selectedPhoto.caption && (
                                <p className={styles.modalCaption}>{selectedPhoto.caption}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
