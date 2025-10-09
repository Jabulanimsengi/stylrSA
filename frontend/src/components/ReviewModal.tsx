// frontend/src/components/ReviewModal.tsx
'use client';

import { useState, FormEvent } from 'react';
import { Review } from '@/types';
import styles from './ReviewModal.module.css';
import { toast } from 'react-toastify';
import { apiJson } from '@/lib/api';
import { toFriendlyMessage } from '@/lib/errors';

interface ReviewModalProps {
  bookingId: string;
  onClose: () => void;
  onReviewAdded: (newReview: Review) => void;
}

export default function ReviewModal({ bookingId, onClose, onReviewAdded }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const newReview = await apiJson('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, rating, comment }),
      });
      toast.success('Thank you for your review!');
      onReviewAdded(newReview);
      onClose();
    } catch (err: any) {
      const msg = toFriendlyMessage(err, 'Failed to submit review.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>Leave a Review</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>Your Rating</label>
            <div className={styles.starRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={`${styles.star} ${rating >= star ? styles.starActive : ''}`}
                  onClick={() => setRating(star)} onMouseOver={() => setRating(star)}>
                  ★
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className={styles.label}>Your Comments</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} required className={styles.textarea} />
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <div className={styles.buttonContainer}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}