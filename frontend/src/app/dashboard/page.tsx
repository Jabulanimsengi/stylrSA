// frontend/src/app/dashboard/page.tsx


'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Image from 'next/image';
import {
  Salon,
  Service,
  ApprovalStatus,
  Booking,
  GalleryImage,
  Product,
  Promotion,
  PlanPaymentStatus,
  PlanCode,
} from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './Dashboard.module.css';
import ServiceFormModal from '@/components/ServiceFormModal';
import EditSalonModal from '@/components/EditSalonModal';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'react-toastify';
import { logger } from '@/lib/logger';
import GalleryUploadModal from '@/components/GalleryUploadModal';
import ProductFormModal from '@/components/ProductFormModal';
import PromotionModal from '@/components/PromotionModal';
import CreatePromotionModal from '@/components/CreatePromotionModal';
import ConfirmationModal from '@/components/ConfirmationModal/ConfirmationModal';
import { FaTrash, FaEdit, FaPlus, FaCamera } from 'react-icons/fa';
import Link from 'next/link';
import PageNav from '@/components/PageNav';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch, apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { APP_PLANS, PLAN_BY_CODE } from '@/constants/plans';
import ReviewsTab from '@/components/ReviewsTab/ReviewsTab';

type DashboardBooking = Booking & {
  user: { firstName: string; lastName: string };
  service: { title: string };
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
  clientPhone?: string;
};

const BANK_DETAILS = {
  bank: 'Capitec Bank',
  accountNumber: '1618097723',
  accountHolder: 'J Msengi',
  whatsapp: '0787770524',
};

const PLAN_PAYMENT_LABELS: Record<PlanPaymentStatus, string> = {
  PENDING_SELECTION: 'Package not yet selected',
  AWAITING_PROOF: 'Awaiting proof of payment',
  PROOF_SUBMITTED: 'Proof submitted • pending admin review',
  VERIFIED: 'Payment verified',
};

function DashboardPageContent() {
  const [salon, setSalon] = useState<Salon | null | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<{ active: any[]; expired: any[] }>({ active: [], expired: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlanUpdating, setIsPlanUpdating] = useState(false);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isEditSalonModalOpen, setIsEditSalonModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'service' | 'product' | 'promotion' | 'gallery' } | null>(null);
  
  const [activeBookingTab, setActiveBookingTab] = useState<'pending' | 'confirmed' | 'past'>('pending');
  const [activeMainTab, setActiveMainTab] = useState<'bookings' | 'services' | 'reviews' | 'gallery' | 'promotions' | 'booking-settings'>('bookings');
  const [selectedServiceForPromo, setSelectedServiceForPromo] = useState<Service | null>(null);
  const [isCreatePromoModalOpen, setIsCreatePromoModalOpen] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const socket = useSocket();
  
  const { authStatus, user } = useAuth(); 

  const ownerId = user?.role === 'ADMIN' ? searchParams.get('ownerId') : user?.id;

  const handlePlanProofUpdate = useCallback(
    async (hasProof: boolean) => {
      if (!ownerId) return;
      setIsPlanUpdating(true);
      try {
        const res = await fetch(`/api/salons/mine/plan?ownerId=${ownerId}` , {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hasSentProof: hasProof }),
        });
        if (!res.ok) throw new Error('Failed to update plan status');
        const updatedSalon = await res.json();
        setSalon(updatedSalon);
        toast.success(
          hasProof
            ? 'Thanks! We will review and approve your payment shortly.'
            : 'Status updated. Please send proof of payment when ready.',
        );
      } catch (err) {
        toast.error('Could not update your payment status.');
      } finally {
        setIsPlanUpdating(false);
      }
    },
    [ownerId],
  );

  const fetchDashboardData = useCallback(async () => {
    if (!ownerId) {
      // Avoid infinite spinner when admin forgets ownerId
      setIsLoading(false);
      setSalon(null);
      setServices([]);
      setBookings([] as any);
      setGalleryImages([]);
      setProducts([]);
      setPromotions({ active: [], expired: [] });
      return;
    }
    setIsLoading(true);
    try {
      const salonRes = await fetch(`/api/salons/my-salon?ownerId=${ownerId}`, { credentials: 'include', cache: 'no-store' as any });
      if (salonRes.status === 401) { router.push('/'); return; }
      if (salonRes.status === 404) { setSalon(null); setIsLoading(false); return; }
      if (!salonRes.ok) throw new Error('Could not fetch salon data.');
      
      // Parse JSON with proper error handling
      let salonData;
      try {
        const text = await salonRes.text();
        if (!text || text.trim() === '') {
          // Empty response means no salon exists
          setSalon(null);
          setIsLoading(false);
          return;
        }
        salonData = JSON.parse(text);
      } catch (jsonError) {
        logger.error('Failed to parse salon data:', jsonError);
        toast.error('You must create a salon profile to view the salon dashboard.');
        setSalon(null);
        setIsLoading(false);
        return;
      }
      
      // If no salon exists (backend returns null), stop here and show welcome screen
      if (!salonData) {
        setSalon(null);
        setIsLoading(false);
        return;
      }
      
      setSalon(salonData);
      setBookingMessage(salonData.bookingMessage || '');
      setIsEditingMessage(!salonData.bookingMessage); // If no message, start in edit mode

      const results = await Promise.allSettled([
        apiJson(`/api/salons/mine/services?ownerId=${ownerId}`),
        apiJson(`/api/salons/mine/bookings?ownerId=${ownerId}`),
        apiJson(`/api/gallery/salon/${salonData.id}`),
        apiJson(`/api/products/seller/${ownerId}`),
        apiJson(`/api/promotions/my-salon`),
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

      if (promotionsRes.status === 'fulfilled') setPromotions(promotionsRes.value || { active: [], expired: [] });
      else setPromotions({ active: [], expired: [] });

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

  // Handle tab query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'reviews' || tab === 'services' || tab === 'bookings' || tab === 'gallery' || tab === 'promotions') {
      setActiveMainTab(tab as any);
    }
  }, [searchParams]);

  // Refresh dashboard when admin updates visibility for this salon
  useEffect(() => {
    if (!socket || !salon?.id) return;
    const handler = (payload: any) => {
      try {
        if (payload?.entity === 'salon' && payload.id === salon.id) {
          fetchDashboardData();
          toast.success('Your package has been updated by an admin');
        }
      } catch (err) {
        logger.error('Error handling visibility update:', err);
      }
    };
    socket.on('visibility:updated', handler);
    return () => { socket.off('visibility:updated', handler); };
  }, [socket, salon?.id, fetchDashboardData]);
  
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
    setPromotions({ ...promotions, active: [...promotions.active, addedPromotion] });
    setIsPromotionModalOpen(false);
  };

  const openCreatePromoModal = (service: Service) => {
    setSelectedServiceForPromo(service);
    setIsCreatePromoModalOpen(true);
  };

  const handlePromoCreated = () => {
    setIsCreatePromoModalOpen(false);
    setSelectedServiceForPromo(null);
    fetchDashboardData();
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
        else if (type === 'promotion') {
          setPromotions({
            active: promotions.active.filter(p => p.id !== id),
            expired: promotions.expired.filter(p => p.id !== id),
          });
        }
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

  const saveBookingMessage = async () => {
    if (!ownerId) return;
    setIsSavingMessage(true);
    try {
      const updated = await apiJson(`/api/salons/mine/booking-message?ownerId=${ownerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingMessage }),
      });
      setSalon(updated);
      setIsEditingMessage(false); // Switch to view mode after save
      toast.success('Booking message saved successfully!');
    } catch (e: any) {
      toast.error(toFriendlyMessage(e, 'Failed to save booking message'));
    } finally {
      setIsSavingMessage(false);
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

  const planCode = (salon?.planCode as PlanCode | null) ?? 'STARTER';
  const planDetails = PLAN_BY_CODE[planCode] ?? APP_PLANS[0];
  const planStatus = (salon?.planPaymentStatus as PlanPaymentStatus | null) ?? 'PENDING_SELECTION';
  const planReference = salon?.planPaymentReference ?? salon?.name ?? 'your salon name';
  const proofSubmittedAt = salon?.planProofSubmittedAt
    ? new Date(salon.planProofSubmittedAt).toLocaleString('en-ZA')
    : null;
  const planVerifiedAt = salon?.planVerifiedAt
    ? new Date(salon.planVerifiedAt).toLocaleString('en-ZA')
    : null;
  const handleCopyReference = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(String(planReference));
      toast.success('Payment reference copied');
    } catch {
      toast.error('Unable to copy reference automatically');
    }
  }, [planReference]);

  if (isLoading || authStatus === 'loading') {
    return (
      <div className={styles.container}>
        <PageNav />
        <h1 className={styles.title}>{user?.role === 'ADMIN' ? 'Salon Dashboard' : 'My Dashboard'}</h1>

        <header className={styles.header} aria-hidden>
          <div className={styles.headerTop}>
            <Skeleton variant="text" style={{ width: '45%', height: 28 }} />
            <div className={styles.headerActions}>
              <Skeleton variant="button" style={{ width: 160 }} />
              <Skeleton variant="button" style={{ width: 180 }} />
              <Skeleton variant="button" style={{ width: 140 }} />
            </div>
          </div>
          <div style={{display:'flex', gap:'1rem', flexWrap:'wrap', marginTop: 8}}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} variant="text" style={{ width: '18%', minWidth: 120, height: 20 }} />
            ))}
          </div>
        </header>

        <div className={styles.contentGrid} aria-hidden>
          {Array.from({ length: 3 }).map((_, cardIdx) => (
            <div key={cardIdx} className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <Skeleton variant="text" style={{ width: '50%', height: 24 }} />
                <Skeleton variant="button" style={{ width: '35%' }} />
              </div>
              <div className={styles.list}>
                {Array.from({ length: 3 }).map((_, rowIdx) => (
                  <div key={rowIdx} className={styles.listItem}>
                    <Skeleton variant="text" style={{ width: '70%', height: 18 }} />
                    <div className={styles.actions}>
                      <Skeleton variant="text" style={{ width: 80, height: 18 }} />
                      <Skeleton variant="button" style={{ width: 40 }} />
                      <Skeleton variant="button" style={{ width: 40 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING': return styles.statusPending;
      case 'CONFIRMED': return styles.statusConfirmed;
      case 'COMPLETED': return styles.statusCompleted;
      case 'DECLINED': return styles.statusDeclined;
      case 'CANCELLED': return styles.statusCancelled;
      default: return '';
    }
  };

  const handleMarkAsCompleted = async (bookingId: string) => {
    const confirmed = window.confirm(
      'Is this service completed?\n\nMarking as completed will:\n• Move this booking to Past tab\n• Send a review request to the customer\n• Update booking records'
    );
    
    if (!confirmed) return;

    try {
      await handleBookingStatusUpdate(bookingId, 'COMPLETED');
      toast.success('Service marked as completed! Customer will be notified to leave a review.');
    } catch (e) {
      toast.error(toFriendlyMessage(e, 'Failed to mark service as completed'));
    }
  };

  const renderBookingsList = (list: DashboardBooking[]) => {
    if (list.length === 0) return <p>No bookings in this category.</p>;
    return list.map(booking => {
      const bookingDate = new Date(booking.bookingTime);
      const formattedDate = bookingDate.toLocaleDateString('en-ZA', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      const formattedTime = bookingDate.toLocaleTimeString('en-ZA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      return (
        <div key={booking.id} className={styles.bookingCard}>
          <div className={styles.bookingHeader}>
            <div>
              <h4 className={styles.bookingServiceTitle}>{booking.service.title}</h4>
              <p className={styles.bookingCustomerName}>
                Customer: {booking.user.firstName} {booking.user.lastName}
              </p>
            </div>
            <span className={`${styles.bookingStatusBadge} ${getStatusBadgeClass(booking.status)}`}>
              {booking.status}
            </span>
          </div>
          
          <div className={styles.bookingDetails}>
            <div className={styles.bookingDetailItem}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{formattedDate}</span>
            </div>
            <div className={styles.bookingDetailItem}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{formattedTime}</span>
            </div>
            {booking.clientPhone && (
              <div className={styles.bookingDetailItem}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{booking.clientPhone}</span>
              </div>
            )}
          </div>

          <div className={styles.bookingActions}>
            {booking.status === 'PENDING' && (
              <>
                <button 
                  onClick={() => handleBookingStatusUpdate(booking.id, 'CONFIRMED')} 
                  className={styles.confirmButton}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Accept
                </button>
                <button 
                  onClick={() => handleBookingStatusUpdate(booking.id, 'DECLINED')} 
                  className={styles.declineButton}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Decline
                </button>
              </>
            )}
            
            {booking.status === 'CONFIRMED' && (
              <button 
                onClick={() => handleMarkAsCompleted(booking.id)} 
                className={styles.completeButton}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Mark as Completed
              </button>
            )}

            {['COMPLETED', 'DECLINED', 'CANCELLED'].includes(booking.status) && (
              <p className={styles.bookingStatusText}>
                {booking.status === 'COMPLETED' && 'Service completed'}
                {booking.status === 'DECLINED' && 'Booking declined'}
                {booking.status === 'CANCELLED' && 'Booking cancelled'}
              </p>
            )}
          </div>
        </div>
      );
    });
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
      {isCreatePromoModalOpen && selectedServiceForPromo && (
        <CreatePromotionModal
          service={selectedServiceForPromo}
          isOpen={isCreatePromoModalOpen}
          onClose={() => {
            setIsCreatePromoModalOpen(false);
            setSelectedServiceForPromo(null);
          }}
          onSuccess={handlePromoCreated}
        />
      )}
      
      <div className={styles.container}>
        <PageNav />
        <h1 className={styles.title}>{user?.role === 'ADMIN' ? `${salon.name}'s Dashboard` : 'My Dashboard'}</h1>
        
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
            <div className={styles.planSummary}>
              <div className={styles.planSummaryRow}>
                <span><strong>Package:</strong> {planDetails.name}</span>
                <span><strong>Amount due:</strong> {planDetails.price}</span>
                <span><strong>Visibility weight:</strong> {salon.visibilityWeight ?? planDetails.visibilityWeight}</span>
                <span><strong>Max listings:</strong> {salon.maxListings ?? planDetails.maxListings}</span>
                <span><strong>Featured until:</strong> {salon.featuredUntil ? new Date(salon.featuredUntil).toLocaleString('en-ZA') : '—'}</span>
              </div>
              <div className={styles.planStatusRow}>
                <span className={`${styles.planStatusBadge} ${styles[`planStatus_${planStatus.toLowerCase()}`]}`}>
                  {PLAN_PAYMENT_LABELS[planStatus]}
                </span>
                {planStatus === 'PROOF_SUBMITTED' && proofSubmittedAt && (
                  <span>Proof submitted: {proofSubmittedAt}</span>
                )}
                {planStatus === 'VERIFIED' && planVerifiedAt && (
                  <span>Verified on: {planVerifiedAt}</span>
                )}
              </div>
              <div className={styles.planNotice}>
                <p>
                  Pay <strong>{planDetails.price}</strong> to <strong>{BANK_DETAILS.bank}</strong>, account <strong>{BANK_DETAILS.accountNumber}</strong> (Account holder: <strong>{BANK_DETAILS.accountHolder}</strong>). Use <strong>{planReference}</strong> as the payment reference and WhatsApp proof to <strong>{BANK_DETAILS.whatsapp}</strong> as soon as you pay.
                </p>
                <div className={styles.planActions}>
                  <button type="button" className={styles.copyButton} onClick={handleCopyReference}>Copy reference</button>
                  <Link href="/prices" className={`${styles.planLink} btn btn-ghost`}>View packages</Link>
                  {planStatus !== 'VERIFIED' && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handlePlanProofUpdate(true)}
                      disabled={isPlanUpdating || planStatus === 'PROOF_SUBMITTED'}
                    >
                      {isPlanUpdating
                        ? 'Saving...'
                        : planStatus === 'PROOF_SUBMITTED'
                          ? 'Proof submitted'
                          : 'I have sent proof'}
                    </button>
                  )}
                  {planStatus === 'PROOF_SUBMITTED' && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => handlePlanProofUpdate(false)}
                      disabled={isPlanUpdating}
                    >
                      {isPlanUpdating ? 'Saving...' : 'Mark as awaiting proof'}
                    </button>
                  )}
                </div>
              </div>
            </div>
        </header>

        <div className={styles.mainTabs}>
          <button
            onClick={() => setActiveMainTab('bookings')}
            className={`${styles.mainTabButton} ${activeMainTab === 'bookings' ? styles.activeMainTab : ''}`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveMainTab('services')}
            className={`${styles.mainTabButton} ${activeMainTab === 'services' ? styles.activeMainTab : ''}`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveMainTab('promotions')}
            className={`${styles.mainTabButton} ${activeMainTab === 'promotions' ? styles.activeMainTab : ''}`}
          >
            Promotions
          </button>
          <button
            onClick={() => setActiveMainTab('reviews')}
            className={`${styles.mainTabButton} ${activeMainTab === 'reviews' ? styles.activeMainTab : ''}`}
          >
            My Reviews
          </button>
          <button
            onClick={() => setActiveMainTab('gallery')}
            className={`${styles.mainTabButton} ${activeMainTab === 'gallery' ? styles.activeMainTab : ''}`}
          >
            Gallery
          </button>
          <button
            onClick={() => setActiveMainTab('booking-settings')}
            className={`${styles.mainTabButton} ${activeMainTab === 'booking-settings' ? styles.activeMainTab : ''}`}
          >
            Booking Settings
          </button>
        </div>

        {activeMainTab === 'reviews' && <ReviewsTab />}

        {activeMainTab === 'bookings' && (
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
          </div>
        )}

        {activeMainTab === 'services' && (
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Your Services</h3>
              <button onClick={openServiceModalToAdd} className="btn btn-primary">+ Add Service</button>
            </div>
            <div className={styles.list}>
              {services.length > 0 ? services.map((service) => {
                const hasPromotion = promotions.active.some((p: any) => p.serviceId === service.id);
                return (
                  <div key={service.id} className={styles.listItem}>
                    <p><strong>{service.title}</strong> - R{service.price.toFixed(2)}</p>
                    <div className={styles.actions}>
                      <span className={`${styles.statusBadge} ${getStatusClass(service.approvalStatus)}`}>{service.approvalStatus}</span>
                      {service.approvalStatus === 'APPROVED' && !hasPromotion && (
                        <button
                          onClick={() => openCreatePromoModal(service)}
                          className={styles.promoButton}
                          title="Create promotion"
                        >
                          % Promo
                        </button>
                      )}
                      <button onClick={() => openServiceModalToEdit(service)} className={styles.editButton}><FaEdit /></button>
                      <button onClick={() => handleDeleteClick(service.id, 'service')} className={styles.deleteButton}><FaTrash /></button>
                    </div>
                  </div>
                );
              }) : <p>You haven't added any services yet.</p>}
            </div>
            </div>
          </div>
        )}

        {activeMainTab === 'promotions' && (
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Active Promotions</h3>
              </div>
              <div className={styles.list}>
                {promotions.active.length > 0 ? promotions.active.map((promo: any) => {
                  const item = promo.service || promo.product;
                  const itemName = promo.service ? item?.title : item?.name;
                  const statusClass = promo.approvalStatus === 'APPROVED' ? 'approved' : promo.approvalStatus === 'REJECTED' ? 'rejected' : 'pending';
                  const endDate = new Date(promo.endDate);
                  const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={promo.id} className={styles.listItem}>
                      <div>
                        <p><strong>{itemName}</strong></p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                          <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>R{promo.originalPrice.toFixed(2)}</span>
                          {' → '}
                          <span style={{ color: '#10b981', fontWeight: 600 }}>R{promo.promotionalPrice.toFixed(2)}</span>
                          {' '}
                          <span style={{ color: 'var(--color-primary)' }}>({promo.discountPercentage}% off)</span>
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          {daysLeft > 0 ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} left` : 'Expired'}
                        </p>
                      </div>
                      <div className={styles.actions}>
                        <span className={`${styles.statusBadge} ${getStatusClass(promo.approvalStatus as ApprovalStatus)}`}>
                          {promo.approvalStatus}
                        </span>
                        <button onClick={() => handleDeleteClick(promo.id, 'promotion')} className={styles.deleteButton}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                }) : <p>No active promotions. Create one from the Services tab!</p>}
              </div>
            </div>

            <div className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Expired Promotions</h3>
              </div>
              <div className={styles.list}>
                {promotions.expired.length > 0 ? promotions.expired.map((promo: any) => {
                  const item = promo.service || promo.product;
                  const itemName = promo.service ? item?.title : item?.name;
                  
                  return (
                    <div key={promo.id} className={styles.listItem}>
                      <div>
                        <p><strong>{itemName}</strong></p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                          Was {promo.discountPercentage}% off
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          Ended: {new Date(promo.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                }) : <p>No expired promotions.</p>}
              </div>
            </div>
          </div>
        )}

        {activeMainTab === 'gallery' && (
          <div className={styles.contentGrid}>
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
        )}

        {activeMainTab === 'booking-settings' && (
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Booking Settings</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div className={styles.infoBox} style={{ marginBottom: '1.5rem' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <strong>Custom Booking Message</strong>
                    <br />
                    Set a message that customers will see before booking. This is perfect for communicating important information such as:
                  </p>
                  <ul style={{ marginTop: '0.75rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
                    <li>Booking fees and payment details</li>
                    <li>Preparation requirements (e.g., "Please arrive 10 minutes early")</li>
                    <li>What to bring (e.g., "Bring photo ID for first visit")</li>
                    <li>Cancellation policies</li>
                  </ul>
                </div>

                <div>
                  {!isEditingMessage && bookingMessage ? (
                    // VIEW MODE: Show saved message with Edit button
                    <>
                      <label style={{ 
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: 'var(--color-text-strong)'
                      }}>
                        Your Booking Message
                      </label>
                      <div style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #10b981',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                        color: 'var(--color-text)',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        minHeight: '100px',
                      }}>
                        {bookingMessage}
                      </div>
                      <p style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.875rem', 
                        color: '#10b981',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Message saved successfully! Customers will see this before booking.
                      </p>

                      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                        <button
                          onClick={() => setIsEditingMessage(true)}
                          className="btn btn-primary"
                        >
                          <FaEdit style={{ marginRight: '0.5rem' }} />
                          Edit Message
                        </button>
                      </div>
                    </>
                  ) : (
                    // EDIT MODE: Show textarea with Save/Clear buttons
                    <>
                      <label htmlFor="bookingMessage" style={{ 
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                        color: 'var(--color-text-strong)'
                      }}>
                        Your Message ({bookingMessage.length}/200 characters)
                      </label>
                      <textarea
                        id="bookingMessage"
                        value={bookingMessage}
                        onChange={(e) => {
                          if (e.target.value.length <= 200) {
                            setBookingMessage(e.target.value);
                          }
                        }}
                        placeholder="e.g., Please arrive 10 minutes early. Booking fee: R50 (non-refundable). Bank details: FNB, Acc: 1234567890"
                        rows={5}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid var(--color-border)',
                          borderRadius: '8px',
                          fontSize: '0.95rem',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text)',
                        }}
                      />
                      <p style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.875rem', 
                        color: 'var(--color-text-muted)' 
                      }}>
                        {bookingMessage.length === 0 && 'No message set. Customers will be able to book directly without seeing a confirmation message.'}
                        {bookingMessage.length > 0 && bookingMessage.length < 200 && `${200 - bookingMessage.length} characters remaining`}
                        {bookingMessage.length === 200 && 'Maximum length reached'}
                      </p>

                      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                        <button
                          onClick={saveBookingMessage}
                          disabled={isSavingMessage}
                          className="btn btn-primary"
                          style={{ minWidth: '150px' }}
                        >
                          {isSavingMessage ? 'Saving...' : 'Save Message'}
                        </button>
                        {bookingMessage && (
                          <button
                            onClick={() => setBookingMessage('')}
                            className="btn btn-secondary"
                          >
                            Clear
                          </button>
                        )}
                        {!isEditingMessage && (
                          <button
                            onClick={() => {
                              setIsEditingMessage(false);
                              setBookingMessage(salon?.bookingMessage || '');
                            }}
                            className="btn btn-secondary"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
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