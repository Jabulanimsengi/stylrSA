'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaHeart } from 'react-icons/fa';
import { transformCloudinary } from '@/utils/cloudinary';
import { getImageWithFallback } from '@/lib/placeholders';
import ImageLightbox from '@/components/ImageLightbox';
import { useNavigationLoading } from '@/context/NavigationLoadingContext';
import { Salon } from '@/types';
import styles from './SalonCard.module.css';
import AvailabilityIndicator from './AvailabilityIndicator/AvailabilityIndicator';
import VerificationBadge from './VerificationBadge/VerificationBadge';

type SalonWithFavorite = Salon & { isFavorited?: boolean };

interface SalonCardProps {
  salon: SalonWithFavorite;
  showFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, salonId: string) => void;
  showHours?: boolean;
  compact?: boolean;
  enableLightbox?: boolean; // Enable image lightbox (default: false)
}

export default function SalonCard({ salon, showFavorite = true, onToggleFavorite, showHours = true, compact = false, enableLightbox = false }: SalonCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const router = useRouter();
  const { setIsNavigating } = useNavigationLoading();

  const handleImageClick = (e: React.MouseEvent) => {
    if (!enableLightbox) return; // Don't handle if lightbox disabled
    
    e.preventDefault();
    e.stopPropagation();
    
    // Collect salon images for lightbox
    const images: string[] = [];
    if (salon.backgroundImage) {
      images.push(salon.backgroundImage);
    }
    // Add gallery images if available
    if (salon.galleryImages && Array.isArray(salon.galleryImages)) {
      images.push(...salon.galleryImages.map((img: any) => img.imageUrl || img));
    }
    
    setLightboxImages(images);
    setLightboxIndex(0);
    setIsLightboxOpen(true);
  };



  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on favorite button or other interactive elements
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    if (!enableLightbox) {
      setIsNavigating(true);
      router.push(`/salons/${salon.id}`);
    }
  };

  // If lightbox is disabled, wrap entire card in Link
  if (!enableLightbox) {
    return (
      <div className={`${styles.salonCard} ${compact ? styles.compact : ''}`} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        {showFavorite && onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e, salon.id);
            }}
            className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}
            aria-label={salon.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FaHeart />
          </button>
        )}
        <div className={styles.salonLink}>
          <div className={styles.imageWrapper}>
            {salon.isVerified && (
              <div className={styles.verificationOverlay}>
                <VerificationBadge size="small" overlay={true} />
              </div>
            )}
            {salon.reviewCount !== undefined && salon.avgRating !== undefined && salon.reviewCount > 0 && (
              <div className={styles.ratingBadge}>
                <div className={styles.ratingValue}>★ {salon.avgRating.toFixed(1)}</div>
                <div className={styles.reviewCount}>{salon.reviewCount} {salon.reviewCount === 1 ? 'review' : 'reviews'}</div>
              </div>
            )}
            <div className={styles.statusOverlay}>
              <AvailabilityIndicator salon={salon} showNextAvailable={false} compact={true} />
            </div>
            <div className={styles.logoOverlay}>
              {salon.logo && !logoError ? (
                <Image
                  src={transformCloudinary(salon.logo, { 
                    width: 128, 
                    quality: 'auto', 
                    format: 'auto' 
                  })}
                  alt={`${salon.name} logo`}
                  className={styles.salonLogo}
                  width={64}
                  height={64}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className={styles.logoPlaceholder}>
                  <span>{salon.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <Image
              src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), { 
                width: 600, 
                quality: 'auto', 
                format: 'auto', 
                crop: 'fill' 
              })}
              alt={`A photo of ${salon.name}`}
              className={styles.cardImage}
              fill
              sizes="(max-width: 479px) 45vw, (max-width: 767px) 40vw, (max-width: 1023px) 33vw, (max-width: 1439px) 25vw, 20vw"
            />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <h2 
                className={styles.cardTitle}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNavigating(true);
                  router.push(`/salons/${salon.id}`);
                }}
                style={{ cursor: 'pointer' }}
              >
                {salon.name}
              </h2>
            </div>
            <p className={styles.cardLocation}>{salon.city}, {salon.province}</p>
            {salon.distance !== null && salon.distance !== undefined && (
              <>
                <div className={styles.distanceBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>
                    {salon.distance < 1 
                      ? `${Math.round(salon.distance * 1000)}m away`
                      : `${salon.distance.toFixed(1)}km away`
                    }
                  </span>
                </div>
                {salon.latitude && salon.longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${salon.latitude},${salon.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.directionsLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Get Directions →
                  </a>
                )}
              </>
            )}
            {showHours && (() => {
              const oh = salon.operatingHours as unknown;
              let hoursRecord: Record<string, string> | null = null;
              if (Array.isArray(oh)) {
                const derived: Record<string, string> = {};
                oh.forEach((entry: { day?: string; open?: string; close?: string }) => {
                  const day = entry?.day;
                  if (!day) return;
                  const open = entry.open;
                  const close = entry.close;
                  if (!open && !close) return;
                  derived[day] = `${open ?? ''} - ${close ?? ''}`.trim();
                });
                hoursRecord = Object.keys(derived).length > 0 ? derived : null;
              } else if (oh && typeof oh === 'object') {
                hoursRecord = oh as Record<string, string>;
              }
              if (!hoursRecord) return null;
              const entries = Object.entries(hoursRecord);
              if (entries.length === 0) return null;
              const samples = entries.slice(0, 2).map(([day, hrs]) => `${day.substring(0,3)} ${hrs}`);
              const extra = entries.length > 2 ? ` +${entries.length - 2} more` : '';
              return <p className={styles.cardMeta}>Hours: {samples.join(' • ')}{extra}</p>;
            })()}
          </div>
        </div>
      </div>
    );
  }

  // If lightbox enabled, use separate click handlers
  return (
    <>
      <div className={`${styles.salonCard} ${compact ? styles.compact : ''}`}>
        {showFavorite && onToggleFavorite && (
          <button
            onClick={(e) => onToggleFavorite(e, salon.id)}
            className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}
            aria-label={salon.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FaHeart />
          </button>
        )}
        <div 
          className={styles.imageWrapper}
          onClick={handleImageClick}
        >
          {salon.isVerified && (
            <div className={styles.verificationOverlay}>
              <VerificationBadge size="small" overlay={true} />
            </div>
          )}
          {salon.reviewCount !== undefined && salon.avgRating !== undefined && salon.reviewCount > 0 && (
            <div className={styles.ratingBadge}>
              <div className={styles.ratingValue}>★ {salon.avgRating.toFixed(1)}</div>
              <div className={styles.reviewCount}>{salon.reviewCount} {salon.reviewCount === 1 ? 'review' : 'reviews'}</div>
            </div>
          )}
          <div className={styles.statusOverlay}>
            <AvailabilityIndicator salon={salon} showNextAvailable={false} compact={true} />
          </div>
          <div className={styles.logoOverlay}>
            {salon.logo && !logoError ? (
              <Image
                src={transformCloudinary(salon.logo, { 
                  width: 128, 
                  quality: 'auto', 
                  format: 'auto' 
                })}
                alt={`${salon.name} logo`}
                className={styles.salonLogo}
                width={64}
                height={64}
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className={styles.logoPlaceholder}>
                <span>{salon.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <Image
            src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), { 
              width: 600, 
              quality: 'auto', 
              format: 'auto', 
              crop: 'fill' 
            })}
            alt={`A photo of ${salon.name}`}
            className={styles.cardImage}
            fill
            sizes="(max-width: 479px) 45vw, (max-width: 767px) 40vw, (max-width: 1023px) 33vw, (max-width: 1439px) 25vw, 20vw"
          />
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <h2 
              className={styles.cardTitle}
              onClick={(e) => {
                e.stopPropagation();
                setIsNavigating(true);
                router.push(`/salons/${salon.id}`);
              }}
              style={{ cursor: 'pointer' }}
            >
              {salon.name}
            </h2>
          </div>
          <p className={styles.cardLocation}>{salon.city}, {salon.province}</p>
          {!compact && <AvailabilityIndicator salon={salon} showNextAvailable={false} />}
          {salon.distance !== null && salon.distance !== undefined && (
            <>
              <div className={styles.distanceBadge}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>
                  {salon.distance < 1 
                    ? `${Math.round(salon.distance * 1000)}m away`
                    : `${salon.distance.toFixed(1)}km away`
                  }
                </span>
              </div>
              {salon.latitude && salon.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${salon.latitude},${salon.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.directionsLink}
                  onClick={(e) => e.stopPropagation()}
                >
                  Get Directions →
                </a>
              )}
            </>
          )}
          {showHours && (() => {
            const oh = salon.operatingHours as unknown;
            let hoursRecord: Record<string, string> | null = null;
            if (Array.isArray(oh)) {
              const derived: Record<string, string> = {};
              oh.forEach((entry: { day?: string; open?: string; close?: string }) => {
                const day = entry?.day;
                if (!day) return;
                const open = entry.open;
                const close = entry.close;
                if (!open && !close) return;
                derived[day] = `${open ?? ''} - ${close ?? ''}`.trim();
              });
              hoursRecord = Object.keys(derived).length > 0 ? derived : null;
            } else if (oh && typeof oh === 'object') {
              hoursRecord = oh as Record<string, string>;
            }
            if (!hoursRecord) return null;
            const entries = Object.entries(hoursRecord);
            if (entries.length === 0) return null;
            const samples = entries.slice(0, 2).map(([day, hrs]) => `${day.substring(0,3)} ${hrs}`);
            const extra = entries.length > 2 ? ` +${entries.length - 2} more` : '';
            return <p className={styles.cardMeta}>Hours: {samples.join(' • ')}{extra}</p>;
          })()}
        </div>
      </div>

      {enableLightbox && isLightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          initialImageIndex={lightboxIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </>
  );
}
