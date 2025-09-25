// frontend/src/components/BookingModal.tsx
'use client';

import { useState } from 'react';
import { Service, Salon } from '@/types';
import DatePicker from 'react-datepicker';

interface BookingModalProps {
  salon: Salon;
  service: Service;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export default function BookingModal({ salon, service, onClose, onBookingSuccess }: BookingModalProps) {
  const [bookingDate, setBookingDate] = useState<Date | null>(new Date());
  const [isMobile, setIsMobile] = useState(false);
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
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Booking failed.');
      }
      onBookingSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md text-gray-800">
        <h2 className="text-2xl font-bold mb-4">Book: {service.title}</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Select Date & Time</label>
            <DatePicker
              selected={bookingDate}
              onChange={(date) => setBookingDate(date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full p-2 border rounded-md"
            />
          </div>
          {salon.offersMobile && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isMobile"
                checked={isMobile}
                onChange={(e) => setIsMobile(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="isMobile" className="ml-2">
                Mobile Service (+R{salon.mobileFee?.toFixed(2)})
              </label>
            </div>
          )}
          <div className="text-xl font-bold mt-4">
            Total: R{totalCost.toFixed(2)}
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
          <button
            onClick={handleBooking}
            disabled={isLoading}
            className="px-4 py-2 bg-vivid-cyan text-gunmetal font-bold rounded-md disabled:opacity-50"
          >
            {isLoading ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}