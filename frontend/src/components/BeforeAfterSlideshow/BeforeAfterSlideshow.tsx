'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import styles from './BeforeAfterSlideshow.module.css';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import ImageLightbox from '@/components/ImageLightbox';
import Image from 'next/image';
import { transformCloudinary } from '@/utils/cloudinary';
import Link from 'next/link';

import 'swiper/css';
import 'swiper/css/navigation';

interface BeforeAfterPhoto {
  id: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  caption?: string;
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

// Custom card for Before/After photos
function BeforeAfterCard({
  photo,
  onImageClick
}: {
  photo: BeforeAfterPhoto;
  onImageClick: (photo: BeforeAfterPhoto) => void;
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
    <div className={styles.card}>
      {/* Single image display - switch based on currentImageIndex */}
      <div className={styles.imageWrapper}>
        <div
          className={styles.imageSlide}
          onClick={() => onImageClick(photo)}
        >
          <Image
            src={transformCloudinary(images[currentImageIndex], {
              width: 400,
              height: 300,
              crop: 'fill',
              quality: 'auto',
              format: 'auto'
            })}
            alt={`${labels[currentImageIndex]} - ${photo.service?.title || 'Transformation'}`}
            fill
            sizes="(max-width: 768px) 85vw, 280px"
            className={styles.cardImage}
          />
          {/* Before/After label on current image */}
          <div className={styles.imageLabel}>
            {labels[currentImageIndex]}
          </div>
        </div>

        {/* Desktop navigation arrows - always show both, disabled based on position */}
        <button
          className={`${styles.carouselButton} ${styles.carouselPrev}`}
          onClick={handlePrev}
          disabled={currentImageIndex === 0}
          aria-label="View before image"
        >
          ‹
        </button>
        <button
          className={`${styles.carouselButton} ${styles.carouselNext}`}
          onClick={handleNext}
          disabled={currentImageIndex === 1}
          aria-label="View after image"
        >
          ›
        </button>
      </div>

      {/* Image counter badge */}
      <div className={styles.imageCounter}>
        {currentImageIndex + 1}/2
      </div>

      {/* Card content */}
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>
          {photo.service?.title || photo.caption || `${photo.salon.city}, ${photo.salon.province}`}
        </h3>
        <Link href={`/salons/${photo.salon.id}`} className={styles.salonName}>
          {photo.salon.name}
        </Link>
        {(photo.service?.title || photo.caption) && (
          <p className={styles.location}>
            {photo.salon.city}, {photo.salon.province}
          </p>
        )}
      </div>
    </div>
  );
}

interface BeforeAfterSlideshowProps {
  initialPhotos?: BeforeAfterPhoto[];
}

export default function BeforeAfterSlideshow({ initialPhotos = [] }: BeforeAfterSlideshowProps) {
  // Use initial data if provided (server-side), otherwise start empty
  const hasServerData = initialPhotos.length > 0;
  const [photos, setPhotos] = useState<BeforeAfterPhoto[]>(initialPhotos);
  // Start as 'done' if we have server data, otherwise 'pending'
  const [loadingState, setLoadingState] = useState<'pending' | 'loading' | 'done'>(
    hasServerData ? 'done' : 'pending'
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    // Only fetch client-side if no server data was provided
    if (!hasServerData) {
      fetchPhotos();
    }
  }, [hasServerData]);

  const fetchPhotos = async () => {
    setLoadingState('loading');
    try {
      const res = await fetch('/api/before-after/approved?limit=20');
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error('Failed to fetch before/after photos:', error);
    } finally {
      setLoadingState('done');
    }
  };

  const handleImageClick = (photo: BeforeAfterPhoto) => {
    setLightboxImages([photo.beforeImageUrl, photo.afterImageUrl]);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  if (loadingState === 'pending' || loadingState === 'loading') {
    return null;
  }

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      <section className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>Before & After</h2>
          <Link href="/before-after" className={styles.viewAll}>View All</Link>
        </div>
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
            slidesPerView={1.15}
            style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', height: '260px' }}
            onSlideChange={(swiper: SwiperType) => setActiveIndex(swiper.activeIndex)}
            breakpoints={{
              320: {
                slidesPerView: 1.15,
                spaceBetween: 16
              },
              640: {
                slidesPerView: 2.5,
                spaceBetween: 16
              },
              768: {
                slidesPerView: 3.2,
                spaceBetween: 20
              },
              1024: {
                slidesPerView: 4.1,
                spaceBetween: 24
              },
            }}
          >
            {photos.map((photo) => (
              <SwiperSlide
                key={photo.id}
                style={{
                  width: isMobile ? 'calc(100% / 1.15)' : 'calc((100% - 72px) / 4.1)',
                  minHeight: isMobile ? '200px' : '240px',
                  flexShrink: 0,
                }}
              >
                <BeforeAfterCard
                  photo={photo}
                  onImageClick={handleImageClick}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Swiper navigation buttons */}
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

          {/* Slide counter for mobile */}
          <div className={styles.slideCounter}>
            {activeIndex + 1}/{photos.length}
          </div>
        </div>
      </section>

      {lightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          initialImageIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
