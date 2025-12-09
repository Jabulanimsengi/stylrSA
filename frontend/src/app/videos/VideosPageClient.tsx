// frontend/src/app/videos/VideosPageClient.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
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

type VideoFilters = Partial<FilterValues> & { q?: string };

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

    const fetchVideos = useCallback(async (
        filters: Partial<FilterValues> & { q?: string }
    ) => {
        setIsLoading(true);
        const query = new URLSearchParams();

        query.append('_t', String(Date.now()));
        query.append('limit', '50');

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
            ) : (
                <div className={styles.videoGrid}>
                    {videos.map((video) => (
                        <div
                            key={video.id}
                            className={styles.videoCard}
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
                                <Link href={getSalonUrl(video.salon)} className={styles.cardTitle}>
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
