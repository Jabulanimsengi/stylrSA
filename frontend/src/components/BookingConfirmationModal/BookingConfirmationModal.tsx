'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import styles from './BookingConfirmationModal.module.css';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  salonName: string;
  salonLogo?: string;
  message: string;
}

export default function BookingConfirmationModal({
  isOpen,
  onClose,
  onAccept,
  salonName,
  salonLogo,
  message,
}: BookingConfirmationModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Only render portal in browser environment
  if (typeof document === 'undefined') return null;

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Booking Confirmation</h2>
        </div>

        {/* Salon Info */}
        <div className={styles.salonInfo}>
          {salonLogo && (
            <div className={styles.logoWrapper}>
              <Image
                src={salonLogo}
                alt={salonName}
                width={80}
                height={80}
                className={styles.logo}
              />
            </div>
          )}
          <h3 className={styles.salonName}>{salonName}</h3>
        </div>

        {/* Message */}
        <div className={styles.messageBox}>
          <div className={styles.messageHeader}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Important Information</span>
          </div>
          <p className={styles.message}>{message}</p>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onAccept} className={styles.acceptButton}>
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );

  // Render modal using portal at document body level
  return createPortal(modalContent, document.body);
}
