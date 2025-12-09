'use client';

import { useEffect } from 'react';
import styles from './VideoLightbox.module.css';

interface VideoLightboxProps {
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
  salonName?: string;
  caption?: string;
}

export default function VideoLightbox({
  videoUrl,
  isOpen,
  onClose,
  salonName,
  caption,
}: VideoLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <svg
            width="28"
            height="28"
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

        <div className={styles.videoWrapper}>
          <video
            src={videoUrl}
            className={styles.video}
            controls
            autoPlay
            playsInline
          />
        </div>

        {(salonName || caption) && (
          <div className={styles.info}>
            {salonName && <h3 className={styles.salonName}>{salonName}</h3>}
            {caption && <p className={styles.caption}>{caption}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
