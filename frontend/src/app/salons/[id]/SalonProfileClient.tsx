// frontend/src/app/salons/[id]/SalonProfileClient.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import { FaHome, FaArrowLeft, FaHeart, FaWhatsapp, FaGlobe, FaEdit, FaPlus, FaCamera, FaStar } from 'react-icons/fa';
import { Salon, Service, GalleryImage, Review, Booking } from '@/types';
import BookingModal from '@/components/BookingModal';
import styles from './SalonProfile.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import Accordion from '@/components/Accordion';
import ServiceCard from '@/components/ServiceCard';
import { toast } from 'react-toastify';
import { useSocket } from '@/context/SocketContext';
import ImageLightbox from '@/components/ImageLightbox';
import EditSalonModal from '@/components/EditSalonModal';
import ServiceFormModal from '@/components/ServiceFormModal';
import ReviewModal from '@/components/ReviewModal';
import GalleryUploadModal from '@/components/GalleryUploadModal';

interface SalonProfileClientProps {
  initialSalon: Salon | null;
  initialServices: Service[];
  initialGalleryImages: GalleryImage[];
}

export default function SalonProfileClient({ initialSalon, initialServices, initialGalleryImages }: SalonProfileClientProps) {
  const router = useRouter();
  const { authStatus, user } = useAuth();
  const socket = useSocket();

  const [salon, setSalon] = useState<Salon | null>(initialSalon);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(initialGalleryImages);
  const [isLoading, setIsLoading] = useState(!initialSalon);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  const isOwner = salon && user && (user.id === salon.ownerId || user.role === 'ADMIN');

  const fetchPageData = useCallback(async () => {
    if (salon?.id) {
      setIsLoading(true);
      try {
        const [salonRes, servicesRes, galleryRes] = await Promise.all([
          fetch(`http://localhost:3000/api/salons/${salon.id}`, { credentials: 'include', cache: 'no-store' }),
          fetch(`http://localhost:3000/api/services/salon/${salon.id}`),
          fetch(`http://localhost:3000/api/gallery/salon/${salon.id}`),
        ]);

        if (salonRes.ok) setSalon(await salonRes.json());
        if (servicesRes.ok) setServices(await servicesRes.json());
        if (galleryRes.ok) setGalleryImages(await galleryRes.json());

      } catch (error) {
        console.error('Failed to refresh data:', error);
        toast.error('Could not load latest salon details.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [salon?.id]);

  useEffect(() => {
    if (socket && salon) {
      socket.emit('joinSalonRoom', salon.id);
      socket.on('availabilityUpdate', (data: { isAvailableNow: boolean }) => {
        setSalon(prev => prev ? { ...prev, isAvailableNow: data.isAvailableNow } : null);
      });
      return () => {
        socket.emit('leaveSalonRoom', salon.id);
        socket.off('availabilityUpdate');
      };
    }
  }, [socket, salon]);

  const openLightbox = (imageUrl: string) => {
    setLightboxImageUrl(imageUrl);
    setLightboxOpen(true);
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
        setSalon(prev => (prev ? { ...prev, isFavorited: !prev.isFavorited } : null)); // Revert on fail
        throw new Error('Failed to update favorite status.');
      }
      toast.success(salon.isFavorited ? 'Removed from favorites.' : 'Added to favorites!');
    } catch (error) {
      toast.error('Could not update favorites.');
    }
  };

  const handleToggleAvailability = async () => {
    if (!salon) return;
    try {
        const res = await fetch(`http://localhost:3000/api/salons/mine/availability`, {
            method: 'PATCH',
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to update availability.');
        const updatedSalon = await res.json();
        setSalon(s => s ? { ...s, isAvailableNow: updatedSalon.isAvailableNow } : null);
        toast.success(`Salon is now ${updatedSalon.isAvailableNow ? 'available' : 'unavailable'} for bookings.`);
    } catch (error) {
        toast.error('Failed to update availability.');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!salon) return <div style={{ textAlign: 'center', padding: '2rem' }}>Salon not found.</div>;

  const mapSrc = salon.latitude && salon.longitude
    ? `https://maps.google.com/maps?q=${salon.latitude},${salon.longitude}&hl=es;z=14&output=embed`
    : '';

  const formatBookingType = (type: string) => {
    if (type === 'ONSITE') return 'This salon offers on-site services.';
    if (type === 'MOBILE') return 'This salon offers mobile services.';
    if (type === 'BOTH') return 'This salon offers both on-site and mobile services.';
    return 'Not Specified';
  };
  
  const operatingDays = salon.operatingHours ? Object.keys(salon.operatingHours) : [];

  return (
    <>
      <Head>
        <title>{`${salon.name} - The Salon Hub`}</title>
      </Head>

      {selectedService && (
        <BookingModal
          salon={salon}
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onBookingSuccess={(booking: Booking) => {
            toast.success('Booking request sent! The salon will confirm shortly.');
            setSelectedService(null);
          }}
        />
      )}
      {isEditModalOpen && salon && (
        <EditSalonModal
          salon={salon}
          onClose={() => setIsEditModalOpen(false)}
          onSalonUpdate={(updatedSalon) => {
            setSalon(updatedSalon);
            setIsEditModalOpen(false);
          }}
        />
      )}
      {isServiceModalOpen && salon && (
        <ServiceFormModal
          salonId={salon.id}
          onClose={() => setIsServiceModalOpen(false)}
          onServiceAdded={(newService: Service) => {
            setServices(prev => [...prev, newService]);
            setIsServiceModalOpen(false);
          }}
        />
      )}
      {isReviewModalOpen && salon && (
        <ReviewModal
          bookingId="" // Pass a valid booking ID if available
          onClose={() => setIsReviewModalOpen(false)}
          onReviewAdded={(newReview: Review) => {
            setSalon(prev => prev ? { ...prev, reviews: [newReview, ...(prev.reviews || [])] } : null);
            setIsReviewModalOpen(false);
          }}
        />
      )}
      {isGalleryModalOpen && salon && (
        <GalleryUploadModal
          salonId={salon.id}
          onClose={() => setIsGalleryModalOpen(false)}
          onImageAdded={(newImage: GalleryImage) => {
            setGalleryImages(prev => [...prev, newImage]);
            // No need to close modal here, user can upload multiple
          }}
        />
      )}
      {isLightboxOpen && (
        <ImageLightbox
          images={[lightboxImageUrl]}
          startIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* ... The rest of the JSX from page.tsx, adapted to use the state from this component ... */}
    </>
  );
}