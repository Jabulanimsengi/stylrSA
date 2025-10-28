'use client';

import { useState, useEffect, useCallback, useDeferredValue, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './FilterBar.module.css';
import { toFriendlyMessage } from '@/lib/errors';
import { getCategoriesCached, getLocationsCached } from '@/lib/resourceCache';
import { apiJson } from '@/lib/api';
import { useGeolocation } from '@/hooks/useGeolocation';

export interface FilterValues {
  province: string;
  city: string;
  service: string;
  category: string;
  offersMobile: boolean;
  sortBy: string;
  openNow: boolean;
  priceMin: string;
  priceMax: string;
  lat?: number | string | null;
  lon?: number | string | null;
}

type LocationsByProvince = Record<string, string[]>;

interface ServiceSuggestion {
  id: string;
  title: string;
  salon?: string;
}

type AutocompletePayload = Array<{
  id?: string;
  title?: string | null;
  salon?: { name?: string | null } | null;
  salonName?: string | null;
}>;

interface FilterBarProps {
  onSearch: (filters: FilterValues) => void;
  initialFilters?: Partial<FilterValues>;
  isHomePage?: boolean;
  autoSearch?: boolean;
  showSearchButton?: boolean;
  isSearching?: boolean;
}

export default function FilterBar({
  onSearch,
  initialFilters = {},
  isHomePage = false,
  autoSearch,
  showSearchButton = isHomePage,
  isSearching = false,
}: FilterBarProps) {
  const [locations, setLocations] = useState<LocationsByProvince>({});
  const [province, setProvince] = useState(initialFilters.province || '');
  const [city, setCity] = useState(initialFilters.city || '');
  const [serviceSearch, setServiceSearch] = useState(initialFilters.service || '');
  const [category, setCategory] = useState(initialFilters.category || '');
  const [offersMobile, setOffersMobile] = useState(
    initialFilters.offersMobile ?? false
  );
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || '');
  const [openNow, setOpenNow] = useState(initialFilters.openNow ?? false);
  const [priceMin, setPriceMin] = useState(initialFilters.priceMin || '');
  const [priceMax, setPriceMax] = useState(initialFilters.priceMax || '');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [serviceSuggestions, setServiceSuggestions] = useState<ServiceSuggestion[]>([]);
  const [isServiceLoading, setIsServiceLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const deferredServiceSearch = useDeferredValue(serviceSearch);
  const router = useRouter();
  const enableAutoSearch = autoSearch ?? !isHomePage;
  const lastEmittedFiltersRef = useRef<string>('');
  
  // Use geolocation hook
  const { coordinates, isLoading: isGeoLoading, requestLocation } = useGeolocation();

  const initialProvince = initialFilters.province ?? '';
  const initialCity = initialFilters.city ?? '';
  const initialService = initialFilters.service ?? '';
  const initialCategory = initialFilters.category ?? '';
  const initialOffersMobile = initialFilters.offersMobile ?? false;
  const initialSortBy = initialFilters.sortBy ?? '';
  const initialOpenNow = initialFilters.openNow ?? false;
  const initialPriceMin = initialFilters.priceMin ?? '';
  const initialPriceMax = initialFilters.priceMax ?? '';

  const fetchedStaticDataRef = useRef(false);

  useEffect(() => {
    if (fetchedStaticDataRef.current) {
      return;
    }
    fetchedStaticDataRef.current = true;

    let cancelled = false;

    (async () => {
      const [locationsResult, categoriesResult] = await Promise.allSettled([
        getLocationsCached(),
        getCategoriesCached(),
      ]);

      if (cancelled) {
        return;
      }

      if (locationsResult.status === 'fulfilled' && locationsResult.value && typeof locationsResult.value === 'object') {
        setLocations(locationsResult.value);
      } else if (locationsResult.status === 'rejected') {
        console.debug('Locations load failed:', toFriendlyMessage(locationsResult.reason));
      }

      if (categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value)) {
        setCategories(
          categoriesResult.value
            .filter(
              (item): item is { id: string; name: string } =>
                Boolean(item && typeof item.id === 'string' && typeof item.name === 'string'),
            )
            .map((item) => ({ id: item.id, name: item.name })),
        );
      } else if (categoriesResult.status === 'rejected') {
        console.debug('Categories load failed:', toFriendlyMessage(categoriesResult.reason));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const buildFilters = useCallback((): FilterValues => ({
    province,
    city,
    service: serviceSearch,
    category,
    offersMobile,
    sortBy,
    openNow,
    priceMin,
    priceMax,
    lat: coordinates?.latitude ?? null,
    lon: coordinates?.longitude ?? null,
  }), [province, city, serviceSearch, category, offersMobile, sortBy, openNow, priceMin, priceMax, coordinates]);

  const triggerSearch = useCallback((filters: FilterValues, force = false) => {
    const serialized = JSON.stringify(filters);
    if (!force && serialized === lastEmittedFiltersRef.current) {
      return;
    }
    lastEmittedFiltersRef.current = serialized;
    setShowSuggestions(false);
    onSearch(filters);
  }, [onSearch]);

  useEffect(() => {
    if (!enableAutoSearch) {
      return;
    }
    const handler = setTimeout(() => {
      const nextFilters = buildFilters();
      triggerSearch(nextFilters);
    }, 300);
    return () => clearTimeout(handler);
  }, [buildFilters, triggerSearch, enableAutoSearch]);

  // Trigger search when coordinates become available
  useEffect(() => {
    if (coordinates && enableAutoSearch) {
      const filters = buildFilters();
      // Auto-enable distance sorting when location is available
      if (!filters.sortBy) {
        filters.sortBy = 'distance';
      }
      triggerSearch(filters, true);
    }
  }, [coordinates, enableAutoSearch, buildFilters, triggerSearch]);

  const handleSearchClick = () => {
    const filters = buildFilters();
    triggerSearch(filters, true);
  };

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    requestLocation();
  };

  useEffect(() => {
    const query = deferredServiceSearch.trim();
    if (query.length <= 1) {
      setServiceSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let cancelled = false;
    setIsServiceLoading(true);
    const controller = new AbortController();

    apiJson<AutocompletePayload>(`/api/services/autocomplete?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((data) => {
        if (cancelled || !Array.isArray(data)) {
          return;
        }
        const suggestions = data.reduce<ServiceSuggestion[]>((acc, item, index) => {
          const title = (item?.title ?? '').trim();
          if (!title) return acc;
          const id = item?.id ?? `suggestion-${index}`;
          const salonName = item?.salon?.name ?? item?.salonName ?? undefined;
          acc.push({ id, title, salon: salonName ?? undefined });
          return acc;
        }, []);
        setServiceSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      })
      .catch(() => {
        if (!cancelled) {
          setServiceSuggestions([]);
          setShowSuggestions(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsServiceLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [deferredServiceSearch]);

  useEffect(() => {
    setProvince((prev) => (prev === initialProvince ? prev : initialProvince));
    setCity((prev) => (prev === initialCity ? prev : initialCity));
    setServiceSearch((prev) => (prev === initialService ? prev : initialService));
    setCategory((prev) => (prev === initialCategory ? prev : initialCategory));
    setOffersMobile((prev) => (prev === initialOffersMobile ? prev : initialOffersMobile));
    setSortBy((prev) => (prev === initialSortBy ? prev : initialSortBy));
    setOpenNow((prev) => (prev === initialOpenNow ? prev : initialOpenNow));
    setPriceMin((prev) => (prev === initialPriceMin ? prev : initialPriceMin));
    setPriceMax((prev) => (prev === initialPriceMax ? prev : initialPriceMax));
  }, [
    initialProvince,
    initialCity,
    initialService,
    initialCategory,
    initialOffersMobile,
    initialSortBy,
    initialOpenNow,
    initialPriceMin,
    initialPriceMax,
  ]);

  useEffect(() => {
    if (!isSearching) {
      setShowSuggestions(false);
    }
  }, [isSearching]);

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
            if (val.trim().length <= 1) {
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
          <ul className={styles.suggestionsList}>
            <li className={styles.suggestionsHeader}>
              <button type="button" className={styles.dismissButton} onClick={() => setShowSuggestions(false)}>×</button>
            </li>
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
                onMouseDown={(e) => {
                  e.preventDefault();
                  const base = buildFilters();
                  const next = { ...base, service: s.title };
                  setServiceSearch(s.title);
                  setShowSuggestions(false);
                  triggerSearch(next, true);
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
      {showSearchButton && (
        <button onClick={handleSearchClick} className={styles.searchButton} disabled={isSearching}>
          {isSearching ? 'Searching…' : 'Search'}
        </button>
      )}
    </div>
  );
}