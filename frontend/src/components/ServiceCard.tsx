'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Service } from '@/types';
import styles from './ServiceCard.module.css';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { apiFetch } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';
import { getPlaceholder } from '@/lib/placeholders';
import { sanitizeText } from '@/lib/sanitize';

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
  onImageClick: (images: string[], index: number) => void;
  promotion?: any;
  onPromotionClick?: (promotion: any) => void;
}

export default function ServiceCard({ service, onBook, onImageClick, promotion, onPromotionClick }: ServiceCardProps) {
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();
  const [isLiked, setIsLiked] = useState(Boolean(service.isLikedByCurrentUser));
  const [likeCount, setLikeCount] = useState(service.likeCount ?? 0);
  const [isExpanded, setIsExpanded] = useState(false);
  const serviceTitle = service.title ?? service.name ?? 'Service';
  const images = useMemo(() => {
    const unique = Array.isArray(service.images)
      ? service.images.filter((img, idx, arr) => img && arr.indexOf(img) === idx)
      : [];
    return unique.length > 0 ? unique : [getPlaceholder('wide')];
  }, [service.images]);
  const [activeImage, setActiveImage] = useState(0);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (authStatus !== 'authenticated') {
      toast.info('Please log in to like a service.');
      openModal('login');
      return;
    }

    const originalLikedState = isLiked;
    const originalLikeCount = likeCount;
    
    // Optimistic UI update
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      await apiFetch(`/api/likes/service/${service.id}/toggle`, { method: 'POST' });
    } catch (error) {
      // Revert UI on error
      setIsLiked(originalLikedState);
      setLikeCount(originalLikeCount);
      toast.error(toFriendlyMessage(error, 'Failed to update like status.'));
    }
  };

  return (
    <div className={styles.card}>
      <div
        className={styles.imageContainer}
        onClick={() => images.length > 0 && onImageClick(images, activeImage)}
      >
        <Image
          key={images[activeImage]}
          src={images[activeImage]}
          alt={serviceTitle}
          className={styles.image}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {images.length > 1 && (
          <>
            <button className={`${styles.carouselButton} ${styles.prev}`} onClick={handlePrevImage} aria-label="Previous image">
              ‹
            </button>
            <button className={`${styles.carouselButton} ${styles.next}`} onClick={handleNextImage} aria-label="Next image">
              ›
            </button>
            <div className={styles.imageCounter}>
              {activeImage + 1}/{images.length}
            </div>
          </>
        )}
        {promotion && (
          <div 
            className={styles.promotionBadge}
            onClick={(e) => {
              e.stopPropagation();
              onPromotionClick?.(promotion);
            }}
          >
            <span className={styles.badgeIcon}>🏷️</span>
            <span className={styles.badgeText}>Promo</span>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{serviceTitle}</h3>
          <div className={styles.priceWrapper}>
            <p className={styles.price}>
              R{service.price.toFixed(2)}
              {service.pricingType && (
                <span className={styles.pricingType}>
                  {service.pricingType === 'PER_PERSON' ? 'per person' : 'per couple'}
                </span>
              )}
            </p>
          </div>
        </div>
        {service.salon && (
          <div className={styles.locationInfo}>
            <p className={styles.salonName}>{service.salon.name}</p>
            {(service.salon.city || service.salon.province) && (
              <p className={styles.salonLocation}>
                {[service.salon.city, service.salon.province].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        )}
        <p className={`${styles.description} ${isExpanded ? styles.expanded : ''}`}>
          {sanitizeText(service.description || '')}
        </p>
        <button onClick={() => setIsExpanded(!isExpanded)} className={styles.expandButton}>
          {isExpanded ? 'View Less' : 'View More'}
        </button>
        <div className={styles.footer}>
          <button onClick={handleLikeClick} className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span>{likeCount}</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onBook(service); }} className="btn btn-primary" style={{ flex: 1 }}>Book Now</button>
        </div>
      </div>
    </div>
  );
}