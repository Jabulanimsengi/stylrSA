import Link from 'next/link';
import styles from './HomePage.module.css';

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.textCenter}>
        <h1 className={styles.title}>
          Online Hair Salon Marketplace
        </h1>
        <p className={styles.subtitle}>
          Your one-stop platform for salon services.
        </p>
        <Link href="/salons" className="btn btn-secondary" style={{ marginTop: '2.5rem' }}>
          Explore Salons Now
        </Link>
      </div>
    </main>
  );
}