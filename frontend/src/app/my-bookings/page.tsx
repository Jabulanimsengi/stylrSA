'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/types';
import styles from './MyBookingsPage.module.css';
import Spinner from '@/components/Spinner'; // Import the Spinner

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchBookings = async () => {
      setIsLoading(true);
      const res = await fetch('http://localhost:3000/api/bookings/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Handle error, maybe show a message
        console.error("Failed to fetch bookings");
        setIsLoading(false);
        return;
      }

      const data: Booking[] = await res.json();
      setBookings(data);
      setIsLoading(false);
    };

    fetchBookings();
  }, [router]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) return <Spinner />;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Bookings</h1>
      {bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <div className={styles.list}>
          {bookings.map(booking => (
            <div key={booking.id} className={styles.card}>
              <h4>{booking.service.title}</h4>
              <p>at <strong>{booking.salon.name}</strong></p>
              <p>Date: {formatDate(booking.bookingDate)}</p>
              <p>Cost: <strong>R{booking.totalCost.toFixed(2)}</strong></p>
              {booking.isMobile && <span className={styles.tag}>Mobile Service</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}