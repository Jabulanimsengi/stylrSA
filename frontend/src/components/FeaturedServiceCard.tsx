'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Service } from '@/types';
import ServiceCard from './ServiceCard';
import ImageLightbox from '@/components/ImageLightbox';
import { SkeletonCard } from './Skeleton/Skeleton';
import { getSalonUrl } from '@/utils/salonUrl';

interface FeaturedServiceCardProps {
  service: Service & { salon: { id: string; name: string; city: string; province: string; slug?: string | null } };
}

export default function FeaturedServiceCard({ service }: FeaturedServiceCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const router = useRouter();

  const salonId = service.salon?.id ?? service.salonId;
  if (!salonId) return null;

  const handleImageClick = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  // Navigate to salon page for booking (BookingModal requires full salon data)
  const handleBook = () => {
    const salonUrl = getSalonUrl(service.salon);
    router.push(`${salonUrl}?book=${service.id}`);
  };

  return (
    <>
      <ServiceCard
        service={service}
        onBook={handleBook}
        onImageClick={handleImageClick}
        variant="featured"
      />

      {isLightboxOpen && lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          initialImageIndex={lightboxIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </>
  );
}

export function FeaturedServiceCardSkeleton() {
  return <SkeletonCard hasImage lines={3} />;
}
