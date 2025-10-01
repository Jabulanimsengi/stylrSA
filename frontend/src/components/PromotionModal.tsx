'use client';

import { useState, FormEvent } from 'react';
import styles from './PromotionModal.module.css';
import { toast } from 'react-toastify';

interface PromotionModalProps {
  onClose: () => void;
  onSave: () => void;
  serviceId?: string;
  productId?: string;
}

export default function PromotionModal({ onClose, onSave, serviceId, productId }: PromotionModalProps) {
  const [description, setDescription] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('http://localhost:3000/api/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description,
          discountPercentage,
          startDate,
          endDate,
          serviceId,
          productId,
        }),
      });
      if (res.ok) {
        toast.success('Promotion created!');
        onSave();
      } else {
        throw new Error('Failed to create promotion.');
      }
    } catch (error) {
      toast.error('Could not create promotion.');
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
            <input type="number" value={discountPercentage} onChange={(e) => setDiscountPercentage(Number(e.target.value))} required />
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