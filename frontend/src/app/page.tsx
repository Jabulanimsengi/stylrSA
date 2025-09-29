'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './HomePage.module.css';
import FilterBar from '@/components/FilterBar/FilterBar';

export default function HomePage() {
  const router = useRouter();

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

      {/* How It Works Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>1. Discover</h3>
            <p>Search for salons by location, service, or availability.</p>
          </div>
          <div className={styles.card}>
            <h3>2. Book</h3>
            <p>Choose your desired service and book an appointment in seconds.</p>
          </div>
          <div className={styles.card}>
            <h3>3. Enjoy</h3>
            <p>Relax and enjoy your salon experience with confidence.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className={`${styles.section} ${styles.ctaSection}`}>
        <h2 className={styles.sectionTitle}>Are You a Salon Owner?</h2>
        <p>Join our platform to reach more clients and grow your business.</p>
        <Link href="/register" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          List Your Business
        </Link>
      </section>
    </div>
  );
}