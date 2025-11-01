'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { transformCloudinary } from '@/utils/cloudinary';
import { getImageWithFallback } from '@/lib/placeholders';
import { Salon, Service, Review } from '@/types';
import BookingModal from '@/components/BookingModal';
import ServiceCard from '@/components/ServiceCard';
import ReviewModal from '@/components/ReviewModal';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import { FaHeart, FaStar, FaPhone, FaEnvelope, FaWhatsapp, FaGlobe, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import styles from './SalonDetailPage.module.css';

export default function SalonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const salonId = params.id as string;
  
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();

  useEffect(() => {
    const fetchSalonDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch salon details
        const salonResponse = await fetch(`/api/salons/${salonId}`, {
          credentials: 'include',
        });
        
        if (!salonResponse.ok) {
          throw new Error('Salon not found');
        }
        
        const salonData = await salonResponse.json();
        setSalon(salonData.salon);
        setServices(salonData.services || []);
        setReviews(salonData.reviews || []);
        setIsFavorited(salonData.salon.isFavorited || false);
        
      } catch (err: any) {
        setError(err.message || 'Failed to load salon details');
        toast.error(err.message || 'Failed to load salon details');
      } finally {
        setIsLoading(false);
      }
    };

    if (salonId) {
      fetchSalonDetails();
    }
  }, [salonId]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (authStatus !== 'authenticated') {
      openModal();
      return;
    }

    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await fetch(`/api/salons/${salonId}/favorite`, {
        method,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }

      setIsFavorited(!isFavorited);
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update favorite status');
    }
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const handleOpenReviewModal = () => {
    if (authStatus !== 'authenticated') {
      openModal();
      return;
    }
    setIsReviewModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading salon details...</p>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className={styles.errorContainer}>
        <h2>Salon Not Found</h2>
        <p>{error || 'The salon you\'re looking for doesn\'t exist.'}</p>
        <Link href="/salons" className={styles.backButton}>
          ← Back to Salons
        </Link>
      </div>
    );
  }

  const renderOperatingHours = () => {
    if (!salon.operatingHours) return null;
    
    const hours = typeof salon.operatingHours === 'object' 
      ? salon.operatingHours as Record<string, string>
      : null;
    
    if (!hours) return null;

    return (
      <div className={styles.operatingHours}>
        <h3>Operating Hours</h3>
        <div className={styles.hoursGrid}>
          {Object.entries(hours).map(([day, hoursStr]) => (
            <div key={day} className={styles.dayHours}>
              <span className={styles.day}>{day}</span>
              <span className={styles.hours}>{hoursStr}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Header with Logo */}
      <div className={styles.header}>
        <div className={styles.logoSection}>
          {salon.logo ? (
            <Image
              src={transformCloudinary(salon.logo, { width: 120, quality: 'auto', format: 'auto' })}
              alt={`${salon.name} logo`}
              className={styles.mainLogo}
              width={120}
              height={120}
            />
          ) : (
            <div className={styles.logoPlaceholder}>
              <span>{salon.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
        
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <h1 className={styles.salonName}>{salon.name}</h1>
            {salon.avgRating && (
              <div className={styles.ratingSection}>
                <div className={styles.stars}>
                  <FaStar className={styles.star} />
                  <span>{salon.avgRating.toFixed(1)}</span>
                </div>
                <span className={styles.reviewCount}>
                  {salon.reviewCount || 0} {salon.reviewCount === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            )}
          </div>
          
          <div className={styles.headerActions}>
            <button
              onClick={handleToggleFavorite}
              className={`${styles.favoriteButton} ${isFavorited ? styles.favorited : ''}`}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FaHeart />
              <span>{isFavorited ? 'Favorited' : 'Add to Favorites'}</span>
            </button>
            <button onClick={handleOpenReviewModal} className={styles.reviewButton}>
              Write Review
            </button>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className={styles.heroSection}>
        <Image
          src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), { 
            width: 1200, 
            quality: 'auto', 
            format: 'auto', 
            crop: 'fill' 
          })}
          alt={`${salon.name} salon`}
          className={styles.heroImage}
          width={1200}
          height={400}
        />
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          {/* Salon Info */}
          <div className={styles.infoCard}>
            <h2>About {salon.name}</h2>
            {salon.description && (
              <p className={styles.description}>{salon.description}</p>
            )}
            
            <div className={styles.contactInfo}>
              {salon.address && (
                <div className={styles.contactItem}>
                  <FaMapMarkerAlt />
                  <span>{salon.address}, {salon.city}, {salon.province}</span>
                </div>
              )}
              {salon.phoneNumber && (
                <div className={styles.contactItem}>
                  <FaPhone />
                  <a href={`tel:${salon.phoneNumber}`}>{salon.phoneNumber}</a>
                </div>
              )}
              {salon.whatsapp && (
                <div className={styles.contactItem}>
                  <FaWhatsapp />
                  <a href={`https://wa.me/${salon.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </div>
              )}
              {salon.contactEmail && (
                <div className={styles.contactItem}>
                  <FaEnvelope />
                  <a href={`mailto:${salon.contactEmail}`}>{salon.contactEmail}</a>
                </div>
              )}
              {salon.website && (
                <div className={styles.contactItem}>
                  <FaGlobe />
                  <a href={salon.website} target="_blank" rel="noopener noreferrer">
                    Website
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Operating Hours */}
          {renderOperatingHours()}

          {/* Services */}
          <div className={styles.servicesCard}>
            <h2>Services</h2>
            {services.length > 0 ? (
              <div className={styles.servicesGrid}>
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    compact={false}
                    onBook={() => handleBookService(service)}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.noServices}>No services listed yet.</p>
            )}
          </div>

          {/* Reviews */}
          <div className={styles.reviewsCard}>
            <h2>Reviews</h2>
            {reviews.length > 0 ? (
              <div className={styles.reviewsList}>
                {reviews.map((review) => (
                  <div key={review.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <h4 className={styles.reviewerName}>
                        {review.user?.firstName} {review.user?.lastName}
                      </h4>
                      <div className={styles.reviewRating}>
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`${styles.reviewStar} ${
                              i < review.rating ? styles.filled : ''
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className={styles.reviewComment}>{review.comment}</p>
                    <div className={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noReviews}>No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>

        {/* Right Column - Booking */}
        <div className={styles.rightColumn}>
          <div className={styles.bookingCard}>
            <h3>Book a Service</h3>
            <p>Select from our available services to book your appointment.</p>
            {services.length > 0 ? (
              <button 
                className={styles.bookAllButton}
                onClick={() => setIsBookingModalOpen(true)}
              >
                View All Services & Book
              </button>
            ) : (
              <p className={styles.noBooking}>No services available for booking.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isBookingModalOpen && (
        <BookingModal
          salon={salon}
          services={services}
          selectedService={selectedService}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedService(null);
          }}
          onBookingSuccess={() => {
            setIsBookingModalOpen(false);
            setSelectedService(null);
            toast.success('Booking request sent successfully!');
          }}
        />
      )}

      {isReviewModalOpen && (
        <ReviewModal
          salonId={salonId}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewSubmitted={(newReview) => {
            setReviews([newReview, ...reviews]);
            setIsReviewModalOpen(false);
            toast.success('Review submitted successfully!');
          }}
        />
      )}
    </div>
  );
}
