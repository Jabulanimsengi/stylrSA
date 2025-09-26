'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Salon } from '@/types';
import styles from './SalonsPage.module.css';
import Spinner from '@/components/Spinner'; // Import the Spinner

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for filters
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [offersMobile, setOffersMobile] = useState(false);

  useEffect(() => {
    // This function fetches salons based on the current filter state
    const fetchSalons = async () => {
      // We don't set loading to true here to avoid flashing on every keystroke
      const query = new URLSearchParams();
      if (province) query.append('province', province);
      if (city) query.append('city', city);
      if (offersMobile) query.append('offersMobile', 'true');
      
      try {
        const res = await fetch(`http://localhost:3000/api/salons?${query.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch salons');
        const data = await res.json();
        setSalons(data);
      } catch (error) {
        console.error(error);
        setSalons([]);
      } finally {
        setIsLoading(false); // Set loading to false after the fetch is complete
      }
    };
    
    // We use a timeout to avoid sending too many requests while the user is typing
    const searchTimeout = setTimeout(() => {
      fetchSalons();
    }, 500); // 500ms debounce

    // Cleanup function to clear the timeout if the component unmounts or filters change
    return () => clearTimeout(searchTimeout);
  }, [province, city, offersMobile]); // Re-fetch whenever a filter changes

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Explore Salons</h1>
      
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="province">Province</label>
          <input
            id="province"
            type="text"
            placeholder="e.g., Gauteng"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className={styles.filterInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            placeholder="e.g., Johannesburg"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={styles.filterInput}
          />
        </div>
        <div className={styles.checkboxGroup}>
          <input
            id="offersMobile"
            type="checkbox"
            checked={offersMobile}
            onChange={(e) => setOffersMobile(e.target.checked)}
          />
          <label htmlFor="offersMobile">Offers Mobile Services</label>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : salons.length === 0 ? (
        <p>No salons found matching your criteria.</p>
      ) : (
        <div className={styles.salonGrid}>
          {salons.map((salon) => (
            <Link href={`/salons/${salon.id}`} key={salon.id} className={styles.salonCard}>
              <div
                className={styles.cardImage}
                style={{
                  backgroundImage: `url(${salon.backgroundImage || 'https://via.placeholder.com/400x200'})`,
                }}
              ></div>
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