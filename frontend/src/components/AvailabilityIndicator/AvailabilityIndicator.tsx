'use client';

import { useMemo } from 'react';
import { FaBolt, FaClock, FaCircle } from 'react-icons/fa';
import styles from './AvailabilityIndicator.module.css';
import { Salon } from '@/types';

interface AvailabilityIndicatorProps {
  salon: Salon;
  showNextAvailable?: boolean;
  compact?: boolean; // For overlay display on cards
}

export default function AvailabilityIndicator({ salon, showNextAvailable = false, compact = false }: AvailabilityIndicatorProps) {
  const availability = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[currentDay];

    // Parse operating hours
    let hoursRecord: Record<string, string> | null = null;
    const oh = salon.operatingHours as unknown;

    if (Array.isArray(oh)) {
      const derived: Record<string, string> = {};
      oh.forEach((entry: { day?: string; open?: string; close?: string }) => {
        const day = entry?.day;
        if (!day) return;
        const open = entry.open;
        const close = entry.close;
        if (!open && !close) return;
        derived[day] = `${open ?? ''} - ${close ?? ''}`.trim();
      });
      hoursRecord = Object.keys(derived).length > 0 ? derived : null;
    } else if (oh && typeof oh === 'object') {
      hoursRecord = oh as Record<string, string>;
    }

    if (!hoursRecord || !hoursRecord[currentDayName]) {
      return {
        isOpen: false,
        status: 'Closed',
        nextAvailable: null
      };
    }

    const todayHours = hoursRecord[currentDayName];
    const [openTime, closeTime] = todayHours.split(' - ').map(time => time.trim());

    if (!openTime || !closeTime) {
      return {
        isOpen: false,
        status: 'Closed',
        nextAvailable: null
      };
    }

    // Parse time strings (assuming format like "09:00" or "9:00 AM")
    const parseTime = (timeStr: string): number => {
      const cleanTime = timeStr.replace(/\s*(AM|PM)/i, '').trim();
      const [hours, minutes] = cleanTime.split(':').map(Number);
      let hour24 = hours;
      
      // Simple AM/PM detection (you may need to adjust based on your data format)
      if (timeStr.toUpperCase().includes('PM') && hours !== 12) {
        hour24 = hours + 12;
      } else if (timeStr.toUpperCase().includes('AM') && hours === 12) {
        hour24 = 0;
      }
      
      return hour24 * 60 + (minutes || 0); // Convert to minutes since midnight
    };

    const openMinutes = parseTime(openTime);
    const closeMinutes = parseTime(closeTime);
    const currentMinutes = currentHour * 60 + now.getMinutes();

    const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

    // Calculate next available time
    let nextAvailable: string | null = null;
    if (!isOpen) {
      if (currentMinutes < openMinutes) {
        // Opens later today
        const hoursUntilOpen = Math.floor((openMinutes - currentMinutes) / 60);
        const minutesUntilOpen = (openMinutes - currentMinutes) % 60;
        if (hoursUntilOpen > 0) {
          nextAvailable = `Opens in ${hoursUntilOpen}h`;
        } else if (minutesUntilOpen > 0) {
          nextAvailable = `Opens in ${minutesUntilOpen}m`;
        } else {
          nextAvailable = `Opens at ${openTime}`;
        }
      } else {
        // Closed for today, find next open day
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        for (let i = 1; i <= 7; i++) {
          const nextDayIndex = (currentDay + i) % 7;
          const nextDayName = days[nextDayIndex];
          if (hoursRecord[nextDayName]) {
            const nextDayHours = hoursRecord[nextDayName].split(' - ')[0];
            nextAvailable = `Opens ${nextDayName} at ${nextDayHours}`;
            break;
          }
        }
        if (!nextAvailable) {
          nextAvailable = 'Closed';
        }
      }
    } else {
      // Currently open, show closing time
      const hoursUntilClose = Math.floor((closeMinutes - currentMinutes) / 60);
      const minutesUntilClose = (closeMinutes - currentMinutes) % 60;
      if (hoursUntilClose > 0) {
        nextAvailable = `Closes in ${hoursUntilClose}h ${minutesUntilClose}m`;
      } else if (minutesUntilClose > 0) {
        nextAvailable = `Closes in ${minutesUntilClose}m`;
      } else {
        nextAvailable = `Closes at ${closeTime}`;
      }
    }

    return {
      isOpen,
      status: isOpen ? 'Open now' : 'Closed',
      nextAvailable: showNextAvailable ? nextAvailable : null
    };
  }, [salon, showNextAvailable]);

  // Use salon.isAvailableNow if available, otherwise calculate
  const isOpen = salon.isAvailableNow ?? availability.isOpen;

  return (
    <div className={styles.container}>
      <div className={`${styles.indicator} ${isOpen ? styles.open : styles.closed} ${compact ? styles.compact : ''}`}>
        <span className={styles.icon}>
          {isOpen ? <FaBolt /> : <FaCircle />}
        </span>
        <span className={styles.status}>{availability.status}</span>
      </div>
      {availability.nextAvailable && !compact && (
        <div className={styles.nextAvailable}>
          <FaClock className={styles.clockIcon} />
          <span>{availability.nextAvailable}</span>
        </div>
      )}
    </div>
  );
}

