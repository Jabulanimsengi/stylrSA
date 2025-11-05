'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import VideoLightbox from '@/components/VideoLightbox/VideoLightbox';
import styles from './VideoSlideshow.module.css';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import 'swiper/css';
import 'swiper/css/navigation';

interface ServiceVideo {
  id: string;
  videoUrl: string;
  vimeoId: string;
  thumbnailUrl?: string;
  duration: number;
  caption?: string;
  views: number;
  salon: {
    id: string;
    name: string;
    city: string;
    province: string;
  };
  service?: {
    id: string;
    title: string;
  };
}

export default function VideoSlideshow() {
  const [videos, setVideos] = useState<ServiceVideo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ServiceVideo | null>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos/approved?limit=20');
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Service Video Highlights</h2>
        <div className={styles.container}>
          <div className={styles.skeletonContainer}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Service Video Highlights</h2>
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
          style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}
          onSlideChange={(swiper: SwiperType) => setActiveIndex(swiper.activeIndex)}
          breakpoints={{
            320: {
              slidesPerView: 1.15,
            },
            769: {
              slidesPerView: 5.1,
            },
          }}
        >
          {videos.map((video) => {
            const embedUrl = video.videoUrl.includes('player.vimeo.com')
              ? video.videoUrl
              : `https://player.vimeo.com/video/${video.vimeoId}`;

            return (
              <SwiperSlide key={video.id}>
                <div className={styles.card}>
                  <div className={styles.videoWrapper} onClick={() => handleVideoClick(video)}>
                    <div className={styles.videoBadge}>
                      <span className={styles.badgeLabel}>Video</span>
                    </div>
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.caption || `Video by ${video.salon.name}`}
                        className={styles.videoThumbnail}
                      />
                    ) : (
                      <div className={styles.videoPlaceholder}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="white" opacity="0.9">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    )}
                    <div className={styles.playOverlay}>
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
                        <circle cx="12" cy="12" r="10" fill="rgba(245, 25, 87, 0.9)"/>
                        <path d="M10 8l6 4-6 4V8z" fill="white"/>
                      </svg>
                    </div>
                    <div className={styles.duration}>{video.duration}s</div>
                  </div>
                  <div className={styles.cardContent}>
                    <Link href={`/salons/${video.salon.id}`} className={styles.cardTitle}>
                      {video.salon.name}
                    </Link>
                    <p className={styles.cardLocation}>
                      {video.salon.city}, {video.salon.province}
                    </p>
                    {video.service && (
                      <p className={styles.cardMeta}>{video.service.title}</p>
                    )}
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
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button ref={nextRef} className={styles.nextButton} aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </>
        )}

        {/* Scroll indicators for mobile */}
        <div className={styles.scrollIndicators}>
          <div className={styles.scrollIndicatorLeft}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </div>
          <div className={styles.scrollIndicatorRight}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M9 18l6-6-6-6"/>
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
          vimeoId={selectedVideo.vimeoId}
          isOpen={isLightboxOpen}
          onClose={handleCloseLightbox}
          salonName={selectedVideo.salon.name}
          caption={selectedVideo.caption}
        />
      )}
    </section>
  );
}
