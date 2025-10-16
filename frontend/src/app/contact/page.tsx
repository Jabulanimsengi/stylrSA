import styles from '../info-page.module.css';
import PageNav from '@/components/PageNav';

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <PageNav />
      <h1 className={styles.pageTitle}>Contact Us</h1>
      <p className={styles.paragraph}>
        We&apos;re here to help! For all queries (support, partnerships, and media), please email us at
        <a href="mailto:stylrsa2@gmail.com" className={styles.link}> stylrsa2@gmail.com</a>.
      </p>

      <div className={styles.infoBlock}>
        <h3 className={styles.blockTitle}>Email</h3>
        <p className={styles.blockContent}>
          <a href="mailto:stylrsa2@gmail.com" className={styles.link}>stylrsa2@gmail.com</a>
        </p>
      </div>

      <p className={styles.paragraph}>Our team is available from 9 AM to 5 PM, Monday to Friday.</p>
    </div>
  );
}
