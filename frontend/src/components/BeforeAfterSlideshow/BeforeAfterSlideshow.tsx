'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import styles from './BeforeAfterSlideshow.module.css';
import ImageLightbox from '@/components/ImageLightbox';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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

export default function BeforeAfterSlideshow() {
  const [photos, setPhotos] = useState<BeforeAfterPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/before-after/approved?limit=20');
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error('Failed to fetch before/after photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (photo: BeforeAfterPhoto) => {
    setLightboxImages([photo.beforeImageUrl, photo.afterImageUrl]);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };



  if (isLoading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Before & After Transformations</h2>
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

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Before & After Transformations</h2>
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
            {photos.map((photo) => (
              <SwiperSlide key={photo.id}>
                <div className={styles.card}>
                  <div 
                    className={styles.imageWrapper}
                    onClick={() => handleCardClick(photo)}
                  >
                    <div className={styles.beforeAfterBadge}>
                      <span className={styles.badgeLabel}>Before & After</span>
                    </div>
                    <Image
                      src={photo.beforeImageUrl}
                      alt={`Before - ${photo.salon.name}`}
                      fill
                      sizes="(max-width: 479px) 90vw, (max-width: 767px) 45vw, 20vw"
                      className={styles.cardImage}
                    />
                  </div>
                  <div className={styles.cardContent}>
                    <Link href={`/salons/${photo.salon.id}`} className={styles.cardTitle}>
                    {photo.salon.name}
                  </Link>
                    <p className={styles.cardLocation}>
                      {photo.salon.city}, {photo.salon.province}
                    </p>
                    {photo.service && (
                      <p className={styles.cardMeta}>{photo.service.title}</p>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
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
