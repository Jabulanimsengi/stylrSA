'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Salon } from '@/types';
import styles from './SalonsPage.module.css';
import Spinner from '@/components/Spinner';

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  
  // State for filters
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [offersMobile, setOffersMobile] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [openOn, setOpenOn] = useState('');

  const fetchSalons = useCallback(async (geo_lat?: number, geo_lon?: number) => {
    setIsLoading(true);
    let url = 'http://localhost:3000/api/salons';

    if (geo_lat && geo_lon) {
      url = `http://localhost:3000/api/salons/nearby?lat=${geo_lat}&lon=${geo_lon}`;
    } else {
      const query = new URLSearchParams();
      if (province) query.append('province', province);
      if (city) query.append('city', city);
      if (offersMobile) query.append('offersMobile', 'true');
      if (sortBy) query.append('sortBy', sortBy);
      if (openOn) query.append('openOn', openOn);
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
  }, [province, city, offersMobile, sortBy, openOn]);

  // Fetch initial data on mount
  useEffect(() => {
    fetchSalons();
  }, []);

  const handleSearch = () => {
    fetchSalons();
  };
  
  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchSalons(position.coords.latitude, position.coords.longitude).finally(() => setIsGeoLoading(false));
        setProvince('');
        setCity('');
      },
      () => {
        alert('Unable to retrieve your location. Please enable location permissions.');
        setIsGeoLoading(false);
      }
    );
  };

  const handleWeekendFilter = (day: 'Saturday' | 'Sunday', isChecked: boolean) => {
    if (isChecked) {
      setOpenOn(day);
    } else if (openOn === day) {
      setOpenOn('');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Explore Salons</h1>
      
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="province">Province</label>
          <input id="province" type="text" placeholder="e.g., Gauteng" value={province}
            onChange={(e) => setProvince(e.target.value)} className={styles.filterInput} />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="city">City</label>
          <input id="city" type="text" placeholder="e.g., Johannesburg" value={city}
            onChange={(e) => setCity(e.target.value)} className={styles.filterInput} />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="sortBy">Sort By</label>
          <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.filterSelect}>
            <option value="">Default</option>
            <option value="top_rated">Top Rated</option>
          </select>
        </div>
        <div className={styles.weekendGroup}>
          <div className={styles.checkboxGroup}>
            <input id="openSaturday" type="checkbox" checked={openOn === 'Saturday'} onChange={(e) => handleWeekendFilter('Saturday', e.target.checked)} />
            <label htmlFor="openSaturday">Open Saturday</label>
          </div>
          <div className={styles.checkboxGroup}>
            <input id="openSunday" type="checkbox" checked={openOn === 'Sunday'} onChange={(e) => handleWeekendFilter('Sunday', e.target.checked)} />
            <label htmlFor="openSunday">Open Sunday</label>
          </div>
        </div>
        <div className={styles.checkboxGroup}>
          <input id="offersMobile" type="checkbox" checked={offersMobile} onChange={(e) => setOffersMobile(e.target.checked)} />
          <label htmlFor="offersMobile">Offers Mobile Services</label>
        </div>
        <button onClick={handleFindNearby} disabled={isGeoLoading} className={styles.geoButton}>
          {isGeoLoading ? 'Finding...' : '📍 Near Me'}
        </button>
        <button onClick={handleSearch} className={styles.searchButton}>Search</button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : salons.length === 0 ? (
        <p>No salons found matching your criteria.</p>
      ) : (
        <div className={styles.salonGrid}>
          {salons.map((salon) => (
            <Link href={`/salons/${salon.id}`} key={salon.id} className={styles.salonCard}>
              <div className={styles.cardImage}
                style={{ backgroundImage: `url(${salon.backgroundImage || 'https://via.placeholder.com/400x200'})` }}>
              </div>
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