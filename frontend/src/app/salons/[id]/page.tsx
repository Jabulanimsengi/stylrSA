'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { transformCloudinary } from '@/utils/cloudinary';
import { FaHome, FaArrowLeft, FaHeart, FaWhatsapp, FaGlobe } from 'react-icons/fa';
import { Salon, Service, GalleryImage } from '@/types';
import BookingModal from '@/components/BookingModal';
import styles from './SalonProfile.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import Accordion from '@/components/Accordion';
import ServiceCard from '@/components/ServiceCard';
import { toast } from 'react-toastify';
import { useSocket } from '@/context/SocketContext';
import ImageLightbox from '@/components/ImageLightbox';
import { useAuthModal } from '@/context/AuthModalContext';

async function getSalonDetails(id: string): Promise<Salon | null> {
  try {
    const res = await fetch(`/api/salons/${id}`, { 
      cache: 'no-store',
      credentials: 'include',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Failed to fetch salon details:', error);
    return null;
  }
}

async function getSalonServices(id: string): Promise<Service[]> {
  try {
    const res = await fetch(`/api/services/salon/${id}`);
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Failed to fetch salon services:', error);
    return [];
  }
}

async function getGalleryImages(salonId: string): Promise<GalleryImage[]> {
  try {
    const res = await fetch(`/api/gallery/salon/${salonId}`);
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Failed to fetch gallery images:', error);
    return [];
  }
}

export default function SalonProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { authStatus, user } = useAuth();
  const { openModal } = useAuthModal();
  const socket = useSocket();
  
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  // State for the hero slider
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImagesCount = salon?.heroImages?.length ?? 0;

  const fetchPageData = useCallback(async () => {
    if (params.id) {
      setIsLoading(true);
      const [salonData, servicesData, galleryData] = await Promise.all([
        getSalonDetails(params.id),
        getSalonServices(params.id),
        getGalleryImages(params.id),
      ]);
      setSalon(salonData);
      setServices(servicesData);
      setGalleryImages(galleryData);
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData, authStatus]);

  useEffect(() => {
    if (socket && params && params.id) {
      socket.emit('joinSalonRoom', params.id);
      socket.on('availabilityUpdate', (data: { isAvailableNow: boolean }) => {
        setSalon(prev => prev ? { ...prev, isAvailableNow: data.isAvailableNow } : null);
      });
      return () => {
        socket.emit('leaveSalonRoom', params.id);
        socket.off('availabilityUpdate');
      };
    }
  }, [socket, params]);

  useEffect(() => {
    if (heroImagesCount < 2) return;
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroImagesCount - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(id);
  }, [heroImagesCount]);

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
    if (authStatus !== 'authenticated') {
      openModal('login');
      return;
    }
    if (!salon || !user) return;
    if (user.id === salon.ownerId) {
      toast.error('You cannot message your own salon.');
      return;
    }
    window.openChatWidget?.(salon.ownerId, salon.name);
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
      
      if (!res.ok) {
        throw new Error('Failed to update favorite status.');
      }
      
      const { favorited } = await res.json();
      toast.success(favorited ? 'Added to favorites!' : 'Removed from favorites.');

    } catch (error) {
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
  
  const operatingDays = salon?.operatingHours ? Object.keys(salon.operatingHours) : [];
  const operatingSummary = (() => {
    if (!salon?.operatingHours) return '';
    const entries = Object.entries(salon.operatingHours as Record<string, string>);
    if (entries.length === 0) return '';
    // Basic summary: show up to first two day ranges
    const samples = entries.slice(0, 2).map(([day, hours]) => `${day.substring(0,3)} ${hours}`);
    const extra = entries.length > 2 ? ` +${entries.length - 2} more` : '';
    return `${samples.join(' • ')}${extra}`;
  })();

  if (isLoading) return <LoadingSpinner />;
  if (!salon) return <div style={{textAlign: 'center', padding: '2rem'}}>Salon not found.</div>;

  // --- Hero Slider Logic ---
  const heroImages = salon.heroImages || [];

  const nextSlide = () => {
    setCurrentSlide(prev => (prev === heroImages.length - 1 ? 0 : prev + 1));
  };
  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? heroImages.length - 1 : prev - 1));
  };
  // --- End Hero Slider Logic ---

  

  const galleryImageUrls = galleryImages.map(img => img.imageUrl);

  const mapSrc = (() => {
    if (!salon.latitude || !salon.longitude) return '';
    const lat = salon.latitude;
    const lon = salon.longitude;
    const d = 0.01; // small box
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: salon.name,
            description: salon.description || undefined,
            image: salon.heroImages && salon.heroImages.length > 0 ? salon.heroImages : salon.backgroundImage ? [salon.backgroundImage] : undefined,
            url: `https://thesalonhub.com/salons/${salon.id}`,
            telephone: salon.phoneNumber || undefined,
            email: salon.contactEmail || undefined,
            address: {
              '@type': 'PostalAddress',
              addressLocality: salon.city,
              addressRegion: salon.province,
              streetAddress: salon.address || `${salon.town || ''}`.trim(),
              addressCountry: 'ZA',
            },
            geo: salon.latitude && salon.longitude ? {
              '@type': 'GeoCoordinates',
              latitude: salon.latitude,
              longitude: salon.longitude,
            } : undefined,
            aggregateRating: salon.avgRating ? {
              '@type': 'AggregateRating',
              ratingValue: salon.avgRating,
              reviewCount: salon.reviews?.length || 0,
            } : undefined,
          }),
        }}
      />

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
        
        <div className={styles.container}>
            {/* New Hero Slider */}
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
                      {services
                        .map((service) => (
                          <ServiceCard 
                            key={service.id} 
                            service={service} 
                            onBook={handleBookClick}
                            onSendMessage={handleSendMessageClick}
                            onImageClick={openLightbox}
                          />
                      ))}
                    </div>
                  </section>

                  <section>
                    <h2 className={styles.sectionTitle}>Details</h2>

                    <Accordion title="Operating Hours">
                      {salon.operatingHours ? (
                        <ul>
                          {operatingDays.map(day => (
                            <li key={day}>
                              <span>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                              <strong>{salon.operatingHours![day]}</strong>
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
                           <Link href="/login">Log in</Link> to view detailed contact information and map.
                         </p>
                       )}
                    </Accordion>
                     <Accordion title={`Reviews (${salon.reviews?.length || 0})`}>
                       {salon.reviews && salon.reviews.length > 0 ? (
                         <div>
                           {salon.reviews.map(review => (
                             <div key={review.id} style={{borderBottom: '1px dotted var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem'}}>
                               <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                 <strong>{review.author.firstName} {review.author.lastName.charAt(0)}.</strong>
                                 <span style={{color: 'var(--accent-gold)'}}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                               </div>
                               <p style={{fontStyle: 'italic', marginTop: '0.5rem'}}>"{review.comment}"</p>
                             </div>
                           ))}
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