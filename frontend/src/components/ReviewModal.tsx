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
  existingReview?: Review | null;
}

export default function ReviewModal({ bookingId, onClose, onReviewAdded, existingReview }: ReviewModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = Boolean(existingReview);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a comment for your review.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const newReview = await apiJson(
        isEditing ? `/api/reviews/${existingReview.id}` : '/api/reviews',
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, rating, comment: comment.trim() }),
        }
      );
      
      if (isEditing) {
        toast.success('Your review has been updated and is awaiting admin approval.');
      } else {
        toast.success('Review submitted successfully! Your review is awaiting admin approval and will be visible once approved.');
      }
      
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
        <h2 className={styles.title}>{isEditing ? 'Edit Your Review' : 'Leave a Review'}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>Your Rating</label>
            <div className={styles.starRating} onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className={`${styles.star} ${(hoverRating || rating) >= star ? styles.starActive : ''}`}
                  onClick={() => setRating(star)} 
                  onMouseEnter={() => setHoverRating(star)}
                >
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
              {isLoading ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Review' : 'Submit Review')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}