'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Salon, Service } from '@/types';
import BookingModal from '@/components/BookingModal';
import styles from './SalonProfile.module.css';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/hooks/useAuth';
import Accordion from '@/components/Accordion';
import ServiceCard from '@/components/ServiceCard';
import { toast } from 'react-toastify';
import { useSocket } from '@/context/SocketContext';
import { Metadata } from 'next';

// This function is defined here because it's used by the client component
async function getSalonDetails(id: string): Promise<Salon | null> {
  try {
    const res = await fetch(`http://localhost:3000/api/salons/${id}`, { cache: 'no-store' });
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

export default function SalonProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { userId } = useAuth();
  const socket = useSocket();
  
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      if (params.id) {
        const [salonData, servicesData] = await Promise.all([
          getSalonDetails(params.id),
          getSalonServices(params.id),
        ]);
        setSalon(salonData);
        setServices(servicesData);
      }
      setIsLoading(false);
    }
    if (params && params.id) {
      fetchData();
    }
  }, [params]);

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

  const handleBookNowClick = (service: Service) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    } else {
      setSelectedService(service);
    }
  };

  const handleSendMessageClick = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    if (!salon || !userId) return;
    if (userId === salon.ownerId) {
      toast.error("You cannot message your own salon.");
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: salon.ownerId }),
      });
      if (!res.ok) throw new Error('Failed to start conversation.');
      const conversation = await res.json();
      router.push(`/chat/${conversation.id}`);
    } catch (error) {
      console.error(error);
      toast.error('Could not start chat. Please try again.');
    }
  };
  
  const formatBookingType = (type: string) => {
    if (type === 'ONSITE') return 'This salon offers on-site services.';
    if (type === 'MOBILE') return 'This salon offers mobile services.';
    if (type === 'BOTH') return 'This salon offers both on-site and mobile services.';
    return 'Not Specified';
  };
  
  const operatingDays = salon?.operatingHours ? Object.keys(salon.operatingHours) : [];

  if (isLoading) return <Spinner />;
  if (!salon) return <div style={{textAlign: 'center', padding: '2rem'}}>Salon not found.</div>;

  return (
    <>
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
      <div>
        <div className={styles.hero} style={{ backgroundImage: `url(${salon.backgroundImage || 'https://via.placeholder.com/1200x400'})` }}>
          <div className={styles.heroOverlay}>
            <h1 className={styles.heroTitle}>{salon.name}</h1>
            <p className={styles.heroLocation}>{salon.town}, {salon.city}</p>
            {salon.isAvailableNow && (
              <div className={styles.availabilityIndicator}>
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
                    .filter((s) => s.approvalStatus === 'APPROVED')
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
                   {salon.contactEmail && <p><strong>Email:</strong> <a href={`mailto:${salon.contactEmail}`}>{salon.contactEmail}</a></p>}
                   {salon.phoneNumber && <p><strong>Phone:</strong> <a href={`tel:${salon.phoneNumber}`}>{salon.phoneNumber}</a></p>}
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
            {/* The sidebar action card has been removed */}
          </div>
        </div>
      </div>
    </>
  );
}