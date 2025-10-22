'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './PromotionDetailsModal.module.css';

interface PromotionDetailsModalProps {
  promotion: any;
  isOpen: boolean;
  onClose: () => void;
  salon?: any;
  onBookNow?: () => void;
}

function calculateTimeRemaining(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} left`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  } else {
    return 'Ending soon';
  }
}

export default function PromotionDetailsModal({
  promotion,
  isOpen,
  onClose,
  salon,
  onBookNow,
}: PromotionDetailsModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !promotion) return null;

  // Only render portal in browser environment
  if (typeof document === 'undefined') return null;

  const service = promotion.service;
  const timeRemaining = calculateTimeRemaining(promotion.endDate);
  const savings = promotion.originalPrice - promotion.promotionalPrice;

  const handleBookNow = () => {
    onClose();
    
    if (onBookNow) {
      // Use callback if provided (for salon profile page)
      onBookNow();
    } else {
      // Fallback: scroll to services section
      const servicesSection = document.getElementById('services-section');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Special Promotion!</h2>
          <div className={styles.discountBadge}>
            {promotion.discountPercentage}% OFF
          </div>
        </div>

        {/* Service Image */}
        {service?.images?.[0] && (
          <div className={styles.imageWrapper}>
            <Image
              src={service.images[0]}
              alt={service.title}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className={styles.image}
            />
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>
          <h3 className={styles.serviceTitle}>{service?.title}</h3>

          {/* Price Section */}
          <div className={styles.priceSection}>
            <div className={styles.priceRow}>
              <span className={styles.label}>Original Price:</span>
              <span className={styles.originalPrice}>
                R{promotion.originalPrice.toFixed(2)}
              </span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.label}>Promotional Price:</span>
              <span className={styles.promoPrice}>
                R{promotion.promotionalPrice.toFixed(2)}
              </span>
            </div>
            <div className={styles.savings}>
              You Save: R{savings.toFixed(2)}
            </div>
          </div>

          {/* Time Remaining */}
          <div className={styles.timeInfo}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{timeRemaining}</span>
          </div>

          {/* Book Now Button */}
          <button onClick={handleBookNow} className={styles.bookButton}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );

  // Render modal using portal at document body level
  return createPortal(modalContent, document.body);
}
