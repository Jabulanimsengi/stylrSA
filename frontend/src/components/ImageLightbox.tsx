'use client';

import { useState, useEffect } from 'react';
import styles from './ImageLightbox.module.css';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface ImageLightboxProps {
  images: string[];
  initialImageIndex?: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialImageIndex = 0, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex);

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevious(e as any);
      if (e.key === 'ArrowRight') goToNext(e as any);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);


  if (!images || images.length === 0) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <img src={images[currentIndex]} alt="Enlarged view" className={styles.image} />
        
        <button className={styles.closeButton} onClick={onClose}><FaTimes /></button>

        {images.length > 1 && (
          <>
            <button className={`${styles.navButton} ${styles.prevButton}`} onClick={goToPrevious}><FaChevronLeft /></button>
            <button className={`${styles.navButton} ${styles.nextButton}`} onClick={goToNext}><FaChevronRight /></button>
          </>
        )}
      </div>
    </div>
  );
}