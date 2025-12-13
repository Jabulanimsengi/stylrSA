'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './LiveBookingCounter.module.css';

interface LiveBookingCounterProps {
    initialCount?: number;
    label?: string;
}

export default function LiveBookingCounter({
    initialCount = 2847593,
    label = 'appointments booked today'
}: LiveBookingCounterProps) {
    const [count, setCount] = useState(initialCount);
    const [isAnimating, setIsAnimating] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Simulate real-time booking updates
        intervalRef.current = setInterval(() => {
            const increment = Math.floor(Math.random() * 3) + 1; // Random 1-3
            setCount(prev => prev + increment);
            setIsAnimating(true);

            // Reset animation
            setTimeout(() => setIsAnimating(false), 300);
        }, 3000 + Math.random() * 2000); // Random 3-5 seconds

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Format number with commas
    const formattedCount = count.toLocaleString('en-US');

    return (
        <div className={styles.counterContainer}>
            <span className={`${styles.counterNumber} ${isAnimating ? styles.pulse : ''}`}>
                {formattedCount}
            </span>
            <span className={styles.counterLabel}>{label}</span>
        </div>
    );
}
