'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaHeart, FaEye } from 'react-icons/fa';
import { Trend } from '@/types';
import { transformCloudinary } from '@/utils/cloudinary';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import styles from './TrendCard.module.css';

interface TrendCardProps {
  trend: Trend;
  onLike?: (trendId: string, isLiked: boolean) => void;
}

export default function TrendCard({ trend, onLike }: TrendCardProps) {
  const [isLiked, setIsLiked] = useState(trend.isLiked || false);
  const [likeCount, setLikeCount] = useState(trend.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (authStatus !== 'authenticated') {
      toast.info('Please log in to like trends');
      openModal('login');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    const previousState = isLiked;
    const previousCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      const endpoint = isLiked
        ? `/api/trends/${trend.id}/unlike`
        : `/api/trends/${trend.id}/like`;

      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to update like status');
      }

      onLike?.(trend.id, !isLiked);
    } catch (error) {
      // Revert on error
      setIsLiked(previousState);
      setLikeCount(previousCount);
      toast.error('Failed to update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const primaryImage = trend.images[0];
  const categoryLabel = trend.category.replace(/_/g, ' ');

  return (
    <Link href={`/trends/${trend.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={transformCloudinary(primaryImage, {
            width: 600,
            quality: 'auto',
            format: 'auto',
            crop: 'fill',
          })}
          alt={trend.title}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        
        {/* Category badge - top left */}
        <div className={styles.categoryBadge}>{categoryLabel}</div>
        
        {/* Like button - top right */}
        <button
          onClick={handleLike}
          className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
          aria-label={isLiked ? 'Unlike' : 'Like'}
          disabled={isLiking}
        >
          <FaHeart />
        </button>
      </div>
      
      {/* Card content - below image */}
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{trend.title}</h3>
        {trend.styleName && (
          <p className={styles.cardStyleName}>{trend.styleName}</p>
        )}
        <div className={styles.cardStats}>
          <span className={styles.cardStat}>
            <FaEye /> {trend.viewCount.toLocaleString()}
          </span>
          <span className={styles.cardStat}>
            <FaHeart /> {likeCount.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
