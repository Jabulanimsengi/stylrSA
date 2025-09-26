'use client';

import { useEffect, useState } from 'react';
import { Salon, Service } from '@/types';
import BookingModal from '@/components/BookingModal';
import styles from './SalonProfile.module.css';
import Spinner from '@/components/Spinner';

async function getSalonDetails(id: string): Promise<Salon | null> {
  try {
    const res = await fetch(`http://localhost:3000/api/salons/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Failed to fetch salon details:', error);
    return null;
  }
}

async function getSalonServices(id: string): Promise<Service[]> {
  try {
    const res = await fetch(`http://localhost:3000/api/salons/${id}/services`);
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Failed to fetch salon services:', error);
    return [];
  }
}

export default function SalonProfilePage({ params }: { params: { id: string } }) {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [salonData, servicesData] = await Promise.all([
        getSalonDetails(params.id),
        getSalonServices(params.id),
      ]);
      setSalon(salonData);
      setServices(servicesData);
      setIsLoading(false);
    }
    fetchData();
  }, [params.id]);

  const formatBookingType = (type: string) => {
    if (type === 'ONSITE') return 'On-Site Only';
    if (type === 'MOBILE') return 'Mobile Only';
    if (type === 'BOTH') return 'On-Site & Mobile';
    return 'Not Specified';
  };
  
  const operatingDays = salon?.operatingHours ? Object.keys(salon.operatingHours) : [];

  if (isLoading) return <Spinner />;
  if (!salon) return <div className="notFound">Salon not found.</div>;

  return (
    <>
      {selectedService && (
        <BookingModal
          salon={salon}
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onBookingSuccess={() => {
            alert('Booking successful!');
            setSelectedService(null);
          }}
        />
      )}
      <div>
        <div
          className={styles.hero}
          style={{ backgroundImage: `url(${salon.backgroundImage || 'https://via.placeholder.com/1200x400'})` }}
        >
          <div className={styles.heroOverlay}>
            <h1 className={styles.heroTitle}>{salon.name}</h1>
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.contentCard}>
            <h2 className={styles.servicesTitle}>Our Services</h2>
            <p className={styles.location}>Location: {salon.town}, {salon.city}</p>
            <div className={styles.servicesList}>
              {services.filter((s) => s.approvalStatus === 'APPROVED').length > 0 ? (
                services
                  .filter((s) => s.approvalStatus === 'APPROVED')
                  .map((service) => (
                    <div key={service.id} className={styles.serviceItem}>
                      <div className={styles.serviceHeader}>
                        <div>
                          <h3 className={styles.serviceTitle}>{service.title}</h3>
                          <p className={styles.servicePrice}>R{service.price.toFixed(2)}</p>
                        </div>
                        <button onClick={() => setSelectedService(service)} className={styles.bookButton}>
                          Book Now
                        </button>
                      </div>
                      <p className={styles.serviceDescription}>{service.description}</p>
                    </div>
                  ))
              ) : (
                <p>No approved services listed yet.</p>
              )}
            </div>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <h3>Operating Hours</h3>
                {salon.operatingHours ? (
                  <ul className={styles.hoursList}>
                    {operatingDays.map(day => (
                      <li key={day}>
                        <span>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                        <strong>{salon.operatingHours![day]}</strong>
                      </li>
                    ))}
                  </ul>
                ) : <p>Operating hours not listed.</p>}
              </div>
              <div className={styles.detailCard}>
                <h3>Service Type</h3>
                <p>{formatBookingType(salon.bookingType)}</p>
                {salon.offersMobile && salon.mobileFee && (
                  <p style={{marginTop: '0.5rem'}}>Mobile service fee: <strong>R{salon.mobileFee.toFixed(2)}</strong></p>
                )}
              </div>
            </div>
          </div>
          
          {salon.reviews && salon.reviews.length > 0 && (
            <div className={`${styles.contentCard} ${styles.reviewsSection}`}>
              <h2 className={styles.servicesTitle}>What Our Clients Say</h2>
              <div className={styles.reviewsList}>
                {salon.reviews.map(review => (
                  <div key={review.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewAuthor}>{review.author.firstName} {review.author.lastName.charAt(0)}.</span>
                      <span className={styles.reviewRating}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <p className={styles.reviewComment}>"{review.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}