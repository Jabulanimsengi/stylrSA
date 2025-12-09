'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './BeforeAfterStories.module.css';
import { transformCloudinary } from '@/utils/cloudinary';

interface BeforeAfterPhoto {
    id: string;
    beforeImageUrl: string;
    afterImageUrl: string;
    caption?: string;
    service?: {
        id: string;
        title: string;
    };
}

interface BeforeAfterStoriesProps {
    photos: BeforeAfterPhoto[];
    salonName: string;
}

export default function BeforeAfterStories({ photos, salonName }: BeforeAfterStoriesProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<BeforeAfterPhoto | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // 0 = Before, 1 = After

    if (!photos || photos.length === 0) {
        return null;
    }

    const handleStoryClick = (photo: BeforeAfterPhoto) => {
        setSelectedPhoto(photo);
        setCurrentImageIndex(0); // Start with Before image
    };

    const handleCloseModal = () => {
        setSelectedPhoto(null);
        setCurrentImageIndex(0);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex(0);
    };

    const handleNextImage = () => {
        setCurrentImageIndex(1);
    };

    const currentImage = selectedPhoto 
        ? (currentImageIndex === 0 ? selectedPhoto.beforeImageUrl : selectedPhoto.afterImageUrl)
        : '';
    const currentLabel = currentImageIndex === 0 ? 'Before' : 'After';

    return (
        <>
            <div className={styles.storiesContainer}>
                <p className={styles.label}>Before & After</p>
                <div className={styles.storiesRow}>
                    {photos.map((photo) => (
                        <button
                            key={photo.id}
                            className={styles.storyCircle}
                            onClick={() => handleStoryClick(photo)}
                            aria-label={`View before and after: ${photo.service?.title || 'transformation'}`}
                        >
                            <div className={styles.circleInner}>
                                <Image
                                    src={transformCloudinary(photo.beforeImageUrl, { width: 150, height: 150, crop: 'fill' })}
                                    alt="Before"
                                    fill
                                    className={styles.circleImage}
                                    sizes="80px"
                                />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Full view modal - Single image with navigation */}
            {selectedPhoto && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={handleCloseModal} aria-label="Close">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                        
                        {/* Single image display */}
                        <div className={styles.modalSingleImage}>
                            <span className={styles.modalLabel}>{currentLabel}</span>
                            <Image
                                src={currentImage}
                                alt={currentLabel}
                                fill
                                className={styles.modalImage}
                                sizes="90vw"
                            />
                            
                            {/* Navigation arrows */}
                            <button 
                                className={`${styles.navArrow} ${styles.navPrev}`}
                                onClick={handlePrevImage}
                                disabled={currentImageIndex === 0}
                                aria-label="View before image"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                            <button 
                                className={`${styles.navArrow} ${styles.navNext}`}
                                onClick={handleNextImage}
                                disabled={currentImageIndex === 1}
                                aria-label="View after image"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </button>
                        </div>

                        {/* Dots indicator */}
                        <div className={styles.dotsContainer}>
                            <button 
                                className={`${styles.dot} ${currentImageIndex === 0 ? styles.dotActive : ''}`}
                                onClick={handlePrevImage}
                                aria-label="Before"
                            />
                            <button 
                                className={`${styles.dot} ${currentImageIndex === 1 ? styles.dotActive : ''}`}
                                onClick={handleNextImage}
                                aria-label="After"
                            />
                        </div>

                        <div className={styles.modalInfo}>
                            <h3 className={styles.modalTitle}>{salonName}</h3>
                            {selectedPhoto.service && (
                                <p className={styles.modalService}>{selectedPhoto.service.title}</p>
                            )}
                            {selectedPhoto.caption && (
                                <p className={styles.modalCaption}>{selectedPhoto.caption}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
