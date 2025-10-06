// frontend/src/components/BookingModal.tsx
import { useState, FormEvent } from 'react';
import { Salon, Service, Booking } from '@/types';
import styles from './BookingModal.module.css';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface BookingModalProps {
  salon: Salon;
  service: Service;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export default function BookingModal({ salon, service, onClose, onBookingSuccess }: BookingModalProps) {
  const [bookingTime, setBookingTime] = useState<Date | null>(null);
  const [clientPhone, setClientPhone] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!bookingTime) {
      toast.error('Please select a date and time.');
      return;
    }
    
    setIsLoading(true);

    if (authStatus !== 'authenticated') {
      toast.error("You must be logged in to book.");
      openModal('login');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          serviceId: service.id,
          bookingTime: bookingTime.toISOString(),
          clientPhone,
          isMobile,
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

  const totalCost = service.price + (isMobile && salon.mobileFee ? salon.mobileFee : 0);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.title}>
            <h2>Book Appointment</h2>
            <button onClick={onClose}><FaTimes /></button>
        </div>

        <div className={styles.details}>
            <p><strong>Salon:</strong> {salon.name}</p>
            <p><strong>Service:</strong> {service.title}</p>
            <p><strong>Duration:</strong> {service.duration} minutes</p>
            <p><strong>Price:</strong> R{service.price.toFixed(2)}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.formContent}>
            <div className={styles.formGroup}>
                <label htmlFor="bookingTime">Preferred Date & Time</label>
                <DatePicker
                    id="bookingTime"
                    selected={bookingTime}
                    onChange={(date: Date | null) => setBookingTime(date)}
                    showTimeSelect
                    dateFormat="yyyy/MM/dd, hh:mm aa"
                    className={styles.datePicker}
                    placeholderText="Select a date and time"
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="clientPhone">Your Contact Number</label>
                <input
                    type="tel"
                    id="clientPhone"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="e.g., 0821234567"
                    required
                    className={styles.input}
                />
            </div>

            {salon.bookingType !== 'ONSITE' && (
                <div className={styles.checkboxGroup}>
                    <input 
                        type="checkbox" 
                        id="isMobile" 
                        checked={isMobile} 
                        onChange={(e) => setIsMobile(e.target.checked)}
                        disabled={salon.bookingType === 'MOBILE'}
                    />
                    <label htmlFor="isMobile">
                        Request mobile service?
                        {salon.mobileFee && ` (+R${salon.mobileFee.toFixed(2)})`}
                    </label>
                </div>
            )}
            
            <p className={styles.total}>Total: R{totalCost.toFixed(2)}</p>

            <div className={styles.buttonContainer}>
                <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                <button type="submit" disabled={isLoading} className="btn btn-primary">
                    {isLoading ? 'Sending Request...' : 'Request Booking'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}