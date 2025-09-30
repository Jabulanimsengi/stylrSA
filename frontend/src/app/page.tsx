'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './HomePage.module.css';
import FilterBar from '@/components/FilterBar/FilterBar';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Service } from '@/types';
import FeaturedServiceCard from '@/components/FeaturedServiceCard';
import Spinner from '@/components/Spinner';

type ServiceWithSalon = Service & { salon: { id: string; name: string } };

export default function HomePage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceWithSalon[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const loader = useRef(null);
  
  // FIX: Initialize the ref with null and update its type
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchServices = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/services?page=${pageNum}&pageSize=12`);
      if (res.ok) {
        const data = await res.json();
        // Prevent duplicate keys by using a Set
        setServices(prev => {
          const allServices = [...prev, ...data.services];
          const uniqueServices = Array.from(new Map(allServices.map(item => [item.id, item])).values());
          return uniqueServices;
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

  // Effect for the initial data fetch
  useEffect(() => {
    fetchServices(1);
  }, [fetchServices]);

  // This callback will be executed when the loader element is visible
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !isLoading && hasMore) {
        fetchServices(page);
    }
  }, [isLoading, hasMore, page, fetchServices]);

  // Effect to set up the IntersectionObserver
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
        
        {isLoading && page === 1 ? (
          <Spinner />
        ) : (
          <div className={styles.grid}>
            {services.map((service) => (
              <FeaturedServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
        
        {/* The loader element for the observer to watch */}
        <div ref={loader} />
        
        {/* Show spinner only when loading subsequent pages */}
        {isLoading && page > 1 && <Spinner />}

        {!hasMore && services.length > 0 && (
          <p className={styles.endOfList}>You've reached the end!</p>
        )}
      </section>
    </div>
  );
}