'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import styles from './AdminPage.module.css';
import { Salon, Service, ApprovalStatus } from '@/types';
import Spinner from '@/components/Spinner'; // Import the Spinner

interface DecodedToken { role: string; }

// Define more specific types for the data we fetch
type PendingSalon = Salon & { owner: { email: string } };
type PendingService = Service & { salon: { name: string } };

export default function AdminPage() {
  const [pendingSalons, setPendingSalons] = useState<PendingSalon[]>([]);
  const [pendingServices, setPendingServices] = useState<PendingService[]>([]);
  const [view, setView] = useState<'salons' | 'services'>('salons');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      if (decodedToken.role !== 'ADMIN') {
        router.push('/'); // Redirect non-admins
        return;
      }
    } catch (e) {
      router.push('/login'); // Invalid token
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [salonsRes, servicesRes] = await Promise.all([
        fetch('http://localhost:3000/api/admin/salons/pending', { headers }),
        fetch('http://localhost:3000/api/admin/services/pending', { headers }),
      ]);
      setPendingSalons(await salonsRes.json());
      setPendingServices(await servicesRes.json());
      setIsLoading(false);
    };
    fetchData();
  }, [router]);

  const handleUpdateStatus = async (type: 'salon' | 'service', id: string, status: ApprovalStatus) => {
    const token = localStorage.getItem('access_token');
    const url = type === 'salon'
      ? `http://localhost:3000/api/admin/salons/${id}/status`
      : `http://localhost:3000/api/admin/services/${id}/status`;

    await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ approvalStatus: status }),
    });

    if (type === 'salon') {
      setPendingSalons(pendingSalons.filter(s => s.id !== id));
    } else {
      setPendingServices(pendingServices.filter(s => s.id !== id));
    }
  };

  if (isLoading) return <Spinner />;

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
          onClick={() => setView('services')}
          className={`${styles.tabButton} ${view === 'services' ? styles.activeTab : ''}`}
        >
          Pending Services ({pendingServices.length})
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
              <button onClick={() => handleUpdateStatus('salon', salon.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
              <button onClick={() => handleUpdateStatus('salon', salon.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
            </div>
          </div>
        )) : <p>No pending salons.</p>
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
      </div>
    </div>
  );
}