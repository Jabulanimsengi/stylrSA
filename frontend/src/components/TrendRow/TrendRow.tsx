'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Trend, TrendCategory } from '@/types';
import TrendCard from '../TrendCard/TrendCard';
import styles from './TrendRow.module.css';

interface TrendRowProps {
  title: string;
  category: TrendCategory;
  trends: Trend[];
  onLike?: (trendId: string, isLiked: boolean) => void;
}

const CATEGORY_ICONS: Record<TrendCategory, string> = {
  HAIRSTYLE: '💇',
  NAILS: '💅',
  SPA: '🧖',
  MAKEUP: '💄',
  SKINCARE: '✨',
  MASSAGE: '💆',
  BARBERING: '✂️',
  BRAIDS: '🪢',
  LOCS: '🔒',
  EXTENSIONS: '👩‍🦱',
};

export default function TrendRow({ title, category, trends, onLike }: TrendRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 300;
    const newPosition =
      scrollContainerRef.current.scrollLeft +
      (direction === 'right' ? scrollAmount : -scrollAmount);
    scrollContainerRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
  };

  if (!trends || trends.length === 0) {
    return null;
  }

  const icon = CATEGORY_ICONS[category] || '✨';

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>{icon}</span> {title}
        </h2>
        <Link href={`/trends?category=${category}`} className={styles.viewAll}>
          View All
        </Link>
      </div>

      <div className={styles.scrollWrapper}>
        <button
          onClick={() => scroll('left')}
          className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
          aria-label="Scroll left"
        >
          <FaChevronLeft />
        </button>

        <div ref={scrollContainerRef} className={styles.scrollContainer}>
          {trends.map((trend) => (
            <div key={trend.id} className={styles.cardWrapper}>
              <TrendCard trend={trend} onLike={onLike} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
          aria-label="Scroll right"
        >
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
}
