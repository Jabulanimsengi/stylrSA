'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import styles from './ImageLightbox.module.css';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export default function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (images.length > 1) {
        // Only allow navigation if there are multiple images
        if (e.key === 'ArrowLeft') {
          onNavigate('prev');
        } else if (e.key === 'ArrowRight') {
          onNavigate('next');
        }
      }
    };

    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onNavigate, images.length]);

  if (!isOpen || images.length === 0) return null;

  // Ensure currentIndex is valid and handle case when images array changes
  const safeIndex = Math.max(0, Math.min(currentIndex, images.length - 1));
  const currentImage = images[safeIndex];
  const hasMultipleImages = images.length > 1;

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* Close Button */}
      <button
        onClick={onClose}
        className={styles.closeButton}
        aria-label="Close lightbox"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Navigation Controls - Only show if multiple images */}
      {hasMultipleImages && (
        <>
          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('prev');
            }}
            className={`${styles.navButton} ${styles.prevButton}`}
            aria-label="Previous image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('next');
            }}
            className={`${styles.navButton} ${styles.nextButton}`}
            aria-label="Next image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        {/* Image */}
        <div className={styles.imageWrapper}>
          {currentImage && (
            <Image
              src={currentImage}
              alt={`Image ${safeIndex + 1} of ${images.length}`}
              fill
              sizes="100vw"
              className={styles.image}
              priority
            />
          )}
        </div>

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className={styles.counter}>
            {safeIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}
