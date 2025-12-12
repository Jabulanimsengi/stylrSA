'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
    FaMapMarkerAlt,
    FaClock,
    FaPhone,
    FaWhatsapp,
    FaChevronDown,
    FaCamera,
    FaStar,
    FaTruck,
    FaDirections,
    FaHeart,
    FaBolt,
    FaCheck,
} from 'react-icons/fa';
import { Salon, GalleryImage, Review } from '@/types';
import { transformCloudinary } from '@/utils/cloudinary';
import styles from './BooksyLayout.module.css';
import VerificationBadge from '@/components/VerificationBadge/VerificationBadge';

interface BooksySidebarProps {
    salon: Salon;
    galleryImages: GalleryImage[];
    onShowAllPhotos: () => void;
    onOpenLightbox: (images: string[], index: number) => void;
    mapSrc: string | null;
    mapsHref: string;
    hoursRecord: Record<string, string> | null;
    todayLabel: string;
    orderedOperatingDays: string[];
    onBookNow: () => void;
    isFavorited: boolean;
    onToggleFavorite: () => void;
    showFavoriteButton: boolean;
}

export default function BooksySidebar({
    salon,
    galleryImages,
    onShowAllPhotos,
    onOpenLightbox,
    mapSrc,
    mapsHref,
    hoursRecord,
    todayLabel,
    orderedOperatingDays,
    onBookNow,
    isFavorited,
    onToggleFavorite,
    showFavoriteButton,
}: BooksySidebarProps) {
    const [showFullWeek, setShowFullWeek] = useState(false);
    const [showFullAbout, setShowFullAbout] = useState(false);

    // Get hero image - use background image, first gallery image, or logo
    const heroImage = galleryImages[0]?.imageUrl || salon.backgroundImage || salon.logo;
    const allGalleryUrls = galleryImages.map(g => g.imageUrl);

    return (
        <div className={styles.booksySidebar}>
            {/* Book Now Button */}
            <button className={styles.sidebarBookBtn} onClick={onBookNow}>
                <FaBolt /> Book now
            </button>

            {/* Map Card */}
            {mapSrc && (
                <div className={`${styles.sidebarCard} ${styles.mapCard}`}>
                    <div className={styles.sidebarMap}>
                        <iframe
                            src={mapSrc}
                            loading="lazy"
                            title={`Map of ${salon.name}`}
                        />
                        <div className={styles.mapOverlay}>
                            <div>
                                <strong>{salon.name}</strong>
                                <span>{salon.address || `${salon.town}, ${salon.city}`}</span>
                            </div>
                            <a
                                href={mapsHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.mapDirectionsBtn}
                                title="Get directions"
                            >
                                <FaDirections />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* About Card */}
            {salon.description && (
                <div className={styles.sidebarCard}>
                    <p className={styles.sidebarCardTitle}>About Us</p>
                    <p className={`${styles.aboutText} ${showFullAbout ? styles.expanded : ''}`}>
                        {salon.description}
                    </p>
                    {salon.description.length > 200 && (
                        <button
                            className={styles.showMoreBtn}
                            onClick={() => setShowFullAbout(!showFullAbout)}
                        >
                            {showFullAbout ? 'Show less' : 'Show more'}
                        </button>
                    )}
                </div>
            )}

            {/* Contact & Business Hours Card */}
            <div className={styles.sidebarCard}>
                <p className={styles.sidebarCardTitle}>Contact & Business Hours</p>

                {/* Phone */}
                {salon.phoneNumber && (
                    <div className={styles.contactRow}>
                        <div className={styles.contactInfo}>
                            <FaPhone />
                            <span>{salon.phoneNumber}</span>
                        </div>
                        <a
                            href={`tel:${salon.phoneNumber.replace(/[^0-9+]/g, '')}`}
                            className={styles.callBtn}
                        >
                            Call
                        </a>
                    </div>
                )}

                {/* Today Hours */}
                {hoursRecord && (
                    <>
                        <div className={styles.todayHours}>
                            <span className={styles.todayLabel}>Today</span>
                            <span className={styles.todayValue}>
                                {hoursRecord[todayLabel] || 'Closed'}
                            </span>
                        </div>

                        <button
                            className={`${styles.showFullWeekBtn} ${showFullWeek ? styles.expanded : ''}`}
                            onClick={() => setShowFullWeek(!showFullWeek)}
                        >
                            Show full week <FaChevronDown />
                        </button>

                        {showFullWeek && (
                            <div className={styles.weeklyHoursList}>
                                <ul>
                                    {orderedOperatingDays.map(day => (
                                        <li key={day} className={day === todayLabel ? styles.today : ''}>
                                            <span>{day}</span>
                                            <span className={hoursRecord[day]?.toLowerCase() === 'closed' ? styles.closedText : ''}>
                                                {hoursRecord[day]}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* WhatsApp Button */}
            {salon.whatsapp && (
                <a
                    href={`https://wa.me/${salon.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi! I found your salon on Stylr SA and I'd like to make a booking.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.sidebarWhatsapp}
                >
                    <FaWhatsapp /> WhatsApp Us
                </a>
            )}
        </div>
    );
}

// Hero Gallery Component
export function HeroGallery({
    salon,
    galleryImages,
    onShowAllPhotos,
    onOpenLightbox,
}: {
    salon: Salon;
    galleryImages: GalleryImage[];
    onShowAllPhotos: () => void;
    onOpenLightbox: (images: string[], index: number) => void;
}) {
    const [activeThumb, setActiveThumb] = useState(0);

    // Get all available images
    const allImages: string[] = [];

    // Add hero images first
    if (salon.heroImages && salon.heroImages.length > 0) {
        allImages.push(...salon.heroImages);
    }

    // Add background image if available
    if (salon.backgroundImage && !allImages.includes(salon.backgroundImage)) {
        allImages.push(salon.backgroundImage);
    }

    // Add gallery images
    galleryImages.forEach(g => {
        if (!allImages.includes(g.imageUrl)) {
            allImages.push(g.imageUrl);
        }
    });

    // Fallback to logo if no images
    if (allImages.length === 0 && salon.logo) {
        allImages.push(salon.logo);
    }

    const currentImage = allImages[activeThumb] || allImages[0];
    const thumbnails = allImages.slice(0, 8); // Show max 8 thumbnails

    if (allImages.length === 0) {
        return null;
    }

    return (
        <div className={styles.heroGallery}>
            {/* Main Large Image */}
            <div
                className={styles.heroMainImage}
                onClick={() => onOpenLightbox(allImages, activeThumb)}
            >
                <Image
                    src={transformCloudinary(currentImage, { width: 1200, quality: 'auto', format: 'auto', crop: 'fill' })}
                    alt={salon.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                />

                {/* Show All Photos Button */}
                {allImages.length > 1 && (
                    <button
                        className={styles.showAllPhotosBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onShowAllPhotos();
                        }}
                    >
                        <FaCamera /> Show all photos
                    </button>
                )}
            </div>

            {/* Thumbnails Row */}
            {thumbnails.length > 1 && (
                <div className={styles.thumbnailsRow}>
                    {thumbnails.map((img, idx) => (
                        <div
                            key={idx}
                            className={`${styles.thumbnailItem} ${idx === activeThumb ? styles.active : ''}`}
                            onClick={() => setActiveThumb(idx)}
                        >
                            <Image
                                src={transformCloudinary(img, { width: 200, quality: 'auto', format: 'auto', crop: 'fill' })}
                                alt={`${salon.name} photo ${idx + 1}`}
                                fill
                                sizes="80px"
                            />
                        </div>
                    ))}
                    {allImages.length > 8 && (
                        <div
                            className={`${styles.thumbnailItem} ${styles.thumbnailMore}`}
                            onClick={onShowAllPhotos}
                        >
                            +{allImages.length - 8}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Salon Info Header Component (below photos)
export function SalonInfoHeader({
    salon,
    reviewsCount,
    onReviewsClick,
}: {
    salon: Salon;
    reviewsCount: number;
    onReviewsClick: () => void;
}) {
    return (
        <div className={styles.salonInfoHeader}>
            {/* Badges */}
            <div className={styles.salonBadges}>
                {salon.bookingType === 'MOBILE' && (
                    <span className={styles.mobileBadge}>
                        <FaTruck /> Mobile service
                    </span>
                )}
                {salon.bookingType === 'BOTH' && (
                    <span className={styles.mobileBadge}>
                        <FaTruck /> Mobile available
                    </span>
                )}
            </div>

            {/* Salon Name */}
            <h1 className={styles.salonNameLarge}>
                {salon.name}
                {salon.isVerified && <VerificationBadge size="medium" />}
            </h1>

            {/* Address */}
            <p className={styles.salonAddress}>
                {salon.address || `${salon.town}, ${salon.city}, ${salon.province}`}
            </p>

            {/* Rating & Reviews */}
            <div className={styles.salonRatingReviews}>
                {salon.avgRating && salon.avgRating > 0 && (
                    <span className={styles.ratingDisplay}>
                        <FaStar /> {salon.avgRating.toFixed(2)}
                    </span>
                )}
                {reviewsCount > 0 && (
                    <button className={styles.reviewsLink} onClick={onReviewsClick}>
                        ({reviewsCount} review{reviewsCount !== 1 ? 's' : ''})
                    </button>
                )}
            </div>
        </div>
    );
}

// BooksyReviewsSection uses Review type from the top-level import

// Booksy-style Reviews Section Component
export function BooksyReviewsSection({
    reviews,
    avgRating,
    galleryImages,
    onOpenLightbox,
}: {
    reviews: Review[];
    avgRating: number;
    galleryImages: { id: string; imageUrl: string }[];
    onOpenLightbox: (images: string[], index: number) => void;
}) {
    const [visibleCount, setVisibleCount] = useState(5);

    // Calculate rating distribution
    const ratingCounts = [0, 0, 0, 0, 0]; // Index 0 = 1 star, Index 4 = 5 stars
    reviews.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
            ratingCounts[review.rating - 1]++;
        }
    });

    const maxCount = Math.max(...ratingCounts, 1);
    const totalReviews = reviews.length;
    const displayedReviews = reviews.slice(0, visibleCount);

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-ZA', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Get client photos (from reviews that might have images or from gallery)
    const clientPhotoUrls = galleryImages.slice(0, 10).map(g => g.imageUrl);

    if (totalReviews === 0) {
        return (
            <section id="reviews-section" className={styles.reviewsSection}>
                <h2 className={styles.reviewsSectionTitle}>Reviews</h2>
                <div className={styles.noReviews}>
                    <p>No reviews yet. Be the first to leave a review!</p>
                </div>
            </section>
        );
    }

    return (
        <section id="reviews-section" className={styles.reviewsSection}>
            <h2 className={styles.reviewsSectionTitle}>Reviews</h2>

            {/* Reviews Header with Description and Rating Summary */}
            <div className={styles.reviewsHeader}>
                <p className={styles.reviewsDescription}>
                    Stylr SA guarantees that reviews with the &quot;Verified&quot; tag have been added by
                    registered users who have had an appointment with the provider. A registered user
                    has the opportunity to add a review only after the service has been provided to them.
                </p>

                {/* Rating Summary Card */}
                <div className={styles.ratingSummaryCard}>
                    <div className={styles.ratingScoreSection}>
                        <div className={styles.ratingScore}>
                            {avgRating.toFixed(1)}<span>/5</span>
                        </div>
                        <div className={styles.ratingStars}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <FaStar
                                    key={star}
                                    style={{ opacity: star <= Math.round(avgRating) ? 1 : 0.3 }}
                                />
                            ))}
                        </div>
                        <p className={styles.ratingCount}>Based on {totalReviews} reviews</p>
                    </div>

                    {/* Rating Breakdown Bars */}
                    <div className={styles.ratingBreakdown}>
                        {[5, 4, 3, 2, 1].map(star => (
                            <div key={star} className={styles.ratingBar}>
                                <span className={styles.ratingBarLabel}>
                                    {star} <FaStar />
                                </span>
                                <div className={styles.ratingBarTrack}>
                                    <div
                                        className={styles.ratingBarFill}
                                        style={{ width: `${(ratingCounts[star - 1] / maxCount) * 100}%` }}
                                    />
                                </div>
                                <span className={styles.ratingBarCount}>{ratingCounts[star - 1]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Client Photos */}
            {clientPhotoUrls.length > 0 && (
                <div className={styles.clientPhotos}>
                    <h3 className={styles.clientPhotosTitle}>Client photos</h3>
                    <div className={styles.clientPhotosGrid}>
                        {clientPhotoUrls.map((url, idx) => (
                            <div
                                key={idx}
                                className={styles.clientPhotoItem}
                                onClick={() => onOpenLightbox(clientPhotoUrls, idx)}
                            >
                                <Image
                                    src={transformCloudinary(url, { width: 180, quality: 'auto', format: 'auto', crop: 'fill' })}
                                    alt={`Client photo ${idx + 1}`}
                                    fill
                                    sizes="72px"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Individual Reviews */}
            <div className={styles.reviewsList}>
                {displayedReviews.map(review => (
                    <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewCardHeader}>
                            {/* Stars */}
                            <div className={styles.reviewRatingStars}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <FaStar
                                        key={star}
                                        style={{ opacity: star <= review.rating ? 1 : 0.3 }}
                                    />
                                ))}
                            </div>

                            {/* Reviewer Info */}
                            <div className={styles.reviewerInfo}>
                                <span className={styles.reviewerName}>
                                    {review.author?.firstName || 'Anonymous'} {review.author?.lastName?.charAt(0) || ''}.
                                </span>
                                <span>• {formatDate(review.createdAt)}</span>
                                <span className={styles.verifiedBadge} title="Verified booking">
                                    <FaCheck />
                                </span>
                            </div>
                        </div>

                        {/* Service Info (if available) */}
                        {review.booking?.service && (
                            <p className={styles.reviewServiceInfo}>
                                <strong>{review.booking.service.title}</strong>
                            </p>
                        )}

                        {/* Review Comment */}
                        <p className={styles.reviewComment}>{review.comment}</p>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            {visibleCount < totalReviews && (
                <button
                    className={styles.loadMoreReviews}
                    onClick={() => setVisibleCount(prev => prev + 5)}
                >
                    Show more reviews ({totalReviews - visibleCount} remaining)
                </button>
            )}
        </section>
    );
}
