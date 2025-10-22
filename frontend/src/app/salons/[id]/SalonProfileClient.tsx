"use client";

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import { transformCloudinary } from '@/utils/cloudinary';
import {
  FaHeart,
  FaWhatsapp,
  FaGlobe,
  FaMapMarkerAlt,
  FaClock,
  FaBolt,
  FaRegCopy,
  FaExternalLinkAlt,
} from 'react-icons/fa';
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
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { useStartConversation } from '@/hooks/useStartConversation';
import SalonProfileSkeleton from '@/components/Skeleton/SalonProfileSkeleton';
import { sanitizeText } from '@/lib/sanitize';
import PageNav from '@/components/PageNav';
import PromotionDetailsModal from '@/components/PromotionDetailsModal/PromotionDetailsModal';
import BookingConfirmationModal from '@/components/BookingConfirmationModal/BookingConfirmationModal';

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
  const [showWeek, setShowWeek] = useState(false);
  const [promotionsMap, setPromotionsMap] = useState<Map<string, any>>(new Map());
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [pendingBookingService, setPendingBookingService] = useState<Service | null>(null);
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
        logger.error('Failed to load salon', error);
        if (isActive) {
          toast.error(toFriendlyMessage(error, 'Unable to load salon details right now.'));
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

  // removed hero slider auto-advance

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

  // Fetch active promotions for this salon
  useEffect(() => {
    if (!salonId) return;

    const fetchPromotions = async () => {
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`/api/promotions/public?salonId=${salonId}&t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          const promoMap = new Map();
          data.forEach((promo: any) => {
            if (promo.serviceId) {
              promoMap.set(promo.serviceId, promo);
            }
          });
          setPromotionsMap(promoMap);
        }
      } catch (error) {
        logger.error('Failed to fetch promotions', error);
        // Silently fail - promotions are not critical
      }
    };

    void fetchPromotions();
  }, [salonId]);

  // Refetch salon data when page becomes visible (fixes operating hours not updating)
  useEffect(() => {
    let isActive = true;

    const refetchSalon = async () => {
      try {
        const res = await fetch(`/api/salons/${salonId}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data: Salon = await res.json();
        if (isActive) {
          setSalon(data);
          setServices(data?.services ?? []);
          setGalleryImages(data?.gallery ?? []);
        }
      } catch (error) {
        logger.error('Failed to refetch salon on visibility change', error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && salon) {
        void refetchSalon();
      }
    };

    const handleFocus = () => {
      if (salon) {
        void refetchSalon();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      isActive = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [salonId, salon]);

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

  const handlePromotionClick = (promotion: any) => {
    setSelectedPromotion(promotion);
    setIsPromotionModalOpen(true);
  };

  const handlePromotionBookNow = () => {
    // Called when user clicks "Book Now" in promotion details modal
    if (!selectedPromotion?.service) return;
    
    if (salon?.bookingMessage) {
      // Show confirmation modal
      setPendingBookingService(selectedPromotion.service);
      setShowBookingConfirmation(true);
    } else {
      // Open booking modal directly
      setSelectedService(selectedPromotion.service);
    }
  };

  const handleBookingConfirmationAccept = () => {
    setShowBookingConfirmation(false);
    if (pendingBookingService) {
      setSelectedService(pendingBookingService);
      setPendingBookingService(null);
    }
  };

  const handleBookingConfirmationClose = () => {
    setShowBookingConfirmation(false);
    setPendingBookingService(null);
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
    if (typeof oh === 'object') {
      const rec: Record<string, string> = {};
      const dayMap: Record<string, string> = {
        sunday: 'Sunday', monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
        thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday',
      };
      Object.entries(oh as Record<string, string>).forEach(([k, v]) => {
        const norm = dayMap[k.trim().toLowerCase().replace(/\./g, '')];
        if (norm) rec[norm] = v;
      });
      return Object.keys(rec).length > 0 ? rec : (oh as Record<string, string>);
    }
    return null;
  }, [salon?.operatingHours]);

  const orderedOperatingDays = useMemo(() => {
    if (!hoursRecord) return [] as string[];
    const order = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    return order.filter((d) => d in hoursRecord);
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

  // hero section removed; using compact info board instead
  const availabilityLabel = salon.isAvailableNow ? 'Open now' : 'Currently closed';
  const bookingSummary = (() => {
    const type = salon.bookingType;
    if (type === 'MOBILE') return 'Mobile visits available';
    if (type === 'BOTH') return 'On-site & mobile visits';
    if (type === 'REQUEST') return 'Request-led appointments';
    return 'On-site appointments';
  })();
  

  const galleryImageUrls = galleryImages.map(img => img.imageUrl);
  const addressText = (() => {
    if (salon.address && salon.address.trim().length > 0) return salon.address;
    const parts = [salon.town, salon.city, salon.province].filter(Boolean);
    return parts.join(', ');
  })();
  const mapsHref = salon.latitude && salon.longitude
    ? `https://www.google.com/maps?q=${salon.latitude},${salon.longitude}`
    : `https://www.google.com/maps?q=${encodeURIComponent(addressText)}`;
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(addressText);
      toast.success('Address copied');
    } catch {
      toast.error('Could not copy address');
    }
  };
  const shareProfile = async () => {
    if (!salon) return;
    const url = `${window.location.origin}/salons/${salon.id}`;
    const text = `Check out ${salon.name} on Stylr SA`;
    try {
      if (navigator.share) {
        await navigator.share({ title: salon.name, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      } catch {
        toast.error('Unable to share link');
      }
    }
  };
  const mapSrc = (() => {
    if (!salon.latitude || !salon.longitude) return '';
    const lat = salon.latitude;
    const lon = salon.longitude;
    const d = 0.01;
    const bbox = `${lon - d},${lat - d},${lon + d},${lat + d}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  })();
  const daysNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const todayLabel = daysNames[new Date().getDay()];

  return (
    <>
      <Head>
        <title>{`${salon.name} - Stylr SA`}</title>
        <meta name="description" content={`Find the best beauty services at ${salon.name} in ${salon.city}. Book online today!`} />
        <meta name="keywords" content={`salon, ${salon.name}, ${salon.city}, beauty, haircut, nails, stylist, hairdresser`} />
        <meta property="og:title" content={`${salon.name} - Stylr SA`} />
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

      <PromotionDetailsModal
        promotion={selectedPromotion}
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        salon={salon}
        onBookNow={handlePromotionBookNow}
      />

      <BookingConfirmationModal
        isOpen={showBookingConfirmation}
        onClose={handleBookingConfirmationClose}
        onAccept={handleBookingConfirmationAccept}
        salonName={salon?.name || ''}
        salonLogo={salon?.backgroundImage}
        message={salon?.bookingMessage || ''}
      />

      <div>
        <PageNav />
        <div className={styles.stickyHeaderContent}>
          <h1 className={styles.title}>{salon.name}</h1>
          <div className={styles.headerSpacer}>
            <button type="button" onClick={shareProfile} className={styles.navButton}>
              <FaExternalLinkAlt /> Share
            </button>
            {authStatus === 'authenticated' && (
              <button onClick={handleToggleFavorite} className={`${styles.favoriteButton} ${salon.isFavorited ? styles.favorited : ''}`}>
                <FaHeart />
              </button>
            )}
          </div>
        </div>

        <div className={styles.container}>
          <div className={styles.infoBoard}>
            <div className={styles.infoGrid}>
              <div className={`${styles.infoCard} ${styles.infoLocation}`}>
                <span className={styles.infoIcon} aria-hidden="true"><FaMapMarkerAlt /></span>
                <div className={styles.infoContent}>
                  <p className={styles.infoLabel}>Location</p>
                  <p className={styles.infoValue}>{salon.town}, {salon.province}</p>
                  {salon.city && <p className={styles.infoDetail}>{salon.city}</p>}
                  <div className={styles.infoActions}>
                    <button type="button" onClick={handleCopyAddress} className={styles.infoActionBtn}>
                      <FaRegCopy /> Copy
                    </button>
                    <a href={mapsHref} target="_blank" rel="noopener noreferrer" className={styles.infoActionBtn}>
                      <FaExternalLinkAlt /> Maps
                    </a>
                  </div>
                </div>
              </div>
              <div className={`${styles.infoCard} ${styles.infoAvailability}`} role="status" aria-live="polite">
                <span className={styles.infoIcon} aria-hidden="true"><FaBolt /></span>
                <div className={styles.infoContent}>
                  <p className={styles.infoLabel}>Availability</p>
                  <p className={`${styles.infoValue} ${salon.isAvailableNow ? styles.open : styles.closed}`}>{availabilityLabel}</p>
                  <p className={styles.infoDetail}>{bookingSummary}</p>
                </div>
              </div>
              <div className={`${styles.infoCard} ${styles.infoToday}`}>
                <span className={styles.infoIcon} aria-hidden="true"><FaClock /></span>
                <div className={styles.infoContent}>
                  <p className={styles.infoLabel}>Today</p>
                  <p className={styles.infoValue}>
                    {todayLabel}: {hoursRecord?.[todayLabel] ?? '—'}
                  </p>
                  {hoursRecord && (
                    <button type="button" onClick={() => setShowWeek(v => !v)} className={styles.infoActionBtn}>
                      {showWeek ? 'Hide week' : 'View week'}
                    </button>
                  )}
                </div>
              </div>
              {hoursRecord && (
                <div className={`${styles.infoCard} ${styles.infoWeek}`}>
                  <span className={styles.infoIcon} aria-hidden="true"><FaClock /></span>
                  <div className={styles.infoContent}>
                    <p className={styles.infoLabel}>Weekly hours</p>
                    {showWeek ? (
                      <ul className={styles.weekList}>
                        {orderedOperatingDays.map((day) => (
                          <li key={day}><span>{day}</span><strong>{hoursRecord[day]}</strong></li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.infoDetail}>Tap "View week" to expand full schedule.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.profileLayout}>
            <div className={styles.mainContent}>
              {salon.description && (
                <section id="about-section">
                  <h2 className={styles.sectionTitle}>About</h2>
                  <p style={{ lineHeight: '1.6', color: 'var(--color-text)', marginBottom: '2rem' }}>
                    {sanitizeText(salon.description)}
                  </p>
                </section>
              )}
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
                      promotion={promotionsMap.get(service.id)}
                      onPromotionClick={handlePromotionClick}
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
                  {hoursRecord && orderedOperatingDays.length > 0 ? (
                    <ul>
                      {orderedOperatingDays.map(day => (
                        <li key={day}>
                          <span>{day}</span>
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
                          <p style={{fontStyle: 'italic', marginTop: '0.5rem'}}>&quot;{sanitizeText(review.comment)}&quot;</p>
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
