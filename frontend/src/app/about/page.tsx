import styles from '../info-page.module.css';
import PageNav from '@/components/PageNav';

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <PageNav />
      <h1 className={styles.pageTitle}>About Us</h1>
      <p className={styles.paragraph}>
        In a world full of choices, finding the right beauty and wellness professional shouldn&apos;t be a chore. Stylr SA was
        born from a simple idea: to create a seamless connection between clients and talented stylists, barbers, and beauty
        experts.
      </p>
      <p className={styles.paragraph}>
        We saw the passion and artistry in local salons and the frustration of clients searching for reliable, high-quality
        services. Our mission is to bridge that gap with technology. For our users, we&apos;re a curated marketplace for discovering
        the best local talent, booking appointments with ease, and finding top-tier beauty products. For salon and business
        owners, we&apos;re a powerful partner, providing the digital tools needed to manage bookings, showcase their work, sell
        products, and grow their brand.
      </p>
      <p className={styles.paragraph}>
        Stylr SA isn&apos;t just a booking app; it&apos;s a community dedicated to empowering beauty professionals and helping
        every client look and feel their best.
      </p>
    </div>
  );
}
