// frontend/src/app/videos/VideosPageClient.tsx
'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './Videos.module.css';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import FilterBar, { type FilterValues } from '@/components/FilterBar/FilterBar';
import { SkeletonGroup, SkeletonCard } from '@/components/Skeleton/Skeleton';
import { toast } from 'react-toastify';
import { logger } from '@/lib/logger';
import PageNav from '@/components/PageNav';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileSearch from '@/components/MobileSearch/MobileSearch';
import EmptyState from '@/components/EmptyState/EmptyState';
import VideoLightbox from '@/components/VideoLightbox/VideoLightbox';
import { getSalonUrl } from '@/utils/salonUrl';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface ServiceVideo {
    id: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    caption?: string;
    views: number;
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
    videos: ServiceVideo[];
}

type VideoFilters = Partial<FilterValues> & { q?: string };

// Province row component with horizontal scrolling
function ProvinceRow({
    province,
    videos,
    onVideoClick,
    isMobile
}: {
    province: string;
    videos: ServiceVideo[];
    onVideoClick: (video: ServiceVideo) => void;
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
    }, [checkScrollButtons, videos]);

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
                    <span className={styles.videoCount}>({videos.length} {videos.length === 1 ? 'video' : 'videos'})</span>
                </h2>
                <Link href={`/videos?province=${encodeURIComponent(province)}`} className={styles.viewAllLink}>
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
                    {videos.map((video) => (
                        <div
                            key={video.id}
                            className={styles.videoCard}
                            onClick={() => onVideoClick(video)}
                        >
                            <div className={styles.videoWrapper}>
                                <div className={styles.videoBadge}>
                                    <span className={styles.badgeLabel}>Video</span>
                                </div>
                                {video.thumbnailUrl ? (
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.caption || 'Service video'}
                                        className={styles.thumbnail}
                                    />
                                ) : (
                                    <div className={styles.videoPlaceholder}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                )}
                                <div className={styles.playOverlay}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                                        <circle cx="12" cy="12" r="10" fill="rgba(245, 25, 87, 0.9)" />
                                        <path d="M10 8l6 4-6 4V8z" fill="white" />
                                    </svg>
                                </div>
                                <div className={styles.duration}>{video.duration}s</div>
                            </div>
                            <div className={styles.cardContent}>
                                <Link href={getSalonUrl(video.salon)} className={styles.cardTitle} onClick={(e) => e.stopPropagation()}>
                                    {video.salon.name}
                                </Link>
                                <p className={styles.cardLocation}>
                                    {video.salon.city}
                                </p>
                                {video.service && (
                                    <p className={styles.cardMeta}>{video.service.title}</p>
                                )}
                                <p className={styles.viewCount}>
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                    </svg>
                                    {video.views.toLocaleString()} views
                                </p>
                            </div>
                        </div>
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

export default function VideosPageClient() {
    const [videos, setVideos] = useState<ServiceVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<ServiceVideo | null>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const isMobile = useMediaQuery('(max-width: 768px)');

    const searchParams = useSearchParams();

    const getInitialFilters = useCallback((): VideoFilters => {
        const params = new URLSearchParams(searchParams.toString());
        return {
            province: params.get('province') || '',
            city: params.get('city') || '',
            q: params.get('q') || '',
        };
    }, [searchParams]);

    const [initialFilters] = useState<VideoFilters>(getInitialFilters);

    // Group videos by province and sort by count
    const provinceGroups = useMemo((): ProvinceGroup[] => {
        const groups: Record<string, ServiceVideo[]> = {};

        videos.forEach(video => {
            const province = video.salon?.province || 'Other';
            if (!groups[province]) {
                groups[province] = [];
            }
            groups[province].push(video);
        });

        // Sort provinces by number of videos (descending)
        return Object.entries(groups)
            .map(([province, videoList]) => ({ province, videos: videoList }))
            .filter(group => group.videos.length > 0)
            .sort((a, b) => b.videos.length - a.videos.length);
    }, [videos]);

    // Check if filtering by specific province
    const isFilteredByProvince = Boolean(searchParams.get('province'));

    const fetchVideos = useCallback(async (
        filters: Partial<FilterValues> & { q?: string }
    ) => {
        setIsLoading(true);
        const query = new URLSearchParams();

        query.append('_t', String(Date.now()));
        query.append('limit', '100');

        if (filters.province) query.append('province', filters.province);
        if (filters.city) query.append('city', filters.city);
        if (filters.q) query.append('q', filters.q);

        const url = `/api/videos/approved?${query.toString()}`;

        try {
            const res = await fetch(url, { credentials: 'include', cache: 'no-store' as any });
            if (!res.ok) throw new Error('Failed to fetch videos');
            const data = await res.json();
            setVideos(data);
        } catch (error) {
            logger.error('Failed to fetch videos:', error);
            toast.error('Failed to load videos. Please try again.');
            setVideos([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVideos(getInitialFilters());
    }, [getInitialFilters, fetchVideos]);

    const handleVideoClick = (video: ServiceVideo) => {
        setSelectedVideo(video);
        setIsLightboxOpen(true);
    };

    const handleCloseLightbox = () => {
        setIsLightboxOpen(false);
        setSelectedVideo(null);
    };

    return (
        <div className={styles.container}>
            <PageNav />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                <h1 className={styles.title}>Service Videos</h1>
                <p className={styles.subtitle}>
                    Watch styling techniques and transformations from top salons
                </p>
            </div>

            {isMobile ? (
                <MobileSearch onSearch={fetchVideos} />
            ) : (
                <FilterBar onSearch={fetchVideos} initialFilters={initialFilters} />
            )}

            {isLoading ? (
                videos.length === 0 ? (
                    <SkeletonGroup count={8} className={styles.videoGrid}>
                        {() => <SkeletonCard hasImage lines={2} />}
                    </SkeletonGroup>
                ) : (
                    <div className={styles.loadingState}>
                        <LoadingSpinner />
                    </div>
                )
            ) : videos.length === 0 ? (
                <EmptyState
                    variant="no-results"
                    title="No Videos Found"
                    description="Try adjusting your filters to find more videos."
                />
            ) : isFilteredByProvince ? (
                // If filtered by province, show traditional grid
                <div className={styles.videoGrid}>
                    {videos.map((video) => (
                        <div
                            key={video.id}
                            className={`${styles.videoCard} ${styles.gridCard}`}
                            onClick={() => handleVideoClick(video)}
                        >
                            <div className={styles.videoWrapper}>
                                <div className={styles.videoBadge}>
                                    <span className={styles.badgeLabel}>Video</span>
                                </div>
                                {video.thumbnailUrl ? (
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.caption || 'Service video'}
                                        className={styles.thumbnail}
                                    />
                                ) : (
                                    <div className={styles.videoPlaceholder}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                )}
                                <div className={styles.playOverlay}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                                        <circle cx="12" cy="12" r="10" fill="rgba(245, 25, 87, 0.9)" />
                                        <path d="M10 8l6 4-6 4V8z" fill="white" />
                                    </svg>
                                </div>
                                <div className={styles.duration}>{video.duration}s</div>
                            </div>
                            <div className={styles.cardContent}>
                                <Link href={getSalonUrl(video.salon)} className={styles.cardTitle} onClick={(e) => e.stopPropagation()}>
                                    {video.salon.name}
                                </Link>
                                <p className={styles.cardLocation}>
                                    {video.salon.city}, {video.salon.province}
                                </p>
                                {video.service && (
                                    <p className={styles.cardMeta}>{video.service.title}</p>
                                )}
                                <p className={styles.viewCount}>
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                    </svg>
                                    {video.views.toLocaleString()} views
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Otherwise, show grouped by province with horizontal scrolling
                <div className={styles.provinceGroupsContainer}>
                    {provinceGroups.map((group) => (
                        <ProvinceRow
                            key={group.province}
                            province={group.province}
                            videos={group.videos}
                            onVideoClick={handleVideoClick}
                            isMobile={isMobile}
                        />
                    ))}
                </div>
            )}

            {selectedVideo && (
                <VideoLightbox
                    videoUrl={selectedVideo.videoUrl}
                    isOpen={isLightboxOpen}
                    onClose={handleCloseLightbox}
                    salonName={selectedVideo.salon.name}
                    caption={selectedVideo.caption}
                />
            )}
        </div>
    );
}
