'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './HomePage.module.css';
import FilterBar from '@/components/FilterBar/FilterBar';
import { useEffect, useState } from 'react';
import { Service } from '@/types';
import FeaturedServiceCard from '@/components/FeaturedServiceCard';
import Spinner from '@/components/Spinner';

export default function HomePage() {
  const router = useRouter();
  const [featuredServices, setFeaturedServices] = useState<
    (Service & { salon: { id: string; name: string } })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/services/featured');
        if (res.ok) {
          setFeaturedServices(await res.json());
        }
      } catch (error) {
        console.error('Failed to fetch featured services:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeaturedServices();
  }, []);

  const handleSearch = (filters: any) => {
    const query = new URLSearchParams(filters).toString();
    router.push(`/salons?${query}`);
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
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

      {/* Featured Services Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Featured Services</h2>
        {isLoading ? (
          <Spinner />
        ) : (
          <div className={styles.grid}>
            {featuredServices.map((service) => (
              <FeaturedServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}