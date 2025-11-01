import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart } from 'react-icons/fa';
import { transformCloudinary } from '@/utils/cloudinary';
import { getImageWithFallback } from '@/lib/placeholders';
import ImageLightbox from '@/components/ImageLightbox/ImageLightbox';
import { Salon } from '@/types';
import styles from './SalonCard.module.css';

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

  const handleLightboxNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    } else if (direction === 'next' && lightboxIndex < lightboxImages.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  // If lightbox is disabled, wrap entire card in Link
  if (!enableLightbox) {
    return (
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
        <Link href={`/salons/${salon.id}`} className={styles.salonLink}>
          <div className={styles.imageWrapper}>
            {salon.reviewCount !== undefined && salon.avgRating !== undefined && salon.reviewCount > 0 && (
              <div className={styles.ratingBadge}>
                <div className={styles.ratingValue}>★ {salon.avgRating.toFixed(1)}</div>
                <div className={styles.reviewCount}>{salon.reviewCount} {salon.reviewCount === 1 ? 'review' : 'reviews'}</div>
              </div>
            )}
            {salon.logo && (
              <div className={styles.logoOverlay}>
                <Image
                  src={transformCloudinary(salon.logo, { 
                    width: 80, 
                    quality: 'auto', 
                    format: 'auto' 
                  })}
                  alt={`${salon.name} logo`}
                  className={styles.salonLogo}
                  width={80}
                  height={80}
                />
              </div>
            )}
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
            <h2 className={styles.cardTitle}>{salon.name}</h2>
            <p className={styles.cardLocation}>{salon.city}, {salon.province}</p>
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
        </Link>
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
          {salon.reviewCount !== undefined && salon.avgRating !== undefined && salon.reviewCount > 0 && (
            <div className={styles.ratingBadge}>
              <div className={styles.ratingValue}>★ {salon.avgRating.toFixed(1)}</div>
              <div className={styles.reviewCount}>{salon.reviewCount} {salon.reviewCount === 1 ? 'review' : 'reviews'}</div>
            </div>
          )}
          {salon.logo && (
            <div className={styles.logoOverlay}>
              <Image
                src={transformCloudinary(salon.logo, { 
                  width: 80, 
                  quality: 'auto', 
                  format: 'auto' 
                })}
                alt={`${salon.name} logo`}
                className={styles.salonLogo}
                width={80}
                height={80}
              />
            </div>
          )}
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
          <Link href={`/salons/${salon.id}`} className={styles.cardTitle}>
            {salon.name}
          </Link>
          <p className={styles.cardLocation}>{salon.city}, {salon.province}</p>
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

      {enableLightbox && (
        <ImageLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          onNavigate={handleLightboxNavigate}
        />
      )}
    </>
  );
}
