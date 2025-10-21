'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Salon } from '@/types';
import styles from './MyFavoritesPage.module.css';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonGroup, SkeletonCard } from '@/components/Skeleton/Skeleton';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { getImageWithFallback } from '@/lib/placeholders';
import { transformCloudinary } from '@/utils/cloudinary';
import PageNav from '@/components/PageNav';
import ReviewBadge from '@/components/ReviewBadge/ReviewBadge';

export default function MyFavoritesPage() {
  const [favorites, setFavorites] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { authStatus } = useAuth();

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (authStatus === 'authenticated') {
      const fetchFavorites = async () => {
        setIsLoading(true);
        try {
          const res = await fetch('/api/favorites', {
            credentials: 'include', // Send cookies with the request
          });

          if (!res.ok) {
            if (res.status === 401) {
              router.push('/login');
            }
            throw new Error('Failed to fetch favorites');
          }

          const data = await res.json();
          setFavorites(data.map((fav: { salon: Salon }) => fav.salon));
        } catch (error) {
          logger.error('Failed to fetch favorites:', error);
          toast.error(toFriendlyMessage(error, 'Failed to load your favorites.'));
        } finally {
          setIsLoading(false);
        }
      };

      fetchFavorites();
    }
  }, [authStatus, router]);

  if (isLoading || authStatus === 'loading') {
    return (
      <div className={styles.container}>
        <PageNav />
        <h1 className={styles.title}>My Favorite Salons</h1>

        <SkeletonGroup count={8} className={styles.salonGrid}>
          {() => <SkeletonCard hasImage lines={3} />}
        </SkeletonGroup>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageNav />
      <h1 className={styles.title}>My Favorite Salons</h1>

      {favorites.length === 0 ? (
        <p>You haven't favorited any salons yet.</p>
      ) : (
        <div className={styles.salonGrid}>
          {favorites.map((salon) => (
            <Link href={`/salons/${salon.id}`} key={salon.id} className={styles.salonCard}>
              <div className={styles.imageWrapper}>
                <ReviewBadge 
                  reviewCount={salon.reviews?.length || 0}
                  avgRating={salon.avgRating || 0}
                />
                <Image
                  src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), { width: 600, quality: 'auto', format: 'auto', crop: 'fill' })}
                  alt={`A photo of ${salon.name}`}
                  className={styles.cardImage}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{salon.name}</h2>
                <p className={styles.cardLocation}>
                  {salon.city}, {salon.province}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}