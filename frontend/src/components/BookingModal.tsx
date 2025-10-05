// frontend/src/components/BookingModal.tsx
import { useState, FormEvent } from 'react';
import { Salon, Service, Booking } from '@/types';
import styles from './BookingModal.module.css';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';

interface BookingModalProps {
  salon: Salon;
  service: Service;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export default function BookingModal({ salon, service, onClose, onBookingSuccess }: BookingModalProps) {
  const [bookingTime, setBookingTime] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem('access_token');
    if (!token) {
        toast.error("You must be logged in to book.");
        setIsLoading(false);
        return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          salonId: salon.id,
          serviceId: service.id,
          bookingTime,
          contactDetails,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create booking.');
      }
      const newBooking = await res.json();
      onBookingSuccess(newBooking);
    } catch (error) {
      console.error(error);
      toast.error('Could not send booking request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
        <h2>Book Appointment</h2>
        <p><strong>Salon:</strong> {salon.name}</p>
        <p><strong>Service:</strong> {service.name}</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="bookingTime">Preferred Date & Time</label>
            <input
              type="datetime-local"
              id="bookingTime"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="contactDetails">Your Contact Number</label>
            <input
              type="tel"
              id="contactDetails"
              value={contactDetails}
              onChange={(e) => setContactDetails(e.target.value)}
              placeholder="e.g., 0821234567"
              required
            />
          </div>
          <button type="submit" disabled={isLoading} className="btn btn-primary">
            {isLoading ? 'Sending Request...' : 'Request Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}