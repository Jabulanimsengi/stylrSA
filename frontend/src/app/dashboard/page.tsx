'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { Salon, Service, ApprovalStatus, Booking, GalleryImage } from '@/types';
import { useRouter } from 'next/navigation';
import styles from './Dashboard.module.css';
import ServiceFormModal from '@/components/ServiceFormModal';
import EditSalonModal from '@/components/EditSalonModal';
import { useSocket } from '@/context/SocketContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-toastify';
import GalleryUploadModal from '@/components/GalleryUploadModal';
import { FaTrash, FaHome, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

type DashboardBooking = Booking & {
  client: { firstName: string, lastName: string },
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED'
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
  const [isCreateSalonModalOpen, setIsCreateSalonModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [activeBookingTab, setActiveBookingTab] = useState<'pending' | 'confirmed' | 'past'>('pending');
  const router = useRouter();
  const socket = useSocket();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const salonRes = await fetch('http://localhost:3000/api/salons/mine', { headers });
        if (salonRes.status === 404) {
          setSalon(null);
          setIsLoading(false);
          return;
        }
        if (salonRes.status === 401) { router.push('/login'); return; }
        if (!salonRes.ok) throw new Error('Could not fetch your salon data.');
        const salonData = await salonRes.json();
        setSalon(salonData);

        const [servicesRes, bookingsRes, galleryRes] = await Promise.all([
          fetch(`http://localhost:3000/api/salons/mine/services`, { headers }),
          fetch(`http://localhost:3000/api/salons/mine/bookings`, { headers }),
          fetch(`http://localhost:3000/api/gallery/salon/${salonData.id}`, { headers }),
        ]);
        setServices(await servicesRes.json());
        const bookingsData = await bookingsRes.json();
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setGalleryImages(await galleryRes.json());

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [router]);

  useEffect(() => {
    if (socket) {
      socket.on('newBooking', (newBooking: DashboardBooking) => {
        setBookings(prev => {
          const prevBookings = Array.isArray(prev) ? prev : [];
          return [newBooking, ...prevBookings];
        });
        toast.info(`New booking request for ${newBooking.service.title}!`);
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
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://localhost:3000/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete service.');
      setServices(services.filter(s => s.id !== serviceId));
      toast.success("Service deleted.");
    } catch (err) {
      toast.error('Error deleting service.');
    }
  };

  const handleBookingStatusUpdate = async (bookingId: string, status: 'CONFIRMED' | 'DECLINED') => {
    const token = localStorage.getItem('access_token');
    await fetch(`http://localhost:3000/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  const handleSalonUpdate = (updatedSalon: Salon) => {
    setSalon(updatedSalon);
    setIsEditSalonModalOpen(false);
  };
  
  const handleSalonCreate = (newSalon: Salon) => {
    setSalon(newSalon);
    setIsCreateSalonModalOpen(false);
  };

  const handleAvailabilityToggle = async () => {
    if (!salon) return;
    const token = localStorage.getItem('access_token');
    setSalon(prev => ({ ...prev!, isAvailableNow: !prev!.isAvailableNow }));
    try {
      await fetch('http://localhost:3000/api/salons/mine/availability', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      toast.error("Failed to update status.");
      setSalon(prev => ({ ...prev!, isAvailableNow: !prev!.isAvailableNow }));
    }
  };

  const handleImageUpload = (newImage: GalleryImage) => {
    setGalleryImages([newImage, ...galleryImages]);
    setIsGalleryModalOpen(false);
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://localhost:3000/api/gallery/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete image.');
      setGalleryImages(galleryImages.filter(img => img.id !== imageId));
      toast.success("Image deleted from gallery.");
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

  if (isLoading || salon === undefined) return <LoadingSpinner />;
  if (error) return <div className={styles.container}><p style={{ color: 'var(--error-red)' }}>{error}</p></div>;

  if (!salon) {
    return (
        <>
        {isCreateSalonModalOpen && (
            <EditSalonModal
              salon={{} as Salon}
              onClose={() => setIsCreateSalonModalOpen(false)}
              onSave={handleSalonCreate}
            />
        )}
        <div className={styles.welcomeContainer}>
          <div className={styles.welcomeCard}>
            <h2 className={styles.cardTitle}>Welcome, Service Provider!</h2>
            <p>Your profile is not yet complete. Create your public salon profile to start adding services and accepting bookings.</p>
            <div style={{marginTop: '1.5rem'}}>
              <button onClick={() => setIsCreateSalonModalOpen(true)} className="btn btn-primary">
                Create Your Salon Profile
              </button>
            </div>
          </div>
        </div>
        </>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const pastBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'DECLINED');

  const renderBookingsList = (list: DashboardBooking[]) => {
    if (list.length === 0) return <p>No bookings in this category.</p>;
    return list.map(booking => (
      <div key={booking.id} className={styles.listItem}>
        <div className={styles.listItemInfo}>
          <p><strong>{booking.service.title}</strong> for {booking.client.firstName}</p>
          <p className={styles.date}>{new Date(booking.bookingDate).toLocaleString('en-ZA')}</p>
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
      {isServiceModalOpen && (
        <ServiceFormModal salonId={salon.id} initialData={editingService} onClose={closeServiceModal} onSave={handleSaveService} />
      )}
      {isEditSalonModalOpen && (
        <EditSalonModal
          salon={salon}
          onClose={() => setIsEditSalonModalOpen(false)}
          onSave={handleSalonUpdate}
        />
      )}
       {isGalleryModalOpen && (
        <GalleryUploadModal
          salonId={salon.id}
          onClose={() => setIsGalleryModalOpen(false)}
          onUpload={handleImageUpload}
        />
      )}
      <div className={styles.container}>
      <div className={styles.stickyHeader}>
        <div className={styles.navButtonsContainer}>
            <button onClick={() => router.back()} className={styles.navButton}><FaArrowLeft /> Back</button>
            <Link href="/" className={styles.navButton}><FaHome /> Home</Link>
        </div>
        <h1 className={styles.title}>My Dashboard</h1>
        <div className={styles.headerSpacer}></div>
      </div>


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