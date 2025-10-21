'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './ReviewsTab.module.css';
import { Review } from '@/types';

interface ReviewsData {
  pending: Review[];
  approved: Review[];
  needsResponse: Review[];
}

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<ReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [view, setView] = useState<'needsResponse' | 'approved' | 'pending'>('needsResponse');

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reviews/my-salon-reviews', {
        credentials: 'include',
      });
      
      if (!res.ok) {
        if (res.status === 404) {
          // No salon found - salon owner hasn't created salon yet
          setReviews({ pending: [], approved: [], needsResponse: [] });
          return;
        }
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await res.json();
      // Ensure data has the correct structure
      setReviews({
        pending: data.pending || [],
        approved: data.approved || [],
        needsResponse: data.needsResponse || [],
      });
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
      // Set empty reviews so UI doesn't crash
      setReviews({ pending: [], approved: [], needsResponse: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ response: responseText }),
      });

      if (!res.ok) throw new Error('Failed to submit response');

      toast.success('Response submitted successfully!');
      setRespondingTo(null);
      setResponseText('');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to submit response');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>⚠️ Error Loading Reviews</h3>
          <p>{error}</p>
          <button onClick={fetchReviews} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!reviews || (reviews.pending.length === 0 && reviews.approved.length === 0 && reviews.needsResponse.length === 0)) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <h3>No Reviews Yet</h3>
          <p>You haven't received any reviews for your salon yet.</p>
          <p className={styles.emptyHint}>
            Reviews will appear here once customers complete their bookings and leave feedback.
          </p>
        </div>
      </div>
    );
  }

  const currentReviews = reviews[view];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Reviews</h2>
        <div className={styles.stats}>
          <span className={styles.statItem}>
            Needs Response: <strong>{reviews.needsResponse.length}</strong>
          </span>
          <span className={styles.statItem}>
            Pending Approval: <strong>{reviews.pending.length}</strong>
          </span>
          <span className={styles.statItem}>
            Total Approved: <strong>{reviews.approved.length}</strong>
          </span>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          onClick={() => setView('needsResponse')}
          className={`${styles.tabButton} ${view === 'needsResponse' ? styles.activeTab : ''}`}
        >
          Needs Response ({reviews.needsResponse.length})
        </button>
        <button
          onClick={() => setView('approved')}
          className={`${styles.tabButton} ${view === 'approved' ? styles.activeTab : ''}`}
        >
          All Approved ({reviews.approved.length})
        </button>
        <button
          onClick={() => setView('pending')}
          className={`${styles.tabButton} ${view === 'pending' ? styles.activeTab : ''}`}
        >
          Pending Approval ({reviews.pending.length})
        </button>
      </div>

      <div className={styles.reviewsList}>
        {currentReviews.length === 0 ? (
          <div className={styles.empty}>
            {view === 'needsResponse' && 'All reviews have been responded to!'}
            {view === 'pending' && 'No reviews pending approval.'}
            {view === 'approved' && 'No approved reviews yet.'}
          </div>
        ) : (
          currentReviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.authorInfo}>
                  <strong>
                    {review.author.firstName} {review.author.lastName.charAt(0)}.
                  </strong>
                  {review.booking && (
                    <span className={styles.service}>
                      for {review.booking.service.title}
                    </span>
                  )}
                </div>
                <div className={styles.rating}>
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
              </div>

              <p className={styles.comment}>{review.comment}</p>

              {review.salonOwnerResponse && (
                <div className={styles.response}>
                  <strong>Your Response:</strong>
                  <p>{review.salonOwnerResponse}</p>
                  <span className={styles.responseDate}>
                    Responded on{' '}
                    {new Date(review.salonOwnerRespondedAt!).toLocaleDateString()}
                  </span>
                </div>
              )}

              {!review.salonOwnerResponse && view === 'needsResponse' && (
                <>
                  {respondingTo === review.id ? (
                    <div className={styles.responseForm}>
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write your response to this review..."
                        className={styles.textarea}
                        rows={4}
                      />
                      <div className={styles.responseActions}>
                        <button
                          onClick={() => setRespondingTo(null)}
                          className={styles.cancelButton}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRespond(review.id)}
                          className={styles.submitButton}
                        >
                          Submit Response
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRespondingTo(review.id)}
                      className={styles.respondButton}
                    >
                      Respond to this review
                    </button>
                  )}
                </>
              )}

              <div className={styles.reviewFooter}>
                <span className={styles.date}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                {review.approvalStatus && (
                  <span className={`${styles.status} ${styles[review.approvalStatus.toLowerCase()]}`}>
                    {review.approvalStatus}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
