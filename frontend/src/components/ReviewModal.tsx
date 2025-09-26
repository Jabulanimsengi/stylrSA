// frontend/src/components/ReviewModal.tsx
'use client';

import { useState, FormEvent } from 'react';
import styles from './ReviewModal.module.css';

interface ReviewModalProps {
  bookingId: string;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export default function ReviewModal({ bookingId, onClose, onReviewSubmitted }: ReviewModalProps) {
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

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId, rating, comment }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to submit review.');
      }
      onReviewSubmitted();
    } catch (err: any) {
      setError(err.message);
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