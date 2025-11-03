// Radius selector component for geolocation-based filtering
'use client';

import { useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import styles from './RadiusSelector.module.css';

interface RadiusSelectorProps {
  value: number;
  onChange: (radius: number) => void;
  disabled?: boolean;
  hasLocation?: boolean;
}

const RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: 0, label: 'Any distance' }
];

export default function RadiusSelector({ 
  value, 
  onChange, 
  disabled = false, 
  hasLocation = false 
}: RadiusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = RADIUS_OPTIONS.find(option => option.value === value) || RADIUS_OPTIONS[1];

  const handleSelect = (radius: number) => {
    onChange(radius);
    setIsOpen(false);
  };

  if (!hasLocation) {
    return null; // Only show when user has location
  }

  return (
    <div className={styles.radiusSelector}>
      <label className={styles.label}>
        <FaMapMarkerAlt className={styles.icon} />
        Search Radius
      </label>
      
      <div className={styles.dropdown}>
        <button
          type="button"
          className={`${styles.trigger} ${disabled ? styles.disabled : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span>{selectedOption.label}</span>
          <svg 
            className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none"
          >
            <path 
              d="M3 4.5L6 7.5L9 4.5" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isOpen && (
          <div className={styles.menu}>
            {RADIUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.option} ${value === option.value ? styles.selected : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
                {value === option.value && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path 
                      d="M13.5 4.5L6 12L2.5 8.5" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {value > 0 && (
        <p className={styles.description}>
          Showing salons within {value} km of your location
        </p>
      )}
    </div>
  );
}