// frontend/srcs/components/PromotionModal.tsx

'use client';

import { useState, FormEvent } from 'react';
import styles from './PromotionModal.module.css';
import { toast } from 'react-toastify';
import { Promotion } from '@/types'; // Import the Promotion type

interface PromotionModalProps {
  onClose: () => void;
  onPromotionAdded: (promotion: Promotion) => void; // FIX: Changed prop name and added type
  salonId: string; // FIX: Added salonId to props
  serviceId?: string;
  productId?: string;
}

export default function PromotionModal({ onClose, onPromotionAdded, salonId, serviceId, productId }: PromotionModalProps) {
  const [description, setDescription] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // FIX: Use relative URL
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Use credentials for auth
        body: JSON.stringify({
          description,
          discountPercentage: Number(discountPercentage),
          startDate,
          endDate,
          salonId, // Pass salonId to the API
          serviceId,
          productId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Promotion created!');
        onPromotionAdded(data); // FIX: Pass the new promotion data back
        onClose(); // Close the modal on success
      } else {
        throw new Error(data.message || 'Failed to create promotion.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Could not create promotion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Create Promotion</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Discount (%)</label>
            <input type="number" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} required min="1" max="100" />
          </div>
          <div className={styles.inputGroup}>
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label>End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}