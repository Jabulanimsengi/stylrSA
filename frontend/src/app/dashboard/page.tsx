'use client';

import { useEffect, useState } from 'react';
import { Salon, Service, ApprovalStatus, Booking } from '@/types';
import { useRouter } from 'next/navigation';
import styles from './Dashboard.module.css';
import ServiceFormModal from '@/components/ServiceFormModal';
import EditSalonModal from '@/components/EditSalonModal';
import { useSocket } from '@/context/SocketContext';
import Spinner from '@/components/Spinner';
import { toast } from 'react-toastify';

type DashboardBooking = Booking & { 
  client: { firstName: string, lastName: string },
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED'
};

export default function DashboardPage() {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isEditSalonModalOpen, setIsEditSalonModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
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
        const [salonRes, servicesRes, bookingsRes] = await Promise.all([
          fetch('http://localhost:3000/api/salons/mine', { headers }),
          fetch('http://localhost:3000/api/salons/mine/services', { headers }),
          fetch('http://localhost:3000/api/salons/mine/bookings', { headers }),
        ]);

        if (salonRes.status === 401) {
          router.push('/login');
          return;
        }
        if (!salonRes.ok) throw new Error('Could not fetch your salon data. Have you created a salon profile?');
        
        setSalon(await salonRes.json());
        setServices(await servicesRes.json());
        setBookings(await bookingsRes.json());
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
        setBookings(prev => [newBooking, ...prev]);
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
    } catch (err) {
      alert('Error deleting service.');
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

  const openServiceModalToAdd = () => { setEditingService(null); setIsServiceModalOpen(true); };
  const openServiceModalToEdit = (service: Service) => { setEditingService(service); setIsServiceModalOpen(true); };
  const closeServiceModal = () => { setIsServiceModalOpen(false); setEditingService(null); };
  
  const getStatusClass = (status: ApprovalStatus) => {
    if (status === 'APPROVED') return styles.statusApproved;
    if (status === 'PENDING') return styles.statusPending;
    return styles.statusRejected;
  };

  if (isLoading) return <Spinner />;
  if (error) return <div className="error">{error}</div>;
  if (!salon) return <div className="notFound">You have not created a salon profile yet.</div>;

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');

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
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.headerInfo}>
              <h1 className={styles.title}>My Dashboard</h1>
              <p className={styles.salonName}>{salon.name}</p>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.availabilityToggle}>
                <label className={styles.switch}>
                  <input type="checkbox" checked={salon.isAvailableNow} onChange={handleAvailabilityToggle} />
                  <span className={styles.slider}></span>
                </label>
                <strong>Available Now</strong>
              </div>
              <button onClick={() => setIsEditSalonModalOpen(true)} className="btn btn-secondary">
                Edit Profile
              </button>
            </div>
          </div>
        </header>

        <div className={styles.contentGrid}>
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Pending Bookings ({pendingBookings.length})</h3>
            </div>
            <div className={styles.list}>
              {pendingBookings.length > 0 ? pendingBookings.map(booking => (
                <div key={booking.id} className={styles.listItem}>
                  <div className={styles.listItemInfo}>
                    <p><strong>{booking.service.title}</strong> for {booking.client.firstName}</p>
                    <p className={styles.date}>{new Date(booking.bookingDate).toLocaleString('en-ZA')}</p>
                  </div>
                  <div className={styles.actions}>
                    <button onClick={() => handleBookingStatusUpdate(booking.id, 'CONFIRMED')} className={styles.approveButton}>Accept</button>
                    <button onClick={() => handleBookingStatusUpdate(booking.id, 'DECLINED')} className={styles.rejectButton}>Decline</button>
                  </div>
                </div>
              )) : <p>No pending bookings.</p>}
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
        </div>
      </div>
    </>
  );
}