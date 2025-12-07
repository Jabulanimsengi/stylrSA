'use client';

import { useState, useEffect, useMemo, FormEvent, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { Salon, Service, Booking } from '@/types';
import styles from './BookingModal.module.css';
import { toast } from 'react-toastify';
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaMobile,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { useSocket } from '@/context/SocketContext';
import { apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';

interface BookingModalProps {
  salon: Salon;
  service?: Service;
  services: Service[];
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
  status: 'available' | 'busy' | 'unavailable';
}

type Step = 'service' | 'date' | 'time' | 'details' | 'confirm';

const STEPS: Step[] = ['service', 'date', 'time', 'details', 'confirm'];

export default function BookingModal({
  salon,
  service: initialService,
  services,
  onClose,
  onBookingSuccess,
}: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(initialService ? 'date' : 'service');
  const [selectedService, setSelectedService] = useState<Service | null>(initialService || null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [clientPhone, setClientPhone] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { authStatus, user } = useAuth();
  const { openModal } = useAuthModal();
  const socket = useSocket();

  // Get current step index
  const currentStepIndex = STEPS.indexOf(currentStep);
  const stepNumber = initialService ? currentStepIndex : currentStepIndex + 1;
  const totalSteps = initialService ? 4 : 5;

  // Days in month for calendar
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    const endDay = lastDay.getDay();
    for (let day = 1; day < 7 - endDay; day++) {
      days.push(new Date(year, month + 1, day));
    }

    return days;
  }, [currentMonth]);

  // Fetch time slots when date changes
  useEffect(() => {
    if (!selectedDate || !selectedService) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        const response = await fetch(
          `/api/bookings/availability/${selectedService.id}?date=${dateString}`,
          { credentials: 'include' }
        );

        if (!response.ok) throw new Error('Failed to fetch availability');
        const data = await response.json();
        setSlots(data.slots || []);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedService, selectedDate]);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();

    if (!selectedDate || !selectedSlot || !selectedService) {
      toast.error('Please complete all booking details.');
      return;
    }

    if (authStatus !== 'authenticated' || !user) {
      toast.error('You must be logged in to book.');
      openModal('login');
      return;
    }

    setIsLoading(true);

    try {
      const newBooking = await apiJson(`/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          bookingTime: selectedSlot,
          clientPhone,
          isMobile,
        }),
      });

      if (socket) {
        socket.emit('newBooking', {
          bookingId: newBooking.id,
          salonOwnerId: salon.ownerId,
          message: `New booking for ${selectedService.title} from ${user.firstName}.`,
        });
      }

      toast.success('Booking request sent successfully!');

      // Generate ICS file
      try {
        const start = new Date(newBooking.bookingTime);
        const dt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const end = new Date(start.getTime() + (selectedService.duration || 60) * 60000);
        const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//StylrSA//Booking//EN\nBEGIN:VEVENT\nUID:${newBooking.id}@stylrsa\nDTSTAMP:${dt(new Date())}\nDTSTART:${dt(start)}\nDTEND:${dt(end)}\nSUMMARY:${selectedService.title || 'Salon Service'} at ${salon.name}\nDESCRIPTION:Booking via Stylr SA\nLOCATION:${salon.address || salon.city + ', ' + salon.province}\nEND:VEVENT\nEND:VCALENDAR`;
        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedService.title || 'service'}-${start.toISOString().slice(0, 10)}.ics`;
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

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      // Skip service step if initial service was provided
      if (STEPS[prevIndex] === 'service' && initialService) {
        onClose();
        return;
      }
      setCurrentStep(STEPS[prevIndex]);
    } else {
      onClose();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'service':
        return !!selectedService;
      case 'date':
        return !!selectedDate;
      case 'time':
        return !!selectedSlot;
      case 'details':
        return clientPhone.length >= 10;
      default:
        return true;
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const totalCost = selectedService
    ? selectedService.price + (isMobile && salon.mobileFee ? salon.mobileFee : 0)
    : 0;

  const availableSlots = slots.filter((s) => s.available);

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={goBack} aria-label="Go back">
            <FaChevronLeft />
          </button>
          <div className={styles.headerContent}>
            <h2>Book Appointment</h2>
            <span className={styles.salonName}>{salon.name}</span>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* Progress indicator */}
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((stepNumber) / totalSteps) * 100}%` }}
            />
          </div>
          <span className={styles.progressText}>
            Step {stepNumber} of {totalSteps}
          </span>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Step 1: Select Service */}
          {currentStep === 'service' && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Select a Service</h3>
              <div className={styles.serviceList}>
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    className={`${styles.serviceCard} ${selectedService?.id === svc.id ? styles.selected : ''}`}
                    onClick={() => setSelectedService(svc)}
                  >
                    <div className={styles.serviceInfo}>
                      <span className={styles.serviceName}>{svc.title || svc.name}</span>
                      <span className={styles.serviceDuration}>
                        <FaClock /> {svc.duration} min
                      </span>
                    </div>
                    <span className={styles.servicePrice}>R{svc.price}</span>
                    {selectedService?.id === svc.id && (
                      <span className={styles.checkmark}>
                        <FaCheck />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Date */}
          {currentStep === 'date' && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>
                <FaCalendarAlt /> Pick a Date
              </h3>
              <div className={styles.calendar}>
                <div className={styles.calendarHeader}>
                  <button
                    onClick={() =>
                      setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))
                    }
                    className={styles.navButton}
                  >
                    <FaChevronLeft />
                  </button>
                  <span className={styles.monthYear}>
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))
                    }
                    className={styles.navButton}
                  >
                    <FaChevronRight />
                  </button>
                </div>
                <div className={styles.weekDays}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <span key={i} className={styles.weekDay}>
                      {day}
                    </span>
                  ))}
                </div>
                <div className={styles.daysGrid}>
                  {daysInMonth.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
                        disabled={isPast(date)}
                        className={`
                          ${styles.day}
                          ${!isCurrentMonth ? styles.otherMonth : ''}
                          ${isPast(date) ? styles.past : ''}
                          ${isSelected(date) ? styles.selectedDay : ''}
                          ${isToday(date) ? styles.today : ''}
                        `}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Select Time */}
          {currentStep === 'time' && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>
                <FaClock /> Choose a Time
              </h3>
              {selectedDate && (
                <p className={styles.selectedDateLabel}>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
              {loadingSlots ? (
                <div className={styles.loadingSlots}>
                  <div className={styles.spinner} />
                  <span>Loading available times...</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className={styles.timeGrid}>
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      className={`${styles.timeSlot} ${selectedSlot === slot.time ? styles.selectedSlot : ''}`}
                      onClick={() => setSelectedSlot(slot.time)}
                    >
                      {formatTime(slot.time)}
                      {selectedSlot === slot.time && <FaCheck className={styles.slotCheck} />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.noSlots}>
                  <p>No available times for this date.</p>
                  <button className={styles.linkButton} onClick={() => goToStep('date')}>
                    Choose another date
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Your Details */}
          {currentStep === 'details' && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>
                <FaUser /> Your Details
              </h3>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Contact Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="e.g., 082 123 4567"
                  className={styles.input}
                  required
                />
                <span className={styles.hint}>We'll send booking confirmation to this number</span>
              </div>

              {salon.bookingType !== 'ONSITE' && (
                <div className={styles.mobileOption}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={isMobile}
                      onChange={(e) => setIsMobile(e.target.checked)}
                      disabled={salon.bookingType === 'MOBILE'}
                    />
                    <FaMobile />
                    <span>Request mobile service</span>
                    {salon.mobileFee && (
                      <span className={styles.mobileFee}>+R{salon.mobileFee.toFixed(2)}</span>
                    )}
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Confirm */}
          {currentStep === 'confirm' && selectedService && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>
                <FaCheck /> Confirm Booking
              </h3>
              <div className={styles.summary}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Service</span>
                  <span className={styles.summaryValue}>{selectedService.title || selectedService.name}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Date</span>
                  <span className={styles.summaryValue}>
                    {selectedDate?.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Time</span>
                  <span className={styles.summaryValue}>{selectedSlot && formatTime(selectedSlot)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Duration</span>
                  <span className={styles.summaryValue}>{selectedService.duration} minutes</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Location</span>
                  <span className={styles.summaryValue}>
                    <FaMapMarkerAlt /> {isMobile ? 'Mobile visit' : salon.address || `${salon.city}, ${salon.province}`}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Contact</span>
                  <span className={styles.summaryValue}>{clientPhone}</span>
                </div>
                <div className={styles.summaryDivider} />
                <div className={styles.summaryTotal}>
                  <span>Total</span>
                  <span className={styles.totalPrice}>R{totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {currentStep === 'confirm' ? (
            <button
              className={styles.primaryButton}
              onClick={() => handleSubmit()}
              disabled={isLoading || isPending}
            >
              {isLoading ? 'Sending...' : isPending ? 'Finalising...' : 'Confirm Booking'}
            </button>
          ) : (
            <button
              className={styles.primaryButton}
              onClick={goNext}
              disabled={!canProceed()}
            >
              Continue <FaChevronRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
