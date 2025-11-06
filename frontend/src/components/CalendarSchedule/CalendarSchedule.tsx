'use client';

import { useState, useEffect, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaClock } from 'react-icons/fa';
import styles from './CalendarSchedule.module.css';
import { Salon, Service } from '@/types';

interface CalendarScheduleProps {
  salon: Salon;
  services: Service[];
  onServiceSelect?: (service: Service) => void;
  onDateSelect?: (date: Date) => void;
  onSlotSelect?: (slot: string) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
  status: 'available' | 'busy' | 'unavailable';
}

interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

export default function CalendarSchedule({
  salon,
  services,
  onServiceSelect,
  onDateSelect,
  onSlotSelect
}: CalendarScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedService, setSelectedService] = useState<Service | null>(services[0] || null);
  const [availability, setAvailability] = useState<DayAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get days in month
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month to fill first week
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add all days in current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    // Add days from next month to fill last week
    const endDay = lastDay.getDay();
    for (let day = 1; day < 7 - endDay; day++) {
      days.push(new Date(year, month + 1, day));
    }

    return days;
  }, [currentMonth]);

  // Fetch availability when date or service changes
  useEffect(() => {
    if (!selectedService || !selectedDate) {
      setAvailability(null);
      return;
    }

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        
        // Fetch both booking availability and custom availability
        const [bookingResponse, customAvailabilityResponse] = await Promise.all([
          fetch(`/api/bookings/availability/${selectedService.id}?date=${dateString}`),
          fetch(`/api/availability/${salon.id}?date=${dateString}`)
        ]);

        if (!bookingResponse.ok) {
          throw new Error('Failed to fetch booking availability');
        }

        const bookingData = await bookingResponse.json();
        
        // Merge with custom availability if available
        if (customAvailabilityResponse.ok) {
          const customAvailability = await customAvailabilityResponse.json();
          
          // Override booking availability with custom availability
          if (customAvailability.slots && bookingData.slots) {
            bookingData.slots = bookingData.slots.map((slot: TimeSlot) => {
              const hour = new Date(slot.time).getHours();
              const customSlot = customAvailability.slots.find((s: any) => s.hour === hour);
              
              // If provider marked this hour as unavailable, override it
              if (customSlot && !customSlot.isAvailable) {
                return {
                  ...slot,
                  status: 'unavailable' as const,
                  available: false,
                };
              }
              
              return slot;
            });
          }
        }
        
        setAvailability(bookingData);
      } catch (error) {
        console.error('Error fetching availability:', error);
        setAvailability(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedService, selectedDate, salon.id]);

  const handleDateClick = (date: Date) => {
    // Don't allow selection of past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);

    if (clickedDate < today) return;

    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available) {
      onSlotSelect?.(slot.time);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
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

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const availableSlots = availability?.slots.filter(slot => slot.available) || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <FaCalendarAlt /> Schedule & Availability
        </h3>
        {services.length > 1 && (
          <select
            value={selectedService?.id || ''}
            onChange={(e) => {
              const service = services.find(s => s.id === e.target.value);
              if (service) {
                setSelectedService(service);
                onServiceSelect?.(service);
              }
            }}
            className={styles.serviceSelect}
          >
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.title || service.name} - R{service.price}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className={styles.calendarWrapper}>
        <div className={styles.calendar}>
          <div className={styles.calendarHeader}>
            <button
              onClick={() => navigateMonth('prev')}
              className={styles.navButton}
              aria-label="Previous month"
            >
              <FaChevronLeft />
            </button>
            <h4 className={styles.monthYear}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h4>
            <button
              onClick={() => navigateMonth('next')}
              className={styles.navButton}
              aria-label="Next month"
            >
              <FaChevronRight />
            </button>
          </div>

          <div className={styles.weekDays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={styles.weekDay}>
                {day}
              </div>
            ))}
          </div>

          <div className={styles.daysGrid}>
            {daysInMonth.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isPastDate = isPast(date);
              const isSelectedDate = isSelected(date);
              const isTodayDate = isToday(date);

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  disabled={isPastDate}
                  className={`
                    ${styles.day}
                    ${!isCurrentMonth ? styles.otherMonth : ''}
                    ${isPastDate ? styles.past : ''}
                    ${isSelectedDate ? styles.selected : ''}
                    ${isTodayDate ? styles.today : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.timeSlotsSection}>
          <div className={styles.timeSlotsHeader}>
            <FaClock />
            <span>
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Select a date'}
            </span>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading availability...</div>
          ) : availability && availability.slots.length > 0 ? (
            <>
              <div className={styles.slotsGrid}>
                {availability.slots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlotClick(slot)}
                    disabled={!slot.available}
                    className={`
                      ${styles.slot}
                      ${styles[slot.status]}
                      ${slot.available ? styles.available : ''}
                    `}
                  >
                    {formatTime(slot.time)}
                  </button>
                ))}
              </div>
              {availableSlots.length === 0 && (
                <div className={styles.noSlots}>
                  No available slots for this date. Please select another date.
                </div>
              )}
            </>
          ) : (
            <div className={styles.noSlots}>
              {selectedDate
                ? 'No availability data for this date.'
                : 'Please select a date to view available time slots.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

