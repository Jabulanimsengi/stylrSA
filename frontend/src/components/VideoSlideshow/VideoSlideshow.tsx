'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import VideoLightbox from '@/components/VideoLightbox/VideoLightbox';
import OptimizedImage from '@/components/OptimizedImage/OptimizedImage';
import styles from './VideoSlideshow.module.css';
import { getSalonUrl } from '@/utils/salonUrl';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import 'swiper/css';
import 'swiper/css/navigation';

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

export default function VideoSlideshow() {
  const [videos, setVideos] = useState<ServiceVideo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  // 'pending' = not started, 'loading' = fetching, 'done' = completed
  const [loadingState, setLoadingState] = useState<'pending' | 'loading' | 'done'>('pending');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ServiceVideo | null>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoadingState('loading');
    try {
      const res = await fetch('/api/videos/approved?limit=20');
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoadingState('done');
    }
  };

  const handleVideoClick = (video: ServiceVideo) => {
    setSelectedVideo(video);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedVideo(null);
  };

  // Don't render anything until we've started fetching
  // This prevents the flash of skeleton → empty
  if (loadingState === 'pending') {
    return null;
  }

  // Don't show skeleton during loading - only show content once we have it
  // This prevents skeleton flash when there's no videos
  if (loadingState === 'loading') {
    return null;
  }

  // After loading completes, only render if we have videos
  if (videos.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>Service Video Highlights</h2>
        <Link href="/videos" className={styles.viewAll}>View All</Link>
      </div>

      {/* Instagram Stories-style layout for mobile */}
      <div className={styles.storiesContainer}>
        <div className={styles.storiesRow}>
          {videos.map((video) => (
            <div
              key={video.id}
              className={styles.storyItem}
              onClick={() => handleVideoClick(video)}
            >
              <div className={styles.storyCircle}>
                <div className={styles.storyCircleInner}>
                  {video.thumbnailUrl ? (
                    <OptimizedImage
                      src={video.thumbnailUrl}
                      alt={video.salon.name}
                      width={72}
                      height={72}
                      className={styles.storyThumbnail}
                    />
                  ) : (
                    <div className={styles.storyThumbnail} style={{ background: 'linear-gradient(135deg, #F51957 0%, #d4144c 100%)' }} />
                  )}
                  <div className={styles.storyPlayIcon}>
                    <svg viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className={styles.storyInfo}>
                <p className={styles.storyName}>{video.salon.name}</p>
                <p className={styles.storyLocation}>{video.salon.city}</p>
                <p className={styles.storyViews}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                  {video.views.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card layout for desktop */}
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
          style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            minHeight: isMobile ? '260px' : '280px',
          }}
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
          {videos.map((video) => {
            return (
              <SwiperSlide
                key={video.id}
                style={{
                  width: isMobile ? 'calc(100% / 1.15)' : 'calc((100% - 48px) / 4.1)',
                  minHeight: isMobile ? '260px' : '280px',
                  flexShrink: 0,
                }}
              >
                <div className={styles.card}>
                  <div className={styles.videoWrapper} onClick={() => handleVideoClick(video)}>
                    <div className={styles.videoBadge}>
                      <span className={styles.badgeLabel}>Video</span>
                    </div>
                    {/* Always use video tag as we migrated to Cloudinary */}
                    <div className={styles.videoElementWrapper}>
                      <video
                        src={video.videoUrl}
                        className={styles.videoPlayer}
                        controls
                        playsInline
                        poster={video.thumbnailUrl}
                      />
                    </div>
                    <div className={styles.playOverlay}>
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
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
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                      {video.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Navigation buttons - hidden on mobile */}
        {!isMobile && (
          <>
            <button ref={prevRef} className={styles.prevButton} aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button ref={nextRef} className={styles.nextButton} aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {/* Scroll indicators for mobile */}
        <div className={styles.scrollIndicators}>
          <div className={styles.scrollIndicatorLeft}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </div>
          <div className={styles.scrollIndicatorRight}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>

        {/* Slide counter for mobile */}
        <div className={styles.slideCounter}>
          {activeIndex + 1}/{videos.length}
        </div>
      </div>

      {selectedVideo && (
        <VideoLightbox
          videoUrl={selectedVideo.videoUrl}
          isOpen={isLightboxOpen}
          onClose={handleCloseLightbox}
          salonName={selectedVideo.salon.name}
          caption={selectedVideo.caption}
        />
      )}
    </section>
  );
}
