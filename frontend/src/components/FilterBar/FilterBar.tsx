'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './FilterBar.module.css';
import { apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';

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
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [serviceSuggestions, setServiceSuggestions] = useState<{ id: string; title: string; salon?: string }[]>([]);
  const [isServiceLoading, setIsServiceLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await apiJson('/api/locations');
        setLocations(data);
      } catch (e) {
        // Non-blocking: silently ignore, fields remain empty
        console.debug('Locations load failed:', toFriendlyMessage(e));
      }
    };
    const fetchCategories = async () => {
      try {
        const data = await apiJson('/api/categories');
        setCategories(data);
      } catch (e) {
        console.debug('Categories load failed:', toFriendlyMessage(e));
      }
    };
    fetchLocations();
    fetchCategories();
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
    const hasServiceQuery = serviceSearch && serviceSearch.trim().length > 0;
    router.push(`${hasServiceQuery ? '/services' : '/salons'}?${query.toString()}`);
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
          onChange={(e) => {
            const val = e.target.value;
            setServiceSearch(val);
            if (val.trim().length > 1) {
              const q = encodeURIComponent(val);
              setIsServiceLoading(true);
              apiJson(`/api/services/autocomplete?q=${q}`)
                .then((data: any) => {
                  const mapped = Array.isArray(data)
                    ? data
                        .map((item) => ({
                          id: item?.id ?? `${item?.title}-${Math.random()}`,
                          title: item?.title ?? '',
                          salon: item?.salon?.name ?? item?.salonName ?? '',
                        }))
                        .filter((item) => item.title.trim().length > 0)
                    : [];
                  setServiceSuggestions(mapped);
                  setShowSuggestions(mapped.length > 0);
                })
                .catch(() => {
                  setServiceSuggestions([]);
                  setShowSuggestions(false);
                })
                .finally(() => setIsServiceLoading(false));
            } else {
              setServiceSuggestions([]);
              setShowSuggestions(false);
            }
          }}
          className={styles.filterInput}
          onFocus={() => {
            if (serviceSuggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 120);
          }}
        />
        {showSuggestions && (
          <ul className={styles.suggestionsList} ref={suggestionsRef}>
            {isServiceLoading && (
              <li className={`${styles.suggestionItem} ${styles.suggestionLoading}`}>Searching…</li>
            )}
            {!isServiceLoading && serviceSuggestions.length === 0 && (
              <li className={`${styles.suggestionItem} ${styles.suggestionEmpty}`}>No matches found</li>
            )}
            {!isServiceLoading &&
              serviceSuggestions.map((s) => (
              <li
                key={s.id}
                className={styles.suggestionItem}
                onClick={() => {
                  setServiceSearch(s.title);
                  setShowSuggestions(false);
                }}
              >
                <span className={styles.suggestionTitle}>{s.title}</span>
                {s.salon && <span className={styles.suggestionMeta}>{s.salon}</span>}
              </li>
              ))}
          </ul>
        )}
      </div>
      <div className={styles.filterGroup}>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
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