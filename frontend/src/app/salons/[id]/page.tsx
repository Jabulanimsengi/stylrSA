// frontend/src/app/salons/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
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

async function getSalonDetails(id: string): Promise<Salon | null> {
  try {
    const res = await fetch(`http://localhost:3000/api/salons/${id}`, { 
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
    const res = await fetch(`http://localhost:3000/api/services/salon/${id}`);
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Failed to fetch salon services:', error);
    return [];
  }
}

async function getGalleryImages(salonId: string): Promise<GalleryImage[]> {
  try {
    const res = await fetch(`http://localhost:3000/api/gallery/salon/${salonId}`);
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
  const socket = useSocket();
  
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

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

  const openLightbox = (index: number) => {
    setLightboxStartIndex(index);
    setIsLightboxOpen(true);
  };

  const handleBookNowClick = (service: Service) => {
    if (authStatus !== 'authenticated') {
      router.push('/login');
    } else {
      setSelectedService(service);
    }
  };

  const handleSendMessageClick = async () => {
    if (authStatus !== 'authenticated') {
      router.push('/login');
      return;
    }
    if (!salon || !user) return;
    if (user.id === salon.ownerId) {
      toast.error("You cannot message your own salon.");
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: salon.ownerId }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to start conversation.');
      const conversation = await res.json();
      router.push(`/chat/${conversation.id}`);
    } catch (error) {
      console.error(error);
      toast.error('Could not start chat. Please try again.');
    }
  };

  const handleToggleFavorite = async () => {
    if (authStatus !== 'authenticated') {
      toast.error('You must be logged in to favorite a salon.');
      router.push('/login');
      return;
    }
    if (!salon) return;

    try {
      setSalon(prev => (prev ? { ...prev, isFavorited: !prev.isFavorited } : null));

      const res = await fetch(`http://localhost:3000/api/favorites/toggle/${salon.id}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!res.ok) {
        setSalon(prev => (prev ? { ...prev, isFavorited: !prev.isFavorited } : null));
        throw new Error('Failed to update favorite status.');
      }
      
      toast.success(salon.isFavorited ? 'Removed from favorites.' : 'Added to favorites!');

    } catch (error) {
      toast.error('Could not update favorites.');
    }
  };
  
  const formatBookingType = (type: string) => {
    if (type === 'ONSITE') return 'This salon offers on-site services.';
    if (type === 'MOBILE') return 'This salon offers mobile services.';
    if (type === 'BOTH') return 'This salon offers both on-site and mobile services.';
    return 'Not Specified';
  };
  
  const operatingDays = salon?.operatingHours ? Object.keys(salon.operatingHours) : [];

  if (isLoading) return <LoadingSpinner />;
  if (!salon) return <div style={{textAlign: 'center', padding: '2rem'}}>Salon not found.</div>;

  const galleryImageUrls = galleryImages.map(img => img.imageUrl);

  const mapSrc = salon.latitude && salon.longitude
    ? `https://maps.google.com/maps?q=${salon.latitude},${salon.longitude}&hl=es;z=14&output=embed`
    : '';

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
          images={galleryImageUrls}
          startIndex={lightboxStartIndex}
          onClose={() => setIsLightboxOpen(false)}
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

        <div className={styles.hero} style={{ backgroundImage: `url(${salon.backgroundImage || 'https://via.placeholder.com/1200x400'})` }}>
          <div className={styles.heroOverlay}>
            <p className={styles.heroLocation}>{salon.town}, {salon.city}</p>
            {!!salon.isAvailableNow && (
              <div className={styles.availabilityIndicator}>
                <span className={styles.availabilityDot}></span>
                Available for Bookings Now
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.container}>
          <div className={styles.profileLayout}>
            <div className={styles.mainContent}>
              <section id="services-section">
                <h2 className={styles.sectionTitle}>Services</h2>
                <div className={styles.servicesGrid}>
                  {services
                    .map((service) => (
                      <ServiceCard 
                        key={service.id} 
                        service={service} 
                        onBookNow={handleBookNowClick}
                        onSendMessage={handleSendMessageClick}
                      />
                  ))}
                </div>
              </section>

              <section>
                <h2 className={styles.sectionTitle}>Details</h2>
                
                {galleryImages.length > 0 && (
                  <Accordion title="Gallery">
                    <div className={styles.galleryGrid}>
                      {galleryImages.map((image, index) => (
                        <div key={image.id} className={styles.galleryItem} onClick={() => openLightbox(index)}>
                          <img src={image.imageUrl} alt={image.caption || 'Salon work'} />
                        </div>
                      ))}
                    </div>
                  </Accordion>
                )}

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
                   <p><strong>Address:</strong> {salon.town}, {salon.city}, {salon.province}</p>
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
                         <div key={review.id} style={{borderBottom: '1px dotted #ccc', paddingBottom: '1rem', marginBottom: '1rem'}}>
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