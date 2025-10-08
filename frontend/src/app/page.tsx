'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './HomePage.module.css';
import FilterBar from '@/components/FilterBar/FilterBar';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Service } from '@/types';
import FeaturedServiceCard from '@/components/FeaturedServiceCard';
import LoadingSpinner from '@/components/LoadingSpinner';

type ServiceWithSalon = Service & { salon: { id: string; name: string, city: string, province: string } };

export default function HomePage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceWithSalon[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const loader = useRef(null);
  
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchServices = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/services/approved?page=${pageNum}&pageSize=12`);
      if (res.ok) {
        // FIX: Explicitly typing the 'data' object from the API response
        const data: { services: ServiceWithSalon[], currentPage: number, totalPages: number } = await res.json();
        
        setServices(prev => {
          const allServices = pageNum === 1 ? data.services : [...prev, ...data.services];
          const uniqueServicesMap = new Map(allServices.map(item => [item.id, item]));
          return Array.from(uniqueServicesMap.values());
        });
        
        setHasMore(data.currentPage < data.totalPages);
        setPage(data.currentPage + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices(1);
  }, [fetchServices]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !isLoading && hasMore) {
        fetchServices(page);
    }
  }, [isLoading, hasMore, page, fetchServices]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0
    };
    
    observer.current = new IntersectionObserver(handleObserver, option);
    
    const currentLoader = loader.current;
    if (currentLoader) {
      observer.current.observe(currentLoader);
    }

    return () => {
      if(currentLoader) {
        observer.current?.unobserve(currentLoader);
      }
    };
  }, [handleObserver]);

  const handleSearch = (filters: any) => {
    const query = new URLSearchParams(filters).toString();
    router.push(`/salons?${query}`);
  };

  return (
    <div className={styles.container}>
      {isLoading && page === 1 && <LoadingSpinner />}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}>
          <h1 className={styles.heroTitle}>Find & Book Your Next Salon Visit</h1>
          <p className={styles.heroSubtitle}>Discover top-rated salons and stylists near you.</p>
          <div className={styles.filterContainer}>
            <FilterBar onSearch={handleSearch} isHomePage={true} />
          </div>
          <div className={styles.heroActions}>
            <Link href="/salons" className="btn btn-primary">
              Explore Salons
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Featured Services</h2>
        
        {services.length > 0 && (
          <div className={styles.grid}>
            {services.map((service) => (
              <FeaturedServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
        
        <div ref={loader} />

        {isLoading && page > 1 && <div className={styles.spinnerContainer}><div className={styles.spinner}></div></div>}
        
        {!hasMore && services.length > 0 && (
          <p className={styles.endOfList}>You've reached the end!</p>
        )}
      </section>
    </div>
  );
}