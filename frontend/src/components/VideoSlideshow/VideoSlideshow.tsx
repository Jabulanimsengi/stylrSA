'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaRegHeart, FaPlay } from 'react-icons/fa';
import VideoLightbox from '@/components/VideoLightbox/VideoLightbox';
import { getSalonUrl } from '@/utils/salonUrl';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import styles from './VideoSlideshow.module.css';

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
  const [loadingState, setLoadingState] = useState<'pending' | 'loading' | 'done'>('pending');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ServiceVideo | null>(null);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const viewedVideos = useRef<Set<string>>(new Set());

  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();

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

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [videos]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Increment view count (with session-based deduplication)
  const incrementViewCount = async (videoId: string) => {
    // Only count once per session per video
    if (viewedVideos.current.has(videoId)) return;
    viewedVideos.current.add(videoId);

    try {
      await fetch(`/api/videos/${videoId}/view`, { method: 'PATCH' });
    } catch (error) {
      // Silently fail - view count is not critical
    }
  };

  const handleVideoClick = (video: ServiceVideo) => {
    // Increment view count
    incrementViewCount(video.id);

    // Stop any playing video
    if (playingVideoId) {
      const playingVideo = videoRefs.current.get(playingVideoId);
      if (playingVideo) {
        playingVideo.pause();
      }
    }
    setPlayingVideoId(null);
    setSelectedVideo(video);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedVideo(null);
  };

  const handleMouseEnter = (videoId: string) => {
    // Auto-play on hover (desktop)
    const video = videoRefs.current.get(videoId);
    if (video) {
      video.muted = true;
      video.play().then(() => {
        // Increment view count when video starts playing
        incrementViewCount(videoId);
      }).catch(() => { });
      setPlayingVideoId(videoId);
    }
  };

  const handleMouseLeave = (videoId: string) => {
    const video = videoRefs.current.get(videoId);
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setPlayingVideoId(null);
  };

  const handleLikeClick = async (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();

    if (authStatus !== 'authenticated') {
      toast.info('Please log in to like videos');
      openModal('login');
      return;
    }

    const isCurrentlyLiked = likedVideos.has(videoId);

    // Optimistic update
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyLiked) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });

    try {
      const endpoint = isCurrentlyLiked
        ? `/api/videos/${videoId}/unlike`
        : `/api/videos/${videoId}/like`;

      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to update like status');
      }
    } catch (error) {
      // Revert on error
      setLikedVideos(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.add(videoId);
        } else {
          newSet.delete(videoId);
        }
        return newSet;
      });
      toast.error('Failed to update like. Please try again.');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render until loading completes with videos
  if (loadingState === 'pending' || loadingState === 'loading') {
    return null;
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>Service Video Highlights</h2>
        <Link href="/videos" className={styles.viewAll}>View All</Link>
      </div>

      <div className={styles.scrollWrapper}>
        {/* Left Arrow */}
        <button
          className={`${styles.scrollArrow} ${styles.scrollArrowLeft} ${!canScrollLeft ? styles.hidden : ''}`}
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className={styles.videosRow} ref={scrollRef}>
          {videos.map((video) => (
            <div
              key={video.id}
              className={`${styles.videoCard} ${playingVideoId === video.id ? styles.playing : ''}`}
              onClick={() => handleVideoClick(video)}
              onMouseEnter={() => handleMouseEnter(video.id)}
              onMouseLeave={() => handleMouseLeave(video.id)}
            >
              {/* Video element (for hover preview) */}
              <video
                ref={(el) => {
                  if (el) videoRefs.current.set(video.id, el);
                }}
                src={video.videoUrl}
                className={styles.videoElement}
                muted
                loop
                playsInline
                poster={video.thumbnailUrl}
              />

              {/* Thumbnail overlay */}
              {video.thumbnailUrl && playingVideoId !== video.id && (
                <Image
                  src={video.thumbnailUrl}
                  alt={video.salon.name}
                  fill
                  className={styles.thumbnail}
                  sizes="200px"
                />
              )}

              {/* Gradient overlay */}
              <div className={styles.gradientOverlay} />

              {/* Play button */}
              <div className={styles.playButton}>
                <svg viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              {/* Duration badge */}
              <div className={styles.duration}>
                {formatDuration(video.duration)}
              </div>

              {/* Action buttons (right side - TikTok style) */}
              <div className={styles.actionButtons}>
                <button
                  className={`${styles.actionBtn} ${likedVideos.has(video.id) ? styles.liked : ''}`}
                  onClick={(e) => handleLikeClick(e, video.id)}
                  aria-label={likedVideos.has(video.id) ? 'Unlike' : 'Like'}
                >
                  {likedVideos.has(video.id) ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>

              {/* Bottom info overlay */}
              <div className={styles.videoInfo}>
                <Link
                  href={getSalonUrl(video.salon)}
                  className={styles.salonName}
                  onClick={(e) => e.stopPropagation()}
                >
                  {video.salon.name}
                </Link>
                <div className={styles.locationRow}>
                  <svg className={styles.locationIcon} viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <p className={styles.location}>{video.salon.city}</p>
                </div>
                <div className={styles.viewsRow}>
                  <svg className={styles.viewsIcon} viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                  <p className={styles.views}>{video.views.toLocaleString()} views</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          className={`${styles.scrollArrow} ${styles.scrollArrowRight} ${!canScrollRight ? styles.hidden : ''}`}
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Video Lightbox */}
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
