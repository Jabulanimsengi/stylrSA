// frontend/src/components/ImageLightbox.tsx
'use client';

import { useState } from 'react';
import styles from './ImageLightbox.module.css';

interface ImageLightboxProps {
  images: string[];
  startIndex?: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, startIndex = 0, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <button className={styles.closeButton} onClick={onClose}>&times;</button>
      
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <button className={`${styles.navButton} ${styles.prevButton}`} onClick={goToPrevious}>‹</button>
        <img src={images[currentIndex]} alt={`Service Image ${currentIndex + 1}`} className={styles.image} />
        <button className={`${styles.navButton} ${styles.nextButton}`} onClick={goToNext}>›</button>
      </div>
    </div>
  );
}