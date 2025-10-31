'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'react-toastify';
import styles from './CreatePromotionModal.module.css';
import { FaTimes } from 'react-icons/fa';
import { toFriendlyMessage } from '@/lib/errors';

interface Service {
  id: string;
  title: string;
  price: number;
}

interface CreatePromotionModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreatePromotionModal({
  service,
  isOpen,
  onClose,
  onSuccess,
}: CreatePromotionModalProps) {
  const [discountPercentage, setDiscountPercentage] = useState<number>(10);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const promotionalPrice = service.price * (1 - discountPercentage / 100);
  const savingsAmount = service.price - promotionalPrice;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const now = new Date();
      // Add 2 minutes buffer to ensure startDate is always in the future (avoids latency issues)
      const startDate = new Date(now.getTime() + 2 * 60 * 1000).toISOString();
      const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

      const response = await fetch('/api/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          serviceId: service.id,
          discountPercentage,
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create promotion' }));
        throw new Error(errorData.message || 'Failed to create promotion');
      }

      // Enhanced toast notification with clear messaging
      toast.success(
        `🎉 Promotion created successfully!\n⏳ Your promotion is pending admin approval and will be active once approved.`,
        { autoClose: 5000 }
      );
      
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(toFriendlyMessage(error, 'Failed to create promotion'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton}>
          <FaTimes />
        </button>

        <h2 className={styles.title}>Create Promotion</h2>
        <p className={styles.serviceName}>{service.title}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.pricePreview}>
            <div className={styles.priceRow}>
              <span className={styles.label}>Original Price:</span>
              <span className={styles.originalPrice}>R{service.price.toFixed(2)}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.label}>Promotional Price:</span>
              <span className={styles.promotionalPrice}>R{promotionalPrice.toFixed(2)}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.label}>You Save:</span>
              <span className={styles.savings}>R{savingsAmount.toFixed(2)} ({discountPercentage}%)</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="discountPercentage" className={styles.inputLabel}>
              Discount Percentage: {discountPercentage}%
            </label>
            <input
              id="discountPercentage"
              type="range"
              min="5"
              max="90"
              step="5"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>5%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>90%</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="durationDays" className={styles.inputLabel}>
              Promotion Duration
            </label>
            <select
              id="durationDays"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className={styles.select}
              required
            >
              <option value={1}>1 Day</option>
              <option value={3}>3 Days</option>
              <option value={7}>7 Days (1 Week)</option>
              <option value={14}>14 Days (2 Weeks)</option>
              <option value={21}>21 Days (3 Weeks)</option>
              <option value={30}>30 Days (1 Month)</option>
              <option value={60}>60 Days (2 Months)</option>
              <option value={90}>90 Days (3 Months)</option>
            </select>
          </div>

          <div className={styles.infoBox}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
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
            <div>
              <p>Your promotion will be reviewed by an admin before going live.</p>
              <p>Once approved, it will be visible on the Promotions page.</p>
              <p>The promotion will automatically expire after {durationDays} day{durationDays > 1 ? 's' : ''}.</p>
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
