'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  onSearch: (filters: any) => void;
  initialFilters?: any;
  isHomePage?: boolean;
}

export default function FilterBar({ onSearch, initialFilters = {}, isHomePage = false }: FilterBarProps) {
  const [province, setProvince] = useState(initialFilters.province || '');
  const [city, setCity] = useState(initialFilters.city || '');
  const [serviceSearch, setServiceSearch] = useState(initialFilters.service || '');
  const [offersMobile, setOffersMobile] = useState(initialFilters.offersMobile || false);
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || '');
  const [openOn, setOpenOn] = useState(initialFilters.openOn || '');
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // On the salons page, search automatically.
    if (!isHomePage) {
      const handler = setTimeout(() => {
        onSearch({ province, city, service: serviceSearch, offersMobile, sortBy, openOn });
      }, 300); // Debounce
      return () => clearTimeout(handler);
    }
  }, [province, city, serviceSearch, offersMobile, sortBy, openOn]);

  const handleSearchClick = () => {
    // On the home page, navigate with query params.
    const query = new URLSearchParams({
      province,
      city,
      service: serviceSearch,
      offersMobile: String(offersMobile),
      sortBy,
      openOn,
    });
    router.push(`/salons?${query.toString()}`);
  };

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        router.push(`/salons?lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
        setIsGeoLoading(false);
      },
      () => {
        alert('Unable to retrieve your location.');
        setIsGeoLoading(false);
      }
    );
  };
  
  const handleWeekendFilter = (day: 'Saturday' | 'Sunday', isChecked: boolean) => {
    setOpenOn(isChecked ? day : '');
  };

  return (
    <div className={`${styles.filterBar} ${isHomePage ? styles.homeFilterBar : ''}`}>
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
        <label htmlFor="service">Service</label>
        <input id="service" type="text" placeholder="e.g., Braids, Nails" value={serviceSearch}
          onChange={(e) => setServiceSearch(e.target.value)} className={styles.filterInput} />
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
       {isHomePage && (
        <button onClick={handleSearchClick} className={styles.searchButton}>
          Search
        </button>
      )}
    </div>
  );
}