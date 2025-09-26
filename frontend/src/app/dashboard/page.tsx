'use client';

import { useEffect, useState } from 'react';
import { Salon, Service, ApprovalStatus } from '@/types';
import { useRouter } from 'next/navigation';
import styles from './Dashboard.module.css';
import ServiceFormModal from '@/components/ServiceFormModal';

export default function DashboardPage() {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchDashboardData() {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const salonRes = await fetch('http://localhost:3000/api/salons/mine', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (salonRes.status === 401) {
          router.push('/login');
          return;
        }
        if (!salonRes.ok) throw new Error('Could not fetch your salon data. Have you created a salon profile?');
        
        const salonData: Salon = await salonRes.json();
        setSalon(salonData);

        const servicesRes = await fetch(`http://localhost:3000/api/salons/${salonData.id}/services`);
        if (!servicesRes.ok) throw new Error('Could not fetch services.');
        const servicesData: Service[] = await servicesRes.json();
        setServices(servicesData);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [router]);

  const handleSaveService = (savedService: Service) => {
    if (editingService) {
      setServices(services.map(s => s.id === savedService.id ? savedService : s));
    } else {
      setServices([...services, savedService]);
    }
    closeModal();
  };
  
  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://localhost:3000/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete service.');
      setServices(services.filter(s => s.id !== serviceId));
    } catch (err) {
      alert('Error deleting service.');
    }
  };

  const openModalToAdd = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const openModalToEdit = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };
  
  const getStatusClass = (status: ApprovalStatus) => {
    if (status === 'APPROVED') return styles.statusApproved;
    if (status === 'PENDING') return styles.statusPending;
    return styles.statusRejected;
  };

  if (isLoading) {
    return <div style={{ color: 'var(--white)', textAlign: 'center', padding: '2rem' }}>Loading your dashboard...</div>;
  }

  if (error) {
    return <div style={{ color: '#E53E3E', textAlign: 'center', padding: '2rem' }}>{error}</div>;
  }

  if (!salon) {
    return <div style={{ color: 'var(--white)', textAlign: 'center', padding: '2rem' }}>You have not created a salon profile yet.</div>;
  }

  return (
    <>
      {isModalOpen && (
        <ServiceFormModal
          salonId={salon.id}
          initialData={editingService}
          onClose={closeModal}
          onSave={handleSaveService}
        />
      )}
      <div className={styles.container}>
        <h1 className={styles.title}>My Dashboard</h1>
        <h2 className={styles.salonName}>{salon.name}</h2>
        <p className={styles.salonLocation}>{salon.city}, {salon.province}</p>

        <div className={styles.contentCard}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h3 className={styles.servicesTitle}>Your Services</h3>
            <button
              onClick={openModalToAdd}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--secondary-coral)',
                color: 'var(--white)',
                fontWeight: 'bold',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              + Add Service
            </button>
          </div>
          <div className={styles.servicesList}>
            {services.map((service) => (
              <div key={service.id} className={styles.serviceItem}>
                <div>
                  <h4 className={styles.serviceTitle}>{service.title}</h4>
                  <p className={styles.servicePrice}>R{service.price.toFixed(2)}</p>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <span className={`${styles.statusBadge} ${getStatusClass(service.approvalStatus)}`}>
                    {service.approvalStatus}
                  </span>
                  <button onClick={() => openModalToEdit(service)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-blue)'}}>Edit</button>
                  <button onClick={() => handleDeleteService(service.id)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#E53E3E'}}>Delete</button>
                </div>
              </div>
            ))}
            {services.length === 0 && <p>You haven't added any services yet.</p>}
          </div>
        </div>
      </div>
    </>
  );
}