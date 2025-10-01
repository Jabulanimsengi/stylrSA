'use client';

import { useState } from 'react';
import { Service, Salon } from '@/types';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import styles from './BookingModal.module.css';

interface BookingModalProps {
  salon: Salon;
  service: Service;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export default function BookingModal({ salon, service, onClose, onBookingSuccess }: BookingModalProps) {
  const [bookingDate, setBookingDate] = useState<Date | null>(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [clientPhone, setClientPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const totalCost = service.price + (isMobile ? salon.mobileFee || 0 : 0);

  const handleBooking = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('You must be logged in to book.');
      return;
    }
    if (!bookingDate) {
      setError('Please select a date and time.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: service.id,
          bookingDate: bookingDate.toISOString(),
          isMobile,
          clientPhone,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Booking failed.');
      }
      toast.success('Booking request sent! The salon will confirm shortly.');
      onBookingSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>Book: {service.title}</h2>
        <div className={styles.formContent}>
          <div>
            <label className={styles.label}>Select Date & Time</label>
            <DatePicker
              selected={bookingDate}
              onChange={(date) => setBookingDate(date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className={styles.datePicker}
            />
          </div>
          <div>
            <label className={styles.label}>Your Contact Number</label>
            <input
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className={styles.datePicker} // Reusing styles
              placeholder="e.g., 0821234567"
            />
          </div>
          {salon.offersMobile && (
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="isMobile"
                checked={isMobile}
                onChange={(e) => setIsMobile(e.target.checked)}
              />
              <label htmlFor="isMobile">
                Mobile Service (+R{salon.mobileFee?.toFixed(2)})
              </label>
            </div>
          )}
          <div className={styles.total}>
            Total: R{totalCost.toFixed(2)}
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button
            onClick={handleBooking}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}