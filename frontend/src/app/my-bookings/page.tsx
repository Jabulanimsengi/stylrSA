'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Booking, Salon, Service, Review as ReviewType } from '@/types'; // Import all needed types
import styles from './MyBookingsPage.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import ReviewModal from '@/components/ReviewModal';
import Link from 'next/link';
import { FaHome, FaArrowLeft } from 'react-icons/fa';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'react-toastify';

// FIX 1: Create a more detailed Booking type that matches the actual API response data
// This includes the full salon and service objects, and optional review/totalCost fields.
type PopulatedBooking = Booking & {
  salon: Salon;
  service: Service;
  review?: ReviewType | null;
  totalCost: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'DECLINED'; // Add 'DECLINED'
};

export default function MyBookingsPage() {
  // Use the new, more accurate type for state
  const [bookings, setBookings] = useState<PopulatedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const router = useRouter();
  const socket = useSocket();
  const { authStatus } = useAuth();

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings/my-bookings`, { credentials: 'include' });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to fetch bookings');
      }

      // The data from the API matches our new PopulatedBooking type
      const data: PopulatedBooking[] = await res.json();
      setBookings(data);

    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      toast.error("You must be logged in to view your bookings.");
      router.push('/');
    }
    if (authStatus === 'authenticated') {
      fetchBookings();
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (socket) {
      const handleBookingUpdate = (updatedBooking: PopulatedBooking) => {
        fetchBookings();
      };
      socket.on('bookingUpdate', handleBookingUpdate);
      return () => {
        socket.off('bookingUpdate', handleBookingUpdate);
      };
    }
  }, [socket]);

  // FIX 2: Rename the function to match the prop in ReviewModal.tsx
  const handleReviewAdded = () => {
    setReviewingBookingId(null);
    fetchBookings();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ZA', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getStatusClass = (status: PopulatedBooking['status']) => {
    switch(status) {
      case 'PENDING': return styles.statusPending;
      case 'CONFIRMED': return styles.statusConfirmed;
      case 'DECLINED': return styles.statusDeclined;
      case 'COMPLETED': return styles.statusCompleted;
      default: return '';
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED');
  // FIX 3: Include 'DECLINED' as a past booking status
  const pastBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'DECLINED');
  const bookingsToShow = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  if (authStatus === 'loading' || isLoading) return <LoadingSpinner />;
  
  if (authStatus === 'unauthenticated') return <p>Redirecting to login...</p>;

  return (
    <>
      {reviewingBookingId && (
        <ReviewModal
          bookingId={reviewingBookingId}
          onClose={() => setReviewingBookingId(null)}
          // FIX 4: Use the correct prop name: onReviewAdded
          onReviewAdded={handleReviewAdded}
        />
      )}
      <div className={styles.container}>
        <div className={styles.stickyHeader}>
            <div className={styles.navButtonsContainer}>
              <button onClick={() => router.back()} className={styles.navButton}><FaArrowLeft /> Back</button>
              <Link href="/" className={styles.navButton}><FaHome /> Home</Link>
            </div>
            <h1 className={styles.title}>My Bookings</h1>
            <div className={styles.headerSpacer}></div>
        </div>

        <div className={styles.tabs}>
          <button onClick={() => setActiveTab('upcoming')} className={`${styles.tabButton} ${activeTab === 'upcoming' ? styles.activeTab : ''}`}>
            Upcoming ({upcomingBookings.length})
          </button>
          <button onClick={() => setActiveTab('past')} className={`${styles.tabButton} ${activeTab === 'past' ? styles.activeTab : ''}`}>
            Past ({pastBookings.length})
          </button>
        </div>

        {bookingsToShow.length === 0 ? (
          <p>You have no {activeTab} bookings.</p>
        ) : (
          <div className={styles.list}>
            {bookingsToShow.map(booking => (
              <div key={booking.id} className={styles.card}>
                <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>{booking.status}</span>
                {/* FIX 5: Access properties from the full objects */}
                <h4>{booking.service.title}</h4>
                <p>at <strong>{booking.salon.name}</strong></p>
                <p>Date: {formatDate(booking.bookingTime)}</p>
                <p>Cost: <strong>R{booking.totalCost.toFixed(2)}</strong></p>
                <div style={{ marginTop: '1rem' }}>
                  {booking.status === 'COMPLETED' && !booking.review && (
                    <button onClick={() => setReviewingBookingId(booking.id)} className="btn btn-secondary">
                      Leave a Review
                    </button>
                  )}
                  {booking.review && <span className={styles.reviewedBadge}>Reviewed</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}