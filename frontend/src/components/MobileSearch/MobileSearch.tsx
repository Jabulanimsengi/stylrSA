'use client';

import { useState } from 'react';
import styles from './MobileSearch.module.css';
import MobileFilter from './MobileFilter';
import { type FilterValues } from '@/components/FilterBar/FilterBar';

interface MobileSearchProps {
  onSearch: (filters: FilterValues) => void;
}

export default function MobileSearch({ onSearch }: MobileSearchProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleOpenFilter = () => {
    setIsFilterOpen(true);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  return (
    <>
      <div className={styles.searchContainer} onClick={handleOpenFilter}>
        <input
          type="text"
          placeholder="Search for businesses or services"
          className={styles.searchInput}
          readOnly
        />
      </div>
      {isFilterOpen && (
        <MobileFilter onSearch={onSearch} onClose={handleCloseFilter} />
      )}
    </>
  );
}
