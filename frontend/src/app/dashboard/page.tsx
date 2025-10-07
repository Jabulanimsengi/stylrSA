'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Salon, Service, ApprovalStatus, Booking, GalleryImage } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Dashboard.module.css';
import ServiceFormModal from '@/components/ServiceFormModal';
import EditSalonModal from '@/components/EditSalonModal';
import { useSocket } from '@/context/SocketContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-toastify';
import GalleryUploadModal from '@/components/GalleryUploadModal';
import { FaTrash, FaHome, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

type DashboardBooking = Booking & {
  user: { firstName: string; lastName: string };
  service: { title: string };
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
  clientPhone?: string;
};

export default function DashboardPage() {
  const [salon, setSalon] = useState<Salon | null | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isEditSalonModalOpen, setIsEditSalonModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [activeBookingTab, setActiveBookingTab] = useState<'pending' | 'confirmed' | 'past'>('pending');

  const router = useRouter();
  const searchParams = useSearchParams();
  const socket = useSocket();
  
  const { authStatus, user } = useAuth(); 

  const ownerId = user?.role === 'ADMIN' ? searchParams.get('ownerId') : user?.id;

  const fetchDashboardData = useCallback(async () => {
    if (!ownerId) return;

    setIsLoading(true);
    try {
      const salonRes = await fetch(`/api/salons/my-salon?ownerId=${ownerId}`, { credentials: 'include' });
      if (salonRes.status === 401) { router.push('/'); return; }
      if (salonRes.status === 404) { setSalon(null); setIsLoading(false); return; }
      if (!salonRes.ok) throw new Error('Could not fetch salon data.');
      
      const salonData = await salonRes.json();
      setSalon(salonData);

      const [servicesRes, bookingsRes, galleryRes] = await Promise.all([
        fetch(`/api/salons/mine/services?ownerId=${ownerId}`, { credentials: 'include' }),
        fetch(`/api/salons/mine/bookings?ownerId=${ownerId}`, { credentials: 'include' }),
        fetch(`/api/gallery/salon/${salonData.id}`, { credentials: 'include' }),
      ]);

      setServices(await servicesRes.json());
      const bookingsData = await bookingsRes.json();
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setGalleryImages(await galleryRes.json());

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [ownerId, router]);

  useEffect(() => {
    if (authStatus === 'loading') { setIsLoading(true); return; }
    if (authStatus === 'unauthenticated') { toast.error('You must be logged in.'); router.push('/'); return; }
    if (authStatus === 'authenticated' && ownerId) {
      fetchDashboardData();
    } else if (authStatus === 'authenticated' && user?.role === 'SALON_OWNER' && !ownerId) {
        setSalon(null);
        setIsLoading(false);
    }
  }, [authStatus, ownerId, fetchDashboardData, router, user]);

  useEffect(() => {
    if (socket) {
      socket.on('newBooking', (newBooking: DashboardBooking) => {
        setBookings(prev => [newBooking, ...prev]);
        toast.info(`New booking for ${newBooking.service.title}!`);
      });
      return () => { socket.off('newBooking'); };
    }
  }, [socket]);

  const handleSaveService = (savedService: Service) => {
    if (editingService) {
      setServices(services.map(s => s.id === savedService.id ? savedService : s));
    } else {
      setServices([...services, savedService]);
    }
    closeServiceModal();
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/services/${serviceId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete service.');
      setServices(services.filter(s => s.id !== serviceId));
      toast.success("Service deleted.");
    } catch (err) {
      toast.error('Error deleting service.');
    }
  };

  const handleBookingStatusUpdate = async (bookingId: string, status: 'CONFIRMED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED') => {
    await fetch(`/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    fetchDashboardData();
  };

  const handleSalonUpdate = (updatedSalon: Salon) => {
    setSalon(updatedSalon);
    setIsEditSalonModalOpen(false);
  };
  
  const handleAvailabilityToggle = async () => {
    if (!salon) return;
    const originalStatus = salon.isAvailableNow;
    setSalon(prev => (prev ? { ...prev, isAvailableNow: !prev.isAvailableNow } : null));
    try {
      await fetch(`/api/salons/mine/availability?ownerId=${ownerId}`, { method: 'PATCH', credentials: 'include' });
    } catch (error) {
      toast.error("Failed to update status.");
      setSalon(prev => (prev ? { ...prev, isAvailableNow: originalStatus } : null));
    }
  };

  const handleImageUpload = (newImage: GalleryImage) => {
    setGalleryImages(prev => [newImage, ...prev]);
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/gallery/${imageId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete image.');
      setGalleryImages(galleryImages.filter(img => img.id !== imageId));
      toast.success("Image deleted.");
    } catch (err) {
      toast.error('Error deleting image.');
    }
  };

  const openServiceModalToAdd = () => { setEditingService(null); setIsServiceModalOpen(true); };
  const openServiceModalToEdit = (service: Service) => { setEditingService(service); setIsServiceModalOpen(true); };
  const closeServiceModal = () => { setIsServiceModalOpen(false); setEditingService(null); };

  const getStatusClass = (status: ApprovalStatus) => {
    if (status === 'APPROVED') return styles.statusApproved;
    if (status === 'PENDING') return styles.statusPending;
    return styles.statusRejected;
  };

  if (isLoading || authStatus === 'loading') return <LoadingSpinner />;
  if (error) return <div className={styles.container}><p>{error}</p></div>;

  if (!salon) {
    if (user?.role === 'ADMIN') {
        return <div className={styles.container}><p>This user has not created a salon profile yet.</p></div>;
    }
    return (
        <div className={styles.welcomeContainer}>
          <div className={styles.welcomeCard}>
            <h2>Welcome, Service Provider!</h2>
            <p>Create your salon profile to start adding services and accepting bookings.</p>
            <Link href="/create-salon" className="btn btn-primary">Create Your Salon Profile</Link>
          </div>
        </div>
    );
  }
  
  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const pastBookings = bookings.filter(b => ['COMPLETED', 'DECLINED', 'CANCELLED'].includes(b.status));

  const renderBookingsList = (list: DashboardBooking[]) => {
    if (list.length === 0) return <p>No bookings in this category.</p>;
    return list.map(booking => (
      <div key={booking.id} className={styles.listItem}>
        <div className={styles.listItemInfo}>
          <p><strong>{booking.service.title}</strong> for {booking.user.firstName}</p>
          <p className={styles.date}>{new Date(booking.bookingTime).toLocaleString('en-ZA')}</p>
          {booking.clientPhone && <p className={styles.date}>Contact: {booking.clientPhone}</p>}
        </div>
        {booking.status === 'PENDING' && (
          <div className={styles.actions}>
            <button onClick={() => handleBookingStatusUpdate(booking.id, 'CONFIRMED')} className={styles.approveButton}>Accept</button>
            <button onClick={() => handleBookingStatusUpdate(booking.id, 'DECLINED')} className={styles.rejectButton}>Decline</button>
          </div>
        )}
      </div>
    ));
  };
  
  let bookingsToShow;
  if (activeBookingTab === 'pending') bookingsToShow = renderBookingsList(pendingBookings);
  else if (activeBookingTab === 'confirmed') bookingsToShow = renderBookingsList(confirmedBookings);
  else bookingsToShow = renderBookingsList(pastBookings);

  return (
    <>
      {isServiceModalOpen && salon && (
        <ServiceFormModal 
          salonId={salon.id} 
          onClose={closeServiceModal} 
          onServiceAdded={handleSaveService} 
          initialData={editingService} 
        />
      )}
      {isEditSalonModalOpen && salon && (
        <EditSalonModal 
          salon={salon} 
          onClose={() => setIsEditSalonModalOpen(false)} 
          onSalonUpdate={handleSalonUpdate} 
        />
      )}
      {isGalleryModalOpen && salon && (
        <GalleryUploadModal 
          salonId={salon.id} 
          onClose={() => setIsGalleryModalOpen(false)} 
          onImageAdded={handleImageUpload} 
        />
      )}
      <div className={styles.container}>
        <div className={styles.stickyHeader}>
            <div className={styles.navButtonsContainer}>
                <button onClick={() => router.back()} className={styles.navButton}><FaArrowLeft /> Back</button>
                <Link href="/" className={styles.navButton}><FaHome /> Home</Link>
            </div>
            <h1 className={styles.title}>{user?.role === 'ADMIN' ? `${salon.name}'s Dashboard` : 'My Dashboard'}</h1>
            <div className={styles.headerSpacer}></div>
        </div>
        
        {/* FIX: ADDED BACK THE MISSING JSX FOR DASHBOARD CONTENT */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.headerInfo}>
              <p className={styles.salonName}>{salon.name}</p>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.availabilityToggle}>
                <label className={styles.switch}>
                  <input type="checkbox" checked={!!salon.isAvailableNow} onChange={handleAvailabilityToggle} />
                  <span className={styles.slider}></span>
                </label>
                <strong>Available Now</strong>
              </div>
              <Link href={`/salons/${salon.id}`} className="btn btn-ghost" target="_blank">
                View My Salon
              </Link>
              <button onClick={() => setIsEditSalonModalOpen(true)} className="btn btn-secondary">
                Edit Profile
              </button>
            </div>
          </div>
        </header>

        <div className={styles.contentGrid}>
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Manage Bookings</h3>
            </div>
            <div className={styles.tabs}>
              <button onClick={() => setActiveBookingTab('pending')} className={`${styles.tabButton} ${activeBookingTab === 'pending' ? styles.activeTab : ''}`}>Pending ({pendingBookings.length})</button>
              <button onClick={() => setActiveBookingTab('confirmed')} className={`${styles.tabButton} ${activeBookingTab === 'confirmed' ? styles.activeTab : ''}`}>Confirmed ({confirmedBookings.length})</button>
              <button onClick={() => setActiveBookingTab('past')} className={`${styles.tabButton} ${activeBookingTab === 'past' ? styles.activeTab : ''}`}>Past ({pastBookings.length})</button>
            </div>
            <div className={styles.list}>
              {bookingsToShow}
            </div>
          </div>

          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Your Services</h3>
              <button onClick={openServiceModalToAdd} className="btn btn-primary">
                + Add Service
              </button>
            </div>
            <div className={styles.list}>
              {services.length > 0 ? services.map((service) => (
                <div key={service.id} className={styles.listItem}>
                  <div className={styles.listItemInfo}>
                    <p><strong>{service.title}</strong> - R{service.price.toFixed(2)}</p>
                  </div>
                  <div className={styles.actions}>
                    <span className={`${styles.statusBadge} ${getStatusClass(service.approvalStatus)}`}>
                      {service.approvalStatus}
                    </span>
                    <button onClick={() => openServiceModalToEdit(service)} className={styles.editButton}>Edit</button>
                    <button onClick={() => handleDeleteService(service.id)} className={styles.deleteButton}>Delete</button>
                  </div>
                </div>
              )) : <p>You haven't added any services yet.</p>}
            </div>
          </div>

          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Manage Gallery</h3>
              <button onClick={() => setIsGalleryModalOpen(true)} className="btn btn-primary">
                + Add Image
              </button>
            </div>
            <div className={styles.galleryGrid}>
              {galleryImages.length > 0 ? galleryImages.map((image) => (
                <div key={image.id} className={styles.galleryItem}>
                  <img src={image.imageUrl} alt={image.caption || 'Gallery image'} />
                  <button onClick={() => handleDeleteImage(image.id)} className={styles.deleteButton}>
                    <FaTrash />
                  </button>
                </div>
              )) : <p>Your gallery is empty. Add some images of your work!</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}