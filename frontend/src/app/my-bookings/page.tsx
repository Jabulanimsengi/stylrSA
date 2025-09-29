'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/types';
import styles from './MyBookingsPage.module.css';
import Spinner from '@/components/Spinner';
import ReviewModal from '@/components/ReviewModal';
import Link from 'next/link';
import { FaHome, FaArrowLeft } from 'react-icons/fa';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const router = useRouter();

  const fetchBookings = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    const res = await fetch('http://localhost:3000/api/bookings/mine', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setBookings(await res.json());
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleReviewSubmitted = () => {
    setReviewingBookingId(null);
    fetchBookings();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ZA', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getStatusClass = (status: Booking['status']) => {
    switch(status) {
      case 'PENDING': return styles.statusPending;
      case 'CONFIRMED': return styles.statusConfirmed;
      case 'DECLINED': return styles.statusDeclined;
      case 'COMPLETED': return styles.statusCompleted;
      default: return '';
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED');
  const pastBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'DECLINED');
  const bookingsToShow = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  if (isLoading) return <Spinner />;

  return (
    <>
      {reviewingBookingId && (
        <ReviewModal
          bookingId={reviewingBookingId}
          onClose={() => setReviewingBookingId(null)}
          onReviewSubmitted={handleReviewSubmitted}
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
                <h4>{booking.service.title}</h4>
                <p>at <strong>{booking.salon.name}</strong></p>
                <p>Date: {formatDate(booking.bookingDate)}</p>
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