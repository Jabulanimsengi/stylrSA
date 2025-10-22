'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './PromotionCard.module.css';
import { transformCloudinary } from '@/utils/cloudinary';
import { SkeletonCard } from './Skeleton/Skeleton';
import BookingConfirmationModal from './BookingConfirmationModal/BookingConfirmationModal';
import { toast } from 'react-toastify';

const DEFAULT_PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" x2="1" y1="0" y2="1"%3E%3Cstop offset="0%25" stop-color="%23f3f4f6"/%3E%3Cstop offset="100%25" stop-color="%23d1d5db"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="600" height="400" fill="url(%23g)"/%3E%3Cg fill="%239ca3af" font-family="Arial, sans-serif" font-size="28" font-weight="600" text-anchor="middle"%3E%3Ctext x="50%25" y="52%25"%3ENo Image%3C/text%3E%3C/g%3E%3C/svg%3E';

export interface Promotion {
  id: string;
  discountPercentage: number;
  originalPrice: number;
  promotionalPrice: number;
  startDate: string;
  endDate: string;
  service?: {
    id: string;
    title: string;
    images: string[];
    salon: {
      id: string;
      name: string;
      city: string;
      province: string;
    };
  };
  product?: {
    id: string;
    name: string;
    images: string[];
    seller: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}

interface PromotionCardProps {
  promotion: Promotion;
  onImageClick?: (images: string[], startIndex: number) => void;
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

export default function PromotionCard({ promotion, onImageClick }: PromotionCardProps) {
  const router = useRouter();
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [salonData, setSalonData] = useState<any>(null);
  
  const isService = Boolean(promotion.service);
  const item = isService ? promotion.service : promotion.product;
  
  if (!item) return null;

  const title = isService ? item.title : (item as any).name;
  const images = item.images || [];
  const primaryImage = images[0];

  const salonId = isService ? (item as any).salon?.id : undefined;
  const salonName = isService ? (item as any).salon?.name : undefined;
  const sellerName = !isService
    ? `${(item as any).seller?.firstName || ''} ${(item as any).seller?.lastName || ''}`.trim()
    : undefined;

  const locationParts = isService
    ? [(item as any).salon?.city, (item as any).salon?.province].filter(Boolean)
    : [];
  const location = locationParts.length ? locationParts.join(', ') : '';

  const optimizedSrc = primaryImage
    ? transformCloudinary(primaryImage, {
        width: 600,
        quality: 'auto',
        format: 'auto',
        crop: 'fill',
      })
    : DEFAULT_PLACEHOLDER_IMAGE;

  const isCloudinarySource = typeof primaryImage === 'string' && primaryImage.includes('/image/upload/');
  const linkHref = isService && salonId ? `/salons/${salonId}` : '#';
  const timeRemaining = calculateTimeRemaining(promotion.endDate);

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 0 && onImageClick) {
      onImageClick(images, 0);
    }
  };

  const handleBookNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!salonId || linkHref === '#') return;
    
    setIsLoadingBooking(true);
    try {
      // Fetch salon data to check for booking message
      const response = await fetch(`/api/salons/${salonId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch salon details');
      }
      
      const salon = await response.json();
      
      if (salon.bookingMessage) {
        // Show confirmation modal
        setSalonData(salon);
        setShowConfirmation(true);
      } else {
        // Navigate directly
        router.push(linkHref);
      }
    } catch (error) {
      console.error('Error fetching salon:', error);
      toast.error('Failed to load salon details');
      // Navigate anyway
      router.push(linkHref);
    } finally {
      setIsLoadingBooking(false);
    }
  };

  const handleConfirmationAccept = () => {
    setShowConfirmation(false);
    if (linkHref && linkHref !== '#') {
      router.push(linkHref);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setSalonData(null);
  };



  return (
    <div className={styles.card}>
      <div 
        className={styles.cardImageWrapper}
        onClick={handleImageClick}
        style={{ cursor: images.length > 0 ? 'pointer' : 'default' }}
      >
        <Image
          src={optimizedSrc}
          alt={title}
          className={styles.cardImage}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized={!isCloudinarySource}
        />
        {images.length > 1 && (
          <div className={styles.imageCounter}>
            1/{images.length}
          </div>
        )}
        <div className={styles.discountBadge}>
          {promotion.discountPercentage}% OFF
        </div>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {isService && salonName && (
          <p className={styles.providerName}>{salonName}</p>
        )}
        {!isService && sellerName && (
          <p className={styles.providerName}>Sold by {sellerName}</p>
        )}
        {location && <p className={styles.location}>{location}</p>}
        
        <div className={styles.priceContainer}>
          <span className={styles.originalPrice}>R{promotion.originalPrice.toFixed(2)}</span>
          <span className={styles.promotionalPrice}>R{promotion.promotionalPrice.toFixed(2)}</span>
        </div>
        
        <div className={styles.timeRemaining}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
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
          {timeRemaining}
        </div>
        
        {isService && salonId && (
          <button 
            onClick={handleBookNow}
            className={styles.bookButton}
            disabled={isLoadingBooking}
          >
            {isLoadingBooking ? 'Loading...' : 'Book Now'}
          </button>
        )}
      </div>

      <BookingConfirmationModal
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        onAccept={handleConfirmationAccept}
        salonName={salonData?.name || ''}
        salonLogo={salonData?.backgroundImage}
        message={salonData?.bookingMessage || ''}
      />
    </div>
  );
}

export function PromotionCardSkeleton() {
  return <SkeletonCard hasImage lines={4} />;
}
