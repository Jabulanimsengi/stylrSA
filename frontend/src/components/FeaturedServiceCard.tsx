'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Service } from '@/types';
import ImageLightbox from '@/components/ImageLightbox/ImageLightbox';
import styles from './FeaturedServiceCard.module.css';
import { transformCloudinary } from '@/utils/cloudinary';
import { SkeletonCard } from './Skeleton/Skeleton';

const DEFAULT_PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" x2="1" y1="0" y2="1"%3E%3Cstop offset="0%25" stop-color="%23f3f4f6"/%3E%3Cstop offset="100%25" stop-color="%23d1d5db"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="600" height="400" fill="url(%23g)"/%3E%3Cg fill="%239ca3af" font-family="Arial, sans-serif" font-size="28" font-weight="600" text-anchor="middle"%3E%3Ctext x="50%25" y="52%25"%3ENo Image%3C/text%3E%3C/g%3E%3C/svg%3E';

interface FeaturedServiceCardProps {
  service: Service & { salon: { id: string; name: string; city: string; province: string } };
}

export default function FeaturedServiceCard({ service }: FeaturedServiceCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const salonId = service.salon?.id ?? service.salonId;
  if (!salonId) return null;

  const salonName = service.salon?.name ?? 'Salon';
  const salonLocationParts = [
    service.salon?.city ?? (service as Partial<Service> & { city?: string }).city,
    service.salon?.province ?? (service as Partial<Service> & { province?: string }).province,
  ].filter(Boolean);
  const salonLocation = salonLocationParts.length ? salonLocationParts.join(', ') : 'Location unavailable';

  // Get all valid images
  const validImages = Array.isArray(service.images)
    ? service.images.filter((img): img is string => Boolean(img))
    : [];

  const hasMultipleImages = validImages.length > 1;
  const primaryImage = validImages[0] || undefined;

  const optimizedSrc = primaryImage
    ? transformCloudinary(primaryImage, {
        width: 600,
        quality: 'auto',
        format: 'auto',
        crop: 'fill',
      })
    : DEFAULT_PLACEHOLDER_IMAGE;

  const isCloudinarySource = typeof primaryImage === 'string' && primaryImage.includes('/image/upload/');

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxIndex(0);
    setIsLightboxOpen(true);
  };

  const handleLightboxNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    } else if (direction === 'next' && lightboxIndex < validImages.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  return (
    <>
      <div className={styles.card}>
        <div 
          className={styles.cardImageWrapper}
          onClick={handleImageClick}
        >
          <Image
            src={optimizedSrc}
            alt={service.title}
            className={styles.cardImage}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={!isCloudinarySource}
          />
          {hasMultipleImages && (
            <div className={styles.imageCounter}>
              1/{validImages.length}
            </div>
          )}
        </div>
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{service.title}</h3>
          <Link href={`/salons/${salonId}`} className={styles.salonName}>
            {salonName}
          </Link>
          <p className={styles.salonLocation}>{salonLocation}</p>
          <p className={styles.price}>R{service.price.toFixed(2)}</p>
        </div>
      </div>

      <ImageLightbox
        images={validImages}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={handleLightboxNavigate}
      />
    </>
  );
}

export function FeaturedServiceCardSkeleton() {
  return <SkeletonCard hasImage lines={3} />;
}