'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminPage.module.css';
import { Salon, Service, ApprovalStatus, Review, Product } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth'; // Import the useAuth hook

type PendingSalon = Salon & { owner: { id: string; email: string } };
type PendingService = Service & { salon: { name: string } };
type PendingReview = Review & { author: { firstName: string }, salon: { name: string } };
type PendingProduct = Product & { seller: { firstName: string, lastName: string } };

export default function AdminPage() {
  const { authStatus, user } = useAuth(); // Use the hook to get auth status and user info
  const [pendingSalons, setPendingSalons] = useState<PendingSalon[]>([]);
  const [allSalons, setAllSalons] = useState<PendingSalon[]>([]);
  const [pendingServices, setPendingServices] = useState<PendingService[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [view, setView] = useState<'salons' | 'services' | 'reviews' | 'all-salons' | 'products'>('salons');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Wait for the auth status to be determined
    if (authStatus === 'loading') {
      return; 
    }
    // If not authenticated or not an admin, redirect
    if (authStatus !== 'authenticated' || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      // Use credentials: 'include' to automatically send the auth cookie
      const requestOptions = { credentials: 'include' as const };
      
      try {
        const [pendingSalonsRes, allSalonsRes, servicesRes, reviewsRes, productsRes] = await Promise.all([
          fetch('http://localhost:3000/api/admin/salons/pending', requestOptions),
          fetch('http://localhost:3000/api/admin/salons/all', requestOptions),
          fetch('http://localhost:3000/api/admin/services/pending', requestOptions),
          fetch('http://localhost:3000/api/admin/reviews/pending', requestOptions),
          fetch('http://localhost:3000/api/admin/products/pending', requestOptions),
        ]);

        // Check for unauthorized responses which would indicate an invalid session
        if ([pendingSalonsRes, allSalonsRes, servicesRes, reviewsRes, productsRes].some(res => res.status === 401)) {
            router.push('/login');
            return;
        }

        setPendingSalons(await pendingSalonsRes.json());
        setAllSalons(await allSalonsRes.json());
        setPendingServices(await servicesRes.json());
        setPendingReviews(await reviewsRes.json());
        setPendingProducts(await productsRes.json());
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [authStatus, user, router]);

  const handleUpdateStatus = async (type: 'salon' | 'service' | 'review' | 'product', id: string, status: ApprovalStatus) => {
    if (authStatus !== 'authenticated') {
        router.push('/login');
        return;
    }

    let url = '';
    switch (type) {
      case 'salon': url = `http://localhost:3000/api/admin/salons/${id}/status`; break;
      case 'service': url = `http://localhost:3000/api/admin/services/${id}/status`; break;
      case 'review': url = `http://localhost:3000/api/admin/reviews/${id}/status`; break;
      case 'product': url = `http://localhost:3000/api/admin/products/${id}/status`; break;
    }

    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Send cookies with the request
      body: JSON.stringify({ approvalStatus: status }),
    });

    if (type === 'salon') setPendingSalons(pendingSalons.filter(s => s.id !== id));
    if (type === 'service') setPendingServices(pendingServices.filter(s => s.id !== id));
    if (type === 'review') setPendingReviews(pendingReviews.filter(r => r.id !== id));
    if (type === 'product') setPendingProducts(pendingProducts.filter(p => p.id !== id));
  };

  if (isLoading || authStatus === 'loading') return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      <div className={styles.tabs}>
        <button
          onClick={() => setView('salons')}
          className={`${styles.tabButton} ${view === 'salons' ? styles.activeTab : ''}`}
        >
          Pending Salons ({pendingSalons.length})
        </button>
        <button
          onClick={() => setView('all-salons')}
          className={`${styles.tabButton} ${view === 'all-salons' ? styles.activeTab : ''}`}
        >
          All Salons ({allSalons.length})
        </button>
        <button
          onClick={() => setView('services')}
          className={`${styles.tabButton} ${view === 'services' ? styles.activeTab : ''}`}
        >
          Pending Services ({pendingServices.length})
        </button>
        <button
          onClick={() => setView('reviews')}
          className={`${styles.tabButton} ${view === 'reviews' ? styles.activeTab : ''}`}
        >
          Pending Reviews ({pendingReviews.length})
        </button>
        <button
          onClick={() => setView('products')}
          className={`${styles.tabButton} ${view === 'products' ? styles.activeTab : ''}`}
        >
          Pending Products ({pendingProducts.length})
        </button>
      </div>

      <div className={styles.list}>
        {view === 'salons' && (
          pendingSalons.length > 0 ? pendingSalons.map(salon => (
            <div key={salon.id} className={styles.listItem}>
              <div className={styles.info}>
                <h4>{salon.name}</h4>
                <p>Owner: {salon.owner.email}</p>
              </div>
              <div className={styles.actions}>
                <Link href={`/dashboard?ownerId=${salon.owner.id}`} className="btn btn-secondary">View Dashboard</Link>
                <button onClick={() => handleUpdateStatus('salon', salon.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                <button onClick={() => handleUpdateStatus('salon', salon.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
              </div>
            </div>
          )) : <p>No pending salons.</p>
        )}
        
        {view === 'all-salons' && (
          allSalons.length > 0 ? allSalons.map(salon => (
            <div key={salon.id} className={styles.listItem}>
              <div className={styles.info}>
                <h4>{salon.name}</h4>
                <p>Owner: {salon.owner.email} | Status: {salon.approvalStatus}</p>
              </div>
              <div className={styles.actions}>
                <Link href={`/dashboard?ownerId=${salon.owner.id}`} className="btn btn-secondary">View Dashboard</Link>
              </div>
            </div>
          )) : <p>No salons found.</p>
        )}

        {view === 'services' && (
          pendingServices.length > 0 ? pendingServices.map(service => (
            <div key={service.id} className={styles.listItem}>
              <div className={styles.info}>
                <h4>{service.title}</h4>
                <p>Salon: {service.salon.name}</p>
              </div>
              <div className={styles.actions}>
                <button onClick={() => handleUpdateStatus('service', service.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                <button onClick={() => handleUpdateStatus('service', service.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
              </div>
            </div>
          )) : <p>No pending services.</p>
        )}

        {view === 'reviews' && (
          pendingReviews.length > 0 ? pendingReviews.map(review => (
            <div key={review.id} className={styles.listItem}>
              <div className={styles.info}>
                <h4>"{review.comment}" ({review.rating} ★)</h4>
                <p>By: {review.author.firstName} | For Salon: {review.salon.name}</p>
              </div>
              <div className={styles.actions}>
                <button onClick={() => handleUpdateStatus('review', review.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                <button onClick={() => handleUpdateStatus('review', review.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
              </div>
            </div>
          )) : <p>No pending reviews.</p>
        )}
        
        {view === 'products' && (
          pendingProducts.length > 0 ? pendingProducts.map(product => (
            <div key={product.id} className={styles.listItem}>
              <div className={styles.info}>
                <h4>{product.name}</h4>
                <p>Seller: {product.seller.firstName} {product.seller.lastName}</p>
              </div>
              <div className={styles.actions}>
                <button onClick={() => handleUpdateStatus('product', product.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                <button onClick={() => handleUpdateStatus('product', product.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
              </div>
            </div>
          )) : <p>No pending products.</p>
        )}
      </div>
    </div>
  );
}