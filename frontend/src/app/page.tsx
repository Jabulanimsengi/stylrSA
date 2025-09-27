import Link from 'next/link';
import styles from './HomePage.module.css';
import { Service } from '@/types';

type FeaturedService = Service & { salon: { id: string, name: string } };

async function getFeaturedServices(): Promise<FeaturedService[]> {
  try {
    const res = await fetch('http://localhost:3000/api/services/featured', {
      next: { revalidate: 60 }, // Re-fetch data every 60 seconds
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch featured services:", error);
    return [];
  }
}

export default async function Home() {
  const featuredServices = await getFeaturedServices();

  return (
    <main>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          Discover & Book Amazing Hair Services
        </h1>
        <p className={styles.subtitle}>
          Your one-stop platform for finding and booking the best hair care professionals in your area.
        </p>
        <Link href="/salons" className="btn btn-secondary" style={{ marginTop: '2.5rem' }}>
          Explore All Salons
        </Link>
      </div>

      <section className={styles.featuredSection}>
        <h2 className={styles.featuredTitle}>Featured Services</h2>
        {featuredServices.length > 0 ? (
          <div className={styles.servicesGrid}>
            {featuredServices.map(service => (
              <Link href={`/salons/${service.salon.id}`} key={service.id} className={styles.serviceCard}>
                <img
                  src={service.images[0] || 'https://via.placeholder.com/300x180'}
                  alt={service.title}
                  className={styles.cardImage}
                />
                <div className={styles.imageOverlay}>
                  View More
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{service.title}</h3>
                  <p className={styles.cardSalonName}>by {service.salon.name}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{textAlign: 'center'}}>No featured services available right now.</p>
        )}
      </section>
    </main>
  );
}