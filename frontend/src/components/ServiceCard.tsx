'use client';

import { useState } from 'react';
import { Service } from '@/types';
import styles from './ServiceCard.module.css';
import ImageLightbox from './ImageLightbox';
import { toast } from 'react-toastify';

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
  onSendMessage: () => void;
  onImageClick: (images: string[], index: number) => void;
}

export default function ServiceCard({ service, onBook, onSendMessage, onImageClick }: ServiceCardProps) {
  const [isLiked, setIsLiked] = useState(service.isLikedByCurrentUser || false);
  const [likeCount, setLikeCount] = useState(service.likeCount);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('You must be logged in to like a service.');
      return;
    }
    const originalLikedState = isLiked;
    const originalLikeCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    try {
      await fetch(`http://localhost:3000/api/likes/service/${service.id}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      setIsLiked(originalLikedState);
      setLikeCount(originalLikeCount);
      toast.error('Failed to update like status.');
    }
  };

  return (
    <>
      <div className={styles.card}>
        <div 
          className={styles.imageContainer} 
          onClick={() => service.images.length > 0 && onImageClick(service.images, 0)}
        >
          <img
            src={service.images[0] || 'https://via.placeholder.com/300x150'}
            alt={service.title}
            className={styles.image}
          />
          <div className={styles.imageOverlay}>
            <span className={styles.overlayIcon}>👁️</span>
            <span className={styles.overlayText}>View Images</span>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.header}>
            <h3 className={styles.title}>{service.title}</h3>
            <p className={styles.price}>R{service.price.toFixed(2)}</p>
          </div>
          <p className={`${styles.description} ${isExpanded ? styles.expanded : ''}`}>
            {service.description}
          </p>
          <button onClick={() => setIsExpanded(!isExpanded)} className={styles.expandButton}>
            {isExpanded ? 'View Less' : 'View More'}
          </button>
          <div className={styles.footer}>
            <button onClick={handleLikeClick} className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              <span>{likeCount}</span>
            </button>
            <div className={styles.actions}>
              <button onClick={(e) => { e.stopPropagation(); onSendMessage(); }} className="btn btn-ghost">Message</button>
              <button onClick={(e) => { e.stopPropagation(); onBook(service); }} className="btn btn-primary">Book</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
