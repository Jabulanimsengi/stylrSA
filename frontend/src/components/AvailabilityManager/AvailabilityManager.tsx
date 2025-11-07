'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import styles from './AvailabilityManager.module.css';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaSave } from 'react-icons/fa';

interface AvailabilityManagerProps {
  salonId: string;
}

interface HourSlot {
  hour: number;
  isAvailable: boolean;
}

export default function AvailabilityManager({ salonId }: AvailabilityManagerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hourlyAvailability, setHourlyAvailability] = useState<HourSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Generate calendar days for the current month
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add padding days from previous month
    const startDay = firstDay.getDay();
    for (let i = startDay; i > 0; i--) {
      days.push(new Date(year, month, 1 - i));
    }

    // Add all days in current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    // Add padding days from next month
    const endDay = lastDay.getDay();
    for (let day = 1; day < 7 - endDay; day++) {
      days.push(new Date(year, month + 1, day));
    }

    return days;
  };

  // Fetch availability for selected date
  const fetchAvailability = useCallback(async () => {
    if (!selectedDate) return;

    setIsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/availability/${salonId}?date=${dateStr}`);
      
      if (response.ok) {
        const data = await response.json();
        setHourlyAvailability(data.slots || []);
      } else {
        // Initialize with default available slots
        setHourlyAvailability(
          Array.from({ length: 24 }, (_, hour) => ({
            hour,
            isAvailable: true,
          }))
        );
      }
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, salonId]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);

    // Don't allow selection of past dates
    if (clickedDate < today) {
      toast.info('Cannot modify availability for past dates');
      return;
    }

    setSelectedDate(date);
  };

  const toggleHourAvailability = (hour: number) => {
    setHourlyAvailability((prev) =>
      prev.map((slot) =>
        slot.hour === hour ? { ...slot, isAvailable: !slot.isAvailable } : slot
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedDate || !hasChanges) return;

    setIsSaving(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/availability/${salonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          date: dateStr,
          hours: hourlyAvailability,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const savedCount = data.updated || hourlyAvailability.length;
        
        // Show detailed success message
        toast.success(
          `✅ Availability updated! ${savedCount} hours saved for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
          { autoClose: 5000 }
        );
        
        setHasChanges(false);
        setLastSaved(new Date());
        
        // Refetch to confirm save and update UI
        await fetchAvailability();
        
        // Dispatch event for other components (like CalendarSchedule)
        window.dispatchEvent(new CustomEvent('availability-updated', {
          detail: { salonId, date: selectedDate }
        }));
      } else if (response.status === 401) {
        toast.error('🔒 Please log in to update availability');
      } else if (response.status === 403) {
        toast.error('⛔ You do not have permission to update this salon');
      } else {
        const errorText = await response.text();
        toast.error(`❌ Failed to save: ${errorText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to save availability:', error);
      toast.error('Failed to save availability. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
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

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const setAllHours = (available: boolean) => {
    setHourlyAvailability((prev) =>
      prev.map((slot) => ({ ...slot, isAvailable: available }))
    );
    setHasChanges(true);
  };

  const days = getDaysInMonth();
  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <FaCalendarAlt className={styles.icon} />
          <h2 className={styles.title}>Manage Your Availability</h2>
        </div>
        <p className={styles.subtitle}>
          Set your hourly availability for each day. Green indicates you're available, gray means unavailable.
        </p>
      </div>

      <div className={styles.content}>
        {/* Calendar Section */}
        <div className={styles.calendarSection}>
          <div className={styles.calendarHeader}>
            <button
              onClick={() => navigateMonth('prev')}
              className={styles.navButton}
              type="button"
            >
              <FaChevronLeft />
            </button>
            <h3 className={styles.monthTitle}>{monthName}</h3>
            <button
              onClick={() => navigateMonth('next')}
              className={styles.navButton}
              type="button"
            >
              <FaChevronRight />
            </button>
          </div>

          <div className={styles.calendar}>
            <div className={styles.weekDays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className={styles.weekDay}>
                  {day}
                </div>
              ))}
            </div>
            <div className={styles.daysGrid}>
              {days.map((date, index) => {
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    disabled={isPast}
                    className={`${styles.day} ${
                      isToday(date) ? styles.today : ''
                    } ${isSelected(date) ? styles.selected : ''} ${
                      !isCurrentMonth(date) ? styles.otherMonth : ''
                    } ${isPast ? styles.past : ''}`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hours Section */}
        <div className={styles.hoursSection}>
          {selectedDate ? (
            <>
              <div className={styles.hoursHeader}>
                <h3 className={styles.hoursTitle}>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <div className={styles.bulkActions}>
                  <button
                    type="button"
                    onClick={() => setAllHours(true)}
                    className={styles.bulkButton}
                  >
                    All Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllHours(false)}
                    className={styles.bulkButton}
                  >
                    All Unavailable
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className={styles.loading}>Loading availability...</div>
              ) : (
                <>
                  <div className={styles.hoursGrid}>
                    {hourlyAvailability.map((slot) => (
                      <button
                        key={slot.hour}
                        type="button"
                        onClick={() => toggleHourAvailability(slot.hour)}
                        className={`${styles.hourSlot} ${
                          slot.isAvailable ? styles.available : styles.unavailable
                        }`}
                      >
                        <span className={styles.hourTime}>{formatTime(slot.hour)}</span>
                        <span className={styles.hourStatus}>
                          {slot.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </button>
                    ))}
                  </div>

                  {hasChanges && (
                    <div className={styles.saveSection}>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className={styles.saveButton}
                      >
                        <FaSave />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                  
                  {lastSaved && !hasChanges && (
                    <div className={styles.lastSaved}>
                      ✅ Last saved: {lastSaved.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>
              <FaCalendarAlt className={styles.placeholderIcon} />
              <p>Select a date to manage hourly availability</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

