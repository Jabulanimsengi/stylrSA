'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
    FaStar,
    FaMapMarkerAlt,
    FaPhone,
    FaWhatsapp,
    FaDirections,
    FaBolt,
    FaChevronRight,
    FaCheck,
    FaPlus,
    FaClock,
    FaImages,
} from 'react-icons/fa';
import { Salon, Service, GalleryImage, Review } from '@/types';
import { transformCloudinary } from '@/utils/cloudinary';
import VerificationBadge from '@/components/VerificationBadge/VerificationBadge';
import { SERVICE_CATEGORIES } from '@/constants/categories';
import styles from './MobileSalonProfile.module.css';

type TabType = 'services' | 'details' | 'reviews';

interface MobileSalonProfileProps {
    salon: Salon;
    services: Service[];
    galleryImages: GalleryImage[];
    reviews: Review[];
    hoursRecord: Record<string, string> | null;
    todayLabel: string;
    orderedOperatingDays: string[];
    mapSrc: string;
    mapsHref: string;
    onOpenLightbox: (images: string[], index: number) => void;
    onBookService: (service: Service) => void;
    onBookNow: () => void;
}

// Map category slugs to names for lookup
const CATEGORY_NAME_BY_SLUG = new Map(
    SERVICE_CATEGORIES.map(cat => [cat.slug, cat.name])
);

// Valid category names set for quick lookup
const VALID_CATEGORY_NAMES = new Set(SERVICE_CATEGORIES.map(cat => cat.name));

// Manual aliases for category normalization
const CATEGORY_ALIASES: Record<string, string> = {
    'makeup': 'Makeup & Beauty',
    'make-up': 'Makeup & Beauty',
    'make up': 'Makeup & Beauty',
    'hair': 'Haircuts & Styling',
    'nails': 'Nail Care',
    'bridal': 'Bridal Services',
    'wedding': 'Bridal Services',
    'wigs': 'Wig Installations',
    'wig': 'Wig Installations',
    'braids': 'Braiding & Weaving',
    'braid': 'Braiding & Weaving',
    'weaving': 'Braiding & Weaving',
    'lashes': 'Lashes & Brows',
    'lash': 'Lashes & Brows',
    'brows': 'Lashes & Brows',
    'natural': 'Natural Hair Specialists',
    'color': 'Hair Color & Treatments',
    'colour': 'Hair Color & Treatments',
    'treatment': 'Hair Color & Treatments',
    'wellness': 'Wellness & Holistic Spa',
    'spa': 'Wellness & Holistic Spa',
    'tattoo': 'Tattoos & Piercings',
    'aesthetic': 'Aesthetics & Advanced Skin',
    'manicure': 'Nail Care',
    'pedicure': 'Nail Care',
    'haircut': 'Haircuts & Styling',
    'facial': 'Skin Care & Facials',
    'massage': 'Massage & Body Treatments',
    'wax': 'Waxing & Hair Removal',
    'barber': "Men's Grooming",
    'beauty': 'Makeup & Beauty'
};

export default function MobileSalonProfile({
    salon,
    services,
    galleryImages,
    reviews,
    hoursRecord,
    todayLabel,
    orderedOperatingDays,
    mapSrc,
    mapsHref,
    onOpenLightbox,
    onBookService,
    onBookNow,
}: MobileSalonProfileProps) {
    const [activeTab, setActiveTab] = useState<TabType>('services');
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const tabsRef = useRef<HTMLDivElement>(null);

    // Get all gallery images
    const allImages = useMemo(() => {
        const images: string[] = [];
        if (salon.heroImages?.length) images.push(...salon.heroImages);
        if (salon.backgroundImage && !images.includes(salon.backgroundImage)) {
            images.push(salon.backgroundImage);
        }
        galleryImages.forEach(g => {
            if (!images.includes(g.imageUrl)) images.push(g.imageUrl);
        });
        if (images.length === 0 && salon.logo) images.push(salon.logo);
        return images;
    }, [salon, galleryImages]);

    // Group services by category (Fresha-style)
    const groupedServices = useMemo(() => {
        const groups: Record<string, Service[]> = {};

        services.forEach(service => {
            const categoryName = (service as any).category?.name || '';
            const categorySlug = (service as any).category?.slug || (service as any).categoryId || '';

            let validCategoryName = '';

            if (VALID_CATEGORY_NAMES.has(categoryName)) {
                validCategoryName = categoryName;
            } else if (categorySlug && CATEGORY_NAME_BY_SLUG.has(categorySlug)) {
                validCategoryName = CATEGORY_NAME_BY_SLUG.get(categorySlug)!;
            } else if (categoryName) {
                const lowerName = categoryName.toLowerCase();
                for (const [alias, target] of Object.entries(CATEGORY_ALIASES)) {
                    if (lowerName === alias || lowerName.includes(alias)) {
                        validCategoryName = target;
                        break;
                    }
                }
            }

            // Default to "Other Services" if no match
            if (!validCategoryName) validCategoryName = 'Other Services';

            if (!groups[validCategoryName]) {
                groups[validCategoryName] = [];
            }
            groups[validCategoryName].push(service);
        });

        // Sort categories - put known categories first, "Other Services" last
        const categoryOrder = new Map(SERVICE_CATEGORIES.map((cat, index) => [cat.name, index]));

        return Object.entries(groups)
            .map(([categoryName, categoryServices]) => ({
                categoryName,
                services: categoryServices
            }))
            .sort((a, b) => {
                if (a.categoryName === 'Other Services') return 1;
                if (b.categoryName === 'Other Services') return -1;
                const orderA = categoryOrder.get(a.categoryName) ?? 998;
                const orderB = categoryOrder.get(b.categoryName) ?? 998;
                return orderA - orderB;
            });
    }, [services]);

    // Toggle service selection
    const toggleService = (service: Service) => {
        setSelectedServices(prev => {
            const isSelected = prev.some(s => s.id === service.id);
            if (isSelected) {
                return prev.filter(s => s.id !== service.id);
            }
            return [...prev, service];
        });
    };

    // Check if service is selected
    const isServiceSelected = (serviceId: string) => {
        return selectedServices.some(s => s.id === serviceId);
    };

    // Calculate totals
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

    // Format duration
    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes}min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    };

    // Handle continue booking
    const handleContinue = () => {
        if (selectedServices.length > 0) {
            // Book selected services
            selectedServices.forEach(service => onBookService(service));
        } else {
            onBookNow();
        }
    };

    const addressText = salon.address || [salon.town, salon.city, salon.province].filter(Boolean).join(', ');

    return (
        <>
            <div className={styles.mobileProfile}>
                {/* Hero Gallery Section */}
                <div className={styles.heroGallery} onClick={() => allImages.length > 0 && onOpenLightbox(allImages, 0)}>
                    {allImages.length > 0 ? (
                        <>
                            <Image
                                src={transformCloudinary(allImages[0], { width: 800, quality: 'auto', format: 'auto', crop: 'fill' })}
                                alt={salon.name}
                                fill
                                sizes="100vw"
                                priority
                                className={styles.heroImage}
                            />
                            {allImages.length > 1 && (
                                <button className={styles.viewPhotosBtn}>
                                    <FaImages /> {allImages.length} photos
                                </button>
                            )}
                        </>
                    ) : (
                        <div className={styles.noImage}>
                            <span>{salon.name.charAt(0)}</span>
                        </div>
                    )}
                </div>

                {/* Gallery Thumbnails */}
                {allImages.length > 1 && (
                    <div className={styles.thumbnailRow}>
                        {allImages.slice(1, 5).map((img, idx) => (
                            <div
                                key={idx}
                                className={styles.thumbnail}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenLightbox(allImages, idx + 1);
                                }}
                            >
                                <Image
                                    src={transformCloudinary(img, { width: 200, quality: 'auto', format: 'auto', crop: 'fill' })}
                                    alt={`${salon.name} photo ${idx + 2}`}
                                    fill
                                    sizes="100px"
                                />
                                {idx === 3 && allImages.length > 5 && (
                                    <div className={styles.moreOverlay}>+{allImages.length - 5}</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Salon Header */}
                <div className={styles.salonHeader}>
                    <h1 className={styles.salonName}>
                        {salon.name}
                        {salon.isVerified && <VerificationBadge size="small" />}
                    </h1>

                    <div className={styles.locationRow}>
                        <FaMapMarkerAlt />
                        <span>{addressText}</span>
                    </div>

                    {/* Rating & Badges Row */}
                    <div className={styles.metaRow}>
                        {salon.avgRating && salon.avgRating > 0 && (
                            <button
                                className={styles.ratingPill}
                                onClick={() => setActiveTab('reviews')}
                            >
                                <FaStar />
                                <span>{salon.avgRating.toFixed(1)}</span>
                                <span className={styles.reviewCount}>({reviews.length})</span>
                            </button>
                        )}
                        {(salon.bookingType === 'MOBILE' || salon.bookingType === 'BOTH') && (
                            <span className={styles.mobileBadge}>Mobile Service</span>
                        )}
                    </div>
                </div>

                {/* Tab Navigation - Fresha Style */}
                <div className={styles.tabNav} ref={tabsRef}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'services' ? styles.active : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        Services
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'details' ? styles.active : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Details
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.active : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews {reviews.length > 0 && <span className={styles.tabBadge}>{reviews.length}</span>}
                    </button>
                </div>

                {/* Tab Content */}
                <div className={styles.tabContent}>
                    {/* Services Tab - Fresha Style */}
                    {activeTab === 'services' && (
                        <div className={styles.servicesTab}>
                            {groupedServices.map(group => (
                                <div key={group.categoryName} className={styles.categorySection}>
                                    <h3 className={styles.categoryTitle}>{group.categoryName}</h3>
                                    <div className={styles.servicesList}>
                                        {group.services.map(service => {
                                            const isSelected = isServiceSelected(service.id);
                                            const serviceName = service.title || service.name || 'Service';
                                            const hasImages = service.images && service.images.length > 0;

                                            return (
                                                <div
                                                    key={service.id}
                                                    className={`${styles.serviceCard} ${isSelected ? styles.selected : ''}`}
                                                    onClick={() => toggleService(service)}
                                                >
                                                    <div className={styles.serviceMain}>
                                                        <h4 className={styles.serviceName}>{serviceName}</h4>
                                                        {service.description && (
                                                            <p className={styles.serviceDesc}>{service.description}</p>
                                                        )}
                                                        <div className={styles.serviceMeta}>
                                                            <span className={styles.serviceDuration}>
                                                                {formatDuration(service.duration)}
                                                            </span>
                                                            {hasImages && (
                                                                <button
                                                                    className={styles.viewImagesBtn}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onOpenLightbox(service.images, 0);
                                                                    }}
                                                                >
                                                                    <FaImages /> View
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={styles.serviceRight}>
                                                        <span className={styles.servicePrice}>
                                                            R{service.price.toFixed(0)}
                                                        </span>
                                                        <button
                                                            className={`${styles.addBtn} ${isSelected ? styles.added : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleService(service);
                                                            }}
                                                            aria-label={isSelected ? 'Remove' : 'Add'}
                                                        >
                                                            {isSelected ? <FaCheck /> : <FaPlus />}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {groupedServices.length === 0 && (
                                <div className={styles.emptyState}>
                                    <p>No services available yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <div className={styles.detailsTab}>
                            {/* About Section */}
                            {salon.description && (
                                <section className={styles.detailSection}>
                                    <h3 className={styles.sectionTitle}>About Us</h3>
                                    <div className={styles.sectionCard}>
                                        <p className={styles.aboutText}>{salon.description}</p>
                                    </div>
                                </section>
                            )}

                            {/* Location & Map */}
                            <section className={styles.detailSection}>
                                <h3 className={styles.sectionTitle}>Location</h3>
                                <div className={styles.sectionCard}>
                                    <div className={styles.addressRow}>
                                        <FaMapMarkerAlt />
                                        <span>{addressText}</span>
                                    </div>
                                    {mapSrc && (
                                        <div className={styles.mapWrapper}>
                                            <iframe
                                                src={mapSrc}
                                                loading="lazy"
                                                title={`Map of ${salon.name}`}
                                            />
                                            <a
                                                href={mapsHref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.directionsLink}
                                            >
                                                <FaDirections />
                                                Get Directions
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Business Hours */}
                            {hoursRecord && (
                                <section className={styles.detailSection}>
                                    <h3 className={styles.sectionTitle}>Business Hours</h3>
                                    <div className={styles.sectionCard}>
                                        <div className={styles.hoursList}>
                                            {orderedOperatingDays.map(day => {
                                                const hours = hoursRecord[day];
                                                const isToday = day === todayLabel;
                                                const isClosed = hours?.toLowerCase() === 'closed';

                                                return (
                                                    <div
                                                        key={day}
                                                        className={`${styles.hoursRow} ${isToday ? styles.today : ''}`}
                                                    >
                                                        <span className={styles.dayName}>{day}</span>
                                                        <span className={`${styles.hoursValue} ${isClosed ? styles.closed : ''}`}>
                                                            {hours || 'Closed'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Contact */}
                            <section className={styles.detailSection}>
                                <h3 className={styles.sectionTitle}>Contact</h3>
                                <div className={styles.sectionCard}>
                                    {salon.phoneNumber && (
                                        <a
                                            href={`tel:${salon.phoneNumber.replace(/[^0-9+]/g, '')}`}
                                            className={styles.contactRow}
                                        >
                                            <div className={styles.contactIcon}>
                                                <FaPhone />
                                            </div>
                                            <div className={styles.contactInfo}>
                                                <span className={styles.contactLabel}>Phone</span>
                                                <span className={styles.contactValue}>{salon.phoneNumber}</span>
                                            </div>
                                            <FaChevronRight className={styles.contactArrow} />
                                        </a>
                                    )}
                                    {salon.whatsapp && (
                                        <a
                                            href={`https://wa.me/${salon.whatsapp.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.contactRow}
                                        >
                                            <div className={`${styles.contactIcon} ${styles.whatsapp}`}>
                                                <FaWhatsapp />
                                            </div>
                                            <div className={styles.contactInfo}>
                                                <span className={styles.contactLabel}>WhatsApp</span>
                                                <span className={styles.contactValue}>Message on WhatsApp</span>
                                            </div>
                                            <FaChevronRight className={styles.contactArrow} />
                                        </a>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div className={styles.reviewsTab}>
                            <MobileReviewsContent
                                reviews={reviews}
                                avgRating={salon.avgRating || 0}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Sticky Book Bar */}
            <div className={styles.mobileBookBar}>
                {selectedServices.length > 0 ? (
                    <>
                        <div className={styles.bookBarInfo}>
                            <span className={styles.bookBarCount}>
                                {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} • {formatDuration(totalDuration)}
                            </span>
                            <span className={styles.bookBarPrice}>R{totalPrice.toFixed(0)}</span>
                        </div>
                        <button className={styles.bookBarButton} onClick={handleContinue}>
                            Continue
                        </button>
                    </>
                ) : (
                    <>
                        <button className={styles.mobileBookBtn} onClick={onBookNow}>
                            <FaBolt /> Book now
                        </button>
                        {salon.whatsapp && (
                            <a
                                href={`https://wa.me/${salon.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi! I found your salon on Stylr SA and I'd like to make a booking.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.mobileWhatsappBtn}
                            >
                                <FaWhatsapp />
                            </a>
                        )}
                    </>
                )}
            </div>
        </>
    );
}


// Mobile Reviews Content Component
function MobileReviewsContent({
    reviews,
    avgRating,
}: {
    reviews: Review[];
    avgRating: number;
}) {
    const [visibleCount, setVisibleCount] = useState(5);

    // Calculate rating distribution
    const ratingCounts = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
            ratingCounts[review.rating - 1]++;
        }
    });

    const maxCount = Math.max(...ratingCounts, 1);
    const displayedReviews = reviews.slice(0, visibleCount);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-ZA', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (reviews.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No reviews yet. Be the first to leave a review!</p>
            </div>
        );
    }

    return (
        <div className={styles.reviewsContent}>
            {/* Rating Summary */}
            <div className={styles.ratingSummary}>
                <div className={styles.ratingOverview}>
                    <div className={styles.ratingBig}>{avgRating.toFixed(1)}</div>
                    <div className={styles.ratingStars}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <FaStar
                                key={star}
                                className={star <= Math.round(avgRating) ? styles.starFilled : styles.starEmpty}
                            />
                        ))}
                    </div>
                    <div className={styles.reviewTotal}>{reviews.length} reviews</div>
                </div>
                <div className={styles.ratingBars}>
                    {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} className={styles.ratingBarRow}>
                            <span className={styles.barLabel}>{star}</span>
                            <div className={styles.barTrack}>
                                <div
                                    className={styles.barFill}
                                    style={{ width: `${(ratingCounts[star - 1] / maxCount) * 100}%` }}
                                />
                            </div>
                            <span className={styles.barCount}>{ratingCounts[star - 1]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className={styles.reviewsList}>
                {displayedReviews.map(review => (
                    <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                            <div className={styles.reviewerInfo}>
                                <div className={styles.reviewerAvatar}>
                                    {(review.author?.firstName?.charAt(0) || 'A').toUpperCase()}
                                </div>
                                <div>
                                    <div className={styles.reviewerName}>
                                        {review.author?.firstName || 'Anonymous'} {review.author?.lastName?.charAt(0) || ''}.
                                    </div>
                                    {review.booking?.service && (
                                        <div className={styles.reviewService}>{review.booking.service.title}</div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.reviewMeta}>
                                <div className={styles.reviewStars}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <FaStar
                                            key={star}
                                            className={star <= review.rating ? styles.starFilled : styles.starEmpty}
                                        />
                                    ))}
                                </div>
                                <span className={styles.reviewDate}>{formatDate(review.createdAt)}</span>
                            </div>
                        </div>
                        <p className={styles.reviewText}>{review.comment}</p>
                    </div>
                ))}
            </div>

            {/* Load More */}
            {visibleCount < reviews.length && (
                <button
                    className={styles.loadMoreBtn}
                    onClick={() => setVisibleCount(prev => prev + 5)}
                >
                    Show more reviews ({reviews.length - visibleCount} remaining)
                </button>
            )}
        </div>
    );
}
