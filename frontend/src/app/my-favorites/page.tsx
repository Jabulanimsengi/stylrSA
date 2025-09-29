'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Salon } from '@/types';
import styles from './MyFavoritesPage.module.css';
import Spinner from '@/components/Spinner';
import Link from 'next/link';
import { FaHome, FaArrowLeft } from 'react-icons/fa';

export default function MyFavoritesPage() {
  const [favorites, setFavorites] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:3000/api/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch favorites');
        }

        const data = await res.json();
        // The API returns an array of { salon: Salon } objects
        setFavorites(data.map((fav: { salon: Salon }) => fav.salon));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [router]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.navButtonsContainer}>
          <button onClick={() => router.back()} className={styles.navButton}>
            <FaArrowLeft /> Back
          </button>
          <Link href="/" className={styles.navButton}>
            <FaHome /> Home
          </Link>
        </div>
        <h1 className={styles.title}>My Favorite Salons</h1>
      </div>

      {favorites.length === 0 ? (
        <p>You haven't favorited any salons yet.</p>
      ) : (
        <div className={styles.salonGrid}>
          {favorites.map((salon) => (
            <Link href={`/salons/${salon.id}`} key={salon.id} className={styles.salonCard}>
              <img
                src={salon.backgroundImage || 'https://via.placeholder.com/400x200'}
                alt={salon.name}
                className={styles.cardImage}
              />
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