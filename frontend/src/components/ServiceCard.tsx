// frontend/src/components/ServiceCard.tsx
'use client';

import { useState } from 'react';
import { Service } from '@/types';
import styles from './ServiceCard.module.css';
import ImageLightbox from './ImageLightbox';

interface ServiceCardProps {
  service: Service;
  onBookNow: (service: Service) => void;
  onSendMessage: () => void;
}

export default function ServiceCard({ service, onBookNow, onSendMessage }: ServiceCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <>
      {isLightboxOpen && (
        <ImageLightbox images={service.images} onClose={() => setIsLightboxOpen(false)} />
      )}
      <div className={styles.card}>
        <div className={styles.imageContainer} onClick={() => setIsLightboxOpen(true)}>
          <img
            src={service.images[0] || 'https://via.placeholder.com/300x150'}
            alt={service.title}
            className={styles.image}
          />
          {/* --- NEW OVERLAY ELEMENT --- */}
          <div className={styles.imageOverlay}>
            <span className={styles.overlayIcon}>👁️</span>
            <span className={styles.overlayText}>View Images</span>
          </div>
          {/* --- END OF NEW ELEMENT --- */}
        </div>
        <div className={styles.content}>
          <div className={styles.header}>
            <h3 className={styles.title}>{service.title}</h3>
            <p className={styles.price}>R{service.price.toFixed(2)}</p>
          </div>
          <p className={styles.description}>{service.description}</p>
          <div className={styles.actions}>
            <button onClick={() => onBookNow(service)} className="btn btn-primary" style={{flex: 1}}>Book Now</button>
            <button onClick={onSendMessage} className="btn btn-secondary" style={{flex: 1}}>Message</button>
          </div>
        </div>
      </div>
    </>
  );
}