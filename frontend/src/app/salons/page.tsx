// frontend/src/app/salons/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Salon } from '@/types';
import styles from './SalonsPage.module.css';
import Spinner from '@/components/Spinner';
import { FaHome, FaArrowLeft } from 'react-icons/fa';
import FilterBar from '@/components/FilterBar/FilterBar';

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    return {
      province: params.get('province') || '',
      city: params.get('city') || '',
      service: params.get('service') || '',
      offersMobile: params.get('offersMobile') === 'true',
      sortBy: params.get('sortBy') || '',
      openOn: params.get('openOn') || '',
      lat: params.get('lat') || null,
      lon: params.get('lon') || null,
    };
  };
  
  const [initialFilters] = useState(getInitialFilters);


  const fetchSalons = useCallback(async (filters: any) => {
    setIsLoading(true);
    let url = 'http://localhost:3000/api/salons';
    const query = new URLSearchParams();

    if (filters.lat && filters.lon) {
       url = `http://localhost:3000/api/salons/nearby?lat=${filters.lat}&lon=${filters.lon}`;
    } else {
        if (filters.province) query.append('province', filters.province);
        if (filters.city) query.append('city', filters.city);
        if (filters.service) query.append('service', filters.service);
        if (filters.offersMobile) query.append('offersMobile', 'true');
        if (filters.sortBy) query.append('sortBy', filters.sortBy);
        if (filters.openOn) query.append('openOn', filters.openOn);
        url = `http://localhost:3000/api/salons?${query.toString()}`;
    }
    
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch salons');
      const data = await res.json();
      setSalons(data);
    } catch (error) {
      console.error(error);
      setSalons([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalons(initialFilters);
  }, [initialFilters, fetchSalons]);


  return (
    <div className={styles.container}>
      <div className={styles.stickyHeader}>
        <div className={styles.navButtonsContainer}>
          <button onClick={() => router.back()} className={styles.navButton}><FaArrowLeft /> Back</button>
          <Link href="/" className={styles.navButton}><FaHome /> Home</Link>
        </div>
        <h1 className={styles.title}>Explore Salons</h1>
        <div className={styles.headerSpacer}></div>
      </div>
      
      <FilterBar onSearch={fetchSalons} initialFilters={initialFilters} />

      {isLoading ? (
        <Spinner />
      ) : salons.length === 0 ? (
        <p>No salons found matching your criteria.</p>
      ) : (
        <div className={styles.salonGrid}>
          {salons.map((salon) => (
            <Link href={`/salons/${salon.id}`} key={salon.id} className={styles.salonCard}>
              <img
                src={salon.backgroundImage || 'https://via.placeholder.com/400x200'}
                alt={`A photo of ${salon.name}`}
                className={styles.cardImage}
              />
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{salon.name}</h2>
                <p className={styles.cardLocation}>{salon.city}, {salon.province}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}