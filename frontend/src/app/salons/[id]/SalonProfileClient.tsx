"use client";

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { transformCloudinary } from '@/utils/cloudinary';
import { FaHome, FaArrowLeft, FaHeart, FaWhatsapp, FaGlobe } from 'react-icons/fa';
import { Salon, Service, GalleryImage, Review } from '@/types';
import BookingModal from '@/components/BookingModal';
import styles from './SalonProfile.module.css';
import Accordion from '@/components/Accordion';
import ServiceCard from '@/components/ServiceCard';
import { toast } from 'react-toastify';
import { useSocket } from '@/context/SocketContext';
import ImageLightbox from '@/components/ImageLightbox';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { useStartConversation } from '@/hooks/useStartConversation';
import SalonProfileSkeleton from '@/components/Skeleton/SalonProfileSkeleton';

type Props = {
  initialSalon: Salon | null;
  salonId: string;
};

const INITIAL_SERVICES_BATCH = 12;
const SERVICES_BATCH_SIZE = 8;
const INITIAL_REVIEWS_BATCH = 4;
const REVIEWS_BATCH_SIZE = 4;
const EMPTY_REVIEWS: Review[] = [];

export default function SalonProfileClient({ initialSalon, salonId }: Props) {
  const router = useRouter();
  const { authStatus, user } = useAuth();
  const { openModal } = useAuthModal();
  const socket = useSocket();
  const { startConversation } = useStartConversation();

  const [salon, setSalon] = useState<Salon | null>(initialSalon);
  const [services, setServices] = useState<Service[]>(initialSalon?.services ?? []);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(initialSalon?.gallery ?? []);
  const [isLoading, setIsLoading] = useState(!initialSalon);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visibleServicesCount, setVisibleServicesCount] = useState(() => {
    const initialCount = initialSalon?.services?.length ?? 0;
    return initialCount > 0 ? Math.min(INITIAL_SERVICES_BATCH, initialCount) : 0;
  });
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(() => {
    const initialCount = initialSalon?.reviews?.length ?? 0;
    return initialCount > 0 ? Math.min(INITIAL_REVIEWS_BATCH, initialCount) : 0;
  });
  const serviceLoadRef = useRef<HTMLDivElement | null>(null);
  const reviewLoadRef = useRef<HTMLDivElement | null>(null);

  const heroImagesCount = salon?.heroImages?.length ?? 0;
  const reviews = salon?.reviews ?? EMPTY_REVIEWS;

  useEffect(() => {
    let isActive = true;

    const applySalon = (data: Salon | null) => {
      if (!isActive) return;
      setSalon(data);
      setServices(data?.services ?? []);
      setGalleryImages(data?.gallery ?? []);
      setIsLoading(false);
    };

    if (initialSalon) {
      applySalon(initialSalon);
      return () => {
        isActive = false;
      };
    }

    const loadSalon = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/salons/${salonId}`);
        if (!res.ok) throw new Error('Failed to load salon');
        const data: Salon = await res.json();
        applySalon(data);
      } catch (error) {
        console.error('Failed to load salon', error);
        if (isActive) {
          toast.error('Unable to load salon details right now.');
          applySalon(null);
        }
      }
    };

    void loadSalon();

    return () => {
      isActive = false;
    };
  }, [initialSalon, salonId]);

  useEffect(() => {
    setVisibleServicesCount((prev) => {
      if (services.length === 0) return 0;
      if (prev === 0) {
        return Math.min(INITIAL_SERVICES_BATCH, services.length);
      }
      return Math.min(prev, services.length);
    });
  }, [services.length]);

  useEffect(() => {
    setVisibleReviewsCount((prev) => {
      if (reviews.length === 0) return 0;
      if (prev === 0) {
        return Math.min(INITIAL_REVIEWS_BATCH, reviews.length);
      }
      return Math.min(prev, reviews.length);
    });
  }, [reviews.length]);

  useEffect(() => {
    if (heroImagesCount < 2) return;
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroImagesCount - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(id);
  }, [heroImagesCount]);

  useEffect(() => {
    if (!salon?.id || !socket) return;
    socket.emit('joinSalonRoom', salon.id);
    socket.on('availabilityUpdate', (data: { isAvailableNow: boolean }) => {
      setSalon(prev => prev ? { ...prev, isAvailableNow: data.isAvailableNow } : null);
    });
    return () => {
      socket.emit('leaveSalonRoom', salon.id);
      socket.off('availabilityUpdate');
    };
  }, [socket, salon?.id]);

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxStartIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxImages([]);
    setLightboxStartIndex(0);
  };

  const handleBookClick = (service: Service) => {
    if (authStatus !== 'authenticated') {
      openModal('login');
    } else {
      setSelectedService(service);
    }
  };

  const handleSendMessageClick = async () => {
    if (!salon) return;
    if (user && user.id === salon.ownerId) {
      toast.error('You cannot message your own salon.');
      return;
    }
    void startConversation(salon.ownerId, { recipientName: salon.name });
  };

  const handleToggleFavorite = async () => {
    if (authStatus !== 'authenticated') {
      toast.info('Please log in to add to favorites.');
      openModal('login');
      return;
    }
    if (!salon) return;

    const originalFavoritedState = salon.isFavorited;
    setSalon(prev => (prev ? { ...prev, isFavorited: !prev.isFavorited } : null));

    try {
      const res = await fetch(`/api/favorites/toggle/${salon.id}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update favorite status.');
      const { favorited } = await res.json();
      toast.success(favorited ? 'Added to favorites!' : 'Removed from favorites.');
    } catch {
      toast.error('Could not update favorites.');
      setSalon(prev => (prev ? { ...prev, isFavorited: originalFavoritedState } : null));
    }
  };

  const formatBookingType = (type: string) => {
    if (type === 'ONSITE') return 'This salon offers on-site services.';
    if (type === 'MOBILE') return 'This salon offers mobile services.';
    if (type === 'BOTH') return 'This salon offers both on-site and mobile services.';
    return 'Not Specified';
  };

  const hoursRecord = useMemo(() => {
    const oh = salon?.operatingHours as unknown;
    if (!oh) return null;
    if (Array.isArray(oh)) {
      const rec: Record<string, string> = {};
      (oh as Array<{ day?: string; open?: string; close?: string }>).forEach((it) => {
        const day = it?.day;
        const open = it?.open;
        const close = it?.close;
        if (day && (open || close)) rec[day] = `${open ?? ''} - ${close ?? ''}`.trim();
      });
      return rec;
    }
    if (typeof oh === 'object') return oh as Record<string, string>;
    return null;
  }, [salon?.operatingHours]);

  const operatingDays = hoursRecord ? Object.keys(hoursRecord) : [];
  const operatingSummary = useMemo(() => {
    if (!hoursRecord) return '';
    const entries = Object.entries(hoursRecord);
    if (entries.length === 0) return '';
    const samples = entries.slice(0, 2).map(([day, hours]) => `${day.substring(0,3)} ${hours}`);
    const extra = entries.length > 2 ? ` +${entries.length - 2} more` : '';
    return `${samples.join(' • ')}${extra}`;
  }, [hoursRecord]);

  const visibleServices = useMemo(() => services.slice(0, visibleServicesCount), [services, visibleServicesCount]);
  const visibleReviews = useMemo(() => reviews.slice(0, visibleReviewsCount), [reviews, visibleReviewsCount]);

  useEffect(() => {
    const node = serviceLoadRef.current;
    if (!node) return;
    if (visibleServicesCount >= services.length) return;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting) {
        setVisibleServicesCount((prev) => Math.min(prev + SERVICES_BATCH_SIZE, services.length));
      }
    }, { rootMargin: '240px 0px' });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [visibleServicesCount, services.length]);

  useEffect(() => {
    const node = reviewLoadRef.current;
    if (!node) return;
    if (visibleReviewsCount >= reviews.length) return;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting) {
        setVisibleReviewsCount((prev) => Math.min(prev + REVIEWS_BATCH_SIZE, reviews.length));
      }
    }, { rootMargin: '200px 0px' });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [visibleReviewsCount, reviews.length]);

  if (isLoading) return <SalonProfileSkeleton />;
  if (!salon) return <div style={{textAlign: 'center', padding: '2rem'}}>Salon not found.</div>;

  const heroImages = salon.heroImages || [];
  const nextSlide = () => setCurrentSlide(prev => (prev === heroImages.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? heroImages.length - 1 : prev - 1));

  const galleryImageUrls = galleryImages.map(img => img.imageUrl);
  const mapSrc = (() => {
    if (!salon.latitude || !salon.longitude) return '';
    const lat = salon.latitude;
    const lon = salon.longitude;
    const d = 0.01;
    const bbox = `${lon - d},${lat - d},${lon + d},${lat + d}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  })();

  return (
    <>
      <Head>
        <title>{`${salon.name} - The Salon Hub`}</title>
        <meta name="description" content={`Find the best beauty services at ${salon.name} in ${salon.city}. Book online today!`} />
        <meta name="keywords" content={`salon, ${salon.name}, ${salon.city}, beauty, haircut, nails, stylist, hairdresser`} />
        <meta property="og:title" content={`${salon.name} - The Salon Hub`} />
        <meta property="og:description" content={`Find the best beauty services at ${salon.name} in ${salon.city}. Book online today!`} />
        <meta property="og:image" content={salon.backgroundImage || '/logo-transparent.png'} />
        <meta property="og:url" content={`https://thesalonhub.com/salons/${salon.id}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      {selectedService && (
        <BookingModal
          salon={salon}
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onBookingSuccess={() => {
            toast.success('Booking request sent! The salon will confirm shortly.');
            setSelectedService(null);
          }}
        />
      )}
      {isLightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          initialImageIndex={lightboxStartIndex}
          onClose={closeLightbox}
        />
      )}

      <div>
        <div className={styles.stickyHeader}>
          <div className={styles.stickyHeaderContent}>
            <div className={styles.navButtonsContainer}>
              <button onClick={() => router.back()} className={styles.navButton}><FaArrowLeft /> Back</button>
              <Link href="/" className={styles.navButton}><FaHome /> Home</Link>
            </div>
            <h1 className={styles.title}>{salon.name}</h1>
            <div className={styles.headerSpacer}>
              {authStatus === 'authenticated' && (
                <button onClick={handleToggleFavorite} className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}>
                  <FaHeart />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.container}>
          <div className={styles.heroSlider}>
            {heroImages.length > 0 ? (
              <>
                <div className={styles.sliderWrapper} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                  {heroImages.map((img: string, index: number) => (
                    <div key={index} className={styles.slide}>
                      <Image
                        src={transformCloudinary(img, { width: 1200, quality: 'auto', format: 'auto', crop: 'fill' })}
                        alt={`${salon.name} gallery image ${index + 1}`}
                        className={styles.heroImage}
                        fill
                        sizes="(max-width: 1024px) 100vw, 1024px"
                        priority={index === 0}
                      />
                    </div>
                  ))}
                </div>
                {heroImages.length > 1 && (
                  <>
                    <button onClick={prevSlide} className={`${styles.sliderButton} ${styles.prev}`}>❮</button>
                    <button onClick={nextSlide} className={`${styles.sliderButton} ${styles.next}`}>❯</button>
                  </>
                )}
              </>
            ) : (
              <div className={styles.placeholderHero}>
                <p>No images available for this salon</p>
              </div>
            )}
            <div className={styles.heroOverlay}>
              <p className={styles.heroLocation}>{salon.town}, {salon.province}</p>
              {operatingSummary && (
                <p className={styles.heroHours}>Hours: {operatingSummary}</p>
              )}
              {!!salon.isAvailableNow && (
                <div className={styles.availabilityIndicator}>
                  <span className={styles.availabilityDot}></span>
                  Available Now
                </div>
              )}
            </div>
          </div>

          <div className={styles.profileLayout}>
            <div className={styles.mainContent}>
              {galleryImages.length > 0 && (
                <section id="gallery-section">
                  <h2 className={styles.sectionTitle}>Gallery</h2>
                  <div className={styles.galleryGrid}>
                    {galleryImages.map((image, index) => (
                      <div key={image.id} className={styles.galleryItem} onClick={() => openLightbox(galleryImageUrls, index)}>
                        <Image
                          src={transformCloudinary(image.imageUrl, { width: 400, quality: 'auto', format: 'auto', crop: 'fill' })}
                          alt={image.caption || 'Salon work'}
                          className={styles.galleryImage}
                          fill
                          sizes="(max-width: 768px) 50vw, 200px"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
              <section id="services-section">
                <h2 className={styles.sectionTitle}>Services</h2>
                <div className={styles.servicesGrid}>
                  {visibleServices.map((service) => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      onBook={handleBookClick}
                      onSendMessage={handleSendMessageClick}
                      onImageClick={openLightbox}
                    />
                  ))}
                  {visibleServicesCount < services.length && (
                    <div ref={serviceLoadRef} className={styles.lazySentinel} aria-hidden="true" />
                  )}
                </div>
              </section>

              <section>
                <h2 className={styles.sectionTitle}>Details</h2>

                <Accordion title="Operating Hours">
                  {hoursRecord && operatingDays.length > 0 ? (
                    <ul>
                      {operatingDays.map(day => (
                        <li key={day}>
                          <span>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                          <strong>{hoursRecord[day]}</strong>
                        </li>
                      ))}
                    </ul>
                  ) : <p>Operating hours not listed.</p>}
                </Accordion>
                <Accordion title="Service Type">
                  <p>{formatBookingType(salon.bookingType)}</p>
                  {salon.offersMobile && salon.mobileFee && (
                    <p style={{marginTop: '0.5rem'}}>Mobile service fee: <strong>R{salon.mobileFee.toFixed(2)}</strong></p>
                  )}
                </Accordion>
                <Accordion title="Location & Contact">
                  <p><strong>Address:</strong> {salon.address || `${salon.town}, ${salon.city}, ${salon.province}`}</p>
                  {authStatus === 'authenticated' ? (
                    <>
                      {salon.contactEmail && <p><strong>Email:</strong> <a href={`mailto:${salon.contactEmail}`}>{salon.contactEmail}</a></p>}
                      {salon.phoneNumber && <p><strong>Phone:</strong> <a href={`tel:${salon.phoneNumber}`}>{salon.phoneNumber}</a></p>}
                      {salon.whatsapp && <p><strong><FaWhatsapp /> WhatsApp:</strong> <a href={`https://wa.me/${salon.whatsapp}`} target="_blank" rel="noopener noreferrer">{salon.whatsapp}</a></p>}
                      {salon.website && <p><strong><FaGlobe /> Website:</strong> <a href={salon.website} target="_blank" rel="noopener noreferrer">{salon.website}</a></p>}
                      {mapSrc && (
                        <div className={styles.mapContainer}>
                          <iframe
                            width="100%"
                            height="300"
                            style={{ border: 0, borderRadius: '0.5rem', marginTop: '1rem' }}
                            loading="lazy"
                            allowFullScreen
                            src={mapSrc}>
                          </iframe>
                        </div>
                      )}
                    </>
                  ) : (
                  <p className={styles.loginPrompt}>
                    <button
                      type="button"
                      className={styles.loginPromptButton}
                      onClick={() => openModal('login')}
                    >
                      Log in
                    </button>{' '}
                    to view detailed contact information and map.
                  </p>
                  )}
                </Accordion>
                <Accordion title={`Reviews (${salon.reviews?.length || 0})`}>
                  {reviews.length > 0 ? (
                    <div>
                      {visibleReviews.map(review => (
                        <div key={review.id} style={{borderBottom: '1px dotted var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <strong>{review.author.firstName} {review.author.lastName.charAt(0)}.</strong>
                            <span style={{color: 'var(--accent-gold)'}}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                          </div>
                          <p style={{fontStyle: 'italic', marginTop: '0.5rem'}}>&quot;{review.comment}&quot;</p>
                        </div>
                      ))}
                      {visibleReviewsCount < reviews.length && (
                        <div ref={reviewLoadRef} className={styles.lazySentinel} aria-hidden="true" />
                      )}
                    </div>
                  ) : <p>No reviews yet.</p>}
                </Accordion>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
