'use client';

import React, { useState, useEffect, use } from 'react';
import type { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaHeart, FaEye, FaArrowLeft, FaMapMarkerAlt, FaShare, FaStar, FaPhone, FaWhatsapp } from 'react-icons/fa';
import { Trend, Salon } from '@/types';
import { transformCloudinary } from '@/utils/cloudinary';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '@/components/LoadingSpinner';
import ImageLightbox from '@/components/ImageLightbox';
import styles from './TrendDetailPage.module.css';
import PageNav from '@/components/PageNav';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getImageWithFallback } from '@/lib/placeholders';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TrendDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [trend, setTrend] = useState<Trend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [recommendedSalons, setRecommendedSalons] = useState<any[]>([]);
  const [salonsLoading, setSalonsLoading] = useState(false);
  const [showSalons, setShowSalons] = useState(false);
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();
  const { coordinates } = useGeolocation(false);

  useEffect(() => {
    fetchTrend();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (trend && showSalons) {
      fetchRecommendedSalons();
    }
  }, [trend, showSalons, coordinates]);

  const fetchTrend = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trends/${resolvedParams.id}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setTrend(data);
        setIsLiked(data.isLiked || false);
        setLikeCount(data.likeCount);
      } else {
        toast.error('Trend not found');
        router.push('/');
      }
    } catch (error) {
      toast.error('Failed to load trend');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (authStatus !== 'authenticated') {
      toast.info('Please log in to like trends');
      openModal('login');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    const previousState = isLiked;
    const previousCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      const endpoint = isLiked
        ? `/api/trends/${resolvedParams.id}/unlike`
        : `/api/trends/${resolvedParams.id}/like`;

      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to update like status');
      }
    } catch (error) {
      // Revert on error
      setIsLiked(previousState);
      setLikeCount(previousCount);
      toast.error('Failed to update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const fetchRecommendedSalons = async () => {
    if (!trend) return;
    
    setSalonsLoading(true);
    try {
      let url = `/api/trends/${resolvedParams.id}/salons`;
      
      if (coordinates) {
        url += `?lat=${coordinates.latitude}&lon=${coordinates.longitude}`;
      }

      const res = await fetch(url, { credentials: 'include' });

      if (res.ok) {
        const data = await res.json();
        setRecommendedSalons(data);
      }
    } catch (error) {
      console.error('Failed to fetch salons:', error);
    } finally {
      setSalonsLoading(false);
    }
  };

  const handleFindSalons = async () => {
    // Track click-through
    try {
      await fetch(`/api/trends/${resolvedParams.id}/click`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to track click');
    }

    // Show salons section
    setShowSalons(true);
    
    // Scroll to salons section
    setTimeout(() => {
      const salonsSection = document.getElementById('recommended-salons');
      salonsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSalonClick = async (salonId: string) => {
    // Track salon click
    try {
      await fetch(`/api/trends/${resolvedParams.id}/salons/${salonId}/click`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to track salon click');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out this trending style: ${trend?.title}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: trend?.title, text, url });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!trend) {
    return null;
  }

  const categoryLabel = trend.category.replace(/_/g, ' ');
  const ageGroupLabels = trend.ageGroups.map((ag) => ag.replace(/_/g, ' ')).join(', ');

  return (
    <div className={styles.container}>
      <PageNav />

      <button onClick={() => router.back()} className={styles.backButton}>
        <FaArrowLeft /> Back
      </button>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            <Image
              src={transformCloudinary(trend.images[0], {
                width: 800,
                quality: 'auto',
                format: 'auto',
              })}
              alt={trend.title}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
              onClick={() => openLightbox(0)}
              style={{ cursor: 'pointer' }}
            />
          </div>

          {trend.images.length > 1 && (
            <div className={styles.thumbnailGrid}>
              {trend.images.slice(1, 5).map((img, index) => (
                <div
                  key={index}
                  className={styles.thumbnail}
                  onClick={() => openLightbox(index + 1)}
                >
                  <Image
                    src={transformCloudinary(img, {
                      width: 200,
                      height: 250,
                      crop: 'fill',
                    })}
                    alt={`${trend.title} ${index + 2}`}
                    fill
                    className={styles.thumbnailImage}
                    sizes="150px"
                  />
                  {index === 3 && trend.images.length > 5 && (
                    <div className={styles.moreOverlay}>
                      +{trend.images.length - 5} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.header}>
            <div>
              <p className={styles.category}>{categoryLabel}</p>
              <h1 className={styles.title}>{trend.title}</h1>
              {trend.styleName && (
                <p className={styles.styleName}>{trend.styleName}</p>
              )}
            </div>

            <div className={styles.actions}>
              <button
                onClick={handleLike}
                className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                disabled={isLiking}
              >
                <FaHeart /> {likeCount.toLocaleString()}
              </button>
              <button onClick={handleShare} className={styles.shareButton}>
                <FaShare />
              </button>
            </div>
          </div>

          <div className={styles.stats}>
            <span>
              <FaEye /> {trend.viewCount.toLocaleString()} views
            </span>
            <span>Age Groups: {ageGroupLabels}</span>
          </div>

          <div className={styles.description}>
            <h3>About This Style</h3>
            <p>{trend.description}</p>
          </div>

          {trend.tags.length > 0 && (
            <div className={styles.tags}>
              {trend.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <button onClick={handleFindSalons} className={styles.findSalonsButton}>
            <FaMapMarkerAlt /> Find Salons Offering This Style
          </button>
        </div>
      </div>

      {showSalons && (
        <div id="recommended-salons" className={styles.salonsSection}>
          <h2 className={styles.salonsTitle}>
            Salons Offering This Style {coordinates && '(Near You)'}
          </h2>

          {salonsLoading ? (
            <LoadingSpinner />
          ) : recommendedSalons.length === 0 ? (
            <div className={styles.noSalons}>
              <p>No salons found in your area offering this style yet.</p>
              <p>Try broadening your search or check back later!</p>
            </div>
          ) : (
            <div className={styles.salonsGrid}>
              {recommendedSalons.map((salon: any) => (
                <Link
                  key={salon.id}
                  href={`/salons/${salon.id}`}
                  className={styles.salonCard}
                  onClick={() => handleSalonClick(salon.id)}
                >
                  <div className={styles.salonImage}>
                    <Image
                      src={transformCloudinary(getImageWithFallback(salon.backgroundImage, 'wide'), {
                        width: 400,
                        height: 300,
                        crop: 'fill',
                      })}
                      alt={salon.name}
                      fill
                      className={styles.image}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {salon.isPremium && (
                      <div className={styles.premiumBadge}>Featured</div>
                    )}
                  </div>

                  <div className={styles.salonInfo}>
                    <h3>{salon.name}</h3>
                    <p className={styles.location}>
                      <FaMapMarkerAlt /> {salon.city}, {salon.province}
                      {salon.distance && ` • ${salon.distance.toFixed(1)}km away`}
                    </p>

                    {salon.avgRating > 0 && (
                      <div className={styles.rating}>
                        <FaStar /> {salon.avgRating.toFixed(1)} ({salon.reviewCount} reviews)
                      </div>
                    )}

                    {salon.services && salon.services.length > 0 && (
                      <div className={styles.services}>
                        <p className={styles.servicesLabel}>Related Services:</p>
                        {salon.services.slice(0, 2).map((service: any) => (
                          <span key={service.id} className={styles.serviceTag}>
                            {service.title} - R{service.price}
                          </span>
                        ))}
                        {salon.services.length > 2 && (
                          <span className={styles.moreServices}>
                            +{salon.services.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className={styles.salonActions}>
                      {salon.phoneNumber && (
                        <span className={styles.contactIcon}>
                          <FaPhone />
                        </span>
                      )}
                      {salon.whatsapp && (
                        <span className={styles.contactIcon}>
                          <FaWhatsapp />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {lightboxOpen && (
        <ImageLightbox
          images={trend.images}
          initialImageIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
