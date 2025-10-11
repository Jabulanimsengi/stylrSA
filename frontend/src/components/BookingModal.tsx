// frontend/src/components/BookingModal.tsx
import { useState, FormEvent, useTransition } from 'react';
import { Salon, Service, Booking } from '@/types';
import styles from './BookingModal.module.css';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { useSocket } from '@/context/SocketContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';

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
  const [isPending, startTransition] = useTransition();
  const { authStatus, user } = useAuth(); // Get the user object
  const { openModal } = useAuthModal();
  const socket = useSocket(); // Get the socket instance
  // Using relative API path with cookie-based auth

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!bookingTime) {
      toast.error('Please select a date and time.');
      return;
    }
    
    setIsLoading(true);

    if (authStatus !== 'authenticated' || !user) {
      toast.error("You must be logged in to book.");
      openModal('login');
      setIsLoading(false);
      return;
    }

    try {
      const newBooking = await apiJson(`/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          bookingTime: bookingTime.toISOString(),
          clientPhone,
          isMobile,
        }),
      });
      
      // FIX 3: Add the socket notification emit
      if (socket) {
        socket.emit('newBooking', {
            bookingId: newBooking.id,
            salonOwnerId: salon.ownerId, // Assuming salon object has ownerId
            message: `New booking for ${service.title} from ${user.firstName}.`
        });
      }

      toast.success('Booking request sent successfully!');
      // Generate an ICS file for calendar
      try {
        const start = new Date(newBooking.bookingTime);
        const dt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const end = new Date(start.getTime() + (service.duration || 60) * 60000);
        const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TheSalonHub//Booking//EN\nBEGIN:VEVENT\nUID:${newBooking.id}@thesalonhub\nDTSTAMP:${dt(new Date())}\nDTSTART:${dt(start)}\nDTEND:${dt(end)}\nSUMMARY:${service.title || 'Salon Service'} at ${salon.name}\nDESCRIPTION:Booking via TheSalonHub\nLOCATION:${salon.address || salon.city + ', ' + salon.province}\nEND:VEVENT\nEND:VCALENDAR`;
        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${service.title || 'service'}-${start.toISOString().slice(0,10)}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {}
      startTransition(() => {
        onBookingSuccess(newBooking);
      });

    } catch (error: any) {
      toast.error(toFriendlyMessage(error, 'Could not send booking request. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const totalCost = service.price + (isMobile && salon.mobileFee ? salon.mobileFee : 0);
  const isSubmitDisabled = isLoading || isPending;

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
                    minDate={new Date()} // Prevent past dates
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
                <button type="submit" disabled={isSubmitDisabled} className="btn btn-primary">
                    {isLoading ? 'Sending Request...' : isPending ? 'Finalising…' : 'Request Booking'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}