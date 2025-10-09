'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  onSearch: (filters: any) => void;
  initialFilters?: any;
  isHomePage?: boolean;
}

export default function FilterBar({
  onSearch,
  initialFilters = {},
  isHomePage = false,
}: FilterBarProps) {
  const [locations, setLocations] = useState<any>({});
  const [province, setProvince] = useState(initialFilters.province || '');
  const [city, setCity] = useState(initialFilters.city || '');
  const [serviceSearch, setServiceSearch] = useState(initialFilters.service || '');
  const [category, setCategory] = useState(initialFilters.category || '');
  const [offersMobile, setOffersMobile] = useState(
    initialFilters.offersMobile || false
  );
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || '');
  const [openNow, setOpenNow] = useState(initialFilters.openNow || false);
  const [priceMin, setPriceMin] = useState(initialFilters.priceMin || '');
  const [priceMax, setPriceMax] = useState(initialFilters.priceMax || '');
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchLocations = async () => {
      const res = await fetch('/api/locations');
      if (res.ok) {
        setLocations(await res.json());
      }
    };
    fetchLocations();
  }, []);

  const handleSearch = useCallback(() => {
    onSearch({
      province,
      city,
      service: serviceSearch,
      category,
      offersMobile,
      sortBy,
      openNow,
      priceMin,
      priceMax,
    });
  }, [province, city, serviceSearch, category, offersMobile, sortBy, openNow, priceMin, priceMax, onSearch]);

  useEffect(() => {
    if (!isHomePage) {
      const handler = setTimeout(() => {
        handleSearch();
      }, 300); // Debounce
      return () => clearTimeout(handler);
    }
  }, [province, city, serviceSearch, category, offersMobile, sortBy, openNow, priceMin, priceMax, isHomePage, handleSearch]);

  const handleSearchClick = () => {
    const query = new URLSearchParams({
      province,
      city,
      service: serviceSearch,
      category,
      offersMobile: String(offersMobile),
      sortBy,
      openNow: String(openNow),
    });
    if (priceMin) query.set('priceMin', String(priceMin));
    if (priceMax) query.set('priceMax', String(priceMax));
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
        router.push(
          `/salons?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
        );
        setIsGeoLoading(false);
      },
      () => {
        alert('Unable to retrieve your location.');
        setIsGeoLoading(false);
      }
    );
  };

  const handleWeekendFilter = (day: 'Saturday' | 'Sunday', isChecked: boolean) => {
    // Deprecated in favor of openNow; keep function to avoid runtime errors if referenced
  };

  return (
    <div
      className={`${styles.filterBar} ${
        isHomePage ? styles.homeFilterBar : ''
      }`}
    >
      <div className={styles.filterGroup}>
        <label htmlFor="province">Province</label>
        <select
          id="province"
          value={province}
          onChange={(e) => {
            setProvince(e.target.value);
            setCity('');
          }}
          className={styles.filterSelect}
        >
          <option value="">All Provinces</option>
          {Object.keys(locations).map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterGroup}>
        <label htmlFor="city">Town/City</label>
        <select
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={styles.filterSelect}
          disabled={!province}
        >
          <option value="">All Cities</option>
          {province &&
            locations[province]?.map((c: string, index: number) => (
              <option key={`${c}-${index}`} value={c}>
                {c}
              </option>
            ))}
        </select>
      </div>
      <div className={styles.filterGroup}>
        <label htmlFor="service">Service</label>
        <input
          id="service"
          type="text"
          placeholder="e.g., Braids, Nails"
          value={serviceSearch}
          onChange={(e) => setServiceSearch(e.target.value)}
          className={styles.filterInput}
        />
      </div>
      <div className={styles.filterGroup}>
        <label htmlFor="category">Category</label>
        <input
          id="category"
          type="text"
          placeholder="e.g., Hair, Nails"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.filterInput}
        />
      </div>
      <div className={styles.filterGroup}>
        <label htmlFor="sortBy">Sort By</label>
        <select
          id="sortBy"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Default</option>
          <option value="top_rated">Top Rated</option>
          <option value="distance">Nearest</option>
          <option value="price">Lowest Price</option>
        </select>
      </div>
      <div className={styles.checkboxGroup}>
        <input
          id="openNow"
          type="checkbox"
          checked={openNow}
          onChange={(e) => setOpenNow(e.target.checked)}
        />
        <label htmlFor="openNow">Open now</label>
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
      <div className={styles.filterGroup}>
        <label>Price Range (R)</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className={styles.filterInput}
            min={0}
          />
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className={styles.filterInput}
            min={0}
          />
        </div>
      </div>
      <button
        onClick={handleFindNearby}
        disabled={isGeoLoading}
        className={styles.geoButton}
      >
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