'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './MobileFilter.module.css';
import { getLocationsCached } from '@/lib/resourceCache';
import { FilterValues } from '@/components/FilterBar/FilterBar';
import { useGeolocation } from '@/hooks/useGeolocation';

interface MobileFilterProps {
  onSearch: (filters: FilterValues) => void;
  onClose: () => void;
}

type LocationsByProvince = Record<string, string[]>;

export default function MobileFilter({ onSearch, onClose }: MobileFilterProps) {
  const [locations, setLocations] = useState<LocationsByProvince>({});
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [service, setService] = useState('');
  const [offersMobile, setOffersMobile] = useState(false);
  const fetchedLocationsRef = useRef(false);
  
  // Use geolocation hook
  const { coordinates, isLoading: isGeoLoading, requestLocation } = useGeolocation();

  // Prevent body scroll when modal is open
  useEffect(() => {
    // Store original values
    const originalOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    
    // Prevent scrolling
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    
    // Cleanup
    return () => {
      document.documentElement.style.overflow = originalOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (fetchedLocationsRef.current) return;
    fetchedLocationsRef.current = true;

    getLocationsCached()
      .then((data) => {
        if (data && typeof data === 'object') {
          setLocations(data);
        }
      })
      .catch((error) => {
        console.error('Failed to load locations:', error);
      });
  }, []);

  const handleSearch = () => {
    const filters: FilterValues = {
      province,
      city,
      service,
      category: '',
      offersMobile,
      sortBy: coordinates ? 'distance' : '',
      openNow: false,
      priceMin: '',
      priceMax: '',
      lat: coordinates?.latitude ?? null,
      lon: coordinates?.longitude ?? null,
    };
    onSearch(filters);
    onClose();
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    requestLocation();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
          <h2 className={styles.title}>Search</h2>
        </div>
        <div className={styles.content}>
          <div className={styles.filterGroup}>
            <label htmlFor="mobile-province" className={styles.label}>Province</label>
            <select
              id="mobile-province"
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                setCity('');
              }}
              className={styles.select}
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
            <label htmlFor="mobile-city" className={styles.label}>City</label>
            <select
              id="mobile-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={styles.select}
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
            <label htmlFor="mobile-service" className={styles.label}>Service</label>
            <input
              id="mobile-service"
              type="text"
              placeholder="e.g., Braids, Nails"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.checkboxGroup}>
            <input
              id="mobile-offers"
              type="checkbox"
              checked={offersMobile}
              onChange={(e) => setOffersMobile(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="mobile-offers" className={styles.checkboxLabel}>
              Offers Mobile Services
            </label>
          </div>
        </div>

        <div className={styles.footer}>
          <button 
            onClick={handleNearMe} 
            disabled={isGeoLoading}
            className={styles.nearMeButton}
            style={{ 
              marginBottom: '0.75rem', 
              backgroundColor: '#28a745', 
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              width: '100%',
              cursor: isGeoLoading ? 'not-allowed' : 'pointer',
              opacity: isGeoLoading ? 0.6 : 1,
            }}
          >
            {isGeoLoading ? 'Finding...' : '📍 Near Me'}
          </button>
          <button onClick={handleSearch} className={styles.searchButton}>
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
