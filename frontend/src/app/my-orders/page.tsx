'use client';

import { useEffect, useState } from 'react';
import { ProductOrder } from '@/types';
import styles from './MyOrders.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { Skeleton, SkeletonGroup } from '@/components/Skeleton/Skeleton';

export default function MyOrdersPage() {
  const { authStatus } = useAuth();
  const { openModal } = useAuthModal();
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      openModal('login');
      return;
    }
    if (authStatus !== 'authenticated') return;

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/product-orders/buyer', {
          credentials: 'include',
        });
        if (res.ok) {
          setOrders(await res.json());
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [authStatus, openModal]);

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>My Orders</h1>
        <SkeletonGroup count={3} className={styles.list}>
          {() => (
            <div className={styles.orderCard} aria-hidden>
              <div className={styles.orderHeader}>
                <div className={styles.orderImage}>
                  <Skeleton style={{ width: '100%', height: '100%' }} />
                </div>
                <div className={styles.orderInfo}>
                  <Skeleton variant="text" style={{ width: '70%' }} />
                  <div className={styles.orderMeta}>
                    <Skeleton variant="text" style={{ width: '40%' }} />
                    <Skeleton variant="text" style={{ width: '35%' }} />
                    <Skeleton variant="text" style={{ width: '30%' }} />
                  </div>
                </div>
              </div>
              <div className={styles.orderFooter}>
                <Skeleton variant="text" style={{ width: '45%' }} />
                <Skeleton variant="text" style={{ width: '40%' }} />
                <Skeleton variant="text" style={{ width: '30%' }} />
                <Skeleton variant="text" style={{ width: '80%' }} />
              </div>
            </div>
          )}
        </SkeletonGroup>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Orders</h1>
      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No orders yet</h2>
          <p>Browse the product marketplace to discover new items.</p>
          <Link href="/products" className="btn btn-primary">
            Explore products
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderImage}>
                  <Image
                    src={order.product.images[0] || 'https://via.placeholder.com/120x120'}
                    alt={order.product.name}
                    fill
                    sizes="120px"
                  />
                </div>
                <div className={styles.orderInfo}>
                  <h3>{order.product.name}</h3>
                  <div className={styles.orderMeta}>
                    <span>Quantity: {order.quantity}</span>
                    <span>Total: R{order.totalPrice.toFixed(2)}</span>
                    <span className={styles.status}>{order.status}</span>
                  </div>
                </div>
              </div>
              <div className={styles.orderFooter}>
                <div>
                  <span className={styles.metaLabel}>Seller:</span>{' '}
                  {order.seller ? (
                    <Link href={`/sellers/${order.sellerId}`} className={styles.sellerLink}>
                      {`${order.seller.firstName ?? ''} ${order.seller.lastName ?? ''}`.trim() || 'View profile'}
                    </Link>
                  ) : (
                    'Unavailable'
                  )}
                </div>
                {order.deliveryMethod && (
                  <div>
                    <span className={styles.metaLabel}>Delivery:</span> {order.deliveryMethod}
                  </div>
                )}
                {order.contactPhone && (
                  <div>
                    <span className={styles.metaLabel}>Contact:</span> {order.contactPhone}
                  </div>
                )}
                {order.notes && <p className={styles.notes}>{order.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
