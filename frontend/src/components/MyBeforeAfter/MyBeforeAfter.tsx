'use client';

import { useState, useEffect } from 'react';
import styles from './MyBeforeAfter.module.css';
import { toast } from 'react-toastify';
import Image from 'next/image';
import ReactCompareImage from 'react-compare-image';

interface BeforeAfterPhoto {
  id: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  caption?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  salon: { id: string; name: string };
  service?: { id: string; title: string };
}

export default function MyBeforeAfter() {
  const [photos, setPhotos] = useState<BeforeAfterPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/before-after/my-photos', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      } else {
        const errorData = await res.json().catch(() => null);
        const errorMsg = errorData?.message || `Failed to load photos (${res.status})`;
        console.error('Failed to load photos:', res.status, errorData);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
      toast.error('Network error: Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this before/after photo?')) {
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(`/api/before-after/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Photo deleted successfully');
        setPhotos(photos.filter((p) => p.id !== id));
      } else {
        toast.error('Failed to delete photo');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete photo');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string }> = {
      PENDING: { text: 'Pending Approval', className: styles.statusPending },
      APPROVED: { text: 'Approved', className: styles.statusApproved },
      REJECTED: { text: 'Rejected', className: styles.statusRejected },
    };
    return badges[status] || badges.PENDING;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your before/after photos...</div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📷</div>
          <h3 className={styles.emptyTitle}>No Before/After Photos Yet</h3>
          <p className={styles.emptyText}>
            Upload your first transformation photos to showcase your amazing work!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>My Before & After Photos</h3>
        <p className={styles.subtitle}>Manage your transformation showcase</p>
      </div>

      <div className={styles.grid}>
        {photos.map((photo) => {
          const statusBadge = getStatusBadge(photo.approvalStatus);
          return (
            <div key={photo.id} className={styles.card}>
              <div className={styles.comparisonWrapper}>
                <ReactCompareImage
                  leftImage={photo.beforeImageUrl}
                  rightImage={photo.afterImageUrl}
                  sliderLineWidth={2}
                  sliderLineColor="#F51957"
                  leftImageLabel="Before"
                  rightImageLabel="After"
                />
              </div>

              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <span className={`${styles.statusBadge} ${statusBadge.className}`}>
                    {statusBadge.text}
                  </span>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    disabled={deletingId === photo.id}
                    className={styles.deleteButton}
                    aria-label="Delete photo"
                  >
                    {deletingId === photo.id ? '...' : '🗑️'}
                  </button>
                </div>

                {photo.service && (
                  <p className={styles.service}>{photo.service.title}</p>
                )}

                {photo.caption && (
                  <p className={styles.caption}>{photo.caption}</p>
                )}

                <p className={styles.date}>
                  Uploaded {new Date(photo.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
