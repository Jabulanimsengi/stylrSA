// frontend/src/app/dashboard/page.tsx


'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { Salon, Service, ApprovalStatus, Booking, GalleryImage, Product, Promotion } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Dashboard.module.css';
import ServiceFormModal from '@/components/ServiceFormModal';
import EditSalonModal from '@/components/EditSalonModal';
import { useSocket } from '@/context/SocketContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-toastify';
import GalleryUploadModal from '@/components/GalleryUploadModal';
import ProductFormModal from '@/components/ProductFormModal';
import PromotionModal from '@/components/PromotionModal';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import { FaTrash, FaHome, FaArrowLeft, FaEdit, FaPlus, FaCamera } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch, apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';

type DashboardBooking = Booking & {
  user: { firstName: string; lastName: string };
  service: { title: string };
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
  clientPhone?: string;
};

function DashboardPageContent() {
  const [salon, setSalon] = useState<Salon | null | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isEditSalonModalOpen, setIsEditSalonModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'service' | 'product' | 'promotion' | 'gallery' } | null>(null);
  
  const [activeBookingTab, setActiveBookingTab] = useState<'pending' | 'confirmed' | 'past'>('pending');

  const router = useRouter();
  const searchParams = useSearchParams();
  const socket = useSocket();
  
  const { authStatus, user } = useAuth(); 

  const ownerId = user?.role === 'ADMIN' ? searchParams.get('ownerId') : user?.id;

  const fetchDashboardData = useCallback(async () => {
    if (!ownerId) {
      // Avoid infinite spinner when admin forgets ownerId
      setIsLoading(false);
      setSalon(null);
      setServices([]);
      setBookings([] as any);
      setGalleryImages([]);
      setProducts([]);
      setPromotions([]);
      return;
    }
    setIsLoading(true);
    try {
      const salonRes = await fetch(`/api/salons/my-salon?ownerId=${ownerId}`, { credentials: 'include', cache: 'no-store' as any });
      if (salonRes.status === 401) { router.push('/'); return; }
      if (salonRes.status === 404) { setSalon(null); setIsLoading(false); return; }
      if (!salonRes.ok) throw new Error('Could not fetch salon data.');
      const salonData = await salonRes.json();
      setSalon(salonData);

      const results = await Promise.allSettled([
        apiJson(`/api/salons/mine/services?ownerId=${ownerId}`),
        apiJson(`/api/salons/mine/bookings?ownerId=${ownerId}`),
        apiJson(`/api/gallery/salon/${salonData.id}`),
        apiJson(`/api/products/seller/${ownerId}`),
        apiJson(`/api/promotions/salon/${salonData.id}`),
      ]);

      const [servicesRes, bookingsRes, galleryRes, productsRes, promotionsRes] = results;

      if (servicesRes.status === 'fulfilled') setServices(servicesRes.value);
      else setServices([]);

      if (bookingsRes.status === 'fulfilled') setBookings(Array.isArray(bookingsRes.value) ? bookingsRes.value : []);
      else setBookings([] as any);

      if (galleryRes.status === 'fulfilled') setGalleryImages(galleryRes.value);
      else setGalleryImages([]);

      if (productsRes.status === 'fulfilled') setProducts(productsRes.value);
      else setProducts([]);

      if (promotionsRes.status === 'fulfilled') setPromotions(promotionsRes.value);
      else setPromotions([]);

    } catch (err: any) {
      const msg = toFriendlyMessage(err, 'Failed to load your dashboard.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [ownerId, router]);

  useEffect(() => {
    if (authStatus === 'loading') { setIsLoading(true); return; }
    if (authStatus === 'unauthenticated') { toast.error('You must be logged in.'); router.push('/'); return; }
    if (authStatus === 'authenticated' && ownerId) {
      fetchDashboardData();
    }
  }, [authStatus, ownerId, fetchDashboardData, router]);

  // Refresh dashboard when admin updates visibility for this salon
  useEffect(() => {
    if (!socket) return;
    const handler = (payload: any) => {
      try {
        if (payload?.entity === 'salon') {
          // If the currently viewed salon or owner matches, refresh
          if ((salon?.id && payload.id === salon.id) || payload.id === ownerId) {
            fetchDashboardData();
          }
        }
      } catch {}
    };
    socket.on('visibility:updated', handler);
    return () => { socket.off('visibility:updated', handler); };
  }, [socket, salon?.id, ownerId, fetchDashboardData]);
  
  const handleServiceSaved = (savedService: Service) => {
    if (editingService) {
      setServices(services.map(s => s.id === savedService.id ? savedService : s));
    } else {
      setServices([...services, savedService]);
    }
    closeServiceModal();
  };
  
  const handleProductAdded = (addedProduct: Product) => {
    if (selectedProduct) {
        setProducts(products.map(p => p.id === addedProduct.id ? addedProduct : p));
    } else {
        setProducts([...products, addedProduct]);
    }
    setIsProductModalOpen(false);
  };
  
  const handlePromotionAdded = (addedPromotion: Promotion) => {
    setPromotions([...promotions, addedPromotion]);
    setIsPromotionModalOpen(false);
  };

  const handleDeleteClick = (id: string, type: 'service' | 'product' | 'promotion' | 'gallery') => {
    setItemToDelete({ id, type });
  };
  
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;
    try {
        const url = type === 'gallery' ? `/api/gallery/${id}` : `/api/${type}s/${id}`;
        await apiFetch(url, { method: 'DELETE' });

        if (type === 'service') setServices(services.filter(s => s.id !== id));
        else if (type === 'product') setProducts(products.filter(p => p.id !== id));
        else if (type === 'promotion') setPromotions(promotions.filter(p => p.id !== id));
        else if (type === 'gallery') setGalleryImages(galleryImages.filter(g => g.id !== id));

        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted.`);
    } catch (err: any) {
        toast.error(toFriendlyMessage(err, 'Deletion failed'));
    } finally {
        setItemToDelete(null);
    }
  };

  const handleSalonUpdate = (updatedSalon: Salon) => {
    setSalon(updatedSalon);
    setIsEditSalonModalOpen(false);
  };

  const toggleAvailability = async () => {
    if (!ownerId) return;
    try {
      const updated = await apiJson(`/api/salons/mine/availability?ownerId=${ownerId}`, { method: 'PATCH' });
      setSalon(updated);
      toast.success(updated.isAvailableNow ? 'Marked as available now' : 'Marked as unavailable');
    } catch (e: any) {
      toast.error(toFriendlyMessage(e, 'Could not update availability'));
    }
  };
  
  const handleBookingStatusUpdate = async (bookingId: string, status: 'CONFIRMED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await apiFetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchDashboardData();
    } catch (e) {
      toast.error(toFriendlyMessage(e, 'Failed to update booking'));
    }
  };

  const openServiceModalToAdd = () => { setEditingService(null); setIsServiceModalOpen(true); };
  const openServiceModalToEdit = (service: Service) => { setEditingService(service); setIsServiceModalOpen(true); };
  const closeServiceModal = () => { setIsServiceModalOpen(false); setEditingService(null); };
  
  const openProductModal = (product: Product | null = null) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const getStatusClass = (status: ApprovalStatus) => {
    if (status === 'APPROVED') return styles.statusApproved;
    if (status === 'PENDING') return styles.statusPending;
    return styles.statusRejected;
  };

  if (isLoading || authStatus === 'loading') return <LoadingSpinner />;
  
  if (user?.role === 'ADMIN' && !ownerId) {
    return (
      <div className={styles.welcomeContainer}>
        <div className={styles.welcomeCard}>
          <h2>Admin: select a service provider</h2>
          <p>Open the Admin page and click "View Dashboard" for a salon owner to load their dashboard.</p>
          <Link href="/admin" className="btn btn-primary">Go to Admin</Link>
        </div>
      </div>
    );
  }

  if (!salon) {
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

  return (
    <>
      {isServiceModalOpen && salon && (
        <ServiceFormModal 
          salonId={salon.id} 
          onClose={closeServiceModal} 
          onServiceSaved={handleServiceSaved} 
          service={editingService} 
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
          onImageAdded={(newImage) => setGalleryImages(prev => [newImage, ...prev])}
        />
      )}
      {isPromotionModalOpen && salon && (
        <PromotionModal 
          salonId={salon.id}
          onClose={() => setIsPromotionModalOpen(false)} 
          onPromotionAdded={handlePromotionAdded}
        />
      )}
      {isProductModalOpen && salon && (
        <ProductFormModal 
          salonId={salon.id}
          onClose={() => setIsProductModalOpen(false)} 
          onProductAdded={handleProductAdded} 
          initialData={selectedProduct} 
        />
      )}
      {itemToDelete && <ConfirmationModal onConfirm={confirmDelete} onCancel={() => setItemToDelete(null)} message={`Are you sure you want to delete this ${itemToDelete.type}?`} />}
      
      <div className={styles.container}>
        <div className={styles.stickyHeader}>
          <div className={styles.navButtonsContainer}>
              <button onClick={() => router.back()} className={styles.navButton}><FaArrowLeft /> Back</button>
              <Link href="/" className={styles.navButton}><FaHome /> Home</Link>
          </div>
          <h1 className={styles.title}>{user?.role === 'ADMIN' ? `${salon.name}'s Dashboard` : 'My Dashboard'}</h1>
          <div className={styles.headerSpacer}></div>
        </div>
        
        <header className={styles.header}>
            <div className={styles.headerTop}>
              <p className={styles.salonName}>{salon.name}</p>
              <div className={styles.headerActions}>
              <button onClick={toggleAvailability} className="btn btn-ghost">
                {salon.isAvailableNow ? 'Set Unavailable' : 'Set Available Now'}
              </button>
                <Link href={`/salons/${salon.id}`} className="btn btn-ghost" target="_blank">View Public Profile</Link>
                <button onClick={() => setIsEditSalonModalOpen(true)} className="btn btn-secondary"><FaEdit /> Edit Profile</button>
              </div>
            </div>
            {/* Plan & Visibility summary */}
            <div style={{display:'flex', gap:'1rem', flexWrap:'wrap', marginTop: 8, fontSize: '0.95rem'}}>
              <span><strong>Package:</strong> {salon.planCode ?? 'STARTER'}</span>
              <span><strong>Visibility:</strong> {salon.visibilityWeight ?? 1}</span>
              <span><strong>Max listings:</strong> {salon.maxListings ?? 2}</span>
              <span><strong>Featured until:</strong> {salon.featuredUntil ? new Date(salon.featuredUntil).toLocaleString() : '—'}</span>
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
              {activeBookingTab === 'pending' && renderBookingsList(pendingBookings)}
              {activeBookingTab === 'confirmed' && renderBookingsList(confirmedBookings)}
              {activeBookingTab === 'past' && renderBookingsList(pastBookings)}
            </div>
          </div>

          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Your Services</h3>
              <button onClick={openServiceModalToAdd} className="btn btn-primary">+ Add Service</button>
            </div>
            <div className={styles.list}>
              {services.length > 0 ? services.map((service) => (
                <div key={service.id} className={styles.listItem}>
                  <p><strong>{service.title}</strong> - R{service.price.toFixed(2)}</p>
                  <div className={styles.actions}>
                    <span className={`${styles.statusBadge} ${getStatusClass(service.approvalStatus)}`}>{service.approvalStatus}</span>
                    <button onClick={() => openServiceModalToEdit(service)} className={styles.editButton}><FaEdit /></button>
                    <button onClick={() => handleDeleteClick(service.id, 'service')} className={styles.deleteButton}><FaTrash /></button>
                  </div>
                </div>
              )) : <p>You haven't added any services yet.</p>}
            </div>
          </div>

          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Manage Gallery</h3>
              <button onClick={() => setIsGalleryModalOpen(true)} className="btn btn-primary"><FaCamera /> Add Image</button>
            </div>
            <div className={styles.galleryGrid}>
              {galleryImages.length > 0 ? galleryImages.map((image) => (
                <div key={image.id} className={styles.galleryItem}>
                  <Image
                    src={image.imageUrl}
                    alt={image.caption || 'Gallery image'}
                    className={styles.galleryItemImage}
                    fill
                    sizes="(max-width: 768px) 33vw, 160px"
                  />
                  <button onClick={() => handleDeleteClick(image.id, 'gallery')} className={styles.deleteButton}><FaTrash /></button>
                </div>
              )) : <p>Your gallery is empty.</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}