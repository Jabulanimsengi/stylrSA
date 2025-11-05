'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Trend, TrendCategory } from '@/types';
import TrendCard from '../TrendCard/TrendCard';
import styles from './TrendRow.module.css';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';

import 'swiper/css';
import 'swiper/css/navigation';

interface TrendRowProps {
  title: string;
  category: TrendCategory;
  trends: Trend[];
  onLike?: (trendId: string, isLiked: boolean) => void;
}

export default function TrendRow({ title, category, trends, onLike }: TrendRowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const router = useRouter();
  const { setIsNavigating } = useNavigationLoading();

  const handleHeadingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push(`/trends?category=${category}`);
  };

  const handleViewAllClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push(`/trends?category=${category}`);
  };

  if (!trends || trends.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <a href={`/trends?category=${category}`} onClick={handleHeadingClick} className={styles.title}>
          <h2>{title}</h2>
        </a>
        <a href={`/trends?category=${category}`} onClick={handleViewAllClick} className={styles.viewAll}>
          View All
        </a>
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
          slidesPerView={'auto'}
          style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}
          onSlideChange={(swiper: SwiperType) => setActiveIndex(swiper.activeIndex)}
          breakpoints={{
            320: {
              slidesPerView: 1.15,
            },
            769: {
              slidesPerView: 4.1,
            },
          }}
        >
          {trends.map((trend) => (
            <SwiperSlide key={trend.id}>
              <TrendCard trend={trend} onLike={onLike} />
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

        {/* Scroll indicators removed - not needed on any device */}

        {/* Slide counter for mobile */}
        <div className={styles.slideCounter}>
          {activeIndex + 1}/{trends.length}
        </div>
      </div>
    </section>
  );
}
