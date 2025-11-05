'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import PageNav from '@/components/PageNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import { SkeletonGroup, SkeletonCard } from '@/components/Skeleton/Skeleton';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';
import styles from './SellersPage.module.css';

interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  productCount: number;
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const fetchSellers = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    setIsLoading(true);
    try {
      const res = await fetch('/api/sellers/approved', {
        signal: controller.signal,
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch sellers');
      }

      const data: Seller[] = await res.json();
      
      if (requestId === requestIdRef.current) {
        setSellers(data);
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        logger.error('Failed to fetch sellers:', error);
        toast.error(toFriendlyMessage(error, 'Failed to load sellers. Please try again.'));
        setSellers([]);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        abortRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const getSellerInitials = (seller: Seller) => {
    const firstName = seller.firstName?.charAt(0) || '';
    const lastName = seller.lastName?.charAt(0) || '';
    return `${firstName}${lastName}`.toUpperCase() || 'S';
  };

  const getSellerName = (seller: Seller) => {
    return `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'Seller';
  };

  return (
    <div className={styles.container}>
      <PageNav />
      <h1 className={styles.title}>Sellers</h1>
      <p className={styles.subtitle}>
        Discover trusted beauty product sellers from across South Africa
      </p>

      {isLoading ? (
        <SkeletonGroup count={8} className={styles.grid}>
          {() => <SkeletonCard hasImage lines={3} />}
        </SkeletonGroup>
      ) : sellers.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No sellers found at this time.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {sellers.map((seller) => (
            <Link
              key={seller.id}
              href={`/sellers/${seller.id}`}
              className={styles.sellerCard}
            >
              <div className={styles.avatarWrapper}>
                <div className={styles.avatar}>
                  {getSellerInitials(seller)}
                </div>
              </div>
              <div className={styles.cardContent}>
                <h2 className={styles.sellerName}>{getSellerName(seller)}</h2>
                <p className={styles.sellerEmail}>{seller.email}</p>
                <div className={styles.sellerStats}>
                  <span className={styles.statValue}>{seller.productCount}</span>
                  <span className={styles.statLabel}>
                    {seller.productCount === 1 ? 'Product' : 'Products'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

