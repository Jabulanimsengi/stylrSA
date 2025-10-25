'use client';

import { useState, useEffect } from 'react';
import styles from './MyVideos.module.css';
import { toast } from 'react-toastify';

interface ServiceVideo {
  id: string;
  videoUrl: string;
  vimeoId: string;
  thumbnailUrl?: string;
  duration: number;
  caption?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  views: number;
  createdAt: string;
  salon: { id: string; name: string; planCode?: string };
  service?: { id: string; title: string };
}

export default function MyVideos() {
  const [videos, setVideos] = useState<ServiceVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos/my-videos', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      } else {
        const errorData = await res.json().catch(() => null);
        const errorMsg = errorData?.message || `Failed to load videos (${res.status})`;
        console.error('Failed to load videos:', res.status, errorData);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      toast.error('Network error: Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video? This will also delete it from Vimeo.')) {
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Video deleted successfully');
        setVideos(videos.filter((v) => v.id !== id));
      } else {
        toast.error('Failed to delete video');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete video');
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
        <div className={styles.loading}>Loading your videos...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🎬</div>
          <h3 className={styles.emptyTitle}>No Videos Yet</h3>
          <p className={styles.emptyText}>
            Upload your first service video to showcase your skills in action!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>My Service Videos</h3>
        <p className={styles.subtitle}>Manage your video showcase</p>
      </div>

      <div className={styles.grid}>
        {videos.map((video) => {
          const statusBadge = getStatusBadge(video.approvalStatus);
          const vimeoEmbedUrl = `https://player.vimeo.com/video/${video.vimeoId}`;

          return (
            <div key={video.id} className={styles.card}>
              <div className={styles.videoWrapper}>
                {video.thumbnailUrl ? (
                  <div className={styles.thumbnail}>
                    <img src={video.thumbnailUrl} alt="Video thumbnail" className={styles.thumbnailImage} />
                    <a 
                      href={video.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.playButton}
                    >
                      ▶
                    </a>
                    <div className={styles.duration}>{video.duration}s</div>
                  </div>
                ) : (
                  <iframe
                    src={vimeoEmbedUrl}
                    className={styles.videoIframe}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={video.caption || 'Service video'}
                  />
                )}
              </div>

              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <span className={`${styles.statusBadge} ${statusBadge.className}`}>
                    {statusBadge.text}
                  </span>
                  <button
                    onClick={() => handleDelete(video.id)}
                    disabled={deletingId === video.id}
                    className={styles.deleteButton}
                    aria-label="Delete video"
                  >
                    {deletingId === video.id ? '...' : '🗑️'}
                  </button>
                </div>

                {video.service && (
                  <p className={styles.service}>{video.service.title}</p>
                )}

                {video.caption && (
                  <p className={styles.caption}>{video.caption}</p>
                )}

                <div className={styles.stats}>
                  <span className={styles.stat}>
                    👁 {video.views.toLocaleString()} views
                  </span>
                  <span className={styles.stat}>
                    ⏱ {video.duration}s
                  </span>
                </div>

                <p className={styles.date}>
                  Uploaded {new Date(video.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
