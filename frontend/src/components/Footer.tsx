// frontend/src/components/Footer.tsx
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <h3 className={styles.title}>SalonDirect</h3>
        <p className={styles.details}>
          Contact us via WhatsApp: <a href="https://wa.me/YOURNUMBER" target="_blank" rel="noopener noreferrer">+27 12 345 6789</a>
        </p>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} SalonDirect. All rights reserved.
        </p>
      </div>
    </footer>
  );
}