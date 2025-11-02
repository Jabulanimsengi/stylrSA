'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaStar, FaCheck, FaTimes } from 'react-icons/fa';
import styles from './AdminSalonTrendzManager.module.css';

interface SalonTrendzData {
  id: string;
  name: string;
  city: string;
  province: string;
  avgRating: number;
  serviceCategories: string[];
  trendzProfile: {
    isEnabled: boolean;
    categories: string[];
    isPremium: boolean;
    impressions: number;
    clicks: number;
  };
}

const TREND_CATEGORIES = [
  { value: 'HAIRSTYLE', label: 'Hairstyle' },
  { value: 'BRAIDS', label: 'Braids' },
  { value: 'LOCS', label: 'Locs' },
  { value: 'EXTENSIONS', label: 'Extensions' },
  { value: 'NAILS', label: 'Nails' },
  { value: 'SPA', label: 'Spa' },
  { value: 'MAKEUP', label: 'Makeup' },
  { value: 'SKINCARE', label: 'Skincare' },
  { value: 'MASSAGE', label: 'Massage' },
  { value: 'BARBERING', label: 'Barbering' },
];

export default function AdminSalonTrendzManager() {
  const [salons, setSalons] = useState<SalonTrendzData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnabled, setFilterEnabled] = useState<'all' | 'enabled' | 'disabled'>('all');

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/trends/admin/salons', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setSalons(data);
      } else {
        toast.error('Failed to fetch salons');
      }
    } catch (error) {
      toast.error('Error loading salons');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSalonProfile = async (
    salonId: string,
    updates: Partial<SalonTrendzData['trendzProfile']>
  ) => {
    try {
      const res = await fetch(`/api/trends/admin/salons/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        toast.success('Salon profile updated!');
        fetchSalons();
      } else {
        toast.error('Failed to update salon');
      }
    } catch (error) {
      toast.error('Error updating salon');
    }
  };

  const toggleEnabled = (salon: SalonTrendzData) => {
    updateSalonProfile(salon.id, {
      isEnabled: !salon.trendzProfile.isEnabled,
    });
  };

  const togglePremium = (salon: SalonTrendzData) => {
    updateSalonProfile(salon.id, {
      isPremium: !salon.trendzProfile.isPremium,
    });
  };

  const toggleCategory = (salon: SalonTrendzData, category: string) => {
    const currentCategories = salon.trendzProfile.categories;
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];

    updateSalonProfile(salon.id, {
      categories: newCategories,
    });
  };

  const filteredSalons = salons.filter((salon) => {
    const matchesSearch =
      salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.province.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterEnabled === 'all' ||
      (filterEnabled === 'enabled' && salon.trendzProfile.isEnabled) ||
      (filterEnabled === 'disabled' && !salon.trendzProfile.isEnabled);

    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return <div className={styles.loading}>Loading salons...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Salon Trendz Profiles</h2>
        <p className={styles.subtitle}>
          Control which salons appear in trend recommendations
        </p>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search salons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />

        <div className={styles.filterButtons}>
          <button
            onClick={() => setFilterEnabled('all')}
            className={`${styles.filterButton} ${filterEnabled === 'all' ? styles.active : ''}`}
          >
            All ({salons.length})
          </button>
          <button
            onClick={() => setFilterEnabled('enabled')}
            className={`${styles.filterButton} ${filterEnabled === 'enabled' ? styles.active : ''}`}
          >
            Enabled ({salons.filter((s) => s.trendzProfile.isEnabled).length})
          </button>
          <button
            onClick={() => setFilterEnabled('disabled')}
            className={`${styles.filterButton} ${filterEnabled === 'disabled' ? styles.active : ''}`}
          >
            Disabled ({salons.filter((s) => !s.trendzProfile.isEnabled).length})
          </button>
        </div>
      </div>

      {filteredSalons.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No salons found matching your criteria</p>
        </div>
      ) : (
        <div className={styles.salonsList}>
          {filteredSalons.map((salon) => (
            <div key={salon.id} className={styles.salonCard}>
              <div className={styles.salonHeader}>
                <div>
                  <h3>{salon.name}</h3>
                  <p className={styles.location}>
                    {salon.city}, {salon.province}
                  </p>
                  {salon.avgRating > 0 && (
                    <div className={styles.rating}>
                      <FaStar /> {salon.avgRating.toFixed(1)}
                    </div>
                  )}
                </div>

                <div className={styles.toggles}>
                  <button
                    onClick={() => toggleEnabled(salon)}
                    className={`${styles.toggleButton} ${salon.trendzProfile.isEnabled ? styles.enabled : styles.disabled}`}
                  >
                    {salon.trendzProfile.isEnabled ? (
                      <>
                        <FaCheck /> Enabled
                      </>
                    ) : (
                      <>
                        <FaTimes /> Disabled
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => togglePremium(salon)}
                    disabled={!salon.trendzProfile.isEnabled}
                    className={`${styles.premiumButton} ${salon.trendzProfile.isPremium ? styles.premiumActive : ''}`}
                  >
                    ⭐ Premium
                  </button>
                </div>
              </div>

              {salon.serviceCategories.length > 0 && (
                <div className={styles.serviceCategories}>
                  <p className={styles.label}>Services Offered:</p>
                  <div className={styles.tags}>
                    {salon.serviceCategories.map((cat, idx) => (
                      <span key={idx} className={styles.serviceTag}>
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.trendCategories}>
                <p className={styles.label}>Show in Trend Categories:</p>
                <div className={styles.categoryGrid}>
                  {TREND_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => toggleCategory(salon, cat.value)}
                      disabled={!salon.trendzProfile.isEnabled}
                      className={`${styles.categoryButton} ${
                        salon.trendzProfile.categories.includes(cat.value)
                          ? styles.categorySelected
                          : ''
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {(salon.trendzProfile.impressions > 0 ||
                salon.trendzProfile.clicks > 0) && (
                <div className={styles.stats}>
                  <span>
                    👁️ {salon.trendzProfile.impressions.toLocaleString()}{' '}
                    impressions
                  </span>
                  <span>
                    🖱️ {salon.trendzProfile.clicks.toLocaleString()} clicks
                  </span>
                  {salon.trendzProfile.clicks > 0 && (
                    <span>
                      📊{' '}
                      {(
                        (salon.trendzProfile.clicks /
                          salon.trendzProfile.impressions) *
                        100
                      ).toFixed(1)}
                      % CTR
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
