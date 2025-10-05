// frontend/src/components/ImageLightbox.tsx
import { useState } from 'react';
import styles from './ImageLightbox.module.css';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface ImageLightboxProps {
  images: string[];
  startIndex?: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, startIndex = 0, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}><FaTimes /></button>
        {images.length > 1 && (
            <button className={`${styles.navButton} ${styles.prevButton}`} onClick={goToPrevious}><FaChevronLeft /></button>
        )}
        <img src={images[currentIndex]} alt="Enlarged view" className={styles.image} />
        {images.length > 1 && (
            <button className={`${styles.navButton} ${styles.nextButton}`} onClick={goToNext}><FaChevronRight /></button>
        )}
      </div>
    </div>
  );
}